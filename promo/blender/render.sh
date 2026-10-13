#!/bin/sh
# Builds the laptop scene and renders every 3D shot of the launch film into promo/public/blender/.
#   ./render.sh                 all shots, 64 samples (about 1.5 h on an M1 Max)
#   SHOTS=reveal,orbit ./render.sh
#   SAMPLES=16 SCALE=50 FRAMES=first,mid,last ./render.sh   quick look
# Steps: fetch the CC0 HDRI (Poly Haven) once, draw the screen texture (Swift/CoreGraphics), build + render in
# Blender (Cycles, Metal), export per-frame screen corners to <shot>.json, draw the corner check images.
set -eu
cd "$(dirname "$0")"
BLENDER="${BLENDER:-/opt/homebrew/bin/blender}"
OUT="${OUT:-../public/blender}"
mkdir -p cache "$OUT"
HDRI=cache/studio_small_09_2k.hdr
if [ ! -s "$HDRI" ]; then
  curl -fsSL -o "$HDRI" https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/studio_small_09_2k.hdr
fi
xcrun swift make_desktop.swift cache "$OUT"
set -- --shots "${SHOTS:-all}" --samples "${SAMPLES:-64}" --scale "${SCALE:-100}" --out "$OUT" --save-blend cache/macbook.blend
if [ -n "${FRAMES:-}" ]; then set -- "$@" --frames "$FRAMES"; fi
"$BLENDER" -b --factory-startup -P build_scene.py -- "$@"
"$BLENDER" -b --factory-startup -P check_corners.py -- --dir "$OUT" --frame "${CHECK_FRAME:-mid}"
