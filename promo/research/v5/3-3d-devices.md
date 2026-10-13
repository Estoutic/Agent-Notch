# Agent Notch: device shots that earn their screen time

Research dates: **13–14 October 2026**. Acceptance criterion: a 1,500–3,000-word report grounded in v4, with primary-source links, dated evidence, executable workflow proposals, and a ranked shortlist. Every external link below was checked during **2026-10-13–2026-10-14**; that access window supplies its verification date unless a publication date is also given. Commands are proposed for a later production session, **not executed or smoke-tested here**. Visual judgments, settings and effort estimates are recommendations, not measured benchmarks.

## What v4 actually needs

I inspected both supplied contact sheets, decoded frames from the supplied MP4 at 5.5 and 6.7 seconds, and read the Blender scene, screen compositor and promo README. The MP4 is 1920×1080, 30 fps, 59.648 seconds. At 6.7 seconds, the keyboard has no legends, the deck dominates the light, and the dark desktop carries tiny notch marks. At 5.5 seconds, the macro makes those marks readable. Keep that proximity; give the wide shot something worth revealing.

The biggest jump is **real Agent Notch UI, photographed or rendered into a screen with convincing reflections, followed by a deliberate move into the notch**. A more elaborate laptop orbit would spend more time advertising hardware.

The existing scene already has Metal Cycles, adaptive sampling, denoising, a Poly Haven studio HDRI, five area lights, micro-bump aluminium, DOF and compositor bloom. `promo/src/device.tsx` already maps UI onto per-frame screen corners. Buying those features again through another tool would miss the problem. The useful upgrades are geometry details, lighting hierarchy and screen integration.

## A rights constraint that changes the production choice

