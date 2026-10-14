"""v6 SFX and master: soft synthesised cues over a v6 music edit. Cue frames match src/v6/Scenes.tsx.

  python audio/v6_sfx.py heist-2|house-1 [--len 28]   -> public/audio/v6-mix-<take>.wav

Quieter than v5 on purpose: clicks, keys and pitched "yes" notes; one impact on hit 1 (18.0 s).
"""
import argparse
import os
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from v5_sfx import FPS, PROMO, SR, clack, click, impact, lp, thud, tick, whoosh, yes  # noqa: E402


def cues():
    c = [(f, clack(0.35)) for f in range(14, 40, 4)]                               # typing `claude`
    c += [(f - 4, whoosh(0.25, 0.35, 0.8)) for f in (60, 120, 180)] + [(f, tick(0.4)) for f in (60, 120, 180)]
    c += [(186, thud(0.45))]
    c += [(262, click(0.6)), (398, whoosh(0.7, 0.5, 0.9))]                         # the sort; the dot leaves
    c += [(450 + 18 * i, yes(0.28, n)) for i, n in enumerate([72, 76, 79, 84])]   # the states legend
    c += [(540, impact(0.7, 1.8))]                                                 # hit 1, the name
    c += [(666, whoosh(0.3, 0.4, 0.8)), (780, click(0.9)), (780, yes(0.55, 76)), (806, yes(0.4, 79))]
    return c


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("take")
    ap.add_argument("--len", type=float, default=90.0)
    a = ap.parse_args()
    music = os.path.join(PROMO, f"public/audio/v6-{a.take}.wav")
    n = int(a.len * SR)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", music, "-t", str(a.len), "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], check=True, capture_output=True).stdout
    mus = np.frombuffer(raw, np.float32).reshape(-1, 2)[:n].astype(np.float64)
    mus = np.vstack([mus, np.zeros((n - len(mus), 2))])
    fx = np.zeros(n)
    for f, s in cues():
        i = int(round(f / FPS * SR))
        m = min(len(s), n - i)
        if m > 0:
            fx[i:i + m] += s[:m]
    env = lp(np.abs(fx), 8)
    duck = 1 - 0.3 * np.clip(env / (env.max() + 1e-9) * 3, 0, 1)
    out = mus * duck[:, None] + 0.35 * fx[:, None]
    path = os.path.join(PROMO, f"public/audio/v6-mix-{a.take}.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.75:level=false", "-ar", str(SR), "-c:a", "pcm_s16le", path],
                   input=np.clip(out, -1, 1).astype(np.float32).tobytes(), check=True)
    print(path)


if __name__ == "__main__":
    main()
