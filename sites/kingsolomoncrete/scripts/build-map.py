"""Build a self-hosted static map of the project location from OpenStreetMap tiles (no runtime third-party requests).
Usage: python3 -I scripts/build-map.py assets-src/img/ks-map-kalyves.webp   (© OpenStreetMap contributors, ODbL)"""
import sys, math, io, time, urllib.request
from PIL import Image, ImageEnhance, ImageOps
LAT, LNG, Z = 35.457128, 24.166242, 16
W, H = 2400, 1200
UA = 'KingSolomonSiteBuild/1.0 (static map for kingsolomoncrete.com)'
def px(lat, lng, z):
    n = 256 * 2 ** z
    x = (lng + 180) / 360 * n
    y = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n
    return x, y
cx, cy = px(LAT, LNG, Z)
x0, y0 = cx - W / 2, cy - H / 2
canvas = Image.new('RGB', (W, H))
for tx in range(int(x0 // 256), int((x0 + W) // 256) + 1):
    for ty in range(int(y0 // 256), int((y0 + H) // 256) + 1):
        req = urllib.request.Request(f'https://tile.openstreetmap.org/{Z}/{tx}/{ty}.png', headers={'User-Agent': UA})
        tile = Image.open(io.BytesIO(urllib.request.urlopen(req, timeout=20).read())).convert('RGB')
        canvas.paste(tile, (int(tx * 256 - x0), int(ty * 256 - y0)))
        time.sleep(0.2)
# Quiet, warm styling that matches the site palette
g = ImageOps.grayscale(canvas)
g = ImageEnhance.Contrast(g).enhance(1.35)
styled = ImageOps.colorize(g, black=(70, 62, 50), mid=(178, 166, 146), white=(248, 244, 236), midpoint=170)
sea = Image.new("RGB", canvas.size, (176, 199, 210))
r, gch, b = canvas.split()
mask = Image.eval(Image.merge('RGB', (r, gch, b)).convert('HSV').split()[0], lambda h: 255 if 120 <= h <= 160 else 0)
styled.paste(sea, mask=mask.point(lambda v: 200 if v else 0))
styled.save(sys.argv[1], quality=90)
print('ok', W, H)
