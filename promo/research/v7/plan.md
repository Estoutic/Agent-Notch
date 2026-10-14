# Agent Notch v7: v4 remastered

Plan, 2026-10-14.

The owner rejected v5 animatic 3 ("too fast, too aggressive") and the v6 probe ("stuffy start, no dynamics"). The film the owner calls optimal is v4: `promo/out/agent-notch-promo.mp4`, 59.6 s. The task is to make v4 many times better.

## Owner decisions (decide round 4-b11980)

- **Base:** v4. Keep its structure, its order and its music.
- **Upgrade 1: real 3D.** Flat panels on black become the product on a laptop screen in Blender, with the camera moving over it.
- **Upgrade 2: authored transitions.** Every cut is a match on a shared object.
- **Upgrade 3: title-grade typography.**
- **Upgrade 4: stronger sound design.**
- **Upgrade 5: a calmer middle.** The middle gets a little more time, so every caption can be read.
- **Upgrade 6: length 70–75 s** (v4 is 59.6 s).

Two items carry over from earlier notes:
- the film must show an *absurd* number of agents and projects in parallel (55 agents in 11 projects, fixture "swarm");
- it must show the new Keep awake mode: leave the Mac running overnight.

## What we get

A 72 s film, 1920×1080, 30 fps: `promo/out/agent-notch-v7.mp4`. The vertical cut is out of scope until the landscape cut is approved.

**Timing.**
- The shot list and order of v4 (`src/timeline.ts`, `PROMO`) stay. The middle shots (`anatomy` to `card`) get about 1.3× their beats.
- Two shots are new: `swarm` (after `anatomy`) and `night` (after `toast`, before `trust`).
- The hook (`cascade`, `freeze`, `you`, `reveal`) keeps v4's exact timing, because that is what works.
- The music is v4's track (`public/music-suno-v2-4.wav`, take (4) of "Keep Them Moving v2", 64.8 s natively). The `MUSIC` segment map in `src/timeline.ts` stretches it to 72 s by repeating one groove section on bar lines; `audio/synth.mts` already does sample-accurate segments. The fallback is takes (1), (3) or (7), which run 69–70 s natively. The drop still lands on "You." + reveal; the final hit lands on the end card.

**Upgrade by upgrade:**

| Upgrade | What changes | How |
|---|---|---|
| Real 3D | About 60 % of the film happens on the laptop screen in Blender: the reveal, the dive into the notch, the requests, keys, swarm, night (the lid closing for real), themes, end card | Two passes. Remotion renders each shot's UI as a screen sequence at 3024×1964 (the existing `desktop.png` mapping in `blender/build_scene.py`). Blender maps it as a movie texture with emission and renders the camera moves. Finals: EEVEE everywhere (owner, round 5-263aab). Readable crops stay 2D on top, tracked to the screen corners from the shot JSON |
| Transitions | Each pair of shots shares an object. The amber period of "You." becomes the waiting mark. A pressed key becomes the next panel's button. The red row becomes the Deny chip. The toast becomes the night's closing lid. The lid's light line becomes the morning | A transition table, one row per cut, implemented in `src/v7/` |
| Typography | Captions per word or letter on a spring; mask reveals; captions that sit in perspective on the screen plane; one display face (Geist) at title scale for the five key lines | `src/v7/type.tsx` |
| Sound | Layers: UI foley (click, key, toggle, lid), whooshes matched to camera moves, sub hits on the 4 big moments, real silence before "You." and before the night, the app's event sounds, a room tone that changes from day to night | `audio/v7_sfx.py`, mastered to −14 LUFS and ≤ −1.5 dBTP, measured on the MP4 |
| Calmer middle | 1.3× beats on the middle shots; one caption at a time | timeline |
| Length | 72 s | timeline + music extension |

## How we check it

**Stages:**
1. Plan approved.
2. Key stills, three of them: the 3D request on the screen, swarm, night. Owner says yes.
3. Animatic at full length with EEVEE preview plates, the music and the SFX. Owner says yes.
4. Final renders.
5. A fresh Opus review.
6. Final MP4 check at full size and phone size, muted and with sound. Numbers: duration, LUFS, peak, sync anchors.

The deciding frames are looked at by the session itself. Checks are judged by exit codes.

## What we don't do

- No new concept, no new copy direction; v4's lines stay unless a line breaks.
- No voiceover, no Apple logo or system sounds, no "MacBook" in captions, no Claude or OpenAI logos as characters.
- No `--snapshot-live`.
- Nothing that implies auto-approval.
- No vertical cut yet.
- No publishing, release or merge to master.
- Music, frames and weights are never committed.
- Budget $0.

## Render budget (local, M-series)

| Pass | Measured speed | Total |
|---|---|---|
| EEVEE finals, full size (owner's choice) | about 1–2 s/frame, to be measured on the first shot | About 1300 frames of 3D ≈ 25–45 min |
| Cycles (rejected) | 7–15 s/frame | 4–5 h |

## Owner round 5-263aab

- Plan: yes, with one note: "maybe some parts can be made even cooler".
- Render: EEVEE for all shots.
- 3D share: about 60 %, with small text on top in 2D.

## Making the parts cooler

Each item is one moment that EEVEE makes cheap. The key stills stage shows the first three; the rest come in the animatic.

1. **Hook, "4 agents → 12 agents".** The terminals are real 3D windows on a dark desk. They multiply, and the camera pulls back through the wall of them.
2. **"You."** Full silence for a beat. The amber period travels to the notch: a macro on the notch in 3D, then a pull back to the whole laptop as the drop lands.
3. **Night.** The real lid closes. The screen light on the desk narrows to a line and goes out. The room turns blue, the window shadow sweeps across the desk in a time-lapse, and the morning sun comes in. The lid opens on done.
4. **Keys.** A macro of the keyboard in 3D: ⌃⌥Y goes down on the kick, with real key travel and a click in the sound.
5. **Risky.** The red row lights the desk and the aluminium red: an emission spill with bloom. Everything else desaturates for that beat.
6. **Swarm.** The camera flies low over the panel like over a city at night, along 11 projects. The counters flip like a departure board.
7. **Themes.** Each theme recolours the room through the screen's own light: Synthwave turns the desk magenta, Rubber Ducks yellow.
8. **End card.** One slow orbit; `brew install` is typed on the screen in 3D, with the 2D line on top for reading.
