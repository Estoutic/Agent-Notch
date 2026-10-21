# Drawing the agents' house without WebKit: what an active frame would cost

Research note, October 2026. Nothing in the shipping wallpaper changed. Prototype code lives in
`Prototypes/NativeWallpaper/` and is not part of the Swift package or the app.

## Question

While agents work, the wallpaper (`room/index.html` in a WKWebView) costs about 58% CPU at 60 fps on an M2 Pro.
The cost is spread across WebKit's GPU and WebContent processes. Would drawing the same scene natively make an
active frame substantially cheaper, without changing its look or its smoothness?

## What the real page draws per frame

`bench count` wraps every `CanvasRenderingContext2D` method in the real page. The page was given eight working
agents in three projects. Averages per frame in the steady state, with the startup bakes left out:

| call | per frame |
|---|---|
| `fillRect` | ~7 300 (≈2.7 M px, almost all of it two huge fills) |
| `fillStyle` set | ~1 890 |
| `drawImage` | ~250, of which ~110 large ones (≈36 k px each, ≈4 M px in total) |
| `globalAlpha` < 1 draws | ~140 |
| gradients / paths / `save`-`restore` | 6 / ~9 / 18 |

The art canvas is 504×328. A frame is therefore about 7 500 commands, and its image draws cover the canvas about
25 times. WebKit serialises each of these commands into its GPU process and replays it there. That replay is the
40% the GPU process shows.

## Prototypes

`Prototypes/NativeWallpaper/bench.swift` is one binary with several modes. Each mode opens a borderless,
click-through window over the main screen (1512×982 pt @2x). The drawing surface is screen/3 and is upscaled
nearest-neighbour by the layer. The synthetic scene matches the counts above:

- a sky made of 328 row fills
- 110 draws of six large "baked room" images
- 140 sprite draws
- 7 000 small 1–3 px fills, each with its own colour

| mode | how it draws |
|---|---|
| `webkit` | the real `room/index.html?nodemo=1`, `room.setFps(60)`, `room.setAgents([...8 working agents])` |
| `count` | the same page, counting 2D calls (numbers only, not timed) |
| `stub` | the same JS, but calls on the visible canvas are only recorded into a `Float32Array`; nothing is drawn. This is the JS half of a hybrid. |
| `metal` | one texture atlas and one instanced draw per frame into a 504×328 `CAMetalLayer` drawable |
| `cg` | Core Graphics into a 504×328 bitmap; `makeImage()` goes to `layer.contents` each frame |
| `raw` | a naive software rasterizer writing `UInt32` pixels, then a `CGImage` to `layer.contents` |
| `webkit …/webgl.html` | the same synthetic scene through WebGL2 inside WKWebView, one instanced draw per frame (`webgl.html`) |
| `idle` | the window alone with a static colour, nothing drawn |

Frames are paced by `NSView.displayLink` (native modes) or `requestAnimationFrame` (WebKit modes). Each run has a
warm-up and then 30 s of measurement. CPU is the `ps` CPU-time delta of the process itself, of every WebKit process
that appeared after launch, and of WindowServer. `Prototypes/NativeWallpaper/run.sh` repeats the suite.

The window floats above other windows. At desktop level, covered by other windows, WebKit throttles
`requestAnimationFrame` to 0 and the numbers mean nothing.

## Results

Measured on an M2 Pro with macOS 15.6.1, at 60 fps (every run held 59.6–60.1 fps, except `stub`, which ran at 51–60).
"App" is the CPU of the drawing processes. "WS Δ" is WindowServer minus the `idle` window (6–7%). Native rows show the
mean of two rounds; the two rounds differed by less than 2 points.

| approach | app CPU | WindowServer | WS Δ | **total Δ** |
|---|---|---|---|---|
| WebKit page, 2D canvas (today) | **57.5%** (GPU proc 40, WebContent 16, host 2) | 24.9% | +19 | **≈ 76%** |
| WebKit + WebGL2, synthetic scene | 21.4% (WebContent 10, GPU proc 5.5, host 5.7) | 27.7% | +21 | ≈ 42% |
| Native Metal | **9.4%** | 19.7% | +13 | **≈ 23%** |
| Native Core Graphics | 30.5% | 18.2% | +12 | ≈ 42% |
| Native software rasterizer (naive) | 44.9% | 16.9% | +11 | ≈ 56% |
| Light scene (3 000 fills, 20 big, 40 sprites): Metal / CG / raw | 8.0% / 25.6% / 25.9% | 19–21% | +13 | ≈ 21% / 39% / 39% |
| JS logic only (`stub`: real page, canvas calls only recorded) | 22.9% WebContent | 8.8% | — | — |

Reading the table:

- **The 2D canvas replay is the cost, not the pixels.** The same command volume costs about 9% as one Metal draw.
  Through WebGL in the same WebKit it costs about 21%. Through the 2D canvas it costs about 57%.
- **WindowServer pays 11–14 points for any 60 fps full-screen surface**, whatever draws it. A native port cannot
  remove this part; only fewer presented frames can (the existing still/30 fps logic).
- **CPU rasterizing (CG, raw) is not the answer.** The page overdraws the canvas about 25 times per frame, and copying
  pixels on the CPU costs as much as WebKit does. It only helps on a light scene.
