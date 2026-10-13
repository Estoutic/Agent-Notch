"""v5 style probes: synthesised SFX over the first 17 s of the music edit.

  python audio/v5_sfx.py A|B [--music public/audio/v5-heist-2.wav]  -> public/audio/v5-probe-<v>.wav
  python audio/v5_sfx.py film                                       -> public/audio/v5-film.wav (59 s)

Cue frames match src/v5/Proto.tsx (0-510) and src/v5/Punch.tsx (510-1770). Everything is synthesised here (no samples, no Apple sounds).
"""
import argparse
import os
import subprocess

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
PROMO = os.path.dirname(HERE)
SR = 48000
FPS = 30
rng = np.random.default_rng(7)


def t_(d):
    return np.arange(int(d * SR)) / SR


def lp(x, fc):
    """One-pole low-pass."""
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def hp(x, fc):
    return x - lp(x, fc)


def sweep(f0, f1, d, curve=3.0):
    t = t_(d)
    f = f1 + (f0 - f1) * np.exp(-t * curve / d * 3)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def impact(g=1.0, d=1.6):
    t = t_(d)
    sub = sweep(140, 38, d, 1.2) * np.exp(-t / 0.45)
    crack = hp(rng.standard_normal(len(t)), 1500) * np.exp(-t / 0.03)
    body = lp(rng.standard_normal(len(t)), 900) * np.exp(-t / 0.12) * 1.6
    return g * (1.0 * sub + 0.35 * crack + 0.5 * body)


def hit(g=1.0, pitch=1.0):
    t = t_(0.5)
    sub = sweep(110 * pitch, 45 * pitch, 0.5, 2) * np.exp(-t / 0.12)
    snap = hp(rng.standard_normal(len(t)), 2500) * np.exp(-t / 0.015)
    return g * (0.9 * sub + 0.4 * snap)


def thud(g=1.0):
    t = t_(0.35)
    return g * (sweep(90, 42, 0.35, 2) * np.exp(-t / 0.09) + 0.25 * hp(rng.standard_normal(len(t)), 3000) * np.exp(-t / 0.006))


def click(g=1.0):
    t = t_(0.05)
    return g * hp(rng.standard_normal(len(t)), 3500) * np.exp(-t / 0.004)


def clack(g=1.0):
    t = t_(0.12)
    n = rng.standard_normal(len(t))
    return g * (lp(hp(n, 900), 5000) * np.exp(-t / 0.018) + 0.4 * np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.03))


def tick(g=1.0):
    t = t_(0.04)
    return g * np.sin(2 * np.pi * 3200 * t) * np.exp(-t / 0.006)


def whoosh(d=0.6, g=1.0, peak=0.7):
    t = t_(d)
    n = rng.standard_normal(len(t))
    e = np.where(t < d * peak, (t / (d * peak)) ** 2, np.exp(-(t - d * peak) / (d * 0.12)))
    lo, hi = lp(n, 800), lp(n, 4000)
    mix = np.where(t < d * peak, t / (d * peak), 1.0)
    return g * e * ((1 - mix) * lo + mix * hi) * 0.8


def riser(d=1.0, g=1.0):
    t = t_(d)
    n = rng.standard_normal(len(t))
    x = hp(n, 600) * (t / d) ** 2.5
    tone = np.sin(2 * np.pi * np.cumsum(200 + 1600 * (t / d) ** 2) / SR) * (t / d) ** 3 * 0.25
    return g * (0.5 * x + tone)


def yes(g=1.0, note=76):
    t = t_(0.5)
    f = 440 * 2 ** ((note - 69) / 12)
    return g * (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2 * f * t) + 0.2 * np.sin(2 * np.pi * 1.5 * f * t)) * np.exp(-t / 0.16) * 0.35


def beep(g=1.0, f=1400, d=0.09):
    t = t_(d)
    return g * np.sign(np.sin(2 * np.pi * f * t)) * 0.18 * np.minimum(1, (d - t) / 0.01)


def glitch(g=1.0, d=0.1):
    t = t_(d)
    n = rng.standard_normal(len(t))
    hold = np.repeat(n[::60], 60)[: len(t)]
    return g * 0.45 * np.round(hold * 3) / 3 * np.sin(2 * np.pi * 70 * t + 3 * np.sin(2 * np.pi * 13 * t))


