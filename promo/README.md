# Agent Notch promo (Remotion)
Install once: `cd promo && npm install`

The soundtrack is synthesised, not downloaded. Build it before rendering `Promo` or `Vertical`, and again after any change to `src/timeline.ts`:
`node audio/synth.mts` (writes `public/audio/promo.wav` and `public/audio/vertical.wav`, peak -2.5 dBFS).

Compositions (registered in `src/Root.tsx`):
- `Promo` — 1920x1080, 30 fps, 59.5 s: `npx remotion render src/index.ts Promo out/agent-notch-promo.mp4 --codec=h264 --crf=23 --audio-bitrate=192k` (about 13 MB; the limit is 15 MB)
- `Vertical` — 1080x1920, 37.5 s, for X/Shorts/Reels: `npx remotion render src/index.ts Vertical out/agent-notch-vertical.mp4 --codec=h264 --crf=23 --audio-bitrate=192k`
- `Hero` — 9 s seamless loop, rendered at 1280x720: `npx remotion render src/index.ts Hero out/agent-notch-hero.mp4 --codec=h264 --crf=20 --scale=0.6667`, then GIF: `ffmpeg -i out/agent-notch-hero.mp4 -vf "fps=15,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" -loop 0 out/agent-notch.gif`
- `Poster` — 1280x640 social card: `npx remotion still src/index.ts Poster out/poster.png`

Copy to the repo: `cp out/agent-notch.gif ../assets/demo.gif && cp out/agent-notch-promo.mp4 ../assets/ && cp out/poster.png ../assets/social-preview.png`

Layout:
- `src/timeline.ts` — the cut list for both films (shot, length in frames, music section, entrance), key frames inside shots, and the sound-effect cues. Picture and audio both read it, so a cut moved here moves in the soundtrack too after `node audio/synth.mts`. Cuts sit on a 120 BPM grid: 15 frames a beat.
- `src/Film.tsx` — chains the shots into `Promo` and `Vertical` and draws the transitions (whip, zoom, flash, glitch).
- `src/shots/` — one component per shot: `Pain` (the problem), `Reveal` (reveal, mark legend, mark kinds), `List` (open, list, usage, jump), `Answer` (ask, hotkeys, risky, questions and plans, trust), `More` (card, themes, sounds, toast, presets, where it works), `End`.
- `src/lib.tsx` (marks, cursor, keycaps, captions, camera), `src/world.tsx` (MacBook, menu bar, notch wing, screenshot panel), `src/scenes/Terminals.tsx` (terminal windows), `src/Hero.tsx`, `src/Poster.tsx`.
- `audio/synth.mts` — the music and sound effects, plain Node 22 with no dependencies.

Stage coordinates equal the pixel coordinates of the screenshots in `public/` (rendered by the app from fixture data with `AGENT_NOTCH_LANG=en`), so cursor targets are the button centres measured in those images. The toast in the `toast` shot is redrawn in CSS, not a screenshot.
Every vertical shot has its own layout; check both films after editing a shot.
Preview/edit: `npx remotion studio`.
