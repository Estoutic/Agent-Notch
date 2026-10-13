# Agent Notch: motion craft that earns its render time

Research date: **2026-10-13**. Every external link below was checked on that date; publication dates are distinguished from access dates. Tool capabilities are sourced facts. Visual judgments, timings and effort estimates are my recommendations, not measured results. Commands are proposed for a later implementation session; none were installed or executed here.

## What v4 actually needs

An agent waiting twenty minutes for permission is a strong premise. The film should make the viewer feel that interruption, then experience the release when one click gets work moving again. I would spend the first day on that ten-second sequence before adding another shader.

I inspected both supplied v4 contact sheets, decoded MP4 frames at 6.0, 6.5 and 8.0 seconds, and read the composition, camera, font, device and music code. `ffprobe` confirms a 1920×1080, 30 fps film lasting 59.648 seconds. The wide hardware frame contains tiny notch marks on a nearly empty dark desktop; “empty screen” is perceptually fair, although the close-up proves there is content. The vertical sheet repeatedly puts miniature interfaces between large black areas. These are framing problems.

Local primary evidence, inspected 2026-10-13: `promo/out/frames-v4/sheet-promo.png`, `sheet-vertical.png`, `promo/out/agent-notch-promo.mp4`, `promo/src/lib.tsx`, `timeline.ts`, `device.tsx`, `fonts.ts`, and `Sources/AgentsNotch/Snapshot.swift`. V4 already has cursor interpolation, logarithmic camera scaling, springs, motion blur, grain and beat-driven events. Buying those ingredients again will not produce a premium film. Audio quality and full-speed playback were **NOT verified**; I make no listening-based verdict.

## Make the camera explain the action