def cues(v):
    c = [(15, thud(0.9)), (15, click(0.8))]
    for i, f in enumerate([22, 30, 37]):
        c += [(f, hit(0.9 + 0.15 * i, 1 + 0.12 * i)), (f - 2, whoosh(0.12, 0.5))]
    for f in [45, 53, 60, 68, 75, 83]:
        c.append((f, thud(0.85)))
        if v == "B":
            c.append((f, glitch(0.8)))
    c.append((90, riser(1.0, 0.8)))
    if v == "B":
        c += [(17, beep(1, 1200)), (19, beep(1, 1200)), (26, beep(1, 1800, 0.14)), (120, glitch(0.6, 0.06))]
    c += [(150, impact(1.2)), (160, hit(0.7)), (175, hit(0.7, 1.1)), (190, hit(0.85, 0.9)), (205, hit(0.7, 1.2)), (220, impact(0.8, 1.2))]
    c += [(262, whoosh(0.7, 1.0)), (313, thud(0.9))]
    for i, f in enumerate(np.arange(316, 390, 7.5)):
        c.append((f, tick(0.35 + 0.05 * i)))
    c += [(380, riser(0.33, 0.7)), (390, impact(1.4, 1.8)), (390, click(1.0)), (390, yes(0.8, 79)), (403, whoosh(0.25, 0.5, 0.6))]
    c += [(418, whoosh(0.2, 0.6, 0.8)), (460, whoosh(0.2, 0.6, 0.8))]
    for k, n in [(450, 76), (480, 81)]:
        c += [(k - 6, clack(0.8)), (k - 3, clack(0.8)), (k, clack(1.0)), (k, yes(1.0, n)), (k, hit(0.5, 1.4))]
    c.append((492, thud(1.0)))
    return c


def film_cues():
    c = []
    c += [(510, thud(1.0)), (510, glitch(0.6)), (534, clack(0.7)), (537, clack(0.7)), (540, clack(0.8)), (540, thud(0.6)), (541, glitch(0.7))]
    c += [(549, hit(0.6)), (579, impact(0.9, 1.0)), (598, hit(0.5)), (627, click(1.0)), (627, hit(0.8, 0.8)), (627, yes(0.8, 72)), (632, yes(0.7, 67))]
    c += [(640, impact(1.0, 1.4)), (688, whoosh(0.3, 0.6)), (694, thud(0.6)), (750, click(1.0)), (750, yes(0.8, 79)), (750, hit(0.6, 1.3))]
    c += [(776, whoosh(0.4, 0.8)), (792, thud(0.7)), (840, click(1.0)), (840, yes(0.9, 81)), (840, hit(0.7, 1.2))]
    c += [(866, whoosh(0.3, 0.6)), (878, thud(0.8)), (930, hit(0.8)), (950, tick(0.4)), (954, tick(0.45)), (958, tick(0.5)), (972, click(0.9)), (972, thud(0.5))]
    c += [(1000, thud(0.8)), (1003, beep(0.7, 1900, 0.06)), (1030, thud(0.8))] + [(f, tick(0.15)) for f in range(1030, 1066, 3)]
    c += [(1078, whoosh(0.3, 0.6)), (1110, thud(0.9)), (1110, yes(0.7, 76)), (1155, click(1.0)), (1152, whoosh(0.55, 0.8, 0.9)), (1169, impact(0.8, 1.0)), (1173, thud(0.6))]
    c += [(1228, whoosh(0.3, 0.6)), (1248, thud(0.7)), (1258, riser(1.0, 0.7)), (1268, impact(1.0, 1.2))]
    c += [(1290, impact(1.4, 1.6))]
    chord = [69, 72, 76, 79, 81, 84]
    c += [(1290 + 15 * i, yes(0.35, chord[i % len(chord)])) for i in range(1, 12)] + [(1470, hit(0.8)), (1470, yes(0.5, 84))]
    c += [(1486, thud(0.8)), (1493, thud(0.8))]
    c += [(1500, yes(0.9, 76)), (1504, yes(0.8, 79)), (1515, yes(0.9, 81)), (1530, yes(0.9, 74)), (1534, yes(0.8, 78)), (1545, yes(0.9, 72)), (1548, yes(0.8, 76)), (1551, yes(0.8, 79))]
    c += [(1558, whoosh(0.3, 0.6)), (1575, tick(0.3)), (1590, impact(0.8, 1.0))] + [(f, tick(0.2)) for f in range(1605, 1650, 15)]
    c += [(1650, impact(1.0, 2.5))]
    return c


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("v", choices=["A", "B", "film"])
    ap.add_argument("--music", default=os.path.join(PROMO, "public/audio/v5-heist-2.wav"))
    a = ap.parse_args()
    LEN = 59.0 if a.v == "film" else 510 / FPS
    n = int(LEN * SR)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", a.music, "-t", str(LEN), "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], check=True, capture_output=True).stdout
    mus = np.frombuffer(raw, np.float32).reshape(-1, 2)[:n].astype(np.float64)
    mus = np.vstack([mus, np.zeros((n - len(mus), 2))])
    fx = np.zeros(n)
    for f, s in (cues("B") + film_cues() if a.v == "film" else cues(a.v)):
        i = int(round(f / FPS * SR))
        m = min(len(s), n - i)
        if m > 0:
            fx[i:i + m] += s[:m]
    # music ducks 5 dB under the effects
    env = lp(np.abs(fx), 8)
    duck = 1 - 0.44 * np.clip(env / (env.max() + 1e-9) * 3, 0, 1)
    out = mus * duck[:, None] * 0.9 + 0.5 * fx[:, None]
    path = os.path.join(PROMO, "public/audio/v5-film.wav" if a.v == "film" else f"public/audio/v5-probe-{a.v}.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.75:level=false", "-ar", str(SR), "-c:a", "pcm_s16le", path],
                   input=np.clip(out, -1, 1).astype(np.float32).tobytes(), check=True)
    print(path)


if __name__ == "__main__":
    main()
