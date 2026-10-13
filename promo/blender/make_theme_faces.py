"""Screen textures for the v5 themes orbit (shot `themes`): one desktop per theme, built from the app's own
--snapshot-themes renders, and the matching lid-glass face for Blender.

  python3 make_theme_faces.py <themes_dir> [--only synthwave]
    <themes_dir>/theme-<id>.png   from: AGENT_NOTCH_LANG=en AGENT_NOTCH_SNAPSHOT_SCALE=3 AgentsNotch --snapshot-themes <dir>
  writes cache/themes/desktop-<id>.png (3024x1964), cache/themes/face-<id>.png (glass, 20 px/mm) and
  cache/mask-noglow.png (the active-area mask without the amber glow boost, which belongs to desktop.png).

Geometry matches make_desktop.swift: glass 310.6 x 219.2 mm, active 302.4 x 196.4 mm inset 4.1 mm, desktop at 2x.
"""
import os
import sys
from PIL import Image, ImageFilter, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "cache")
OUT = os.path.join(CACHE, "themes")
# Film order: 13 themes, one per beat (Glass is the default and opens the list in the app, not in the orbit).
ORDER = ["terminal", "midnight", "paper", "blueprint", "phosphor", "console", "synthwave",
         "hologram", "pixel", "brutal", "wasteland", "marks", "ducks"]
DW, DH = 3024, 1964
PX_MM, INSET = 20, 4.1


def desktop(src):
    shot = Image.open(src).convert("RGB")
    # wallpaper: the theme's own backdrop stretched over the screen, blurred so the panels' ghosts vanish
    wall = shot.resize((DW, DH), Image.LANCZOS).filter(ImageFilter.GaussianBlur(90))
    d = wall.copy()
    # the three panels, as large as the width allows, under the menu bar
    s = (DW - 120) / shot.width
    pan = shot.resize((round(shot.width * s), round(shot.height * s)), Image.LANCZOS)
    top = 64 + (DH - 64 - pan.height) // 2
    # feathered edges so the snapshot melts into its own wallpaper
    fm = Image.new("L", pan.size, 0)
    ImageDraw.Draw(fm).rectangle((70, 70, pan.width - 70, pan.height - 70), fill=255)
    d.paste(pan, ((DW - pan.width) // 2, top), fm.filter(ImageFilter.GaussianBlur(28)))
    # menu bar: a darkened strip of the wallpaper
    bar = d.crop((0, 0, DW, 64)).point(lambda v: int(v * 0.55))
    d.paste(bar, (0, 0))
    return d


def face(desk, mask):
    m = Image.open(mask)
    fw, fh = m.size
    r = m.split()[0]
    full = Image.new("RGB", (fw, fh), (0, 0, 0))
    a0 = round(INSET * PX_MM)
    full.paste(desk.resize((DW * 2, DH * 2), Image.LANCZOS), (a0, a0))
    out = Image.new("RGB", (fw, fh), (0, 0, 0))
    out.paste(full, (0, 0), r)
    return out


def main():
    src = sys.argv[1]
    only = sys.argv[sys.argv.index("--only") + 1].split(",") if "--only" in sys.argv else ORDER
    os.makedirs(OUT, exist_ok=True)
    mask = os.path.join(CACHE, "mask.png")
    m = Image.open(mask).convert("RGB")
    rr, _, bb = m.split()
    Image.merge("RGB", (rr, Image.new("L", m.size, 0), bb)).save(os.path.join(CACHE, "mask-noglow.png"))
    for t in only:
        d = desktop(os.path.join(src, f"theme-{t}.png"))
        d.save(os.path.join(OUT, f"desktop-{t}.png"))
        face(d, mask).save(os.path.join(OUT, f"face-{t}.png"))
        print("wrote", t)


main()
