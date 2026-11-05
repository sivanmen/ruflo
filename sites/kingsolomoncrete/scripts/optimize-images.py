"""Generate responsive AVIF + WebP + JPEG variants and a manifest.
Usage: python3 -I scripts/optimize-images.py <src_dir> <out_dir>"""
import sys, json, os, glob
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
WIDTHS = [480, 960, 1600, 2400]
manifest = {}
for f in sorted(glob.glob(os.path.join(src, '*.webp'))):
    name = os.path.basename(f)[:-5].removeprefix('ks-')
    im = Image.open(f)
    if name == 'crown':
        continue
    im = im.convert('RGB')
    w0, h0 = im.size
    ws = [w for w in WIDTHS if w < w0] + [min(w0, 2400)]
    ws = sorted(set(ws))
    small = im.resize((1, 1), Image.LANCZOS).getpixel((0, 0))
    for w in ws:
        h = round(h0 * w / w0)
        r = im if w == w0 else im.resize((w, h), Image.LANCZOS)
        base = os.path.join(out, f'{name}-{w}')
        if not os.path.exists(base + '.avif'):
            r.save(base + '.avif', quality=52, speed=6)
        if not os.path.exists(base + '.webp'):
            r.save(base + '.webp', quality=78, method=6)
        if w == ws[min(1, len(ws)-1)] and not os.path.exists(base + '.jpg'):
            r.save(base + '.jpg', quality=80, optimize=True, progressive=True)
    manifest[name] = {'w': w0 if w0 <= 2400 else 2400, 'h': round(h0 * min(w0, 2400) / w0), 'widths': ws,
                      'jpg': ws[min(1, len(ws)-1)], 'color': '#%02x%02x%02x' % small}
    print(name, ws, flush=True)
json.dump(manifest, open(os.path.join(out, '..', '..', '..', 'data', 'images.json'), 'w'), indent=1)
