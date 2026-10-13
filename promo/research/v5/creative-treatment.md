# Agent Notch v5 — creative treatment: "Slowest Process"

Creative director's document, 2026-10-14. Inputs: `synthesis.md` and the six reports beside it, the v4 contact sheet and laptop frame, `promo/src`, `promo/blender/build_scene.py`, the app README and Swift sources. Nothing has been built. Timings are the animatic plan, not a measured edit.

Done criterion: the owner can approve or reject this concept and its three still frames, and Claude can start the animatic from section 3 without further questions.

---

## 1. Critique

Developers on X, HN and YouTube forgive a small budget, not vagueness. They always ask "what does it actually do?" The film has to pick a fight, then prove its side in pixels.

**v4, "You're the bottleneck."** The best line anyone has written for this product, spent in five seconds. After "You." there's no open question left, so the next 50 seconds answer nothing: 24 sections at one scale, dark panels in one spot, captions doing the picture's job. Nobody ever learns whether "you" stopped being the bottleneck. Keep the line and the amber period. Drop the structure.

**A. "We replaced our slowest agent."** Quotable reversal, but an HR document is the least cinematic world on the list and leaves the laptop one short push. The joke is spent by second 16; then it's the usual demo. "Replaced" also points at layoffs, so the comments would be about jobs. Its core, the human as the slowest worker, survives below.

**B. "You're the bottleneck" 2.0.** Right film, different brief. One rescue in 32–40 s can't carry every feature without a catalogue bolted on, which is v4 again. Its rescue becomes my first rung.

**C. "Something stopped."** Best mood, worst fit for a feed: slow suspense is what a scrolling developer skips. It spends amber and red as horror lighting when they must mean status, and the reveal is a shrug. Worth keeping: the pulse that becomes an event sound.

**D. "Approval League."** Its engine is an announcer, and voiceover is ruled out. Without it: a scoreboard with captions, v4 again.

**E. "The waiting room."** Charming and the most expensive: rigged characters before the product shows up at second 20, and agents drifting toward vendor-shaped mascots, which trademark rules forbid. People would enjoy it and forget what it sold.

**"Operation: Enter" (heist).** Right grammar (a clock, rising stakes), wrong message: a heist sneaks past security. I keep the clock and the stakes.

**What all of them miss.** Each treats the feature list as the enemy of the story and cuts features to save it. The owner reversed that. So the fix is a plot where each feature is the next, harder obstacle: a shift that gets worse, where every new problem needs the next tool.

---

## 2. The concept: "Slowest Process"

**Logline.** Twelve agents are blocked on one process, and the process is you. In 59 seconds the film pushes you through an escalating shift of requests until you are fast, and then the app stops you, once, on purpose.

**The provocative idea:**

> **The slowest process on your Mac is you.**

Shown as a `top`-style list sorted by time blocked, where an agent has waited 20:14 and the WAITING ON column says `you`. A developer reads that table in under a second. It insults them in their own syntax, and it's fair. It is the hook and the thumbnail.

**The engine: an escalation ladder.** After the accusation, requests keep coming. Each is harder than the last and needs the next feature:

| Request | Harder because | Answered by |
|---|---|---|
| 1. A test command, waiting 20 minutes | You didn't see it | Marks, Allow from the notch |
| 2–3. Two at once | The mouse is too slow | ⌃⌥Y / ⌃⌥N |
| 4. `rm -rf dist build` | Now speed is the danger | Red, hotkey refused, deliberate Deny |
| 5–6. A question, a plan | Not yes/no any more | Questions, plan approval |
| 7. The swarm | Too many to track | Projects and subagents |
| 8. The wall | You're running out | Limits, context, cost |
| 9. Done | Where did it finish? | Completion toast, jump to window |

A `REQUEST n` counter and a wait timer beside each request carry the plot. The timer reads 20:14 on the first request and never passes a few seconds after it. The music accelerates with the ladder, and the camera gets closer and faster.

