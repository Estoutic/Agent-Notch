"""Draws the exported screen corners and notch centre onto one rendered frame per shot, so the JSON can be
checked by eye. Output: public/blender/_check/<shot>.png (frame composited over dark grey).
  blender -b -P check_corners.py -- [--frame mid|first|last|N] [--dir public/blender]
"""
import bpy
import json
import os
import sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
a = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
opts = dict(zip([k.lstrip("-") for k in a[::2]], a[1::2]))
root = opts.get("dir", os.path.join(os.path.dirname(HERE), "public", "blender"))
which = opts.get("frame", "mid")
out_dir = os.path.join(root, "_check")
os.makedirs(out_dir, exist_ok=True)


def plot(img, x, y, color, r=2):
    h, w, _ = img.shape
    xi, yi = int(round(x)), int(round(y))
    y0, y1, x0, x1 = max(0, yi - r), min(h, yi + r + 1), max(0, xi - r), min(w, xi + r + 1)
    if y0 < y1 and x0 < x1:
        img[y0:y1, x0:x1, :3] = color


def line(img, p, q, color, r=2):
    n = int(max(abs(q[0] - p[0]), abs(q[1] - p[1]))) + 1
    for t in np.linspace(0, 1, min(n, 20000)):
        plot(img, p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, color, r)


for name in sorted(f[:-5] for f in os.listdir(root) if f.endswith(".json") and not f.startswith("_")):
    data = json.load(open(os.path.join(root, name + ".json")))
    n = data["frameCount"]
    f = {"first": 0, "mid": n // 2, "last": n - 1}.get(which, None)
    f = int(which) if f is None else f
    path = os.path.join(root, name, f"{f:04d}.png")
    if not os.path.exists(path):
        print("missing", path)
        continue
    im = bpy.data.images.load(path)
    w, h = im.size
    px = np.array(im.pixels[:], dtype=np.float32).reshape(h, w, 4)[::-1]   # top row first
    bg = np.array([0.063, 0.067, 0.075], dtype=np.float32)
    rgb = px[:, :, :3] * px[:, :, 3:4] + bg * (1 - px[:, :, 3:4]) if im.alpha_mode != 'NONE' else px[:, :, :3]
    img = np.concatenate([rgb, np.ones((h, w, 1), np.float32)], axis=2)
    rec = data["frames"][f]
    k = w / data["width"]   # previews may be rendered at a lower scale
    c = {key: (v[0] * k, v[1] * k) for key, v in rec["corners"].items()}
    quad = [c["tl"], c["tr"], c["br"], c["bl"]]
    amber, cyan, red = (1.0, 0.69, 0.12), (0.2, 0.9, 1.0), (1.0, 0.2, 0.2)
    for i in range(4):
        line(img, quad[i], quad[(i + 1) % 4], amber, 2)
    for p, col in zip(quad, (red, amber, amber, amber)):
        plot(img, p[0], p[1], col, 7)   # tl is red so orientation is visible
    nx, ny = rec["notch"][0] * k, rec["notch"][1] * k
    line(img, (nx - 30, ny), (nx + 30, ny), cyan, 2)
    line(img, (nx, ny - 30), (nx, ny + 30), cyan, 2)
    out = bpy.data.images.new(f"chk_{name}", w, h, alpha=False)
    out.pixels[:] = img[::-1].ravel()
    out.filepath_raw = os.path.join(out_dir, f"{name}.png")
    out.file_format = 'PNG'
    out.save()
    print(f"CHECK {name} frame {f} -> {out.filepath_raw}")
