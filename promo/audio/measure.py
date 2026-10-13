"""Measures a music take for the film: tempo, the drop, and loudness per beat, so the TRACK_* constants in
src/timeline.ts can be set by reading numbers instead of by ear.

  python3 -m venv .venv && .venv/bin/pip install librosa
  .venv/bin/python audio/measure.py public/music-suno-v1.wav [--bpm 123] [--drop 16.3]

Prints the tracked tempo, the beats where the level steps up or down (section changes), and one row per beat from
the drop: beat number, track second, RMS in dB and a bar. Sections show up as runs of rows with the
same level: a quiet run is a breakdown, the loudest run is the brightest part.
"""
import argparse

import librosa
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('file')
ap.add_argument('--bpm', type=float, default=123.0, help='starting guess for the beat tracker')
ap.add_argument('--drop', type=float, default=None, help='drop second (find it by ear or in the table, then rerun with it)')
a = ap.parse_args()

y, sr = librosa.load(a.file, sr=22050, mono=True)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time', start_bpm=a.bpm)
ibi = np.diff(beats)
bpm = 60 / np.median(ibi)
print(f'duration {len(y) / sr:.2f} s · tracker tempo {float(np.atleast_1d(tempo)[0]):.2f} · median-beat tempo {bpm:.2f} BPM')

hop = 512
rms = librosa.feature.rms(y=y, hop_length=hop)[0]
t = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop)
level = np.array([20 * np.log10(rms[(t >= b) & (t < b + 60 / bpm)].mean() + 1e-9) for b in beats])
jump = np.array([level[i:i + 4].mean() - level[max(0, i - 4):i].mean() if 4 <= i < len(beats) - 4 else 0 for i in range(len(beats))])
edges = [i for i in range(1, len(beats) - 1) if abs(jump[i]) >= 5 and abs(jump[i]) >= abs(jump[i - 1]) and abs(jump[i]) >= abs(jump[i + 1])]
print('section changes, level step of 5 dB or more (s, dB):', ', '.join(f'{beats[i]:.2f} {jump[i]:+.1f}' for i in edges))
drop = a.drop if a.drop is not None else float(beats[0])
print(f'drop {drop:.3f} s  ->  TRACK_DROP_S' if a.drop is not None else 'no --drop given: the table counts beats from the first tracked beat')

P = 60 / bpm
near = beats[np.abs(beats - drop) < 8]
phase = (near - drop) / P
print(f'grid error near the drop: {np.median(np.abs(phase - np.round(phase))) * P * 1000:.0f} ms median (under ~30 ms = the BPM and drop agree)')
for k in range(int(-drop / P), int((t[-1] - drop) / P)):
    s = drop + k * P
    m = (t >= s) & (t < s + P)
    if not m.any():
        continue
    db = 20 * np.log10(rms[m].mean() + 1e-9)
    print(f'{k:4d} {s:7.2f} {db:6.1f} ' + '#' * int(max(0, db + 40)))