- **The JS logic is itself 15–23% at 60 fps.** The real page's WebContent process shows 16% while also encoding
  canvas calls, so the logic alone is roughly 10–15%. The naive recorder shim in `stub` costs more, because every call
  goes through a JS-level override. A hybrid that keeps the JS keeps this cost.
- GPU utilisation from `ioreg` ("Device Utilization %") turned out unreliable here: it read 0–1% in most runs. It is
  in the RESULT lines but not used. All the costs above are CPU.

## What porting would take

`room/index.html` has ~5 050 lines, ~330 functions and ~60 sections: themes, Clawd, the house, village islands,
stairs, lift, yard, sky and three backdrops, scenes and residents, cat and dog, info widgets, easter eggs, the
wallpaper picker and the camera. All drawing goes through a handful of primitives:

- `rect` (`fillRect`); `poly`, `polyOutline` and `line`, which become `rect` spans
- `B`, `FX`, `FY` and `FL` boxes over `iso`
- `bake`, `bakeWorld` and `still` into offscreen canvases, then `blit` (`drawImage`)

A few extras sit on top of these primitives:

- `globalAlpha` (83 sites)
- `globalCompositeOperation` `lighter` (17 sites), plus one `multiply` and one `destination-in`
- radial and linear gradients (9 sites, mostly glows that are already cached as sprites)
- two `arc` fills
- one `shadowBlur`
- one `getImageData` on the Codex pet image

There is also DOM outside the canvas:

- room labels
- controls and the home button
- the egg card
- the wallpaper picker

Every one of these maps cleanly onto a sprite batcher: a fill becomes a white-texel quad, a bake becomes a render to
texture, alpha and blend modes become pipeline states, and gradients become baked textures. Nothing needs a general
vector renderer.

| option | what it means | expected active cost (total Δ) | effort |
|---|---|---|---|
| **A. Full Swift port + Metal** | Rewrite the scene logic in Swift (≈5–6 k lines). Add a ~800-line Metal batcher (atlas, render-to-texture bakes, 3 blend modes). Replace the DOM bits with AppKit/SwiftUI overlays. | ≈ 25% (Metal 9 + WS 13 + Swift logic ~2–4) | **3–5 weeks**, high regression risk (hundreds of hand-tuned visual details, eggs, backdrops); browser-based iteration (`ROOM_PREVIEW`, demo) is lost or must be rebuilt natively |
| **B. Hybrid: JavaScriptCore + Metal** | Run the same JS in an in-process `JSContext` with no WKWebView. Replace the 2D context with a recorder object that writes ops into a shared typed array; native code replays it with Metal. Offscreen canvases become texture IDs. DOM bits go over the bridge. | ≈ 35–45% (JS 15–23 + Metal 5–9 + WS 13) | **1.5–2.5 weeks**; same page still runs in a browser for design work; the shim must match canvas semantics exactly (fillStyle strings, alpha, blend, `drawImage` overloads) |
| **C. Stay in WebKit, swap the backend to WebGL** | Keep `index.html` and the WKWebView; replace `g` with a small JS WebGL2 sprite batcher using the same op set. | ≈ 40–50% (measured 42% on the synthetic scene, plus the JS logic) | **1–1.5 weeks**; lowest risk; no new process model, signing or bridge |
| D. Native, CPU rasterized (CG/raw) | — | ≈ 40–56% | not worth it |

Notes on B: the app is not built with the hardened runtime, so in-process JavaScriptCore keeps its JIT. Reading the
command buffer through `JSObjectMakeTypedArrayWithBytesNoCopy` avoids copies, and the recorder should be written as
the fast path (no `Map` lookups per call, colours pre-parsed via the page's own `HEX` cache).

## Recommendation

**Hybrid-first, and probably not a full port.**

1. The cheap, low-risk win is option **C** (WebGL backend inside the existing page). It removes the per-command
   replay, which is the dominant cost, and roughly halves the active cost (≈76% → ≈45%). It needs no change to the
   app's architecture, and the look stays identical because the same JS emits the same pixels. Do this first and
   measure on the real scene with `bench webkit`.
2. If that is still too much, the next step is **B** (JavaScriptCore + Metal). It saves another ~5–10 points: the
   WebKit process overhead, plus the extra WindowServer cost that the WebGL surface showed.
3. A **full Swift port (A)** is the only path to ≈25%. Of that, about 13 points are WindowServer's and stay with any
   60 fps full-screen surface. The port gains ~15–20 points over C, but costs 3–5 weeks and a large visual-regression
   risk. That trade is not worth it unless the wallpaper becomes a central feature.

## Reproducing

```bash
Prototypes/NativeWallpaper/run.sh            # idle, then webkit/metal/cg/raw twice, then the light scene
```

To run one mode on its own, build the binary from `Prototypes/NativeWallpaper/bench.swift` and set the
environment variables you need:

| variable | meaning |
|---|---|
| `SECS` | measuring window, in seconds |
| `WARM` | warm-up before measuring, in seconds |
| `RECTS` | small fills per frame |
| `BIG` | large image draws per frame |
| `SPRITES` | sprite draws per frame |
| `LEVEL=desktop` | put the window at wallpaper level instead of floating |

For the `webkit` and `stub` modes, serve `room/` with `python3 -m http.server 8765`. For the WebGL scene, serve
`Prototypes/NativeWallpaper/` and pass `http://127.0.0.1:<port>/webgl.html` as the URL. Each run covers the screen
for about 40 s.
