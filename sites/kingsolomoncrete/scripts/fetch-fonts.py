"""Download Google Fonts woff2 files for self-hosting (GDPR: no requests to Google at runtime).
Usage: python3 -I scripts/fetch-fonts.py dist/assets/fonts"""
import sys, re, os, urllib.request
OUT = sys.argv[1]
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
FAMILIES = {
  'latin': ('family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300..600', {'latin', 'latin-ext'}),
  'greek': ('family=Noto+Serif+Display:ital,wght@0,300;0,400;1,300&family=Inter:wght@300..600', {'greek', 'greek-ext', 'latin'}),
  'hebrew': ('family=Frank+Ruhl+Libre:wght@300;400;500&family=Heebo:wght@300..600', {'hebrew', 'latin'}),
  'arabic': ('family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500', {'arabic', 'latin'}),
}
os.makedirs(OUT, exist_ok=True)
for group, (q, subsets) in FAMILIES.items():
    req = urllib.request.Request(f'https://fonts.googleapis.com/css2?{q}&display=swap', headers={'User-Agent': UA})
    css = urllib.request.urlopen(req).read().decode()
    blocks = re.findall(r'/\* ([\w-]+) \*/\s*(@font-face \{.*?\})', css, re.S)
    keep = []
    for subset, block in blocks:
        if subset not in subsets:
            continue
        url = re.search(r'url\((https://[^)]+)\)', block).group(1)
        fam = re.search(r"font-family: '([^']+)'", block).group(1).replace(' ', '')
        style = re.search(r'font-style: (\w+)', block).group(1)
        wt = re.search(r'font-weight: ([\d ]+);', block).group(1).replace(' ', '-')
        fn = f'{fam}-{style}-{wt}-{subset}.woff2'
        p = os.path.join(OUT, fn)
        if not os.path.exists(p):
            urllib.request.urlretrieve(url, p)
        keep.append(block.replace(url, f'/assets/fonts/{fn}'))
    open(os.path.join(OUT, f'{group}.css'), 'w').write('\n'.join(keep))
    print(group, len(keep))
