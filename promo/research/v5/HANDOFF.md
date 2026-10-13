# Promo v5 — production handoff

## Task card
Make the new Agent Notch launch film, "Slowest Process": 59 s, 1920×1080, 30 fps, one master only (no vertical, no clips for now). The owner rates v4 at 3/10 and wants something many times better: wow, dynamic, provocative, the best ad for an IT product.

## Where
- Work in the existing worktree `/Users/nikita/Projects/agent-notch-release`, branch `promo/v5`. It holds gitignored assets a fresh checkout lacks: the Blender frames in `promo/public/blender/`, the music in `promo/public/music-*.wav` and the HDRI cache in `promo/blender/cache/`.
- Check the branch and HEAD after every git step; other sessions use other worktrees of this repo.

## Read first
1. `promo/research/v5/creative-treatment.md`: the concept, the 19-beat script, the visual bible, the Blender shot list, the music map with the Suno prompt, and the production plan. This is the spec.
2. `promo/research/v5/synthesis.md`: why v4 failed and what the six research reports agree on.
3. The six reports in the same folder, when a step needs detail (3D → `3-3d-devices.md`, motion → `4-motion-craft.md`, sound → `5-sound.md`).
4. `promo/README.md` and `promo/src/` (Remotion 4.0.290: `timeline.ts` beat grid, `device.tsx` corner-JSON screen overlay, `audio/synth.mts` SFX and mix), plus `promo/blender/` (procedural MacBook, `render.sh`).

## Owner decisions (binding, 2026-10-14)
- Concept: the Opus creative director's own concept, "Slowest Process" (the owner asked for it instead of choosing from the five pitched ones). Its 19-beat script is the spec. Changes to the story go to the owner first.
- All features appear: marks, Allow from the notch, ⌃⌥Y/⌃⌥N, risky command denied, questions, plan approval, projects and subagents, limits/context/cost, completion toast and jump, 13 themes, sounds, local and no network.
- 3D MacBook stays, rebuilt in Blender: the screen is ALIVE (work running on it, never black), the camera dynamic. No Apple logo, no "MacBook" in captions.
- UI = the app's real snapshot PNGs animated in Remotion; new snapshots may be added to the app's snapshot code (re-render at 3× for crops).
- No voiceover, captions only.
- Music: a new Suno v6 track. Give the owner the Style and Lyrics fields from the treatment (section 6) as paste-ready text, and ask for 3 directions × 2 takes. The owner downloads them to ~/Downloads. Analyse with librosa (venv at `/private/tmp/claude-501/-Users-nikita-Projects-agents-notch/3a8eed0a-e94c-41b7-96b3-11affd168906/scratchpad/venv/bin/python` if it still exists, otherwise make a new one) and re-time the grid to the chosen take.
- Budget $0 for paid services. Local open models are allowed; Stable Audio Open only where the treatment says (three textures). Ask the owner before downloading model weights (name, size, licence).
- Process gates: (1) the three key still frames (f50, f380, f1380) → show the owner; (2) an animatic to the music → show the owner; (3) production only after the owner says yes; (4) final check of the exported MP4 at full and phone size, muted and with sound.

## Rules
- Allowed: edit `promo/`, add snapshot scenes under `Sources/` if needed (run `./scripts/test.sh` after), commit to `promo/v5`, push `promo/v5`.
- Forbidden without asking: merging to `master` or `main`, releases, tags, uploading to the GitHub release, changing the README, deleting the v4 outputs.
- Never use `--snapshot-live` (it reads the owner's real agent logs). No Claude or OpenAI logos as characters; the independence line stays. The 20:14 wait and the `top`/`nettop` frames carry the "Dramatisation" label.
- Never commit music, Blender frames or downloaded model weights.
- Models: Opus for art direction and review; workers may be Sonnet or Codex (`codex-job`, see `codex-job --help`). A reviewer is never weaker than the author. Before a wave of more than five agents, post one line: how many, which models, rough cost.
- Look at every screenshot that decides something yourself. Judge checks by exit codes.

## Done means
The owner has watched `promo/out/agent-notch-v5.mp4` and said it is the one. Before that, report at each gate: what was made, where it was checked, what is open. End every report with one line saying where and how it was verified, or "NOT verified" and why.

## Known open items from the treatment
- New snapshots are needed: the completion toast, before/after rows for each answer, Sounds settings, and 3× renders. Check whether the 3× export needs a code change.
- The 81% limit and $3.42 come from the app's demo data; they are shown as what the panel shows, not as results.
- The app's default "Glass" sound is an Apple system sound; the film uses its own synthesized cues.
