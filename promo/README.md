# Agent Notch promo (Remotion)

Install once: `cd promo && npm install` (Remotion is pinned at 4.0.290; keep every `@remotion/*` package on the same version).

## Render

1. Put the music in `public/` (see Music below). Without it the soundtrack falls back to a plain synth bed.
2. Build the soundtrack, and again after any change to `src/timeline.ts` or the music file:
   `node audio/synth.mts`
   It writes `public/audio/promo.wav` and `public/audio/vertical.wav`, mastered to -14 LUFS, true peak -1.5 dBTP, and prints the measured loudness and the music edit points. Needs ffmpeg on PATH.
3. Render:
   - `Promo`, 1920x1080, 30 fps, 59.6 s (must stay under 15 MB):
     `npx remotion render src/index.ts Promo out/agent-notch-promo.mp4 --codec=h264 --crf=23 --audio-bitrate=192k`
   - `Vertical`, 1080x1920, 42.1 s, a separate edit for Shorts, Reels and X:
     `npx remotion render src/index.ts Vertical out/agent-notch-vertical.mp4 --codec=h264 --crf=23 --audio-bitrate=192k`
   - `Hero`, a 9 s seamless loop for the README, rendered at 1280x720:
     `npx remotion render src/index.ts Hero out/agent-notch-hero.mp4 --codec=h264 --crf=20 --scale=0.6667`
     then the GIF (must stay under 4 MB):
     `ffmpeg -i out/agent-notch-hero.mp4 -vf "fps=15,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" -loop 0 out/agent-notch.gif`
   - `Poster`, the 1280x640 social card:
     `npx remotion still src/index.ts Poster out/poster.png`

Preview and edit: `npx remotion studio`.

Copy to the repo: `cp out/agent-notch.gif ../assets/demo.gif && cp out/agent-notch-promo.mp4 ../assets/ && cp out/poster.png ../assets/social-preview.png`

## Timing

Everything sits on the beat grid in `src/timeline.ts`:

- `BPM` (123.05) is the tempo of the music. `OFFSET_FRAMES` puts film beat 10 at exactly 5.0 s, where the drop lands.
- `PROMO` and `VERTICAL` list the shots with their length in beats. Changing one length moves every later cut, and the cues move with it.
- `EV` holds the key moments inside each shot (clicks, hotkeys, tab switches) in beats from the shot start; `SHOT_CUES` holds the sound effects, also in beats.
- `NUDGE` shifts a single cut by whole frames. Leave it empty unless a cut feels late.

Picture and sound both read this file, so rerun `node audio/synth.mts` after changing it.

## Music

The track is `public/<MUSIC_FILE>`, currently `public/music-suno-v2-4.wav` (it replaced `music-suno-v1.wav`). Music files are gitignored (`public/music*.wav`) and must never be committed: they are licensed for use in the film, not for redistribution. Any sample rate works; synth.mts decodes to 48 kHz with ffmpeg.

The edit is data in `src/timeline.ts`:

- `TRACK_DROP_S`: the track second of the drop, the first downbeat of the full groove (3.968 s in v2-4, read off the onset).
- `TRACK_BPM`: the track tempo. Keep it equal to `BPM`; the picture and the music share one grid.
- `TRACK_SECTIONS`: where the sections start, in beats from the drop. v2-4: breakdown 24–32, groove 32–56, breakdown 56–64, groove 64–103 with a softer stretch at 89–96, the final hit at 104.8 (55.08 s), faded below -60 dB by 112. It documents the track; the code does not read it.
- `MUSIC.promo` and `MUSIC.vertical`: segments `{from, to, src}`, meaning film beats `from..to` play the track from beat `src` (counted from the drop, negative before it). A gap between segments is silence: in both cuts film beats 8–10 (4.03–5.0 s) are silent, the dead stop on "You.". Joined segments get a 10 ms crossfade; the hard cuts around the silence get 2 ms so the drop keeps its attack.
- `MUSIC.promoHit` / `MUSIC.verticalHit` (optional): with a film beat set, the music stops there, a synth chord lands and the last beat rings out through a reverb. v2-4 has its own hit and fade, so both are unset and the track plays to its own ending.
- `EV.end.hit` puts the name's pulse on the track's hit: film beat 114.8 in the promo, 78.8 in the vertical.

Edit points with v2-4, as synth.mts prints them:

