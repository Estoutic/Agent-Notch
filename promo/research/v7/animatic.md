# v7 gate 3: animatic

2026-10-14. `out/agent-notch-v7-animatic.mp4` (not committed). The v7 timeline with the v4 2D scenes, 12 EEVEE preview
plates for the 3D shots, and the v4 track re-cut to 72 s with the v7 SFX.

## Measured on the MP4

| | Value | Command |
|---|---|---|
| Duration | 71.85 s, 2154 frames | `ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate,nb_frames -of compact out/agent-notch-v7-animatic.mp4` |
| Picture | 1920×1080, 30 fps, h264 crf 18 | same |
| Loudness | −14.0 LUFS integrated, LRA 4.4 LU | `ffmpeg -nostats -i out/agent-notch-v7-animatic.mp4 -vn -af ebur128=peak=true -f null -` |
| True peak | −1.5 dBTP | same |

Sync, measured on the MP4 with `ffmpeg -ss <t> -t <d> -i … -vn -af astats -f null -`:

- "You." (4.10–4.90 s): RMS −inf, digital silence.
- The drop (5.00–5.30 s, right after the cut to the reveal at frame 150): RMS −9.2 dB.
- The track's final hit (67.80–68.20 s, frame 2034, 26 frames into the end card): RMS −10.9 dB, against −25.5 dB in the
  half second before it.

## Plates

`blender/v7_plates.py`, half size (960×540), 16 samples, HANDLE = 12 extra frames before each shot.
First full pass: 1376 frames in 498 s, 0.19–0.43 s/frame (0.36 average). Re-renders after the first look and the two
review rounds: 2179 frames in 805 s across 16 shot renders. Plate time in total 1303 s ≈ 22 min.

| Shot | Frames | s/frame (last render) |
|---|---|---|
| cascade | 74 | 0.19 |
| reveal | 71 | 0.33 |
| approve | 85 | 0.33 |
| swarm | 100 | 0.21 |
| open | 85 | 0.32 |
| keys | 99 | 0.37 |
| question | 129 | 0.47 |
| plan | 159 | 0.36 |
| risky | 158 | 0.39 |
| night | 129 | 0.39 |
| themes | 129 | 0.34 |
| end | 158 | 0.32 |

3D share: 1232 of 2154 frames, 57 %. Remotion render of the MP4: about 4 min.

## How to rebuild

```sh
cd promo
node blender/v7_dump.mts                       # frame plan -> blender/cache/v7/plates.json
cd blender && python3 make_v7_faces.py --anim --terms && cd ..
for s in cascade reveal approve swarm open keys question plan risky night themes end; do
  (cd blender && blender -b --factory-startup -P v7_plates.py -- --shots $s --scale 50 --samples 16)
done
node audio/v7_synth.mts                        # public/audio/v7.wav
npx remotion render src/index.ts V7 out/agent-notch-v7-animatic.mp4 --codec=h264 --crf=18 --audio-bitrate=320k
```

Contact sheet (one frame per shot, from the MP4): `out/v7-animatic/sheet.png`. Transitions: `out/v7-animatic/transitions.png`.

## Where it departs from the plan

- The middle runs 1.18× its v4 length (66 beats against 56), not 1.3×: two new shots (swarm, night) and the 72 s cap
  leave no room for more.
- Transitions are dissolves, zooms and one light wash, built in Remotion over the plate handles. The reveal is the
  only true match (the amber period of "You." becomes the mark in the notch). Real match cuts need matched plate
  framing and belong to the final render.
- Keys: the four keys used (⌃ ⌥ Y N) carry legends; the rest of the keyboard is blank. ⌥ comes from Arial Unicode,
  since Geist has no such glyph.

## Review

One fresh Opus reviewer, two fix rounds.

Round 1 found four P1 and four P2 problems:
- reveal: the drop showed an empty screen;
- plan, question, risky: captions sat on the panel;
- question: the pick was not visible;
- risky: the red row could not be read and Deny was never shown;
- night: the band disappeared;
- themes: the deck glow clipped;
- end: a floor hot spot and a black screen;
- keys: key travel did not read.

Fixes:
- reveal: the panel opens on the lid during the pull-back.
- question: amber highlight on the chosen option; captions moved clear of the panel.
- risky: a tighter row glow, a camera slide to Deny, and Deny lighting on the click.
- night: a steady faint band all night.
- themes: the screen is dimmer.
- end: lit from above, no studio lights.
- keys: reframed; legends brighten on press.
- Two dissolves shortened.

Round 2 resolved the P1s and found one new defect: a red smear left after Deny. That smear is fixed, and the night band
is now brighter. The end card text was moved back up 30 px after its last line touched the lid.

## Open items for the owner

- Night: the light band on the desk under the front edge. It is bright for about 10 frames after the lid shuts
  (around frame 1535), then stays as a faint line until dawn.
- Themes: with light themes (Paper, Rubber Ducks, Terminal) the aluminium deck reflects the screen colour strongly.
- Left for the final render: true match cuts, the install line typed on the end screen in 3D, one continuous camera
  from the reveal into approve, and full-size plates.
- The drop starts about 1 frame after the cut (AAC priming included). Not audible to me; can be nudged in the final mix.

## Owner notes, round 2 (2026-10-14)

The owner asked for the current app UI, more dynamics, and the lid shut all the way with the work visibly going on.
Decide round 1-e002e2 settled the details: night about 6 s, the drawn UI in the 2D scenes replaced, and all four
dynamics options.

- Night: 12 beats (was 8). The lid now closes to 0°, and five translucent terminals rise out of the closed Mac, their
  logs scrolling (`ghost_terms` in `v7_plates.py`, textures from `make_v7_faces.py --ghosts`). They fade at dawn. The
  lid-light line under the front edge now fades to a trace, since the ghosts carry the night.
- Time for the night came from question and plan (2 beats shorter each). The music edit after the keys cut moved by
  one bar (offset 18) so the second breakdown still lands on the cut to risky.
- 2D scenes: title, usage, jump, card, toast, trust, sounds, presets and hosts now use the app's own snapshots
  (`public/snap5/`, `src/v7/scenes7/`). States and anatomy keep v4's drawn marks.
- Snapshots from a fresh build of master match snap4 almost pixel for pixel, so the 3D faces stay on snap4. New
  fixture scenes `ask-codex` and `ask-claude` show the panel after a single click. Allow on Claude's request leaves
  the Codex `rm -rf` waiting, and Deny on that one leaves Claude's. Those fixture edits live only in a throwaway build;
  the app repo is untouched.
- Dynamics:
  - Every 3D shot: push-ins and tracking moves.
  - Hits: a short decaying shake.
  - Clicks: speed ramps that slow to 0.3–0.5× and catch up afterwards; every click still lands on its frame.
  - Edit: dissolves are 3–6 frames.
  - Hard cuts: a snap-in.
  - Bar-line cuts: a 5-frame flash, except on the hook's dead stops.
  - 2D shots: a 2.5 % punch on each bar downbeat.

Review round 3 (one fresh Opus reviewer) found two P1 problems:
- The night-to-trust cut popped from white to black.
- One Allow appeared to clear both requests, including the dangerous one.

Both are fixed, along with the P2s:
- the flash on "You.";
- lid sounds 6–8 frames off the picture;
- dead holds in risky;
- captions over the panel in plan and risky;
- a ghost terminal running into the night caption;
- the reveal → approve panel jump.

Open P3 items:
- Card captions cross the laptop bezel by about 40 px.
- The sounds click ring appears 3 frames late.
- Title and usage dissolves dip through black.
- The hosts desktop text is too small to read.
