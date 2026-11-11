#!/usr/bin/env python3
"""Original score + sound design for the King Solomon films (fully synthesized,
so no third-party music or SFX licence is involved).

Warm piano, soft pad, low strings and sub, in D major, with chord changes on scene
boundaries; synthesized sea waves, breeze, pool water and glass details.

Usage: python3 score.py --version master --out master.wav
"""
import argparse

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000

CHORDS = {  # name: (bass MIDI, voicing MIDI)
    "Dadd9": (38, [50, 57, 64, 66]),
    "Bm9": (35, [50, 54, 57, 61]),
    "Gmaj9": (43, [50, 54, 57, 59]),
    "D/F#": (42, [50, 57, 62, 64]),
    "Em9": (40, [55, 59, 62, 66]),
    "Asus4": (45, [50, 52, 57, 64]),
    "A": (45, [49, 52, 57, 64]),
    "Dmaj": (38, [50, 54, 57, 62, 66, 69]),
}

PLANS = {
    "master": {
        "dur": 65.0,
        "chords": [(0, "Dadd9"), (10, "Bm9"), (16, "Gmaj9"), (23, "D/F#"), (30, "Em9"), (37, "Gmaj9"),
                   (44, "Bm9"), (51, "Asus4"), (55, "A"), (58, "Dmaj")],
        "intensity": [(0, .12), (10, .3), (16, .45), (30, .6), (37, .92), (44, .68), (51, .75), (58, .85),
                      (62, .6), (65, 0)],
        "waves": [(0, 1), (10, .6), (16, .35), (37, .5), (44, .3), (51, .8), (58, .7), (65, .4)],
        "pool": [(24, 6), (38, 5)], "clinks": [45.6, 48.4], "fadein": 1.2, "fadeout": 2.5,
    },
    "reel": {
        "dur": 30.0,
        "chords": [(0, "Dadd9"), (6, "Bm9"), (11.6, "Gmaj9"), (16.8, "Em9"), (20, "Gmaj9"), (22.4, "Asus4"),
                   (24.4, "A"), (25.4, "Dmaj")],
        "intensity": [(0, .3), (8, .55), (16.8, .9), (22, .75), (25.4, .85), (28, .6), (30, 0)],
        "waves": [(0, 1), (8, .4), (22, .8), (30, .4)],
        "pool": [(11.8, 2.6), (17, 3)], "clinks": [21.0], "fadein": 0.6, "fadeout": 1.6,
    },
    "ad": {
        "dur": 15.0,
        "chords": [(0, "Gmaj9"), (2.7, "Bm9"), (5.1, "Em9"), (7.5, "Gmaj9"), (9.7, "Asus4"), (10.8, "A"),
                   (11.8, "Dmaj")],
        "intensity": [(0, .6), (7.5, .9), (11.8, .85), (14, .5), (15, 0)],
        "waves": [(0, .5), (9.7, .7), (15, .3)],
        "pool": [(0.2, 2.4), (7.6, 2.2)], "clinks": [], "fadein": 0.15, "fadeout": 1.0,
    },
}


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def curve(keys, t):
    ks, vs = zip(*keys)
    return np.interp(t, ks, vs)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def add(buf, sig, t0, pan=0.0):
    """Mix mono or stereo signal into stereo buffer at time t0 with constant-power pan."""
    i0 = int(t0 * SR)
    if i0 >= buf.shape[0]:
        return
    if sig.ndim == 1:
        lg, rg = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * lg, sig * rg], 1)
    n = min(sig.shape[0], buf.shape[0] - i0)
    buf[i0:i0 + n] += sig[:n]


# ------------------------------------------------------------- instruments
def piano(f, vel, dur=5.0, rng=None):
    t = np.arange(int(dur * SR)) / SR
    out = np.zeros_like(t)
    B = 0.00035
    for n in range(1, 11):
        fn = n * f * np.sqrt(1 + B * n * n)
        if fn > 15000:
            break
        amp = (1 / n ** 1.15) * (0.75 if n % 2 == 0 else 1.0)
        out += amp * np.exp(-t * (0.45 + 0.5 * n * (f / 400) ** 0.3)) * np.sin(2 * np.pi * fn * t + n)
    out *= 1 - np.exp(-t / 0.004)
    if rng is not None:
        ham = lp(rng.normal(0, 1, len(t)), 2500) * np.exp(-t / 0.012) * 0.04
        out += ham
    return out * vel * 0.18