**The midpoint turn.** Three requests teach the viewer that speed is good. Then `rm -rf` turns red, the hand hits ⌃⌥Y out of habit, and nothing happens: the app won't take a hotkey Allow on a command that needs a click (`Store.decideByHotkey`, checked in source). The music drops out, a cursor crosses a silent frame and clicks Deny. Caption: **"Yours."** The app that made you fast is the one that won't let you be careless. That answers the HN objection ("so it rubber-stamps agents?") before anyone types it.

**The payoff.** Back to the `top` list: 0 blocked, the 20:14 agent done. "Slowest process? Not anymore." Only then does the film open up: thirteen themes relighting a turning laptop, a blackout where you only hear the event sounds, `nettop` at 0 bytes, the install command.

**Why it beats the others.** Developers will quote the hook to argue with it, and it contradicts every AI ad this year: the bottleneck isn't the model. Every feature has a cause in the plot, so the film gets harder instead of flatter. The risky beat gives it a real turn, which none of the five has. And it's built from the product, a terminal and a laptop, which our pipeline already does well.

---

## 3. Script (30 fps, 59.0 s = 1770 frames)

Grid: 120 BPM, beat = 15 frames, bar = 2.0 s. The track's intro runs 0–4 s, then 1 s of silence; a fresh grid starts at 5.0, so bar lines fall on odd seconds (5, 7 … 55). Big moments sit on bar lines. **★ = key still frame.**

