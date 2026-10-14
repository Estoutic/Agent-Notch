"""Screen textures for the v7 key stills: the app's @3x snapshots placed on a 3024x1964 desktop under the hardware
notch, and the matching lid-glass face for Blender.

  python3 make_v7_faces.py            writes cache/v7/desktop-<name>.png and cache/v7/face-<name>.png
  python3 make_v7_faces.py --anim     the extra faces of the animatic (gate 3)
  python3 make_v7_faces.py --terms    cascade terminal textures
  python3 make_v7_faces.py --ghosts   night shot: ghost terminal logs and title bars

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
# v7 animatic (gate 3): more panels, and "bar-" faces with the notch bar only (panel closed)
SNAPS_ANIM = {
    "one": "public/snap4/one.png",
    "multi": "public/snap4/multi.png",
    "sub": "public/snap4/sub.png",
    "projects": "public/snap4/projects.png",
    "question": "public/snap4/question.png",
    "plan": "public/snap4/plan.png",
    "awake-sub": "public/snap4/awake/sub.png",
    "bar-ask": "public/snap4/ask.png",
    "bar-projects": "public/snap4/projects.png",
    "bar-one": "public/snap4/one.png",
    # after one click only one request is resolved: Allow on Claude's leaves Codex's waiting, Deny on Codex's leaves Claude's
    "ask-codex": "public/snap5/ask-codex.png",
    "ask-claude": "public/snap5/ask-claude.png",
}


def wallpaper():
    """Dark graphite with a soft warm glow low-left, so the panel is the brightest thing on the screen."""
    w = Image.new("RGB", (DW, DH), (18, 19, 22))
    glow = Image.new("L", (DW, DH), 0)
    ImageDraw.Draw(glow).ellipse((-700, 900, 1500, 2700), fill=255)
    glow = glow.filter(ImageFilter.GaussianBlur(320))
    w.paste(Image.new("RGB", (DW, DH), (46, 38, 34)), (0, 0), glow)
    return w


def desktop(src, bar_only=False):
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
    if not bar_only:
        m.paste(box, (0, 0), box)
    m.paste(bar, (0, 0), bar)
    # soft shadow under the panel
    sh = m.filter(ImageFilter.GaussianBlur(30)) if not bar_only else Image.new("L", s.size, 0)
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
    import sys
    snaps = SNAPS_ANIM if "--anim" in sys.argv else SNAPS
    for name, src in snaps.items():
        d = desktop(src, bar_only=name.startswith("bar-"))
        d.save(os.path.join(OUT, f"desktop-{name}.png"))
        face(d, mask).save(os.path.join(OUT, f"face-{name}.png"))
        print("wrote", name)


if __name__ == "__main__" and not {"--terms", "--ghosts"} & set(__import__("sys").argv):
    main()


# ---------------------------------------------------------------- v7 animatic: cascade terminals
TERM_TITLES = [("claude", "wedding-app"), ("codex", "CONF-360"), ("claude", "hexhaven"), ("claude", "agenttrack"),
               ("codex", "audit-b10"), ("claude", "docs/upload"), ("codex", "release-notes"), ("claude", "stickers"),
               ("claude", "billing-api"), ("codex", "infra"), ("claude", "design-system"), ("codex", "mobile-shell")]
TERM_LINES = [
    ("● Read(apps/api/src/routes/upload.ts)", (154, 154, 160)), ("  → Read 214 lines", (110, 110, 116)),
    ("● Edit(src/services/media.ts)", (154, 154, 160)), ("  → Updated with 12 additions, 3 removals", (110, 110, 116)),
    ("● Bash(pnpm --filter api test)", (154, 154, 160)), ("  → PASS src/services/media.test.ts (38)", (48, 209, 88)),
    ("● Grep(\"compress\", path: apps/)", (154, 154, 160)), ("  → Found 9 files", (110, 110, 116)),
    ("● Task(Explore · routes)", (154, 154, 160)), ("  → Done (14 tool uses · 31.2k tokens)", (110, 110, 116)),
    ("● Update Todos", (154, 154, 160)), ("  → [x] Read the upload code", (110, 110, 116)),
    ("     [ ] Add WebCodecs compression", (110, 110, 116)), ("● Write(src/services/media.ts)", (154, 154, 160)),
    ("  → Wrote 88 lines", (110, 110, 116)), ("● Bash(git diff --stat)", (154, 154, 160)),
]


def terminals():
    from PIL import ImageFont
    mono = os.path.join(PROMO, "node_modules", "geist", "dist", "fonts", "geist-mono", "GeistMono-Medium.ttf")
    sans = os.path.join(PROMO, "node_modules", "geist", "dist", "fonts", "geist-sans", "Geist-Medium.ttf")
    fm, fs = ImageFont.truetype(mono, 30), ImageFont.truetype(sans, 28)
    for i, (kind, proj) in enumerate(TERM_TITLES):
        w, h = 1200, 780
        im = Image.new("RGB", (w, h), (14, 14, 16))
        d = ImageDraw.Draw(im)
        d.rectangle((0, 0, w, 56), fill=(30, 30, 33))
        for k, c in enumerate([(255, 95, 87), (254, 188, 46), (40, 200, 64)]):
            d.ellipse((22 + k * 34, 18, 42 + k * 34, 38), fill=c)
        d.text((w / 2, 28), f"{kind} — {proj}", font=fs, fill=(170, 170, 176), anchor="mm")
        y = 80
        for j in range(17):
            t, c = TERM_LINES[(j + i * 3) % len(TERM_LINES)]
            d.text((28, y), t, font=fm, fill=c)
            y += 40
        if i == 0:   # the one that will stop and ask
            d.rectangle((20, h - 150, w - 20, h - 20), outline=(255, 176, 31), width=3)
            d.text((44, h - 130), "Bash command   pnpm --filter api test", font=fm, fill=(240, 240, 242))
            d.text((44, h - 82), "Do you want to proceed?", font=fm, fill=(255, 176, 31))
        im.save(os.path.join(OUT, f"term-{i}.png"))
    print("wrote", len(TERM_TITLES), "terminals")


GHOST_TITLES = [("claude", "wedding-app"), ("codex", "billing-api"), ("claude", "agenttrack"), ("codex", "infra"),
                ("claude", "hexhaven")]


def ghosts():
    """Night shot: a tall, seamlessly repeating log per ghost terminal (scrolled in Blender) and its title bar."""
    from PIL import ImageFont
    mono = os.path.join(PROMO, "node_modules", "geist", "dist", "fonts", "geist-mono", "GeistMono-Medium.ttf")
    sans = os.path.join(PROMO, "node_modules", "geist", "dist", "fonts", "geist-sans", "Geist-Medium.ttf")
    fm, fs = ImageFont.truetype(mono, 30), ImageFont.truetype(sans, 28)
    for i, (kind, proj) in enumerate(GHOST_TITLES):
        w, rows = 1200, 40
        im = Image.new("RGB", (w, rows * 40), (0, 0, 0))
        d = ImageDraw.Draw(im)
        for j in range(rows):
            t, c = TERM_LINES[(j * 3 + i * 5) % len(TERM_LINES)] if j % 7 else TERM_LINES[(j + i) % len(TERM_LINES)]
            d.text((28, j * 40 + 6), t, font=fm, fill=c)
        im.save(os.path.join(OUT, f"ghostlog-{i}.png"))
        bar = Image.new("RGB", (w, 56), (40, 40, 44))
        b = ImageDraw.Draw(bar)
        for k, c in enumerate([(255, 95, 87), (254, 188, 46), (40, 200, 64)]):
            b.ellipse((22 + k * 34, 18, 42 + k * 34, 38), fill=c)
        b.text((w / 2, 28), f"{kind} — {proj}", font=fs, fill=(200, 200, 206), anchor="mm")
        bar.save(os.path.join(OUT, f"ghostbar-{i}.png"))
    print("wrote", len(GHOST_TITLES), "ghost terminals")


if __name__ == "__main__" and "--terms" in __import__("sys").argv:
    terminals()
if __name__ == "__main__" and "--ghosts" in __import__("sys").argv:
    ghosts()
