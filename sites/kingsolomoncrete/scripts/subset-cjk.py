"""Build small Chinese font files that contain only the characters the zh pages use.

Google Fonts' `text=` option returns a subset font per request, so instead of ~300 unicode-range
slices (several MB per visit) the zh pages load one or two small files per weight.
Run after `npm run build` whenever Chinese copy changes:
    python3 -I scripts/subset-cjk.py dist
Characters missing from the subset fall back to the system Chinese font, so new copy never breaks."""
import sys, os, re, glob, html, urllib.request, urllib.parse

DIST = sys.argv[1]
OUT = os.path.join(DIST, 'assets', 'fonts')
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
FACES = [('Noto Serif SC', 400), ('Noto Sans SC', 400), ('Noto Sans SC', 500)]
CHUNK = 700  # characters per request, keeps the URL well under server limits

chars = set(chr(c) for c in range(0x20, 0x7F))
for f in glob.glob(os.path.join(DIST, 'zh', '**', '*.html'), recursive=True):
    raw = open(f, encoding='utf-8').read()
    raw = re.sub(r'<(script|style)\b[^>]*>.*?</\1>', ' ', raw, flags=re.S)
    text = html.unescape(re.sub(r'<[^>]+>', ' ', raw))
    attrs = ' '.join(html.unescape(m) for m in re.findall(r'(?:alt|aria-label|placeholder|title|content|data-[a-z-]+)="([^"]*)"', raw))
    chars.update(ch for ch in text + attrs if not ch.isspace())
for f in glob.glob(os.path.join(DIST, 'zh', '**', '*.html'), recursive=True):  # JSON i18n blocks in scripts
    for m in re.findall(r'<script type="application/json"[^>]*>(.*?)</script>', open(f, encoding='utf-8').read(), re.S):
        chars.update(ch for ch in m.encode().decode('unicode_escape', 'ignore') if ord(ch) > 0x2E7F)
chars = sorted(ch for ch in chars if ord(ch) < 0x10000)
print(len(chars), 'characters')

def ranges(cs):
    cps = sorted(ord(c) for c in cs); out = []; start = prev = cps[0]
    for cp in cps[1:]:
        if cp == prev + 1: prev = cp; continue
        out.append((start, prev)); start = prev = cp
    out.append((start, prev))
    return ', '.join(f'U+{a:x}' if a == b else f'U+{a:x}-{b:x}' for a, b in out)

for old in glob.glob(os.path.join(OUT, 'NotoS*SC-*.woff2')):
    os.remove(old)
css = []
for fam, wt in FACES:
    for i in range(0, len(chars), CHUNK):
        part = chars[i:i + CHUNK]
        q = urllib.parse.urlencode({'family': f'{fam}:wght@{wt}', 'text': ''.join(part), 'display': 'swap'})
        block = urllib.request.urlopen(urllib.request.Request(f'https://fonts.googleapis.com/css2?{q}', headers={'User-Agent': UA})).read().decode()
        url = re.search(r'url\((https://[^)]+)\)', block).group(1)
        fn = f"{fam.replace(' ', '')}-{wt}-k{i // CHUNK}.woff2"
        urllib.request.urlretrieve(url, os.path.join(OUT, fn))
        css.append(f"@font-face {{ font-family: '{fam}'; font-style: normal; font-weight: {wt}; font-display: swap; src: url(/assets/fonts/{fn}) format('woff2'); unicode-range: {ranges(part)}; }}")
open(os.path.join(OUT, 'cjk.css'), 'w').write('\n'.join(css) + '\n')
total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT) if re.match(r'NotoS.*SC-\d+-k\d+\.woff2', f))
print(len(css), 'font files,', total // 1024, 'KB total')