Apple’s [third-party guidelines](https://www.apple.com/legal/intellectual-property/guidelinesfor3rdparties.html), under “Depictions of Apple Products,” permit compatibility depictions under stated conditions, including an **actual photograph of genuine hardware rather than an artist’s rendering**. Apple-owned photographs require express permission. The same page restricts logo use and implied endorsement.

This is Apple’s stated permission framework, not a ruling that every independent render is unlawful. Nevertheless, a downloaded model’s license does not grant Apple’s trademark or product-design rights. Removing the logo is not complete clearance.

For a public launch, my preferred practical route is an owner-shot genuine MacBook plate, with accurate UI composited onto it. A locked camera and controlled reflection are enough; Remotion can animate crops between the wide view and notch close-up. This avoids the specific artist-render mismatch, though it is not blanket legal clearance. Use CG for planning, abstract transitions, or hardware shots whose publication rights have been resolved.

## Blender: the highest-control CG route

Keep the installed **5.1** pipeline for this experiment. Blender [released 5.1 on 17 March 2026](https://www.blender.org/download/releases/5-1/), with 5.1.2 dated 19 May. That establishes the branch, not the installed patch version.

[Cycles](https://www.blender.org/features/rendering/) is the production ray-tracing engine and supports Apple Metal. [EEVEE](https://docs.blender.org/manual/id/dev/render/eevee/index.html) uses rasterization and approximations rather than path tracing. “EEVEE Next” should not be treated as a separate software purchase. Use EEVEE for camera blocking; use Cycles for the final glass and metal shots unless an A/B render proves EEVEE sufficient. The linked EEVEE overview is development documentation; inspect 5.1’s actual settings rather than copying newer API examples.

**Lighting proposal:** retain the low-strength studio environment. Move a large softbox until its reflection describes the lid and deck; add one narrow strip to trace the screen rim. Use black cards to break up broad reflections. Move the trackpad hotspot away from the visual centre. Keep a reflection travelling across the screen edge, clear of Allow/Deny. Stronger light everywhere will flatten the materials.

The current HDRI is [Studio Small 09](https://polyhaven.com/a/studio_small_09). Poly Haven’s [FAQ](https://docs.polyhaven.com/en/faq) confirms its assets are CC0 and commercially usable. Cost: $0. Start with the existing 2K file; higher environment resolution matters only if a close reflection reveals its pixels.

For metal, preserve bevels and restrained grain. Try roughness around 0.2–0.35 rather than a mirror finish; treat that range as look development. Add key legends, credible hinge gaps, rubber feet and port interiors only where the camera sees them. Blender’s [Principled shader](https://docs.blender.org/manual/en/5.1/render/shader_nodes/shader/principled.html) provides metallic, roughness, coat and emission controls; no paid shader is required.

For a notch macro, start around 85 mm and f/4, focus on the amber mark, then stop down for the permission read. The physical scale and focus distance determine the result; those numbers are starting settings. Blender’s [camera documentation](https://docs.blender.org/manual/ru/5.1/render/cameras.html) documents focus and aperture controls. Use a sideways move with a short push and a clear stop. Avoid a continuous turntable during interaction.

**Claude Code control:** prefer the existing `bpy` script for reproducible finals:

```bash
blender -b --factory-startup -P promo/blender/build_scene.py -- --shots reveal --samples 16 --scale 50 --frames first,mid,last --out /tmp/notch-lookdev
```

The script’s cache prerequisites must already exist; its wrapper creates them. Inspect three frames, then a short sequence before increasing samples. Try 64–128 samples only after checking noise and denoising flicker. The repo’s “about 1.5 h” comment is **UNVERIFIED** as a present-machine benchmark.

There are two distinct MCP options. Blender Lab’s [official server](https://www.blender.org/lab/mcp-server/) requires Blender 5.1+, an add-on and an external server. Anthropic [announced the connector on 28 April 2026](https://www.anthropic.com/news/claude-for-creative-work). Its [source manifest](https://projects.blender.org/lab/blender_mcp/raw/branch/main/mcp/pyproject.toml) currently says 1.0.2; the latest release tag is **UNVERIFIED** here. A source-based Claude Code registration is:

```bash
git clone https://projects.blender.org/lab/blender_mcp.git tools/blender_mcp
claude mcp add blender-lab -- uv --directory /absolute/path/tools/blender_mcp/mcp run blender-mcp
```

Install the official add-on from its page first. This registration is derived from the source entry point, not a tested installation.

The community alternative, [ahujasid/mcp-for-blender](https://github.com/ahujasid/mcp-for-blender), is MIT licensed. [PyPI](https://pypi.org/project/mcp-for-blender/) verifies **2.1.9**, released **6 October 2026**:

```bash
brew install uv
uvx mcp-for-blender==2.1.9 install-addon
claude mcp add blender-community -- uvx mcp-for-blender==2.1.9
```

Enable its add-on in Blender. Use one bridge at a time. Claude can inspect objects, execute Python, adjust materials and obtain visual feedback. Both routes execute code; neither supplies art direction. For this repo, MCP helps interactive inspection, while saved scripts remain the final-render authority.

## Models: inspect these before paying

| Candidate | Verified price and license | Judgment for Agent Notch |
|---|---|---|
| Steven Yap, [Macbook Pro 14 Inch 2024 Space Black](https://www.blendkit.com/asset-gallery-detail/8a40e225-9f8a-48ac-aa9b-f240e0c3366e/) | Free; royalty-free; published 2 September 2025 | First inspection candidate. Notch-era form; fidelity, screen UVs and hinge separation remain UNVERIFIED until imported. |
| jc1245, [Macbook Pro](https://sketchfab.com/3d-models/macbook-pro-a2158f4d07c24861b268b170cb24c6d8) | Free download; CC Attribution; published 15 November 2021 | Blender-made high-poly candidate. Verify exact hardware generation and notch; preserve attribution. |
| aliartist3d, [Apple Silicon MacBook Pro 14 2021](https://www.cgtrader.com/3d-models/electronics/computer/apple-silicon-macbook-pro-14-2021-inch-in-official-design) | $15; Royalty Free; published 21 October 2021; native Blender/Cycles 2.93 file | Paid fallback, not an automatic upgrade. Materials may need migration; listed screen UV status is unknown. |

BlenderKit now calls itself **Blendkit**. Its [Full plan](https://www.blendkit.com/plans/pricing/) lists $9.90/month for companies meeting its small-company criteria; Business is $29/month. The free model above does not require Full. [Licenses](https://www.blendkit.com/docs/licenses/) allow commercial derivative work; royalty-free assets cannot be resold as models. Keep purchased/free royalty-free source assets out of the MIT repository unless redistribution is expressly permitted.

Install the Blendkit add-on ZIP through Blender Preferences → Add-ons → Install from Disk; the [vendor’s installation page](https://www.blenderkit.com/get-blenderkit/7bcec554-87af-44d6-9117-1ade8ab8af7b/) lists build 3.19.2.260411. Claude should import the asset, enumerate meshes, identify the screen and hinge, check missing textures, then render the same three camera positions as the procedural model. A marketplace thumbnail is not proof of macro quality.

## Convincing screen replacement

Two workflows deserve a comparison.

**Best integration:** render the real UI into a timestamped PNG sequence, UV-map it to the active display, and feed it into Principled emission beneath a reflective coat. This lets screen content participate in reflections, light spill, occlusion, DOF and motion blur. Give the notch a proper opaque mask; match the actual active-screen aspect ratio rather than stretching a 16:9 desktop.

The app already supports native captures. A proposed command is:

```bash
AGENT_NOTCH_LANG=en swift run AgentsNotch --snapshot /tmp/notch-ui
```

This exports fixture scenes, not a complete animated desktop. Assemble those native assets with desktop plates in Remotion; use a genuine capture where translucency matters. The repo notes that snapshot blur has substitutions, so inspect it before calling a fixture capture pixel-identical.

**Fast iteration:** retain the current corner projection, but put screen reflections above the UI. Export hardware, screen matte, reflection contribution and foreground occlusion separately. Composite UI through the matte, then reflection and bezel occlusion. Match exposure, edge softness and camera blur; the existing HTML layer otherwise stays sharp above a blurred render. Four corners locate a planar screen, but do not reproduce lens distortion or within-frame motion blur.

Use scene-linear EXR for a full compositing workflow, or consistently transformed PNGs for the simpler Remotion path. Apply a display transform once. Validate green and amber against native captures. Keep bloom confined to bright accents: Blender’s [Glare node](https://docs.blender.org/manual/fr/5.1/compositing/types/filter/glare.html) supports bloom/fog glow, but glowing every label damages readability.

For a photographed screen, the owner captures the plate and corner positions; Claude handles homography, masks and editing. Avoid a green screen reflecting green onto the keyboard. Photograph dark or neutral screen content, preserve reflections, and replace only the active display.

## Three.js/R3F and Spline

[Remotion’s Three integration](https://www.remotion.dev/docs/three) makes R3F animation frame-driven through `ThreeCanvas`. It is attractive for quick screen-heavy moves and abstract agent geometry; I would not migrate the photoreal hero to it first.

The repo pins React 18.3.1 and Remotion **4.0.290**. R3F’s [compatibility guidance](https://r3f.docs.pmnd.rs/getting-started/introduction) pairs React 18 with Fiber 8:

```bash
npm install --save-exact @remotion/three@4.0.290 @react-three/fiber@8 three
npm install --save-dev --save-exact @types/three
```

Resolve and lock the Three version after peer checks; an exact compatible release was not tested here. Claude imports a GLB, maps the screen, and computes camera/material values from `useCurrentFrame()`. Configure Chromium’s renderer as documented, and test actual exported frames.

For the existing pin, `useOffthreadVideoTexture()` is the older path. Current [texture documentation](https://www.remotion.dev/docs/videos/as-threejs-texture) recommends `@remotion/media` from 4.0.387 onward; asynchronous texture updates require synchronous `advance()` during rendering. Upgrade all Remotion packages together before adopting that example.

**Spline** now has a [built-in desktop MCP](https://docs.spline.design/generate/spline-mcp-server), including `mcp__Spline__3d_run_code`. Download/open the desktop app, let it register Claude Code, restart Claude, then author meshes, cameras and materials through MCP. No invented npm MCP package is needed. Its hosted/editor build version is **UNVERIFIED**.

[Pro costs $30/month monthly, or $25/month billed annually](https://spline.design/pricing), and includes [video export](https://docs.spline.design/exporting-your-scene/files/exporting-as-video) with duration, fps and resolution controls. Good for glass abstractions or a web companion. Lower priority for a physically convincing laptop because the existing Blender scene already carries the expensive setup.

## AI video: B-roll, with bounded experiments

These are suitability judgments, not a hands-on model benchmark. No generator’s preservation of Agent Notch’s hardware or UI is verified. Use the same authored reference image, short shots and one material palette. Reject altered hinges, notch shapes or keyboards; composite all readable UI separately.

| Tool/model | Current primary evidence, cost and rights | Claude Code route and proposed use |
|---|---|---|
| Veo 3 / 3.1 | Google’s [pricing](https://ai.google.dev/gemini-api/docs/pricing) lists 3.1 Standard $0.40/s at 720p/1080p; Fast $0.10/s at 720p, $0.12/s at 1080p. [Terms](https://ai.google.dev/gemini-api/terms), effective 23 March 2026, disclaim Google ownership of generated content. | Python `google-genai` or REST through the [video API](https://ai.google.dev/gemini-api/docs/video). Reference-led atmospheric plates; verify selected model’s frame-control support. Eight seconds Standard = $3.20 per generation. |
| Sora 2 | OpenAI’s [deprecations](https://developers.openai.com/api/docs/deprecations) record Videos API and Sora 2 removal on **24 September 2026**, announced 24 March. | No new official production pipeline. Current access/license through any reseller is UNVERIFIED. |
| Kling VIDEO 3.0/Omni | Kuaishou’s [5 February 2026 announcement](https://ir.kuaishou.com/node/11216/pdf) documents reference-based consistency. [Payment policy](https://kling.ai/docs/payment-policy) permits members’ commercial outputs. Public [API price](https://kling.ai/dev/pricing) was unreadable: **UNVERIFIED**. | Script the [official API](https://kling.ai/document-api/guides/get-started/quick-start) with reference elements. Test hardware B-roll only after checking price and API-specific rights. |
| Runway Gen-4.5 | [API pricing](https://docs.dev.runwayml.com/guides/pricing/): 12 credits/s, $0.01/credit, hence $0.60/5 s. [Commercial rights](https://dev.runwayml.com/learn/commercial-use) allow outputs subject to terms and third-party clearances. | Python `runwayml` SDK or REST; image-to-video inserts. Its [Dev MCP](https://docs.dev.runwayml.com/guides/mcp/) manages developer tasks/docs and is distinct from generation MCP. |
| Luma Ray 3.2 | [API pricing](https://docs.agents.lumalabs.ai/guides/pricing/): $1.20/5 s 1080p SDR; $3.60/5 s HDR+EXR. [Web Plus](https://lumalabs.ai/pricing) is $30/month with commercial use. [Terms](https://lumalabs.ai/legal/terms-of-service), updated 14 May 2026, condition commercial output use on eligible paid use. | REST job scripts; useful candidate for compositing because of HDR/EXR. Exact commercial entitlement for a pay-as-you-go API account is **UNVERIFIED** here; confirm its applicable API agreement. |
| Higgsfield | [API terms](https://open.higgsfield.ai/terms-of-service), updated 2 September 2026, permit commercial outputs and separate API billing from consumer credits. [Pricing](https://higgsfield.ai/pricing) exposed no readable rate: **UNVERIFIED**. | Official [CLI/skills](https://higgsfield.ai/cli): `npm i -g @higgsfield/cli`, then `npx skills add higgsfield-ai/skills`; owner authenticates. Camera-treatment experiments, not proof of stable hardware. CLI build version UNVERIFIED. |

For SDK experiments, use a project-local environment: `python3 -m venv .venv-media`, then `.venv-media/bin/pip install google-genai runwayml`. Record resolved versions, model IDs, inputs and task IDs. Suggested test budget: ten five-second Runway outputs, **$6 generation cost** before surcharges/tax. A successful but unusable generation still consumes budget.

Discovery included GitHub, official releases, [HN](https://news.ycombinator.com/item?id=47936370), Reddit, MCP listings and creators’ [YouTube breakdowns](https://www.youtube.com/watch?v=1M5GZv-4B14) (30 March 2026). Community praise was not used to verify capability or speed. X searches yielded no usable primary evidence; claims based on X remain **UNVERIFIED**.

## Top 10 recommendations for Agent Notch

Ranked by expected visual impact per working hour. Hours are author estimates; costs exclude existing hardware and Claude usage.

1. **Put native UI in the reveal.** Why: it immediately identifies the product. How: fixture captures plus a real desktop plate; show amber → Allow → green. Cost: $0, 1–3 h. Risk: snapshot translucency differs from live UI.
2. **Shoot a genuine MacBook plate.** Why: credible hardware and the clearest fit with Apple’s depiction guidelines. How: owner camera, locked exposure, controlled reflection; Claude composites. Cost: $0 with existing equipment, 2–4 h. Risk: camera availability and screen moiré.
3. **Repair screen integration.** Why: pasted-on UI breaks the illusion. How: texture emission or matte/reflection/occlusion passes. Cost: $0, 3–6 h. Risk: colour and blur mismatch.
4. **Reframe around the notch.** Why: that is the distinctive product surface. How: one macro, short lateral push, stable permission read. Cost: $0, 1–2 h. Risk: excess DOF hides labels.
5. **Fix the reflection hierarchy.** Why: v4’s deck hotspot competes with the app. How: reposition existing key/strip lights and black cards. Cost: $0, 2–3 h. Risk: over-dark metal.
6. **A/B one finished model.** Why: legends and hinge detail matter in close-up. How: free Steven Yap model against existing geometry; $15 fallback only if better. Cost: $0–15, 1–3 h. Risk: import defects and unresolved Apple rights.
7. **Block with EEVEE, finish selectively in Cycles.** Why: more useful iterations per hour. How: three stills and a short sequence before finals. Cost: $0, 1 h setup. Risk: engine-specific reflections differ.
8. **Use MCP for inspection.** Why: scene understanding is more valuable than endless regeneration. How: official Lab bridge or pinned community 2.1.9; preserve final bpy scripts. Cost: $0, 1–2 h. Risk: version/configuration drift.
9. **Trial one abstract AI insert.** Why: a brief material transition can add surprise. How: ten bounded Runway generations; keep UI authored. Cost: $6 base, 1–2 h review. Risk: no usable take.
10. **Reserve R3F/Spline for distinct jobs.** Why: they help abstractions and web assets. How: one isolated prototype, not a hero rewrite. Cost: existing Remotion entitlement; Spline Pro $30/month, 3–6 h. Risk: migration or export work exceeds the gain.

## What NOT to do

Do not buy a renderer before fixing the empty desktop. Do not spend the reveal on a spinning chassis. Do not expect an MCP to supply taste, or a marketplace license to clear Apple’s rights. Do not put paid model source files under the app’s MIT license. Do not generate permissions, hotkeys or terminal text with AI video. Do not plan new Sora 2 work. Do not render hundreds of high-sample frames before inspecting three stills and a short export. Do not judge “10/10” from a contact sheet alone: play the eventual files at phone size and verify the permission action remains readable.

Verified during 2026-10-13–2026-10-14: supplied contact sheets and decoded MP4 frames, repository pipeline files, and cited primary pages; production proposals and visual improvement are NOT verified because no new film was built.

