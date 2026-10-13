#!/bin/sh
# v5 preview plates: the full dive and the 13-theme orbit (a theme per 15 frames), low samples for the animatic.
#   SAMPLES=24 SCALE=50 ./preview_v5.sh
set -eu
cd "$(dirname "$0")"
BLENDER="${BLENDER:-/opt/homebrew/bin/blender}"
OUT="${OUT:-../public/blender}"
SAMPLES="${SAMPLES:-24}"; SCALE="${SCALE:-50}"
"$BLENDER" -b --factory-startup -P build_scene.py -- --shots dive --samples "$SAMPLES" --scale "$SCALE" --out "$OUT"
i=0
for t in terminal midnight paper blueprint phosphor console synthwave hologram pixel brutal wasteland marks ducks; do
  fr=$(python3 -c "print(','.join(str($i*15+k) for k in range(15)))")
  "$BLENDER" -b --factory-startup -P build_scene.py -- --shots themes --samples "$SAMPLES" --scale "$SCALE" --out "$OUT" \
    --face cache/themes/face-$t.png --mask cache/mask-noglow.png --screen 2.2 --key 0.15 --fill 0.25 --frames "$fr"
  i=$((i+1))
done
echo PREVIEW_DONE
