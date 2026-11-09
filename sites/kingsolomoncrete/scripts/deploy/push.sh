#!/usr/bin/env bash
# usage: push.sh BASE_URL ZIP TOKENFILE CHUNK_MB
set -euo pipefail
BASE=$1; ZIP=$2; TOK=$(cat "$3"); MB=${4:-8}
W=$(mktemp -d); split -b ${MB}m -d -a 4 "$ZIP" "$W/part-"
n=0; for f in "$W"/part-*; do
  for try in 1 2 3; do
    r=$(curl -sS -m 300 -H "X-Deploy-Token: $TOK" -F "c=@$f" "$BASE/ks-deploy.php?action=chunk&i=$n") && echo "$r" | grep -q "\"$(sha256sum "$f" | cut -c1-64)\"" && break
    echo "retry chunk $n: $r"; sleep $((try*3))
  done
  n=$((n+1)); printf "."
done; echo " $n chunks"
curl -sS -m 600 -X POST -H "X-Deploy-Token: $TOK" "$BASE/ks-deploy.php?action=finish&n=$n&sha256=$(sha256sum "$ZIP" | cut -c1-64)"; echo
rm -rf "$W"
