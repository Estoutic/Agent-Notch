# v7 gate 1: key stills

2026-10-14. Three stills, EEVEE (Blender 5.1.1), 1920×1080, 64 TAA samples, M-series, measured by `blender/v7_stills.py`
(second render of the same frame, after shader warm-up = the cost of each frame in a sequence).

| Still | Render | EEVEE s/frame (warm) | First frame | Output |
|---|---|---|---|---|
| 1. Request on the screen | `request-v1` | 3.22 | 5.38 | `out/v7-stills/1-request.png` |
| 2. Swarm fly-over | `swarm-v0` | 1.61 | 3.92 | `out/v7-stills/2-swarm.png` |
| 3. Night, lid closing | `night-v2` | 3.20 | 4.87 | `out/v7-stills/3-night.png` |

Average ≈ 2.7 s/frame at full size. About 1300 frames of 3D ≈ 60 min (the plan guessed 1–2 s/frame, 25–45 min).

Measured after the Opus art review fixes (focus on the risky row and a 30 % pull-back; swarm at f/11 on a
diagonal with bloom on the dots; the night's light moved into the lid gap and thinned).
At 16 samples, half size (animatic plates) it is 0.2–0.6 s/frame.

## How to rebuild

```sh
cd promo/blender
python3 make_v7_faces.py                     # screen faces from public/snap4 (ask, swarm, awake/swarm)
blender -b --factory-startup -P v7_stills.py -- --stills request --variant 1
blender -b --factory-startup -P v7_stills.py -- --stills swarm   --variant 0
blender -b --factory-startup -P v7_stills.py -- --stills night   --variant 2
python3 v7_overlay.py                        # 2D captions + Dramatisation label -> out/v7-stills/
```

Renders land in `blender/cache/v7/stills/` and `out/v7-stills/`; neither is committed.

## What is in each still

1. **Request.** The `snap4/ask` screen (two requests, one risky, red `rm -rf`) on the lid glass, seen from low right at
   f/5.6, focus on the risky row; the notch and the lid edge at the top. The moment right after the macro on the notch, as the pull-back starts.
2. **Swarm.** `snap4/swarm` (55 agents, 11 projects). A 24 mm lens 26 mm above the glass, flying in from the lower
   right on a diagonal, f/11; rows recede like streets, the counters glow like lights (bloom threshold 0.55). All studio lights off: at grazing angles the glass
   mirrored them.
3. **Night.** `snap4/awake/swarm` (Keep awake on). Lid at 3°, hinge raised to key height so the lid rests on the deck.
   Moonlight (sun, blue) through a 4×3 window gobo; a cool line of the screen's light on the desk, as an emissive
   falloff strip plus a thin area light at the gap. No world haze: in EEVEE a world volume swallows the sun.
   Carries the DRAMATISATION label.

Captions are drafts in Geist for the look of the 2D layer only. Lines 1 and 3 are v4/v5 copy; line 2
("55 agents. 11 projects. / One notch keeps count.") is new and needs the owner's yes.

## Owner round 6-4200d3

All yes: still 1 (request), still 2 (swarm), still 3 (night); the swarm line "55 agents. 11 projects. / One notch keeps
count." as written; go to the animatic in this style. No notes.
