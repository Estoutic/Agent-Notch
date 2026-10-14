"""v6 music edit: the v5 takes stretched to 120 BPM and cut to the 90 s map of research/v6/treatment.md section 5.

  python audio/v6_edit.py heist-2|house-1   -> public/audio/v6-<take>.wav

Source bars come from the per-bar level/brightness table of each take (quiet bars for intro, thin, breakdown, night;
the loudest run for the peak). The "filtered" and "night" sections are low-passed so the evening and night sit back.
"""
import argparse
import os
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from v5_edit import PROMO, SR, TAKES, last_hit, load  # noqa: E402

# (name, film start s, length s, low-pass Hz or None)
SECTIONS = [
    ("intro", 0.0, 8.0, None), ("thin", 8.0, 6.0, 2500), ("build", 14.0, 4.0, None), ("grooveA", 18.0, 14.0, None),
    ("breakdown", 32.0, 8.0, None), ("grooveB", 40.0, 16.0, None), ("peak", 56.0, 8.0, None), ("filtered", 64.0, 6.0, 1100),
    ("night", 70.0, 8.0, 700), ("morning", 78.0, 2.0, None), ("final", 80.0, 6.0, None), ("hit", 86.0, 4.0, None),
]
SRC = {
    "heist-2": dict(intro=0, thin=4, build=24, grooveA=26, breakdown=66, grooveB=34, peak=50, filtered=70, night=0, morning=75, final=76),
    "house-1": dict(intro=-9, thin=-5, build=-2, grooveA=0, breakdown=46, grooveB=27, peak=79, filtered=50, night=-9, morning=58, final=59),
}
TOTAL = 90.0


def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = np.zeros(2, np.float32)
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("take", choices=sorted(SRC))
    a = ap.parse_args()
    t = TAKES[a.take]
    ratio, k = 120.0 / t["bpm"], t["bpm"] / 120.0
    x = load(os.path.join(PROMO, t["file"]), ratio)
    bar = lambda i: (t["bar0"] + i * 240.0 / t["bpm"]) * k
    hit = last_hit(x, len(x) / SR - 25)
    out = np.zeros((int(TOTAL * SR), 2), np.float32)
    for name, f0, ln, fc in SECTIONS:
        s0 = hit if name == "hit" else bar(SRC[a.take][name])
        a0, n = int(round(s0 * SR)), int(round(ln * SR))
        seg = x[max(0, a0):a0 + n].copy()
        if a0 < 0:
            seg = np.vstack([np.zeros((-a0, 2), np.float32), seg])[:n]
        if len(seg) < n:
            seg = np.vstack([seg, np.zeros((n - len(seg), 2), np.float32)])
        if fc:
            seg = lowpass(seg, fc) * 1.15
        fi, fo = int(SR * 0.02), int(SR * (2.5 if name == "hit" else 0.02))
        seg[:fi] *= np.linspace(0, 1, fi)[:, None]
        seg[-fo:] *= np.linspace(1, 0, fo)[:, None] ** (2 if name == "hit" else 1)
        b0 = int(round(f0 * SR))
        out[b0:b0 + n] += seg
        print(f"{name:10s} film {f0:5.1f}-{f0 + ln:5.1f}  track {s0 / k:6.2f}s")
    path = os.path.join(PROMO, f"public/audio/v6-{a.take}.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-", "-c:a", "pcm_s16le", path],
                   input=np.clip(out, -1, 1).tobytes(), check=True)
    print(path)


if __name__ == "__main__":
    main()
