"""Prepare King Solomon web assets from the raw Drive/Canva downloads.

usage: python3 prepare_assets.py <raw_dir> <out_dir>
raw_dir layout: raw/ (renders s43_XX/s49_XX), int/ (location+interiors), logo/, deck/ (Canva slide exports)
"""
import sys, os, json
from PIL import Image, ImageOps

RAW, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

RENDERS = {
    's43_02': 'ks-cliff-sea', 's43_01': 'ks-hillside', 's43_03': 'ks-aerial-pools', 's43_05': 'ks-villa-sea',
    's43_06': 'ks-aerial-terraces', 's43_11': 'ks-rooftop-lounge', 's43_12': 'ks-rooftop-pergola',
    's43_13': 'ks-rooftop-sofa', 's43_14': 'ks-rooftop-pavilion', 's43_15': 'ks-rooftop-sea',
    's43_17': 'ks-terrace-horizon', 's43_18': 'ks-terrace-dining', 's43_19': 'ks-aerial-plan',
    's43_23': 'ks-infinity-pool', 's43_24': 'ks-facade-gardens', 's43_25': 'ks-resort-front',
    's43_26': 'ks-terrace-table', 's43_27': 'ks-villa-curves', 's49_01': 'ks-hillside-2',
    's49_15': 'ks-entrance', 's49_19': 'ks-aerial-2', 's49_24': 'ks-resort-front-2',
    's49_25': 'ks-resort-pool-2', 's49_27': 'ks-villa-curves-2', 's49_28': 'ks-gym-pavilion',
}
INT = {
    'ChatGPT_Image_May_18_2026_09_28_59_AM.png': 'ks-location-day',
    'ChatGPT_Image_May_18_2026_09_30_18_AM.png': 'ks-location-sea-path',
    'ChatGPT_Image_May_18_2026_09_31_56_AM.png': 'ks-location-dusk',
    'ChatGPT_Image_May_18_2026_09_41_42_AM.png': 'ks-greece-map',
    'ChatGPT_Image_May_19_2026_01_20_21_PM.png': 'ks-gym',
    'ChatGPT_Image_May_19_2026_01_25_15_PM.png': 'ks-gym-2',
    'ChatGPT_Image_May_26_2026_02_24_06_PM.png': 'ks-living-room',
}
# (slide file, crop box as fractions l,t,r,b, name)
PLAN_BOX = (.255, .36, .945, .93)
PLANS = {19: 'A1', 20: 'A2-1', 21: 'A2-2', 22: 'B1', 23: 'B2', 24: 'B3-1', 25: 'B1-2', 26: 'C1-1', 27: 'C1-2', 28: 'C2-1', 29: 'C2-2'}
CROPS = [
    ('q43.jpg', (.508, .014, .989, .492), 'ks-interior-kitchen'),
    ('q43.jpg', (.508, .503, .925, .975), 'ks-interior-bedroom'),
    ('q46.jpg', (0, .53, 1, .86), 'ks-chania-harbour'),
    ('q48.jpg', (.565, .04, .94, .80), 'ks-chania-old-city'),
    ('q49.jpg', (.016, .031, .505, .325), 'ks-balos'),
    ('q49.jpg', (.517, .031, .755, .36), 'ks-samaria'),
    ('q49.jpg', (.769, .031, .988, .36), 'ks-white-mountains'),
    ('p13.jpg', (0, 0, 1, 1), 'ks-masterplan-numbers'),
]

manifest = {}

def save(im, name, max_w=2400, q=80):
    im = ImageOps.exif_transpose(im).convert('RGB')
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    path = os.path.join(OUT, name + '.jpg')
    im.save(path, 'JPEG', quality=q, optimize=True, progressive=True)
    manifest[name] = {'file': path, 'w': im.width, 'h': im.height}

for src, name in RENDERS.items():
    save(Image.open(os.path.join(RAW, 'raw', src + '.jpg')), name)
for src, name in INT.items():
    save(Image.open(os.path.join(RAW, 'int', src)), name)
for n, t in PLANS.items():
    im = Image.open(os.path.join(RAW, 'deck', f'p{n}.jpg')); W, H = im.size; l, tp, r, b = PLAN_BOX
    save(im.crop((int(l * W), int(tp * H), int(r * W), int(b * H))), f'ks-plan-{t.lower()}', max_w=1800, q=85)
for f, (l, tp, r, b), name in CROPS:
    im = Image.open(os.path.join(RAW, 'deck', f)); W, H = im.size
    save(im.crop((int(l * W), int(tp * H), int(r * W), int(b * H))), name)

# Crown logo: white crown on the gold background -> transparent PNG, recoloured gold.
logo = Image.open(os.path.join(RAW, 'logo', 'Screenshot_2024_08_04_at_11.27.19.png')).convert('RGB')
crown = logo.crop((int(.15 * logo.width), int(.02 * logo.height), int(.85 * logo.width), int(.36 * logo.height)))
px = crown.load(); out = Image.new('RGBA', crown.size)
for y in range(crown.height):
    for x in range(crown.width):
        r, g, b = px[x, y]; a = max(0, min(255, int((min(r, g, b) - 150) * 255 / 105)))
        out.putpixel((x, y), (198, 161, 91, a))
bbox = out.getbbox(); out = out.crop(bbox)
out.save(os.path.join(OUT, 'ks-crown.png'))
manifest['ks-crown'] = {'file': os.path.join(OUT, 'ks-crown.png'), 'w': out.width, 'h': out.height}

json.dump(manifest, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
print(len(manifest), 'assets ->', OUT)
