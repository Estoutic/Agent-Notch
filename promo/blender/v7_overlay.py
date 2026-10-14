"""v7 key stills: the 2D layer on top of the EEVEE renders (small captions in Geist, the Dramatisation label).

  python3 v7_overlay.py            reads cache/v7/stills/<pick>.png, writes ../out/v7-stills/<n>-<name>.png

The captions are drafts for the gate-1 look only; the film's type system (src/v7/type.tsx) comes with the animatic.
"""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
PROMO = os.path.dirname(HERE)
SRC = os.path.join(HERE, "cache", "v7", "stills")
OUT = os.path.join(PROMO, "out", "v7-stills")
GEIST = os.path.join(PROMO, "node_modules", "geist", "dist", "fonts", "geist-sans")

# (output name, render, title, sub, dramatisation, caption top y): captions sit in each frame's empty band
STILLS = [
    ("1-request", "request-v1", "Risky commands turn red.", "No hotkey can allow them.", False, 72),
    ("2-swarm", "swarm-v0", "55 agents. 11 projects.", "One notch keeps count.", False, 72),
    ("3-night", "night-v2", "Keep awake.", "The Mac stays on with the lid closed.", True, 862),
]


def font(weight, size):
    return ImageFont.truetype(os.path.join(GEIST, f"Geist-{weight}.ttf"), size)


def shadowed(im, xy, text, f, fill):
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).text(xy, text, font=f, fill=(0, 0, 0, 170))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(10)))
    ImageDraw.Draw(im).text(xy, text, font=f, fill=fill)


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, src, title, sub, dram, y in STILLS:
        im = Image.open(os.path.join(SRC, f"{src}.png")).convert("RGBA")
        x = 120
        shadowed(im, (x, y), title, font("SemiBold", 56), (245, 245, 247, 255))
        shadowed(im, (x + 2, y + 72), sub, font("Regular", 30), (190, 192, 200, 255))
        if dram:
            f = font("Medium", 22)
            label = "DRAMATISATION"
            d = ImageDraw.Draw(im)
            cx = 1920 - 120
            # tracked caps, right-aligned
            chars = list(label)
            widths = [d.textlength(c, font=f) for c in chars]
            total = sum(widths) + 4 * (len(chars) - 1)
            px = cx - total
            for c, cw in zip(chars, widths):
                d.text((px, 96), c, font=f, fill=(215, 220, 232, 235))
                px += cw + 4
        out = os.path.join(OUT, f"{name}.png")
        im.convert("RGB").save(out)
        print("wrote", out)


if __name__ == "__main__":
    main()