| Cut | Film | Track |
|---|---|---|
| Promo | 0.000–4.025 s | 0.000–3.968 s, the intro (starts 57 ms in, so the drop's onset falls on film beat 8) |
| Promo | 4.025–5.000 s | silence |
| Promo | 5.000–59.612 s | 3.968–58.580 s, continuous (film time = track time + 1.032 s); hit at film 56.11 s, fade to the end |
| Vertical | 0.000–4.025 s | 0.000–3.968 s |
| Vertical | 4.025–5.000 s | silence |
| Vertical | 5.000–16.703 s | 3.968–15.671 s, drop and groove |
| Vertical | 16.703–30.356 s | 13.720–27.373 s, back one bar, so the first breakdown sits under `risky` |
| Vertical | 30.356–42.058 s | 46.877–58.580 s, forward ten bars: soft stretch under `trust`, groove under `themes`, hit at 38.55 s in `end` |

Sections in the promo: the first breakdown sits under `open` and `usage`, the second under `risky`.

### Dropping in a new take

1. Copy it to `public/` and set `MUSIC_FILE`.
2. Measure it with librosa:
   ```
   python3 -m venv .venv && .venv/bin/pip install librosa
   .venv/bin/python audio/measure.py public/<file>.wav --bpm 123
   ```
   It prints the tempo, the beats where the level steps up or down (the section changes), and a level table per beat.
3. Find the drop by ear or in the table and rerun with `--drop <second>`; the table then counts beats from the drop. The "grid error" line should be a median under about 30 ms, which means the BPM and the drop agree.
4. Set `TRACK_DROP_S` and `BPM`. A new tempo moves every cut: check that the drop still lands at 5.0 s and the promo stays 55–65 s long.
5. Read the section starts off the table into `TRACK_SECTIONS`. Then move the `src` beats, or the shot lengths, so that `risky` sits on a breakdown and the end's `EV.end.hit` lands on the track's final hit. In the vertical, jump only on bar lines: change `src - from` by multiples of 4. If the take has no hit of its own, set `promoHit`/`verticalHit` and the synth adds one.
6. Run `node audio/synth.mts` and render.

Loudness of any file: `ffmpeg -i file.wav -af loudnorm=print_format=json -f null -`

## Blender shots

Photoreal MacBook shots come from `blender/build_scene.py`, a separate job. Each shot is an image sequence `public/blender/<shot>/NNNN.png` plus `public/blender/<shot>.json` with `width`, `height`, `fps`, `frameCount` and `frames[]`, where each frame has the four screen corners `corners: {tl, tr, br, bl}` in render pixels.

`src/device.tsx` looks for the files when the bundle is built. When a shot is there, the film plays it and lays the live screen over it with a `matrix3d` built from the corners; otherwise it draws the 2D laptop. The film uses `reveal` and `reveal-v` in the reveal, and `endcard` and `endcard-v` at the end. `Hero` and `Poster` hold frame 23 of `push` (`PUSH_FRAME`) under a fixed 2D zoom (`Z`); the cursor targets are projected onto that frame with `stageToQuad`.

## Layout

- `src/timeline.ts`: cut lists, beat grid, key moments, sound cues, music edit.
- `src/Film.tsx`: chains the shots into `Promo` and `Vertical`.
- `src/scenes/`, one file per act:
  - `Open`: cascade, freeze, "You.", reveal, first approve, title.
  - `Aware`: states, subagents and counters, open, usage, jump.
  - `Answer`: hotkeys, risky commands, questions, plans, "Only you approve".
  - `Finish`: card tabs, toast.
  - `Custom`: themes, sounds, presets.
  - `Close`: hosts, local, end card.
  - `common.tsx`: shared desk, caption and pin helpers. `terminals.tsx`: terminal windows.
- `src/lib.tsx` (marks, cursor, keycaps, camera), `src/world.tsx` (MacBook, menu bar, notch wing, panel), `src/device.tsx` (Blender playback), `src/ui/app.tsx` (panel rows in React).
- `src/Hero.tsx`, `src/Poster.tsx`.
- `audio/synth.mts`: music edit, UI sounds, ducking, mastering. Plain Node 22 plus ffmpeg.
- `audio/measure.py`: tempo, drop and section measurement for a music take.

Stage coordinates equal the pixel coordinates of the app screenshots in `public/`, which the app rendered from fixture data with `AGENT_NOTCH_LANG=en`; cursor targets are button centres measured in those images. The panel rows, the card and the toast are redrawn in React from the app's own layout.

Every vertical shot has its own framing: check both films after editing a shot.
