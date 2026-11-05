#!/usr/bin/env bash
# Re-download the original King Solomon media from sivaninvestgroup.com into assets-src/,
# then rebuild optimized images:  python3 -I scripts/optimize-images.py assets-src/img dist/assets/img
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p assets-src/{img,pdf,video}
BASE=https://sivaninvestgroup.com/wp-content/uploads/2026/10
for f in $(python3 -c "import json;print(' '.join('ks-'+k for k in json.load(open('data/images.json'))))"); do
  curl -fsS -o "assets-src/img/$f.webp" "$BASE/$f.webp" || echo "skip $f"
done
curl -fsS -o assets-src/img/ks-crown.webp "$BASE/ks-crown.webp"
curl -fsS -o assets-src/video/ks-hero-film.mp4 "$BASE/ks-hero-film.mp4"
for f in $(python3 -c "import json;print(' '.join(d['file'] for d in json.load(open('data/project.json'))['downloads']))"); do
  curl -fsS -o "assets-src/pdf/$f" "$BASE/$f"
done
echo "done"
