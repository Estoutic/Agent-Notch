"""v5 music edit: stretches a Suno take to the film's 120 BPM and cuts it to the section map of
research/v5/creative-treatment.md section 6 (59.0 s, silence 4-5 s, drop on 13.0, final hit on 55.0).

  python audio/v5_edit.py <take> [--out public/audio/v5-music.wav] [--norm]
  takes and their maps live in TAKES below; bar numbers come from the per-bar table (scratch bars.py / measure.py).

Each section names a source bar (index into the take's bar list at its own tempo). The script time-stretches the
whole take with ffmpeg atempo first, so every section is a whole number of 2.0 s bars at 120 BPM.
"""
import argparse
import json
import os
import subprocess
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
PROMO = os.path.dirname(HERE)
SR = 48000
BAR = 2.0  # 120 BPM, 4/4

# Film sections: (name, film start s, length s). Gaps are silence.
SECTIONS = [
    ("intro", 0.0, 4.0),
    ("build", 5.0, 8.0),
    ("drop", 13.0, 4.0),
    ("breakdown", 17.0, 6.0),
    ("groove", 23.0, 14.0),
    ("peak", 37.0, 4.0),
    ("fill", 41.0, 2.0),
    ("final", 43.0, 6.5),
    ("drumsout", 49.5, 5.5),
    ("hit", 55.0, 4.0),
]

# Per take: file, tempo, time of bar 0 and bar length at the take's own tempo, then the source bar per section.
# "hit" is a track second (the final hit's onset), not a bar.
TAKES = {
    "heist-2": dict(file="public/music-v5-heist-2.wav", bpm=124.84, bar0=3.87,
                    src=dict(intro=0, build=8, drop=26, breakdown=67, groove=28, peak=58, fill=66, final=76, drumsout=67)),
    "house-1": dict(file="public/music-v5-house-1.wav", bpm=123.08, bar0=17.83,
                    src=dict(intro=-2, build=23, drop=27, breakdown=47, groove=35, peak=42, fill=70, final=71, drumsout=83)),
    "breakbeat-2": dict(file="public/music-v5-breakbeat-2.wav", bpm=120.0, bar0=2.05,
                        src=dict(intro=0, build=3, drop=7, breakdown=31, groove=39, peak=47, fill=70, final=71, drumsout=63)),
}


def load(path, tempo_ratio):
    """Decode to 48 kHz stereo float, slowed/sped by tempo_ratio (atempo, pitch kept)."""
    cmd = ["ffmpeg", "-v", "error", "-i", path, "-af", f"atempo={tempo_ratio:.6f}", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"]
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def last_hit(x, after):
    """Onset of the last loud transient after `after` seconds: the take's own final hit."""
    mono = np.abs(x[:, 0]) + np.abs(x[:, 1])
    hop = SR // 100
    env = np.array([mono[i:i + hop].mean() for i in range(0, len(mono) - hop, hop)])
    d = np.maximum(0, np.diff(env))
    start = int(after * 100)
    thr = np.percentile(d[start:], 99.5)
    idx = [i for i in range(start, len(d)) if d[i] >= thr]
    return (idx[-1] if idx else len(d) - 400) / 100


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("take", choices=sorted(TAKES))
    ap.add_argument("--out", default=None)
    ap.add_argument("--norm", action="store_true", help="loudness-normalise to -14 LUFS (for comparing takes)")
    a = ap.parse_args()
    t = TAKES[a.take]
    ratio = 120.0 / t["bpm"]          # atempo < 1 slows down
    k = t["bpm"] / 120.0              # track second -> stretched second
    x = load(os.path.join(PROMO, t["file"]), ratio)
    bar = lambda i: (t["bar0"] + i * 240.0 / t["bpm"]) * k
    hit = t.get("hit_s")
    hit = hit * k if hit else last_hit(x, len(x) / SR - 25)
    total = 59.0
    out = np.zeros((int(total * SR), 2), dtype=np.float32)
    edits = []
    for name, f0, ln in SECTIONS:
        s0 = hit if name == "hit" else bar(t["src"][name])
        a0, n = int(round(s0 * SR)), int(round(ln * SR))
        seg = x[max(0, a0):a0 + n].copy()
        if a0 < 0:
            seg = np.vstack([np.zeros((-a0, 2), np.float32), seg])[:n]
        seg = np.vstack([seg, np.zeros((n - len(seg), 2), np.float32)]) if len(seg) < n else seg
        # 10 ms fades on joins, 2 ms on the hard cuts around the silence; the hit rings out over its last 1.5 s
        fi = int(SR * (0.002 if name == "build" else 0.010))
        fo = int(SR * (0.002 if name == "intro" else 0.010))
        if name == "hit":
            fo = int(SR * 1.5)
        seg[:fi] *= np.linspace(0, 1, fi)[:, None]
        seg[-fo:] *= np.linspace(1, 0, fo)[:, None] ** (2 if name == "hit" else 1)
        b0 = int(round(f0 * SR))
        out[b0:b0 + n] += seg
        edits.append({"section": name, "film": [f0, f0 + ln], "track_s": round(s0 / k, 3)})
    path = a.out or os.path.join(PROMO, f"public/audio/v5-{a.take}.wav")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    pcm = np.clip(out, -1, 1)
    af = ["-af", "loudnorm=I=-14:TP=-1.5:LRA=11"] if a.norm else []
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-", *af, "-ar", str(SR), "-c:a", "pcm_s16le", path],
                   input=pcm.tobytes(), check=True)
    print(json.dumps({"take": a.take, "bpm": t["bpm"], "stretch": round(ratio, 4), "hit_track_s": round(hit / k, 2), "out": path, "edits": edits}, indent=1))


if __name__ == "__main__":
    sys.exit(main())