def pad_chord(voicing, dur, rng):
    t = np.arange(int(dur * SR)) / SR
    L = np.zeros_like(t)
    R = np.zeros_like(t)
    for m in voicing:
        f = hz(m)
        for k, c in enumerate((-6, 0, 6)):
            ff = f * 2 ** (c / 1200)
            ph = rng.uniform(0, 2 * np.pi)
            s = np.sin(2 * np.pi * ff * t + ph) + 0.25 * np.sin(4 * np.pi * ff * t + ph) \
                + 0.08 * np.sin(6 * np.pi * ff * t)
            if k == 0:
                L += s
            elif k == 2:
                R += s
            else:
                L += 0.6 * s
                R += 0.6 * s
    trem = 1 + 0.06 * np.sin(2 * np.pi * 0.18 * t)
    return np.stack([L * trem, R * trem], 1) * 0.012


def string_note(f, dur, rng):
    t = np.arange(int(dur * SR)) / SR
    vib = 1 + 0.003 * np.sin(2 * np.pi * 5.2 * t) * np.clip(t / 1.5, 0, 1)
    phase = 2 * np.pi * f * np.cumsum(vib) / SR
    s = sum(np.sin(n * phase + rng.uniform(0, 6)) / n for n in range(1, 9))
    return lp(s, 1600, 4) * 0.05


def envelope(n, att, rel):
    e = np.ones(n)
    a, r = int(att * SR), int(rel * SR)
    e[:a] = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, a))
    e[-r:] *= 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, r))
    return e


def reverb(x, rng, length=3.2, decay=0.95, wet=0.3):
    t = np.arange(int(length * SR)) / SR
    out = np.zeros_like(x)
    for ch in range(2):
        ir = rng.normal(0, 1, len(t)) * np.exp(-t / decay)
        ir = lp(ir, 5500)
        ir[: int(0.02 * SR)] = 0
        ir /= np.sqrt(np.sum(ir ** 2))
        out[:, ch] = fftconvolve(x[:, ch], ir)[: len(x)]
    return x * (1 - wet) + out * wet * 1.6


# ------------------------------------------------------------- composition
def music(plan, rng):
    D = plan["dur"]
    n = int(D * SR)
    buf = np.zeros((n + SR * 6, 2))
    chords = plan["chords"]
    tl = np.arange(buf.shape[0]) / SR
    inten = curve(plan["intensity"], np.minimum(tl, D))
    strings = np.zeros_like(buf)
    sub = np.zeros_like(buf)
    for i, (t0, name) in enumerate(chords):
        t1 = chords[i + 1][0] if i + 1 < len(chords) else D + 2.5
        bass, voicing = CHORDS[name]
        dur = t1 - t0 + 1.8
        pad = pad_chord(voicing, dur, rng) * envelope(int(dur * SR), 1.4, 1.8)[:, None]
        add(buf, pad, t0)
        for m, p in ((bass + 12, -0.3), (voicing[0], 0.3)):
            s = string_note(hz(m), dur, rng) * envelope(int(dur * SR), 2.2, 1.8)
            add(strings, s, t0, p)
        s = np.sin(2 * np.pi * hz(bass) * np.arange(int(dur * SR)) / SR) * envelope(int(dur * SR), 0.8, 1.5)
        add(sub, s * 0.05, t0)
        # piano: low anchor note at each change
        add(buf, piano(hz(bass + 12), 0.55, 6, rng), t0 + 0.02, -0.2)
    buf += strings * (0.25 + 0.9 * inten[:, None] ** 1.5)
    buf += sub * (0.4 + 0.6 * inten[:, None])
    # piano arpeggios, density following intensity
    t = 1.6 if plan["dur"] > 20 else 0.3
    pattern = [0, 2, 1, 3, 2, 4, 3, 1]
    k = 0
    last_change = chords[-1][0]
    while t < last_change - 0.3:
        ci = max(i for i, c in enumerate(chords) if c[0] <= t)
        bass, voicing = CHORDS[chords[ci][1]]
        tones = sorted(set([m + 12 for m in voicing] + [voicing[1] + 24]))
        it = curve(plan["intensity"], t)
        if rng.random() > 0.28 - 0.2 * it:
            m = tones[pattern[k % len(pattern)] % len(tones)]
            vel = (0.32 + 0.4 * it) * rng.uniform(0.8, 1.05)
            add(buf, piano(hz(m), vel, 5, rng), t + rng.normal(0, 0.012), (m - 66) / 20)
        k += 1
        t += (1.05 - 0.5 * it) * rng.uniform(0.92, 1.08)
    # final rolled chord, left to ring
    bass, voicing = CHORDS[chords[-1][1]]
    for j, m in enumerate([bass + 12] + [v + 12 for v in voicing[:5]] + [78]):
        add(buf, piano(hz(m), 0.5 - 0.03 * j, 7, rng), last_change + 0.06 * j, (m - 66) / 24)
    buf = reverb(buf, rng, wet=0.34)
    return buf[:n]