| # | Time / frames | Picture | On-screen text (exact) | Sound | Proves |
|---|---|---|---|---|---|
| 1 | 0.0–2.5 / 0–75 | Full-frame terminal, Geist Mono 34 px: a fictional `top`-style list, 13 rows, numbers churning. At f24 the sort flips to BLOCKED; one row slides to the top and turns amber. 2D push 1.0→1.6× into its last cell. **★ STILL 1, f50.** | `agents — 13 processes · 12 running · 1 blocked   sort: BLOCKED ▼` · `PID  AGENT  STATE  BLOCKED  WAITING ON` · amber row `4127  claude · fix/upload-compress  BLOCKED  20:14  you` · corner, Inter 16 px: `Dramatisation` | Intro: clock-tick hats, one pulse note, typing texture. Row snap: dry click. | Problem |
| 2 | 2.5–4.0 / 75–120 | Match on `you`: the cell scales out to fill the frame, the table falls to black. Geist type builds word by word on eighths. | `The slowest process` / `on your Mac` | Riser, ticks double. | Hook |
| 3 | 4.0–5.0 / 120–150 | Black. Line holds; `is you.` drops in, the period amber and slightly oversized. | `is you.` | **Silence**, all buses cut with 2 ms fades. | Hook |
| 4 | 5.0–9.0 / 150–270 | **Blender A.** Opens as a 135 mm macro: the amber period becomes the waiting mark beside the notch, same position and diameter. Rack focus across five marks; pull back and truck left as the lens goes 135→60 mm, revealing the top half of a live screen (four terminals scrolling, menu bar, wing). Labels tethered to marks. | `working` · `waiting for you` · `stuck` · `done` · at 7.0, lower left: `Agent Notch` (Geist 56) / `Every agent, beside the notch.` (Inter 24) | 5.0: impact + half-time section, sub bass, motif once, soft. | Marks, states |
| 5 | 9.0–13.0 / 270–390 | **Blender B.** 18-frame whip from three-quarter view into the notch, motion blur; last frame is square to camera and hands off to 2D. The real `ask` snapshot drops from the notch at 2.4×. 50-frame hold on the command. Cursor clicks Allow at **13.0**. **★ STILL 2, f380** (cursor on Allow). | top left, Geist Mono 20: `REQUEST 1` · beside row: `waiting 20:14` | Whoosh crest on the handoff; amber "waiting" interval under the read. **The drop lands on the Allow click.** | Allow from notch |
| 6 | 13.0–14.0 / 390–420 | Row flashes green; match on the green into a terminal line in the same spot; tests scroll; the wing mark turns green. | terminal `✓ 14 passed` · Geist 64: `Seen in 2 seconds. Not 20 minutes.` | Rising "answer" motif inside the groove. | Work resumes |
| 7 | 14.0–17.0 / 420–510 | **Blender C.** Low 100 mm macro gliding ⌃ → ⌥ → Y; keys travel down on 15.0 and 16.0. Behind, the screen's bokeh shows two amber blobs; each press turns one green. 2D panel inset at right answers two requests in order. | `REQUEST 2 · 3` · `⌃⌥Y allows. ⌃⌥N denies.` · `Hands stay on the keyboard.` | Two keycap clacks on the beats, each with a short pitched "yes". | Hotkeys |
| 8 | 17.0–21.0 / 510–630 | Hard cut, tight: one row at 70% of frame width, `rm -rf dist build` in red, `dangerous` tag. Frame desaturates except red. At **18.0** the keycap overlay shows ⌃⌥Y; the UI doesn't change; the film camera jolts 6 px (film emphasis, not app behaviour). Cursor crosses in silence; **Deny at 21.0**. | `REQUEST 4` · at 18.3: `⌃⌥Y won't approve this.` · at 19.3: `It needs a click.` | **Breakdown, drums out**: drone, heartbeat kick. 18.0: dull muffled knock. Deny: firm descending motif. | Risky, no auto-approve |
| 9 | 21.0–23.0 / 630–690 | Red drains to graphite in 10 frames; the row collapses to the real terminal line. | terminal `Denied by you in Agent Notch` · Geist 140: `Yours.` · Inter 22: `Nothing is approved without your click or keypress.` | Drone rings out; a lone hat at 22.5 counts back in. | Trust |
| 10 | 23.0–26.0 / 690–780 | Panel in 2.5D (5° tilt), left third, `question.png` at 2×. Option clicked at **25.0**; the agent's terminal on the right receives it. | `REQUEST 5` · `It asks. You answer here.` | Groove returns brighter, arpeggios. Click + pluck. | Questions |
| 11 | 26.0–29.0 / 780–870 | 12-frame whip-pan right; `plan.png` on the right third, steps revealing top to bottom; **Approve at 28.0**. | `REQUEST 6` · `Plans too. Read it, approve it.` | Pan whoosh; motif variant. | Plan approval |
| 12 | 29.0–33.0 / 870–990 | `heavy.png` re-rendered at 3× becomes a tower; 3-s tilt down it, subagent rows branching. At 32.0 the wing fills with marks and six fold into a counter. | `REQUEST 7` · Geist 72: `Every project. Every subagent.` | 16th hats, motif in octaves. Fold: tick-tick-tick-snap. | Projects, subagents |
| 13 | 33.0–36.0 / 990–1080 | Macro on the usage panel at 3.5×: the `Claude 81%` chip glows amber, context rings close, spend counts up to `$3.42` (fixture values from `usage.png`). | `REQUEST 8` · `Limits, context, cost.` · `See the wall before you hit it.` | Rising filter; a "limit low" tick when the chip lights. | Usage, cost |
| 14 | 36.0–41.0 / 1080–1230 | Desktop; the completion toast (new snapshot) slides down from the notch at **37.0**. Clicked at 38.5: the camera zooms through it into the agent's window, which comes to front on its commit line. | toast: `Compress video uploads · done · 4 files · tests ✓ · commit 4f9c2e1` · `REQUEST 9` · `Done. One click puts you in its window.` | **Motif repeat**, full and resolved, on 37.0. | Toast, jump |
| 15 | 41.0–43.0 / 1230–1290 | The window shrinks back into the `top` list from beat 1. Rows green; the old amber row reads DONE. | `agents — 13 processes · 12 running · 0 blocked` · `4127  claude · fix/upload-compress  DONE  —` · Geist 96: `Slowest process? Not anymore.` | One-bar fill + riser from 42.0. | Payoff |
| 16 | 43.0–49.5 / 1290–1485 | **Blender E.** Laptop on black; 80° low arc, 35 mm. The screen, baked into Blender's emission, changes theme every beat: 13 themes × 15 frames. The screen is the key light: Synthwave paints the deck magenta, Paper turns it white. **★ STILL 3, f1380** (Synthwave). | lower left, Geist Mono 22: `01/13 Terminal` … `13/13 Rubber Ducks` · 43.0: `13 themes.` · 49.0: `Yes, Rubber Ducks.` | **Final drop**, the widest section. A pitched blip per theme, tuned to the chord. | 13 themes |
| 17 | 49.5–52.5 / 1485–1575 | Black; only marks remain as points of light. On 50.0, 50.5, 51.0, 51.5 one flares with its sound and a label. At 52.0 the Sounds settings snapshot slides up for 15 frames. | Geist 72: `Don't look. Listen.` · `permission` · `question` · `plan` · `finished` · 52.0: `A sound for each event. Or none.` | **Drums out**; the four event sounds are the rhythm. | Sounds |
| 18 | 52.5–55.0 / 1575–1650 | Full-frame mono, `nettop`-style: one row, zero traffic, header timer running. | `Agent Notch   ↑ 0 B   ↓ 0 B` · `Reads local logs. Sends nothing.` | Thin pad, ticks. | Local, no network |
| 19 | 55.0–59.0 / 1650–1770 | **Blender F.** Front, laptop in the lower 55%, slow 4% push; marks green, going to done one by one from 56.0. Command still for all 120 frames. | Geist 96: `Agent Notch` · Geist Mono 36 on a dark pill: `brew install --cask forichok/tap/agent-notch` · `Free · open source · MIT · macOS 14+` · `github.com/Forichok/Agent-Notch` · Inter 16: `Independent project. Not affiliated with Anthropic or OpenAI.` | **Final hit on 55.0**, metallic ring-out. | Install |