Screen Studio’s useful idea is editorial attention: enlarge the region where something consequential happens, smooth the pointer, then give the result room. Its current site advertises automatic click zooms, manual zooms, cursor smoothing and motion blur. Version 4.0 is advertised; pricing is **$29/month**, or **$9/month billed yearly**. Those prices came from the homepage’s pricing HTML, not older reviews. Claude can consume an exported recording through Remotion, but a supported Screen Studio CLI/MCP/API is **UNVERIFIED**. Treat recording and export as an owner-operated shortcut. [Screen Studio, accessed 2026-10-13](https://screen.studio/#pricing).

For Agent Notch, scripted framing is better than chasing every cursor movement. Store `{frame, targetRect, click, resultingState}` events. Fit each target rectangle into a safe output rectangle; calculate scale from both dimensions, then translate its centre to the safe rectangle’s centre. Clamp against the source bounds. Retain the previous framing while the pointer moves within it; reframe only when the target leaves that region. This prevents nervous auto-pan.

Use the existing `camAt()` and `toScreen()` so camera and cursor share coordinates. Proposed timing at 30 fps: arrive 6 frames before a click, make contact at frame C, open the panel at C+1, change amber to green at C+4, resume terminal output at C+6. Hold the readable result for 45–75 frames. These are starting values, not claims about app latency. For vertical, make a separate target rectangle and edit; do not centre-crop landscape.

Keep the notch as the spatial anchor. The panel should originate there; its header arrives first, request content follows, then the action buttons. After approval, return the viewer’s eye to the same agent’s mark. Apple’s WWDC18 *Designing Fluid Interfaces* explains spatial consistency and dynamic motion; it supports this continuity, not a claim that Apple uses a particular advertising recipe. [Apple, WWDC 2018; accessed 2026-10-13](https://developer.apple.com/videos/play/wwdc2018/803/).

## A motion vocabulary, rather than twenty entrance presets

Use three behaviours: decisive camera travel, a restrained panel spring, and brief mechanical feedback. Easing curves let a move land on an exact musical accent. Springs convey attachment and weight, especially when a panel grows out of the notch. Their settings should vary with the object, not with the agent writing the shot.

For a panel, start with Remotion `spring({frame: f-openFrame, fps, config: {mass: 1, stiffness: 190, damping: 28}})`. This is approximately critically damped under the conventional spring model. For camera travel, try `Easing.bezier(0.22, 1, 0.36, 1)`; clamp progress. Avoid applying a bouncy spring to every caption. Google’s motion guidance explicitly recommends changing duration with distance and surface changes, and asymmetric acceleration/deceleration. Its desktop UI durations are guidance for interaction, not mandatory film shot lengths. [Remotion spring API, accessed 2026-10-13](https://www.remotion.dev/docs/spring); [Google motion guidance, accessed 2026-10-13](https://m1.material.io/motion/duration-easing.html).

For 2.5D, split a shot into desktop, terminal, notch/panel and cursor layers. A CSS parent with `perspective: 1200px` and `transform-style: preserve-3d`, shallow Z offsets and a 3–6° camera tilt can supply depth without a new renderer. Then square the panel to the viewer for reading. This is a proposed CSS construction, **UNVERIFIED in this project**. Exaggerated perspective makes buttons harder to read and suggests a different product.

Reserve the Blender device for one short transition from notch macro to recognisable MacBook. Continue into the interface rather than cutting to another unrelated composition. The existing corner JSON and `matrix3d` overlay are valuable: put the actual product state on that screen, check registration, and keep the same cursor target through the handoff. Extra device orbits have lower payoff than readable interactions.

## Typography should punctuate, not narrate every pixel

Keep the already bundled Geist 1.7.2, Inter 5.3.0 and Geist Mono. Geist and Inter’s upstream repositories document their open font licences. A new typeface is unlikely to fix the film. [Geist repository, accessed 2026-10-13](https://github.com/vercel/geist-font); [Inter repository, accessed 2026-10-13](https://github.com/rsms/inter).

Give each role a rule: large Geist accusations; quiet Inter explanations; monospace only for commands and counters. Animate phrases through a clipped container with 12–20 pixels of vertical travel. Use word-level animation once, for “You.” Keep text still during the crucial click. Avoid per-letter rotations, elastic tracking and competing caption/UI movement.

Choose sizes at the delivery surface: preview landscape at 640 pixels wide and vertical at 360×640. Essential buttons must remain identifiable. For a 1080-wide vertical composition, 42–54 pixel essential labels are a useful starting range, not a universal accessibility standard. Keep the install command intact and give it a quiet hold. Do not spend its reading time on a laptop flourish.

## Match cuts, masks, morphs and speed

The amber period in “You.” can become the amber agent mark. Preserve centre, colour and apparent diameter across the cut, then reveal the notch around it. V4 already contains this concept; improve its execution before adding a transition catalogue. A second match cut can connect the Allow button’s green confirmation to resumed terminal output.

Use masks when they explain origin: panel expands from the notch; rows reveal inside the panel; twelve agent marks fold into a counter. Interpolate a rounded rectangle’s position, size and radius directly. For genuinely different silhouettes, `flubber@0.4.2` returns a path interpolation function: evaluate `flubber.interpolate(from, to)(progress)` from the current frame. It ignores holes and all but the first outer shape in a multi-shape path, so it is unsuitable for morphing a complete UI screenshot. [Flubber API, accessed 2026-10-13](https://github.com/veltman/flubber); [version metadata, published 2018-03-01; accessed 2026-10-13](https://registry.npmjs.org/flubber).

Proposed install: `npm install --save-exact flubber@0.4.2`. Claude writes the SVG wrapper and supplies clamped frame progress. Ordinary wipes can use the already installed `@remotion/transitions@4.0.290`; custom masks require no package. [Transition API, accessed 2026-10-13](https://www.remotion.dev/docs/transitions).

Speed-ramp travel, not comprehension. Accelerate a terminal cascade or camera relocation, decelerate into the prompt, then stop. For Blender image sequences, compute a monotonic source-frame mapping; high-speed sections can skip frames, but slow sections need enough source frames to avoid repeated-frame stutter. Retiming existing 30 fps footage cannot invent genuine slow-motion detail. Match direction and screen position across a cut before hiding it with blur.

## Blur, shaders, grading: selective finishing

The installed `CameraMotionBlur` is enough for the first pass. Try 5–6 samples and 90–180° shutter on fast travel only; freeze captions outside it. Remotion warns that its blending can damage colours and that additional samples trade cost against quality. Put `useCurrentFrame()` inside the blurred subtree so each temporal sample evaluates its own motion. [CameraMotionBlur, accessed 2026-10-13](https://www.remotion.dev/docs/motion-blur/camera-motion-blur); [sampling mistake, accessed 2026-10-13](https://www.remotion.dev/docs/motion-blur/common-mistake).

Glow should identify an event: a modest amber halo when permission becomes overdue; one green pulse when work resumes. CSS radial gradients and shadows are the fastest approach. Bloom is worth a WebGL pass only if a test shot proves a visible gain. `postprocessing@6.39.5` supplies `BloomEffect` and `EffectComposer`; Claude must adapt the repository’s realtime example into explicit frame evaluation, rather than retain its `requestAnimationFrame` loop. [Repository, accessed 2026-10-13](https://github.com/pmndrs/postprocessing); [version metadata, published 2026-09-09; accessed 2026-10-13](https://registry.npmjs.org/postprocessing).

For an optional shader shot on the existing React 18 stack:

```sh
npm install --save-exact @remotion/three@4.0.290 \
  @react-three/fiber@8.18.0 three@0.170.0 postprocessing@6.39.5
```

These versions exist and their declared peer ranges overlap; rendered compatibility is **UNVERIFIED**. Current Fiber 9.8.1 requires React 19, so an unpinned install is a migration. [Fiber 8 peers, accessed 2026-10-13](https://registry.npmjs.org/@react-three/fiber/8.18.0); [Fiber current metadata, accessed 2026-10-13](https://registry.npmjs.org/@react-three/fiber); [Three version, accessed 2026-10-13](https://registry.npmjs.org/three/0.170.0); [Remotion ThreeCanvas, accessed 2026-10-13](https://www.remotion.dev/docs/three).

An original fragment-shader sketch for a quiet amber halo follows. It is **UNVERIFIED code**, not a tested package or full bloom pipeline; a host must provide UVs, aspect ratio and frame-derived amplitude.

```glsl
varying vec2 vUv;
uniform vec2 center;
uniform float aspect;
uniform float amplitude;
void main() {
  vec2 p = (vUv - center) * vec2(aspect, 1.0);
  float halo = exp(-dot(p, p) * 180.0);
  vec3 base = vec3(0.027);
  vec3 light = vec3(1.0, 0.43, 0.04);
  gl_FragColor = vec4(base + light * halo * amplitude, 1.0);
}
```

This belongs behind the UI. Claude can host it in a ThreeCanvas plane and derive uniforms from `useCurrentFrame()`; evaluate renderer and colour-space behaviour in the exported result. Current official shader guidance specifies `--gl=angle` for headless WebGL rendering. [Remotion shaders, accessed 2026-10-13](https://www.remotion.dev/docs/shaders).

There is also a newer route: Remotion **4.0.535**, published **2026-10-12**. Upgrade all existing Remotion packages together if needed. `@remotion/effects` starts at 4.0.464; its `lut()` starts at 4.0.526, so neither is available on v4’s 4.0.290. It supports inline 3D `.cube` LUTs and canvas-based components; HTML requires capture through `HtmlInCanvas`. This is useful, but an upgrade is not prerequisite to good choreography. [Release, accessed 2026-10-13](https://github.com/remotion-dev/remotion/releases/tag/v4.0.535); [effects, accessed 2026-10-13](https://www.remotion.dev/docs/effects); [LUT API, accessed 2026-10-13](https://www.remotion.dev/docs/effects/lut).

Grade hardware/background separately from semantic UI colours. FFmpeg’s `lut3d` and `noise` filters provide an existing CLI route; ffmpeg 9.0.1 is installed here. A film-wide LUT may muddy amber/red/green. Existing grain repeats six seeds: compare it against no grain in the compressed delivery encode before retaining it. Particle effects rank last: if used, make twelve seeded marks converge into the notch, with positions computed directly from frame time. Decorative dust adds work without explaining Agent Notch. [FFmpeg filter manual, accessed 2026-10-13](https://ffmpeg.org/ffmpeg-filters.html).

## Music and the critique loop

V4’s `timeline.ts` records 123.05 BPM, a 3.968-second source drop and a 5-second film reveal. That is local configuration, not a fresh audio measurement. Preserve the shared beat grid; add phrase boundaries and intended landing frames. Start a move before an accent so its arrival lands on it. Alternate fast connective cuts with longer reading holds; a cut on every kick becomes predictable. Let silence around “You.” carry the accusation.

Claude can run the existing `audio/measure.py`, revise event data, rebuild audio with `node audio/synth.mts`, and render a short comparison. If a new analysis environment is needed, propose `python3 -m venv .venv`, then `.venv/bin/pip install librosa==1.0.0`. That version was published 2026-08-11; compatibility with the existing script is **UNVERIFIED**. Beat tracking proposes timing; the owner must audition section boundaries and transient alignment. [PyPI metadata, accessed 2026-10-13](https://pypi.org/pypi/librosa/json); [upstream beat implementation, accessed 2026-10-13](https://github.com/librosa/librosa/blob/main/librosa/beat.py).

Professional instruction offers a useful production sequence: storyboard, animatic, style frames, animation, feedback and sound. School of Motion documents that sequence and human critique. My proposed review gates are below; they are not universal industry scoring standards. [Explainer Camp, accessed 2026-10-13](https://schoolofmotion.com/courses/explainer-camp).

- **Still-frame gate:** approve three frames—buried prompt, readable approval, final install. Bad composition cannot be eased away.
- **Silent gate:** a fresh viewer can identify the problem, approval and resumed work without captions explaining every action.
- **Continuity gate:** step through cut boundaries; check cursor contact, notch position, agent identity, masks and one-frame flashes.
- **Attention gate:** only one essential object moves at a time; hold the result after the camera settles.
- **Delivery gate:** inspect final MP4s at feed/phone size, with sound and muted. Check crushed blacks, tiny labels, banding, grain crawl and an unreadable command. Studio screenshots are insufficient.

Ask for timestamped defects, not “make it more premium.” First fix framing and timing; then typography and colour; then effects. Compare short variants with the same music and assets.

## Claude Code workflow and research limits

Use the official rolling Remotion skills repository: `npx skills add remotion-dev/skills`, choosing project scope and Claude Code. Claude edits React/frame math, uses the existing Swift snapshot capability for real UI, and renders through the CLI. The old Remotion documentation MCP is explicitly deprecated; prefer `/remotion-docs`. [Official skills repo, accessed 2026-10-13](https://github.com/remotion-dev/skills); [MCP deprecation, accessed 2026-10-13](https://www.remotion.dev/docs/ai/mcp).

GitHub, official docs/releases, blogs, HN, Reddit, X, YouTube, MCP registry and skill-marketplace surfaces were searched. HN’s original Screen Studio author post is historical evidence, not current pricing. X thread contents and a full YouTube viewing pass were **UNVERIFIED**. Marketplace listings establish discovery, not film quality; no third-party MCP is required. [Author post, 2022-12-18; accessed 2026-10-13](https://news.ycombinator.com/item?id=34045110); [official tutorial, accessed 2026-10-13](https://www.youtube.com/watch?v=5NRAOnKc3c8); [skill listing, accessed 2026-10-13](https://skills.sh/remotion-dev/skills/remotion-best-practices).

Costs below mean incremental software cost; Claude usage, labour and render time are additional. Remotion permits free commercial use for individuals/companies up to three people; creator seats for larger organisations are $25/month per user. [Licensing, accessed 2026-10-13](https://www.remotion.dev/docs/license/pricing).

## Top 10 recommendations for Agent Notch

Ranked by expected visual impact per working hour; hours are estimates, not benchmarks.

| Rank / what | Why | How Claude drives it | Cost / effort | Risk |
|---|---|---|---|---|
| 1. Reframe essential UI | Biggest visible v4 weakness | Target-rectangle camera; separate vertical framing | $0; 2–4 h | Lose spatial context if every shot is tight |
| 2. Complete one approval journey | Makes the benefit undeniable | Shared click/state/output event data | $0; 2–4 h | Invented product behaviour; check real UI |
| 3. Change shot-length rhythm | Creates tension and release | Retune timeline holds and connective cuts | $0; 1–3 h | Essential text outruns reading |
| 4. Standardise motion | Removes preset inconsistency | Two easing curves and one panel spring | $0; 1–2 h | Excess overshoot feels playful rather than precise |
| 5. Fix type hierarchy | Stronger hook, less visual competition | Bundled fonts, phrase masks, fixed roles | $0; 1–2 h | Headlines overpower the demonstration |
| 6. Refine amber match cut | Gives the film a memorable visual idea | Match centre/diameter, reveal notch, continue action | $0; 2–3 h | Mismatch breaks the illusion |
| 7. Time landings to music | Makes motion feel intentional | Existing beat grid, manual accent markers, audio CLI | $0 using existing track; 2–3 h | BPM tracker misses phrase/downbeat |
| 8. Add shallow UI depth | Creates scale and material separation | CSS layers; reserve Blender for one handoff | $0; 3–5 h | Tilt or blur damages legibility |
| 9. Restrict blur and glow | Polishes fast moves and state changes | Existing blur; CSS halo before WebGL | $0; 1–3 h | Colour shifts, increased render cost |
| 10. Consider real capture | Saves manual UI reconstruction | Owner records/exports Screen Studio; Claude imports | $29 for one monthly period; 1–2 h setup | Automation UNVERIFIED; capture still needs art direction |

## What NOT to do

Do not add glow, particles, glitch and grain to every shot. Do not make a feature catalogue compete with the blocked-agent story. Do not spend another day on laptop orbits while permission buttons remain tiny. Do not spring every letter, pan after every click, or speed-ramp reading. Do not assume the newest Fiber works with React 18. Do not install deprecated documentation MCPs. Do not grade status colours blindly or declare a 10/10 film from contact sheets. Protect the reading holds and finish the actual delivery encode before judging polish.

Verified here: supplied v4 sheets and decoded MP4 samples inspected, local source/configuration read, primary URLs and package metadata checked on 2026-10-13; full playback/audio and proposed implementations NOT verified.
