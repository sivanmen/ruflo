#!/usr/bin/env bash
# Reproducible build for the King Solomon "Own the Horizon" films.
#   ASSETS=/path/to/assets OUT=/path/to/out ./build.sh [master|reel|ad|all] [--mux-only]
# ASSETS must contain img/ (official renders + licensed location images), fonts/, brand/
# (see asset_manifest.csv for every file and its source).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ASSETS="${ASSETS:?set ASSETS}"; OUT="${OUT:?set OUT}"
WHICH="${1:-all}"; MUX_ONLY="${2:-}"
mkdir -p "$OUT"

declare -A FILE=( [master]=king_solomon_brand_film_65s_16x9.mp4 [reel]=king_solomon_reel_30s_9x16.mp4 [ad]=king_solomon_ad_15s_9x16.mp4 )
declare -A LUFS=( [master]=-16 [reel]=-14 [ad]=-14 )

build_one() {
  local v="$1"
  if [ -z "$MUX_ONLY" ]; then
    python3 "$HERE/render.py" --version "$v" --assets "$ASSETS" --out "$OUT/${v}_video.mp4"
  fi
  python3 "$HERE/score.py" --version "$v" --out "$OUT/${v}.wav"
  # two-step loudness match: measure integrated loudness, apply static gain, true-peak limit
  local I
  I=$(ffmpeg -hide_banner -nostats -i "$OUT/${v}.wav" -af ebur128=framelog=verbose -f null - 2>&1 | awk '/I:/{v=$2} END{print v}')
  local G
  G=$(python3 -c "print(round(${LUFS[$v]} - ($I), 2))")
  ffmpeg -y -v error -i "$OUT/${v}_video.mp4" -i "$OUT/${v}.wav" -map 0:v -map 1:a -c:v copy \
    -af "volume=${G}dB,alimiter=limit=0.84:attack=5:release=80:level=false" \
    -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart "$OUT/${FILE[$v]}"
  echo "built $OUT/${FILE[$v]} (audio gain ${G} dB)"
}

qa_one() {
  local f="$OUT/${FILE[$1]}"
  echo "== $f"
  ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,sample_rate,channels \
    -show_entries format=duration,size -of compact "$f"
  ffmpeg -hide_banner -nostats -i "$f" -vf "blackdetect=d=0.12:pix_th=0.04" -af "silencedetect=n=-55dB:d=0.4,ebur128=peak=true:framelog=verbose" \
    -f null - 2>&1 | grep -E "black_start|silence_start|silence_end|I:|Peak:" || true
}

if [ "$WHICH" = all ]; then set -- ad reel master; else set -- "$WHICH"; fi
for v in "$@"; do build_one "$v"; done
for v in "$@"; do qa_one "$v"; done