Every listed feature appears once: marks 4, Allow 5, hotkeys 7, risky 8–9, questions 10, plan 11, projects/subagents 12, usage/limits/cost 13, toast and jump 14, themes 16, sounds 17, local/no network 18.

Readable text gets at least 45 still frames after the camera stops. The 100-second fallback goes in the post copy: "No answer in 100 s? The agent asks in its own window, as usual."

---

## 4. Visual bible

**Palette** (status colours from `Theme.swift`, so film and app agree):

| Role | Hex | Rule |
|---|---|---|
| Amber, needs you | `#FFB01F` | Waiting, the "you." period, request timers. Never decoration. |
| Red, danger | `#FF453B` | Beat 8 and the "stuck" mark only. One red flood per film. |
| Green, working/done | `#30D159` | Answers, resumed work, the bookend. |
| Ground | `#0B0B0D`, graphite `#1C1C1F` | A stage, never more than 3 s without colour. |
| Paper | `#F2EFE8` | The light theme frames; the film needs bright moments. |

Grade the Blender plates on their own; no LUT over the status colours.

**Type roles.** *Geist* 600–700, −2% tracking: accusations and headlines ("Yours.", "Not anymore."). Huge or absent. *Inter* 400–500: labels and small print, never above 28 px. *Geist Mono*: everything a machine says (`top`, `nettop`, counters, timers, brew). Phrases reveal through a clipped mask with 16 px travel; word-by-word only in beat 2; text is still during every click.

**Motion: three behaviours, nothing else.**
1. **Travel**: `Easing.bezier(0.22, 1, 0.36, 1)` for every camera move. Start 8–12 frames early so arrival hits the beat. Whips use it over 12–18 frames with `CameraMotionBlur` (6 samples, 180°), and nothing else in frame moves.
2. **Drop**: `spring({mass: 1, stiffness: 190, damping: 28})` for whatever leaves the notch: panel, toast, sheet. Header, content, buttons, 3 frames apart.
3. **Clack**: 3 frames down to 0.96 scale, 2 hold, 6 back. Keys, clicks, the row snap.

