#!/usr/bin/env python3
"""King Solomon brand film renderer.

Reads storyboard.json, animates the official architectural renders with
geometry-preserving camera moves (2D affine pan/zoom only), applies a restrained
cinematic grade, film grain, typography, visualization labels and a brand end
card, and pipes frames to FFmpeg.

Usage:
  python3 render.py --version master --assets ASSETS --out OUT.mp4
  python3 render.py --version reel --assets ASSETS --preview OUT_DIR   # stills only
"""
import argparse
import json
import math
import os
import subprocess
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
GOLD = (198, 161, 92)          # official brand gold #C6A15C
WHITE = (250, 247, 240)        # soft white
ENDCARD_BG = (13, 12, 10)      # warm black

LABELS = {
    "render": "ARCHITECTURAL VISUALIZATION",
    "montage": "LOCATION AERIAL  ·  PROJECT VISUALIZED",
}


# ---------------------------------------------------------------- utilities
def ease(p):
    """Mostly linear with soft ends, so motion never stops dead at a cut."""
    p = min(max(p, 0.0), 1.0)
    return 0.55 * p + 0.45 * (0.5 - 0.5 * math.cos(math.pi * p))


def smooth(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def load_font(path, size, weight):
    f = ImageFont.truetype(path, size)
    try:
        f.set_variation_by_axes([weight])
    except Exception:
        pass
    return f


def grade_source(img_bgr, warm=0.0):
    """Static per-source grade: gentle S-curve, warm highlights, soft saturation."""
    x = img_bgr.astype(np.float32) / 255.0
    x = x - 0.13 * np.sin(2 * np.pi * x) / (2 * np.pi)          # mild S-curve
    lum = (0.114 * x[..., 0] + 0.587 * x[..., 1] + 0.299 * x[..., 2])[..., None]
    x = lum + (x - lum) * 0.95                                     # restrain saturation
    hi = np.clip((lum - 0.35) / 0.65, 0, 1)
    gains = np.array([1 - 0.03 - 0.10 * warm, 1.0 + 0.02 * warm, 1 + 0.018 + 0.09 * warm], np.float32)
    x = x * (1 + (gains - 1) * hi)                                 # warm the highlights
    x = x + np.array([0.006, 0.002, -0.004], np.float32) * (1 - hi)  # lifted, slightly warm blacks
    x = np.clip(x, 0, 1)
    blur = cv2.GaussianBlur(x, (0, 0), 1.2)
    x = np.clip(x + 0.35 * (x - blur), 0, 1)                       # light sharpening pre-upscale
    return (x * 255 + 0.5).astype(np.uint8)


# ---------------------------------------------------------------- text
class TextLayer:
    """Pre-rendered RGBA text (with soft shadow) cropped to its bounding box."""

    def __init__(self, rgba, x, y):
        a = rgba[..., 3:4].astype(np.float32) / 255.0
        self.rgb = rgba[..., :3][..., ::-1].astype(np.float32)   # to BGR
        self.a = a
        self.x, self.y = x, y

    def composite(self, frame, opacity, dy=0):
        if opacity <= 0.002:
            return
        h, w = self.a.shape[:2]
        y0, x0 = self.y + int(dy), self.x
        fh, fw = frame.shape[:2]
        # clip to frame (layer boxes include padding that may overhang the edge)
        sy, sx = max(0, -y0), max(0, -x0)
        ey, ex = min(h, fh - y0), min(w, fw - x0)
        if ey <= sy or ex <= sx:
            return
        roi = frame[y0 + sy:y0 + ey, x0 + sx:x0 + ex]
        a = self.a[sy:ey, sx:ex] * opacity
        roi[:] = roi * (1 - a) + self.rgb[sy:ey, sx:ex] * a


def draw_tracked(draw, xy, text, font, fill, tracking, gold_bars=False):
    x, y = xy
    for ch in text:
        col = GOLD + (fill[3],) if (gold_bars and ch == "|") else fill
        draw.text((x, y), ch, font=font, fill=col, features=["lnum"])  # lining numerals
        x += font.getlength(ch, features=["lnum"]) + tracking


def tracked_width(text, font, tracking):
    return sum(font.getlength(c, features=["lnum"]) for c in text) + tracking * (len(text) - 1)


def make_text(lines, font, tracking, W, H, cy, fill=WHITE + (255,), shadow=0.65,
              gold_bars=False, line_gap=1.35, rule=False):
    """Render centered multi-line tracked text into a TextLayer."""
    size = font.size
    lh = int(size * line_gap)
    widths = [tracked_width(t, font, tracking) for t in lines]
    bw = int(max(widths) + size * 2)
    rule_h = int(size * 0.9) if rule else 0
    bh = int(lh * len(lines) + size * 1.4 + rule_h)
    img = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    y = size * 0.5
    if rule:
        rw = int(size * 1.6)
        d.rectangle([bw // 2 - rw // 2, int(y), bw // 2 + rw // 2, int(y) + max(1, size // 40)],
                    fill=GOLD + (230,))
        y += rule_h
    for t, w in zip(lines, widths):
        draw_tracked(d, ((bw - w) / 2, y), t, font, fill, tracking, gold_bars)
        y += lh
    if shadow > 0:
        sh = img.split()[3].filter(ImageFilter.GaussianBlur(size * 0.35))
        sh = sh.point(lambda v: int(v * shadow))
        base = Image.new("RGBA", img.size, (0, 0, 0, 0))
        base.putalpha(sh)
        img = Image.alpha_composite(base, img)
    arr = np.array(img)
    x = int(W / 2 - bw / 2)
    y0 = int(cy - bh / 2)
    return TextLayer(arr, x, y0)


def make_label(text, font, tracking, W, H, margin, opacity=0.78):
    w = int(tracked_width(text, font, tracking) + font.size)
    h = int(font.size * 2)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    draw_tracked(d, (font.size * 0.5, font.size * 0.4), text, font, WHITE + (int(255 * opacity),), tracking)
    sh = img.split()[3].filter(ImageFilter.GaussianBlur(font.size * 0.4)).point(lambda v: int(v * 0.5))
    base = Image.new("RGBA", img.size, (0, 0, 0, 0))
    base.putalpha(sh)
    img = Image.alpha_composite(base, img)
    return TextLayer(np.array(img), int(W - margin - w), int(H - margin - h))


# ---------------------------------------------------------------- film
class Film:
    def __init__(self, sb, version, assets):
        self.v = sb["versions"][version]
        self.shots = sb["shots"]
        self.W, self.H, self.fps = self.v["w"], self.v["h"], self.v["fps"]
        self.orient = self.v["orient"]
        self.assets = assets
        W, H = self.W, self.H
        vertical = self.orient == "v"
        fdir = os.path.join(assets, "fonts")
        serif = os.path.join(fdir, "CormorantGaramond-normal-300-latin.ttf")
        sans = os.path.join(fdir, "Inter-normal-300-600-latin.ttf")
        unit = W if vertical else H
        k_title, k_small, k_label = (0.074, 0.030, 0.021) if vertical else (0.050, 0.020, 0.0125)
        self.f_title = load_font(serif, int(unit * k_title), 300)
        self.f_small = load_font(sans, int(unit * k_small), 300)
        self.f_label = load_font(sans, int(unit * k_label), 300)
        self.title_cy = H * (0.60 if vertical else 0.80)
        self.sources = {}
        for e in self.v["timeline"]:
            sid = e["shot"]
            if sid == "END" or sid in self.sources:
                continue
            s = self.shots[sid]
            img = cv2.imread(os.path.join(assets, "img", s["src"]), cv2.IMREAD_COLOR)
            if img is None:
                sys.exit(f"missing source {s['src']}")
            self.sources[sid] = grade_source(img, s.get("warm", 0.0))
        # titles
        self.titles = []
        for t in self.v["titles"]:
            lines = t["text"].split("|") if "|" in t["text"] and "  |  " not in t["text"] else [t["text"]]
            if t.get("style") == "small":
                f = self.f_small
                layer = make_text(lines, f, f.size * 0.42, W, H, self.title_cy, gold_bars=True)
            else:
                f = self.f_title
                layer = make_text(lines, f, f.size * 0.20, W, H, self.title_cy, rule=True)
            self.titles.append((t, layer))
        margin = int(unit * (0.045 if vertical else 0.03))
        if vertical:  # keep labels clear of social UI at the bottom
            margin_y = int(H * 0.16)
            self.labels = {k: make_label(txt, self.f_label, self.f_label.size * 0.30, W, H - margin_y + margin, margin)
                           for k, txt in LABELS.items()}
        else:
            self.labels = {k: make_label(txt, self.f_label, self.f_label.size * 0.30, W, H, margin)
                           for k, txt in LABELS.items()}
        self.endcard = self.build_endcard(serif, sans)
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / math.sqrt(2)
        self.vignette = (1 - 0.22 * np.clip((r - 0.35) / 0.65, 0, 1) ** 1.6)[..., None]
        # soft horizontal scrim behind titles (darkens only while a title is on screen)
        ys = np.arange(H, dtype=np.float32)[:, None, None]
        self.scrim = (0.50 if vertical else 0.42) * np.exp(-((ys - self.title_cy) / (H * (0.085 if vertical else 0.12))) ** 2)
        rng = np.random.default_rng(7)
        g = []
        for _ in range(6):
            n = rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32)
            n = cv2.resize(n, (W, H), interpolation=cv2.INTER_LINEAR)
            g.append((n * 2.4)[..., None])
        self.grain = g

    # ---- end card
    def build_endcard(self, serif, sans):
        W, H = self.W, self.H
        vertical = self.orient == "v"
        unit = W if vertical else H
        crown = Image.open(os.path.join(self.assets, "brand", "crown-gold.png")).convert("RGBA")
        cw = int(W * (0.30 if vertical else 0.105))
        crown = crown.resize((cw, int(cw * crown.height / crown.width)), Image.LANCZOS)
        cy0 = H * (0.36 if vertical else 0.33)
        layers = []
        carr = np.array(crown)
        layers.append((0.0, TextLayer(carr, int(W / 2 - cw / 2), int(cy0 - crown.height / 2))))
        f_name = load_font(serif, int(unit * (0.080 if vertical else 0.080)), 300)
        f_tag = load_font(sans, int(unit * (0.036 if vertical else 0.023)), 300)
        f_loc = load_font(sans, int(unit * (0.028 if vertical else 0.017)), 300)
        f_url = load_font(sans, int(unit * (0.032 if vertical else 0.020)), 400)
        f_disc = load_font(sans, int(unit * (0.019 if vertical else 0.0105)), 300)
        ys =([0.47, 0.535, 0.585, 0.65] if vertical else [0.53, 0.615, 0.675, 0.75])
        layers.append((0.35, make_text(["KING SOLOMON"], f_name, f_name.size * (0.16 if vertical else 0.22),
                                       W, H, H * ys[0], shadow=0)))
        layers.append((0.7, make_text(["OWN THE HORIZON"], f_tag, f_tag.size * 0.55, W, H, H * ys[1],
                                      fill=GOLD + (255,), shadow=0)))
        layers.append((1.0, make_text(["KALYVES  |  CHANIA  |  CRETE"], f_loc, f_loc.size * 0.5, W, H, H * ys[2],
                                      fill=WHITE + (190,), shadow=0, gold_bars=True)))
        layers.append((1.2, make_text(["www.kingsolomoncrete.com"], f_url, f_url.size * 0.08, W, H, H * ys[3],
                                      shadow=0)))
        disc = ["Images of King Solomon are architectural visualizations (artist's impressions)",
                "and may change as the development progresses. Not an offer or contract."]
        if vertical:
            disc = ["Images of King Solomon are architectural visualizations",
                    "(artist's impressions) and may change as the development",
                    "progresses. Not an offer or contract."]
        layers.append((1.2, make_text(disc, f_disc, f_disc.size * 0.06, W, H, H * (0.80 if vertical else 0.925),
                                      fill=WHITE + (120,), shadow=0, line_gap=1.45)))
        return layers

    # ---- camera
    def shot_frame(self, sid, p):
        s = self.shots[sid]
        a, b = s[self.orient]
        q = ease(p)
        cx, cy, z = [a[i] + (b[i] - a[i]) * q for i in range(3)]
        img = self.sources[sid]
        h, w = img.shape[:2]
        sc = max(self.W / w, self.H / h) * z
        hw, hh = self.W / (2 * sc * w), self.H / (2 * sc * h)
        cx = min(max(cx, hw), 1 - hw)
        cy = min(max(cy, hh), 1 - hh)
        M = np.float32([[sc, 0, self.W / 2 - sc * cx * w], [0, sc, self.H / 2 - sc * cy * h]])
        return cv2.warpAffine(img, M, (self.W, self.H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)

    def frame(self, n):
        t = n / self.fps
        tl = self.v["timeline"]
        active = [(i, e) for i, e in enumerate(tl) if e["start"] <= t < e["end"]]
        out = np.zeros((self.H, self.W, 3), np.float32)
        layers = []  # (kind, opacity) in stacking order
        for i, e in active:
            # dissolve in over the overlap with the previous entry, or fade up from black
            if i > 0 and tl[i - 1]["end"] > e["start"]:
                op = smooth((t - e["start"]) / (tl[i - 1]["end"] - e["start"]))
            elif "fadein" in e:
                op = smooth((t - e["start"]) / e["fadein"])
            else:
                op = 1.0
            if e["shot"] == "END":
                out = out * (1 - op) + np.array(ENDCARD_BG[::-1], np.float32) * op
                layers.append(("END", op))
                continue
            p = (t - e["start"]) / (e["end"] - e["start"])
            img = self.shot_frame(e["shot"], p).astype(np.float32)
            out = out * (1 - op) + img * op
            layers.append((self.shots[e["shot"]]["kind"], op))
        # effective visible weight of each layer after "over" compositing
        label_ops, cover = {}, 1.0
        for kind, op in reversed(layers):
            wgt = op * cover
            cover *= (1 - op)
            if kind in self.labels:
                label_ops[kind] = label_ops.get(kind, 0) + wgt
        out = out * self.vignette + self.grain[n % len(self.grain)]
        # labels
        for kind, op in label_ops.items():
            self.labels[kind].composite(out, min(op, 1.0))
        # titles: scrim, then fade + slight rise
        sop = max([smooth((t - s["start"]) / 0.7) * smooth((s["end"] - t) / 0.6)
                   * (0.7 if s.get("style") == "small" else 1.0)
                   for s, _ in self.titles if s["start"] <= t <= s["end"]] or [0])
        if sop > 0:
            out *= 1 - self.scrim * sop
        for t_spec, layer in self.titles:
            a, b = t_spec["start"], t_spec["end"]
            if a <= t <= b:
                op = smooth((t - a) / 0.7) * smooth((b - t) / 0.6)
                rise = (1 - smooth((t - a) / 1.2)) * self.H * 0.006
                layer.composite(out, op, dy=rise)
        # end card elements
        ends = [e for e in tl if e["shot"] == "END"]
        if ends and t >= ends[0]["start"]:
            e0 = ends[0]
            prev_end = tl[tl.index(e0) - 1]["end"]
            base_t = max(prev_end, e0["start"]) + 0.15
            for delay, layer in self.endcard:
                op = smooth((t - base_t - delay) / 0.9)
                layer.composite(out, op)
        # global fade to black
        fo = self.v.get("fadeout", 0)
        if fo and t > self.v["duration"] - fo:
            out *= smooth((self.v["duration"] - t) / fo)
        return np.clip(out, 0, 255).astype(np.uint8)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--version", required=True)
    ap.add_argument("--assets", required=True)
    ap.add_argument("--storyboard", default=os.path.join(HERE, "storyboard.json"))
    ap.add_argument("--out")
    ap.add_argument("--preview", help="directory: write mid-shot stills instead of video")
    ap.add_argument("--times", help="comma-separated times for --preview")
    a = ap.parse_args()
    sb = json.load(open(a.storyboard))
    film = Film(sb, a.version, a.assets)
    total = int(round(film.v["duration"] * film.fps))
    if a.preview:
        os.makedirs(a.preview, exist_ok=True)
        if a.times:
            times = [float(x) for x in a.times.split(",")]
        else:
            times = [(e["start"] + e["end"]) / 2 for e in film.v["timeline"]]
        for tt in times:
            fr = film.frame(int(tt * film.fps))
            cv2.imwrite(os.path.join(a.preview, f"{a.version}_{tt:06.2f}.jpg"), fr, [cv2.IMWRITE_JPEG_QUALITY, 90])
        return
    cmd = ["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "bgr24",
           "-s", f"{film.W}x{film.H}", "-r", str(film.fps), "-i", "-",
           "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-tune", "film",
           "-pix_fmt", "yuv420p", "-profile:v", "high", "-colorspace", "bt709",
           "-color_primaries", "bt709", "-color_trc", "bt709", "-movflags", "+faststart", a.out]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for n in range(total):
        proc.stdin.write(film.frame(n).tobytes())
        if n % 100 == 0:
            print(f"{a.version}: frame {n}/{total}", flush=True)
    proc.stdin.close()
    sys.exit(proc.wait())


if __name__ == "__main__":
    main()
