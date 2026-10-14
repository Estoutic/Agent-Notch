"""Screen textures for the v7 key stills: the app's @3x snapshots placed on a 3024x1964 desktop under the hardware
notch, and the matching lid-glass face for Blender.

  python3 make_v7_faces.py            writes cache/v7/desktop-<name>.png and cache/v7/face-<name>.png

Stage geometry (src/world.tsx): @2x pixels, hardware notch [792, 1160], centre 976; the screen is 3024 wide, so the
stage origin sits 536 px right of the screen's left edge. The @3x snapshots share the stage origin (their notch bar
ends at x = 1739 / 1.5 = 1159). Glass and mask geometry match make_theme_faces.py.
"""
import os
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
PROMO = os.path.dirname(HERE)
CACHE = os.path.join(HERE, "cache")
OUT = os.path.join(CACHE, "v7")
DW, DH, BAR = 3024, 1964, 64
SX0 = 3024 // 2 - 976
PX_MM, INSET = 20, 4.1
SNAPS = {
    "ask": "public/snap4/ask.png",
    "swarm": "public/snap4/swarm.png",
    "awake": "public/snap4/awake/swarm.png",
}


def wallpaper():
    """Dark graphite with a soft warm glow low-left, so the panel is the brightest thing on the screen."""
    w = Image.new("RGB", (DW, DH), (18, 19, 22))
    glow = Image.new("L", (DW, DH), 0)
    ImageDraw.Draw(glow).ellipse((-700, 900, 1500, 2700), fill=255)
    glow = glow.filter(ImageFilter.GaussianBlur(320))
    w.paste(Image.new("RGB", (DW, DH), (46, 38, 34)), (0, 0), glow)
    return w


def desktop(src):
    shot = Image.open(os.path.join(PROMO, src)).convert("RGB")
    s = shot.resize((round(shot.width * 2 / 3), round(shot.height * 2 / 3)), Image.LANCZOS)
    d = wallpaper()
    # keep the snapshot's dark parts (notch bar, panel), drop its flat grey desktop and menu bar
    # the panel: everything under the menu bar that is not the snapshot's flat grey desktop (89, 89, 89)
    grey = s.point(lambda v: 255 if abs(v - 89) <= 4 else 0).convert("L").point(lambda v: 255 if v == 255 else 0)
    body = Image.eval(grey, lambda v: 255 - v)
    body.paste(0, (0, 0, s.width, BAR + 4))
    x0, y0, x1, y1 = body.getbbox()
    box = Image.new("L", s.size, 0)
    ImageDraw.Draw(box).rounded_rectangle((x0, y0, x1 - 1, y1 - 1), radius=22, fill=255)
    bar = Image.new("L", s.size, 0)
    row = [x for x in range(s.width) if sum(s.getpixel((x, 10))) < 15]
    ImageDraw.Draw(bar).rounded_rectangle((row[0], -20, row[-1], BAR - 1), radius=14, fill=255)
    m = Image.new("L", s.size, 0)
    m.paste(box, (0, 0), box)
    m.paste(bar, (0, 0), bar)
    # soft shadow under the panel
    sh = m.filter(ImageFilter.GaussianBlur(30))
    d.paste(Image.new("RGB", s.size, (0, 0, 0)), (SX0, 14), sh.point(lambda v: v * 0.7))
    # menu bar: translucent dark strip with the snapshot's own menu titles
    mb = d.crop((0, 0, DW, BAR)).point(lambda v: int(v * 0.6 + 8))
    d.paste(mb, (0, 0))
    menu = s.crop((0, 0, row[0] - 40, BAR))
    d.paste(menu, (10, 0), menu.convert("L").point(lambda v: 255 if v > 120 else 0))
    d.paste(s, (SX0, 0), m)
    return d


def face(desk, mask_path):
    m = Image.open(mask_path)
    fw, fh = m.size
    r = m.split()[0]
    full = Image.new("RGB", (fw, fh), (0, 0, 0))
    a0 = round(INSET * PX_MM)
    full.paste(desk.resize((DW * 2, DH * 2), Image.LANCZOS), (a0, a0))
    out = Image.new("RGB", (fw, fh), (0, 0, 0))
    out.paste(full, (0, 0), r)
    return out


def main():
    os.makedirs(OUT, exist_ok=True)
    mask = os.path.join(CACHE, "mask.png")
    noglow = os.path.join(CACHE, "mask-noglow.png")
    if not os.path.exists(noglow):
        mm = Image.open(mask).convert("RGB")
        rr, _, bb = mm.split()
        Image.merge("RGB", (rr, Image.new("L", mm.size, 0), bb)).save(noglow)
    for name, src in SNAPS.items():
        d = desktop(src)
        d.save(os.path.join(OUT, f"desktop-{name}.png"))
        face(d, mask).save(os.path.join(OUT, f"face-{name}.png"))
        print("wrote", name)


if __name__ == "__main__":
    main()