**Match cuts** (detailed in the script): `you` cell → giant word; amber period → waiting mark at the same centre and diameter; dive's last frame → 2D panel (stage pixels = snapshot pixels); Allow green → `✓` line; toast → window → `top` row, so the film returns to its first frame; green `top` → Terminal theme on the orbit screen; last theme's marks → points of light.

**2D/3D handoff.** UI the viewer must read is 2D and straight on, or overlaid on the plate through the corner JSON, never baked into a raked render. Shots about light and object (A, C, E, F) bake the screen into Blender's emission so it lights the metal. Handoffs happen only on frames where the screen is square to camera.

**Killing "small dark panels in one place."** No two adjacent beats share a scale or a position: full-frame type, macro hardware, panel centred, inset, single row, left third, right third, a tower, a macro strip, a wide orbit. Colour breaks the black every few seconds. Snapshots are re-rendered at 3× so a 3.5× crop stays sharp (v4's 1280-px PNGs blur past 1.5×). Captions never sit in the same corner twice running.

---

## 5. Blender shot list

The v4 screen looks dead because it is one static `desktop.png`. New order: **a Remotion `ScreenFeed` composition** (3024×1964, 30 fps: desktop, four live terminals, menu bar, wing, marks) **→ PNG sequence → image-sequence texture on the screen emission → Blender plate + corner JSON as today → Remotion overlays readable UI via `device.tsx`.** `export_json` also writes each mark's and the notch centre's projected position per frame, for the tethered labels and the period-to-mark match.

| Shot | Film / frames | Camera and lens | Screen shows | Why it moves |
|---|---|---|---|---|
| A notch-reveal | 5.0–9.0 / 120 | 135 mm f/2.0 on the amber mark; pull back 6 cm, truck left 3 cm, lens 135→60 mm, f/2.0→5.6. Ends on the top half of the lid. | `ScreenFeed`: terminals scrolling, five mark states, amber pulsing 1 Hz. | Rack focus, perspective shift of the dolly-zoom, terminal light on the bezel. |
| B dive | 9.0–10.5 / 45 | Retimed `shot_push`: three-quarter (az 34°, el 21°, 0.92 m) to square-on notch, 50 mm; 18 fast frames, 27 settling. | Frozen `Do you want to proceed?`; amber mark. | Whip speed, Cycles motion blur (shutter 0.5), dead stop on the handoff. |
| C keys | 14.0–17.0 / 90 | 100 mm f/2.8, 3 cm above the deck, sliding ⌃ → Y. ⌃ ⌥ Y as separate objects, −1.0 mm on 15.0 and 16.0. | Defocused screen: two amber blobs turning green on the presses. | Parallax over keycaps, colour change in bokeh, real key travel. |
| E themes-orbit | 43.0–49.5 / 195 | 35 mm f/8, el 12°→22°, 80° arc around `HERO_T` at 0.85 m, ease-in-out. | 13 theme feeds, one per 15 frames, emission 1.6×. | The screen relights the metal every beat; a reflection stripe travels along the lid edge. |
| F endcard | 55.0–59.0 / 120 | Retimed `shot_endcard`, el 6°, 1.22→1.17 m, laptop framed low. | Clean desktop; marks green → done from 56.0. | Slow push, marks changing on the hit. |

570 frames. At v4's measured 7–15 s/frame (64 samples, M1 Max) that's 1.5–2.5 h; E may need 128 samples for clean coloured spill, so budget 4 h for finals. Block everything in EEVEE first.

**`build_scene.py` changes** (from `3-3d-devices.md` and the v4 frame):
- *Lighting.* v4 has a hotspot mid-trackpad and a flat deck. Move `Key` up and back so its reflection draws the lid edge; add a 0.02 × 0.8 m strip on the screen rim and two camera-invisible black cards beside the deck. In E, `Key` at 30%, the screen lights the scene, `RimL` keeps the silhouette.
- *Materials.* Aluminium roughness to the 0.22–0.32 look-dev range, keep the micro-bump. Screen emission under a coat layer so the HDRI and strip reflect over the UI.
- *Model.* Key legends (⌃ ⌥ Y N at least, as a texture), separate keycap objects, a visible hinge gap, rubber feet, port interiors only where C sees them. No logo on the lid.
- *Screen.* Image-sequence texture; an opaque notch mask at the real active-display aspect.
- *Compositor.* Bloom threshold above UI white; only marks bloom.
- *Rights.* Apple's guidelines favour photos of genuine hardware. Owner chose CG; no logo, no "MacBook" in captions; owner signs off.

---

## 6. Music and sound

**Section map (film time).** Suno won't hit these alone; the edit in `MUSIC.promo` makes them.

| Film time | Bars | Section | Picture |
|---|---|---|---|
| 0.0–4.0 | 2 | Intro: ticks, one pulse, rising | `top`, hook |
| 4.0–5.0 | — | Silence (made in the mix) | "is you." |
| 5.0–13.0 | 4 | Half-time: impact, sub, motif once | Reveal, dive, read |
| 13.0–17.0 | 2 | **Drop** on the Allow click | Allow, hotkeys |
| 17.0–23.0 | 3 | Breakdown: drums out, drone, heartbeat | `rm -rf`, "Yours." |
| 23.0–37.0 | 7 | Groove B: brighter, arpeggios, climbing | Question → usage |
| 37.0–41.0 | 2 | Peak: motif repeat, resolved | Toast, jump |
| 41.0–43.0 | 1 | Stop-time fill + riser | `top` bookend |
| 43.0–49.5 | 3¼ | **Final drop**, widest | Themes orbit |
| 49.5–55.0 | 2¾ | Drums out; event sounds carry it | Sounds, nettop |
| 55.0–59.0 | 2 | Final hit, metallic ring-out | End card |

**Suno v6 Style field** (934 characters):

```
Instrumental electronic score for a tense developer-tool launch film. 120 BPM, 4/4, A minor. Dry mechanical percussion, ticking closed hi-hats like a clock, tight sidechained sub bass, a clipped metallic three-note rising synth motif. Starts sparse: ticks and one pulsing note, building for 2 bars. Then half-time: heavy sub bass, the motif once, tension rising for 4 bars. Punchy drop into a driving, precise groove with empty space between hits. Sudden breakdown: drums out, only a low drone and a heartbeat kick, dark and quiet. Groove returns brighter with arpeggios, climbing for 8 bars, motif repeated and resolved. One bar drum fill and riser. Final drop: the biggest, widest section, motif loud and confident. Then drums out for 2 bars, then one final hit with a short metallic ring-out. Modern, controlled, slightly menacing, confident. No vocals, no choir, no orchestral brass, no guitar, no long ambient intro, no fade-out.
```

**Lyrics field:**

```
[Instrumental]
[Intro: clock ticks, single pulse note, 2 bars]
[Build: half-time, sub bass, three-note motif, 4 bars]
[Drop: full groove]
[Breakdown: drums out, low drone, heartbeat kick, 3 bars]
[Groove: brighter, arpeggios, 8 bars]
[Fill: 1 bar riser]
[Final Drop: biggest section, motif loud, 4 bars]
[Drums Out: 2 bars]
[Final Hit: short metallic ring]
[End]
```

**Variants** (replace the instrument sentence; keep 120 BPM so the grid holds):
1. **Heist techno**, the prompt above: dry and menacing, best fit for the ladder.
2. **Breakbeat electro**: "chopped funk breakbeat drums, acid 303 bass line, gritty and playful". More attitude; busier under captions.
3. **Filter house**: "four-on-the-floor kick, filtered disco chords opening up, warm analog bass, optimistic". Friendlier; weakest breakdown.

Six takes (two per direction) at matched loudness against the animatic, one revision of the winner, then `audio/measure.py` and the segment map. The silence and the drop on the click are edits.

**SFX palette** (extend `audio/synth.mts`):

| Cue | Sound | Where |
|---|---|---|
| Tick | 20 ms dry click | `top`, counters, fold |
| Clack | low-profile key, 40 ms | 7, 8 |
| Waiting | soft unresolved sus4 | amber holds |
| Answer | rising A–C♯–E, short | Allow, hotkeys, question, plan |
| Refused | muffled knock, no pitch | ⌃⌥Y on `rm -rf` |
| Deny | descending motif | 8 |
| Finished | full motif | 14, end |
| Theme blip | 13 pitched blips in the chord | 16 |
| Whoosh | 120–300 ms filtered air, crest on arrival | 5, 11, 14 |
| Impact | attack + body + 50 Hz with harmonics for phones | 5.0, 55.0 |

Beat 17 uses these designed cues. The app's default "Glass" is a macOS system sound; Apple audio stays out of the ad.

**Local models.** *Stable Audio Open* earns a place for three textures only: whoosh air, the metallic ring-out tail, a room-tone bed under the keyboard macro. Tonal cues stay synthesised so they follow the chord. Check its Community License before use. *Z-Image-Turbo or any image model:* no job here. UI is real pixels, backgrounds are black or Blender, the HDRI is CC0, key legends are vector text. Skip it.

---

## 7. Production plan

Gates: 3 stills → animatic → owner approval → production → phone check muted and with sound.

| Step | Claude | Owner | Hours |
|---|---|---|---|
| 1. Stills | ★1, ★2 (over an EEVEE plate), ★3 (EEVEE), 1920×1080, checked at 640 px | Approves or redirects | 6 / 0.5 |
| 2. Snapshots | New fixtures: toast, before/after rows per answer, risky-only list, sounds sheet; snapshot scale 3×; one build with `AGENT_NOTCH_LANG=en` | — | 4 |
| 3. Animatic | Full 59 s at final timing, rough 2D, EEVEE grey blocking, v4 track retimed as temp, final captions | Phone watch, timestamped notes | 10 / 1 |
| 4. Music | Candidate manifest, measuring, segment edit | Six Suno v6 takes, picks with Claude | 3 / 2 |
| 5. Blender | `ScreenFeed`, image-sequence screen, lighting/model changes, shots A B C E F, previews then finals | Approves previews | 12 + 4 render / 0.5 |
| 6. Edit | 19 beats on the grid, 3× snapshots, match cuts, motion rules | — | 18 |
| 7. Sound | Cues in `timeline.ts`, new cues in `synth.mts`, ducking, −14 LUFS / −1.5 dBTP measured on the encoded MP4 | Speakers + phone | 6 / 0.5 |
| 8. Review | One fresh Opus reviewer, max two fix rounds, three decisive frames | Final watch, sign-off | 4 / 1 |

About 63 Claude hours plus ~4 h unattended render; about 6 owner hours.

**Risks.**
- *Density.* 19 beats in 59 s. If the animatic fails the read test, trim 15 and 18, then merge 10 and 11 into one split screen.
- *The `top` frame reads as a real tool.* It's a fictional list; "Dramatisation" stays on 0–5 s and the post copy says so.
- *Hotkey refusal.* The app shows no refusal animation; the film shows only that nothing changes. The camera jolt is film language. The animatic must not invent a "denied" UI.
- *Theme orbit.* If the spill looks muddy in blocking, overlay themes through corners and light the deck with a coloured area light per theme.
- *Suno structure.* It won't arrive as written; budget the edit, not rerolls.
- *Render time.* E is the long pole; test denoise flicker on a 30-frame slice first.

**Explicitly NOT done.**
- No Claude or OpenAI logos as characters, jokes or animated objects; marks appear only as the app draws them, at UI scale. Independence line on the end card.
- No implied auto-approval: every Allow is a visible click or keypress, the risky command is refused by the hotkey and denied by hand, and the film says "Nothing is approved without your click or keypress."
- The 20:14 wait is a labelled dramatisation of a day without the app. No time-saved or money-saved claims; $3.42 and 81% are fixture UI, not results.
- No vertical cut, clips, voiceover, screen recording, paid services, or AI-generated video or UI.
- No Apple system sounds, no Apple logo. Music and licensed raw assets stay out of the MIT repo.
- No publishing; the owner uploads.
