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

## Owner notes, round 3 (2026-10-14)

The owner reported four problems: the music jumped, the cut felt jerky, the keyboard shot did not work, and the
highlights sat off the UI.

- Music: the two jumps that landed mid-phrase (26.5 s, 54.2 s) moved to 8-beat phrase lines: track 40→32 at film beat
  50 (24.5 s) and 88→72 at film beat 106 (51.8 s). On the MP4 the envelope at 24.5 s matches an ordinary beat at 20.6 s.
- Jerkiness: no camera shake, no cut flashes, no bar punches on 2D shots; the hard-cut snap-in is now a 2 % settle.
  Speed ramps are softer (0.6–0.75× instead of 0.3–0.5×).
- Highlights: the amber pick, the red Codex row and the Deny outline are drawn into the screen textures at the UI's own
  pixel coordinates (`make_v7_faces.py`, faces `question-pick`, `ask-red`, `ask-deny`). The 3D tint cards are gone.
- Keys: the 3D keyboard macro is replaced by a 2D shot (`scenes7/Keys7.tsx`). It stays in Claude's terminal after the
  jump; the real panel holds two requests. ⌃⌥Y allows Claude's, and the panel becomes the one-waiting snapshot; ⌃⌥N
  denies Codex's `rm -rf`, and the panel folds. The keys plate is no longer rendered.

MP4: 71.85 s, 2154 frames, −14.0 LUFS, −1.5 dBTP. Plates: 11 shots, 529 s.

## Owner notes, round 4

The six notes and what changed:

1. **Prompts in the card.** CardShot7 now clicks a fifth tab, Prompts (snap5/card-prompts.png, rendered by the app). The tab beats are EV7.card: 0.6 / 2.75 / 4.9 / 7.05 / 9.2.
2. **Crooked highlights.** USAGE_SPOTS in Aware7 were re-measured on usage.png. The ask highlights are still baked into the faces, which were regenerated from the new snapshots. The snapshot sizes did not change.
3. **Music.** MUSIC7 was re-cut so no track beat repeats within 16 film beats. There are two joins: beat 34 (track 24 → 32) and beat 50 (track 48 → 0), each with a 40 ms crossfade. The night enters on the measured downbeat 68. The master is −14.0 LUFS and −1.5 dBTP. This was checked numerically; nobody has listened to it yet.
4. **Cascade.** The cascade grows 4 → 8 → 12 terminals on the beat (frames 0, 18, 33), and the camera pulls back on each step.
5. **Effort.** All snap4 and snap5 images were re-shot from master 5eb79de. The effort row part is off in the default preset, so the snapshot run turns it on (AGENT_NOTCH_SNAPSHOT_EFFORT=1, scratch build only). The bars now show next to the model in every row.
6. **After the night.** The lid opens all the way. The five ghosts dive into the screen, nearest first. Each one lands as a real "done" toast from a different project (snap5/toast-night-0..4). The camera swings to face the screen and flies into it. Trust comes in with a new `through` transition (scale 0.86 → 1, blur 10 → 0). The light wash is gone. The captions are "Keep awake." and then "Done by morning."

Known issue: the fly-through lands on trust's first frame, which has no text yet, so there are about 6 dark frames (around film frame 1624).

## Owner notes, round 5

- **Silence on the lid close (bug).** The MP4 dropped to −42 dB at 48.3–49.4 s, the deliberate 98.5–101 music hole. The track now runs on to beat 101. From the latch it is low-passed at 650 Hz, as if heard through the closed lid, and it opens back up over one beat as the lid swings open. The join to track 68 sits inside the muffle. The old −4 dB night dip is gone. Measured on the MP4: −13 to −15 dB through 47.5–55 s, −14.0 LUFS and −1.5 dBTP overall.
- **Lid close.** Low at the front edge. The lid closes slowly to about 12°, then snaps shut on the latch, and the light from the gap narrows to a line across the frame. From there the camera cranes up to the ghosts.
- **Lid open.** Three-quarter front from the sun side. The seam lights first and the lid cracks open about 2.5°, then swings up fast (expo-out, 12 frames). The screen wakes on a dawn wallpaper (`dawn_wallpaper` in make_v7_faces.py), with a whoosh, a boom and a sub under it. The camera then rises to face the screen.

## Max-quality plates (PC render)

The owner rendered all 11 plates on their PC (RTX 4080) from the offload bundle: 1920×1080, 128 samples, `--quality max`. That is 1276 frames in 65 min at 1.8–3.5 s/frame. Every shot has the planned frame count, and every PNG decodes.

`out/agent-notch-v7-max.mp4` is built from the same timeline and audio as the animatic: 71.85 s, 2154 frames, −14.0 LUFS, −1.5 dBTP, and `qc.sh` exits 0. The screen text, keys and speaker grille are sharp now, and the glow on the deck no longer clips (`out/v7-max-vs-preview.png`). The preview plates are kept in `public/blender/v7-preview`.

- The cascade (0–2 s) is a little darker than the preview, so blackdetect now flags it. Those frames are dark by design.
- Still open: the 0.27 s of dark frames at 54.0 s, on the night → trust fly-through.