def sound_design(plan, rng):
    D = plan["dur"]
    n = int(D * SR)
    tl = np.arange(n) / SR
    out = np.zeros((n, 2))
    # sea waves: sequence of swells (rise, break, wash)
    env = np.zeros(n)
    foam = np.zeros(n)
    t = -2.0
    while t < D:
        period = rng.uniform(6.0, 8.5)
        x = (tl - t) / period
        swell = np.where((x > 0) & (x < 1), np.sin(np.pi * np.clip(x, 0, 1) ** 0.7) ** 2, 0)
        env += swell * rng.uniform(0.7, 1.0)
        peak = np.exp(-((tl - (t + 0.42 * period)) / 0.9) ** 2)
        foam += peak * rng.uniform(0.6, 1.0)
        t += period * rng.uniform(0.55, 0.75)
    level = curve(plan["waves"], tl)
    for ch in range(2):
        w = rng.normal(0, 1, n)
        body = lp(w, 700) * 0.9 + lp(rng.normal(0, 1, n), 140) * 1.6
        hiss = bp(rng.normal(0, 1, n), 1800, 6500) * 0.16
        out[:, ch] += (body * (0.15 + env) + hiss * foam) * level * 0.05
    # breeze
    lfo = 0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * tl + 1.3)
    for ch in range(2):
        out[:, ch] += bp(rng.normal(0, 1, n), 250, 1100) * lfo * 0.008
    # pool water lapping
    for t0, d in plan["pool"]:
        m = int(d * SR)
        tt = np.arange(m) / SR
        bursts = np.zeros(m)
        for b in rng.uniform(0, d, int(d * 3.2)):
            bursts += np.exp(-((tt - b) / 0.07) ** 2) * rng.uniform(0.4, 1.0)
        sig = bp(rng.normal(0, 1, m), 220, 1400) * bursts * envelope(m, 0.8, 1.2) * 0.07
        add(out, sig, t0, rng.uniform(-0.4, 0.4))
    # glass / tableware details
    for t0 in plan["clinks"]:
        m = int(1.6 * SR)
        tt = np.arange(m) / SR
        sig = sum(a * np.exp(-tt / d) * np.sin(2 * np.pi * f * tt)
                  for f, a, d in ((2093, 1, .5), (3542, .6, .35), (5274, .4, .25), (7040, .2, .15)))
        sig *= 1 - np.exp(-tt / 0.001)
        add(out, sig * 0.035, t0, 0.35)
    out = lp(out.T, 9000).T  # keep the SFX bus soft, no fizz
    return reverb(out, rng, length=1.6, decay=0.4, wet=0.15)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--version", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    plan = PLANS[a.version]
    rng = np.random.default_rng(2026)
    mix = music(plan, rng) * 0.9 + sound_design(plan, rng)
    n = mix.shape[0]
    tl = np.arange(n) / SR
    fi, fo, D = plan["fadein"], plan["fadeout"], plan["dur"]
    g = np.clip(tl / fi, 0, 1) * np.clip((D - tl) / fo, 0, 1)
    mix *= (g * g * (3 - 2 * g))[:, None]
    mix = hp(mix.T, 28).T
    mix /= np.max(np.abs(mix)) / 0.89
    wavfile.write(a.out, SR, mix.astype(np.float32))


if __name__ == "__main__":
    main()
