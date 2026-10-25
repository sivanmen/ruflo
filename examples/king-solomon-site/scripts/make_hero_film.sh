#!/usr/bin/env bash
# Builds the scroll-scrubbed hero film (1920x1080, H.264, 24fps) from project renders:
# morning cliff -> infinity pool -> terrace horizon -> dusk over Kalyves.
# usage: make_hero_film.sh <web_assets_dir> <out.mp4>
set -euo pipefail
W="$1"; OUT="$2"
FPS=24
seg() { # image seconds zoom_from zoom_to grade
  local n=$(( $2 * FPS / 10 ))
  echo "[$1]scale=3840:-2,zoompan=z='$3+($4-$3)*on/$n':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$n:s=1920x1080:fps=$FPS,$5,setsar=1,format=yuv420p"
}
ffmpeg -y -loglevel error \
  -loop 1 -i "$W/ks-cliff-sea.jpg" -loop 1 -i "$W/ks-infinity-pool.jpg" \
  -loop 1 -i "$W/ks-terrace-horizon.jpg" -loop 1 -i "$W/ks-location-dusk.jpg" \
  -filter_complex "
$(seg 0:v 32 1.00 1.10 'eq=brightness=0.02')[a];
$(seg 1:v 30 1.04 1.14 'eq=brightness=0.0')[b];
$(seg 2:v 30 1.10 1.00 'eq=brightness=-0.01')[c];
$(seg 3:v 38 1.00 1.12 'eq=brightness=-0.10:saturation=0.9')[d];
[a][b]xfade=transition=fade:duration=0.8:offset=2.4[ab];
[ab][c]xfade=transition=fade:duration=0.8:offset=4.6[abc];
[abc][d]xfade=transition=fade:duration=0.9:offset=6.8,format=yuv420p[v]" \
  -map "[v]" -t 10.6 -r $FPS -c:v libx264 -profile:v high -preset slow -crf 22 -g 12 -keyint_min 12 \
  -pix_fmt yuv420p -movflags +faststart -an "$OUT"
ls -la "$OUT"
