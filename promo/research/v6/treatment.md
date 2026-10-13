# Agent Notch v6: "One Person"

Treatment, 2026-10-14. It replaces v5 "Slowest Process" after the owner's notes on animatic 3: "too fast, can be less aggressive, start from scratch".

**Owner decisions (decide round 1-8324c2):**
- 75–90 s.
- A warm day-and-night story of one developer, with the wow and the motion kept: "the dynamics were fun".
- The old idea, made gentler.
- Try the existing music first.
- Show every feature, but differently.

Done criterion: the owner approves this beat sheet and three key stills, and the animatic can be built from section 4 without new questions.

## 1. What changes from v5

| v5 | v6 |
|---|---|
| A cut every 1–2 s, a slam on every caption | One scene per 4–8 s (2–4 bars), cuts inside a scene on bars, not on eighths |
| Shake on 50 hits, flash frames, glitch | Shake on 3 moments only, no glitch. Flashes only where the light of the day changes |
| Surveillance HUD, "Dramatisation" accusation | A clock in the corner and the colour of the light tell the time of day. That is the one device |
| "The slowest process is you" as a verdict | Said once, then forgiven: "Not your fault. You're one person." |
| Features as an escalation ladder of requests | Features as moments of one working day, in order of the clock |
| Captions slammed in at 150–420 px | Captions rise on a spring at 120–200 px, one at a time, readable at phone size |

What stays, because the owner liked it:
- kinetic full-frame type;
- crash zooms at act changes;
- motion blur on whips;
- real product pixels;
- SFX on actions, but softer: clicks, keys, pings, no impacts except at the three hits.

## 2. The idea

> **The slowest process on your Mac is you. That's fine. You're one person.**

A developer starts one agent at 09:00, then eleven projects' worth: 55 agents by 09:02. All day those agents wait for one person. Agent Notch is how that person keeps up without staring at 55 terminals.

The film follows the day:
- **morning:** the start;
- **day:** requests, questions, plans, the swarm, the limits;
- **evening:** the person steps away, and the app is still there by sound and by colour;
- **night:** the person goes to sleep with the lid closed and Keep awake on;
- **morning:** the work is done.

The person is never shown: hands, a desk, a mug, the light in the room.

The forgiving line turns the v5 insult into empathy. The film still makes the point that the human is the bottleneck, but it takes their side.

## 3. Visual system

**Time of day.**
- A small clock, top left, Geist Mono 28 px, always on: `09:00`, `10:14` … `07:12`.
- The ground colour shifts by act:

| Act | Ground |
|---|---|
| Morning | warm graphite with a peach edge light |
| Day | neutral graphite |
| Sunset | amber to magenta |
| Night | deep blue |
| Morning again | peach |

- The shift is a large radial gradient behind everything, so the product pixels stay true.

**Type.**
- Captions: Inter Display 120–200 px, one line at a time, sentence case.
- Rise on a spring (damping 18, mass 0.8) from 40 px below with a 6 px blur.
- Exit as a fade with 20 px of drift. Never more than two lines on screen.

**Camera.**
- Every scene has a slow push (1.00 → 1.06).
- Act changes are crash zooms or whips with `CameraMotionBlur` (6 samples, 180°).
- Product crops at 1.5–2.6× from the 3× snapshots (snap4).

**The three hits** get shake and a bigger sound: the reveal at 18 s, "Yours." at 38 s, and the morning at 80 s.

## 4. Beat sheet (30 fps, ~90 s, 120 BPM, bar = 2 s)

| # | Time | Clock | Picture | Caption | Sound | Feature |
|---|---|---|---|---|---|---|
| 1 | 0–8 | 09:00 → 09:02 | Black, then one terminal; a hand types `claude`. On each bar the frame splits: 1 → 4 → 16 → 55 terminals, a living wall of real-looking sessions. Pull back through the wall. | `09:00. One agent.` · `Then eleven projects.` · `Fifty-five agents.` | Intro of the take; a soft key click per split; a rising pad | Scale |
| 2 | 8–14 | 09:40 | The wall dims; a `top`-style list sorted by time blocked; one row amber; slow push to the `you` cell. | `The slowest process on your Mac` · `is you.` (amber period) · then `Not your fault. You're one person.` | The music thins to the pad; one soft tick per second; "Dramatisation" label | Hook |
| 3 | 14–22 | 09:41 | **Blender reveal**: the amber period becomes the waiting mark beside the notch; rack focus and pull back to the live screen. **Hit 1 at 18.0.** | `Agent Notch` · `Every agent. Every project. Beside the notch.` | The first downbeat of the groove | Marks |
| 4 | 22–28 | 10:14 | Crash zoom into the notch; the request drops (ask.png); cursor clicks Allow on a bar; green; tests scroll. | `It asks once.` · `You see it in two seconds.` | Click, a pitched "yes" | Allow from the notch |
| 5 | 28–32 | 11:30 | Low macro on the keys (Blender C plate or 2D keys), ⌃⌥Y pressed twice on bars; two requests turn green in the inset. | `Hands stay on the keyboard.` | Two key clacks, two "yes" | Hotkeys |
| 6 | 32–40 | 13:05 | The groove drops out. One row `rm -rf dist build`, red accent only. ⌃⌥Y pressed out of habit: nothing happens. The cursor crosses slowly and clicks Deny. **Hit 2 at 38.0.** | `Some things need you.` · `Yours.` · small: `Nothing is approved without your click or keypress.` | Breakdown: a pad and a heartbeat kick; a muted knock for the refused key | Risky, no auto-approval |
| 7 | 40–46 | 14:40 | Split frame, a soft whip between halves: the question (question.png) answered on the left; the plan (plan.png) approved on the right. | `It asks. You answer.` · `It plans. You approve.` | The groove returns; two plucks | Questions, plans |
| 8 | 46–52 | 16:00 | **The swarm**: a crash zoom out from one mark in the wing to the whole panel (snap4/swarm.png); a slow tilt down 11 projects; the counters roll. | `55 agents. 11 projects.` · `One glance.` | Hats double; a tick per project | Projects, subagents |
| 9 | 52–56 | 17:30 | Usage panel; the session bar fills; cost counts up. | `Know the wall before you hit it.` | A soft rising tone | Limits, cost |
| 10 | 56–64 | 19:10 | **Sunset**: the room light goes amber to magenta while the laptop cycles the 13 themes (themes plate); the theme name rises bottom left, one per bar. | `13 themes.` · `Yes, Rubber Ducks.` | The brightest section of the track | Themes |
| 11 | 64–68 | 20:30 | The person leaves the desk: the frame goes dark, only the marks glow. Each event sound draws its mark in light: permission, question, plan, finished. | `Making dinner?` · `Listen.` · small: `A sound for each event. Or none.` | The four event sounds on beats over a filtered groove | Sounds |
| 12 | 68–70 | 21:00 | `nettop`, zeros. | `Zero bytes out.` · small: `Reads local logs. Sends nothing.` | One tick | Privacy |
| 13 | 70–78 | 23:40 → 07:12 | **Night**: the header switch Keep awake flips On; the lid closes (a black shutter with a lit edge); blue night; the clock races through the night; the 11 project marks turn done one by one. | `Keep awake.` · `Close the lid.` · `They keep working.` · small: `Anything that needs your answer waits for you.` | The music filters down, ticks on the clock; "Dramatisation" label on the time-lapse | Keep awake |
| 14 | 78–84 | 07:12 | **Morning**: peach light; done toasts stack under the notch; one click jumps to the window; the `top` list again, 0 blocked. **Hit 3 at 80.0.** | `Wake up to done.` · `Slowest process?` · `Still you. Just rested.` | The final section | Done toasts, jump to window |
| 15 | 84–90 | 07:13 | Endcard plate, `brew install`, line of facts, the independence line. | `Agent Notch` · `Free · open source · MIT · macOS 14+` | The take's final hit, then its tail | CTA |

**Truth checks:**
- 55 agents and 11 projects come from the swarm fixture, and the film shows it on screen.
- Keep awake keeps the Mac awake with the lid closed until it is switched off; the caption on the night says only that.
- Nothing in the night implies approvals without the person.

## 5. Music

Use the existing takes first, as the owner asked:
- **house-1** (warmer, the first choice for a warm story);
- **heist-2** as the fallback.

The edit script gets a 90 s section map:

| Time | Section |
|---|---|
| 0–8 | intro |
| 8–14 | thin |
| 14–18 | build |
| 18–32 | groove A |
| 32–40 | breakdown |
| 40–56 | groove B |
| 56–64 | peak |
| 64–70 | filtered groove |
| 70–78 | night breakdown |
| 78–84 | final |
| 84–90 | hit and tail |

If neither take carries a calm 90 s without obvious loops, ask the owner for a new Suno take: 100–110 BPM, warm.

## 6. Steps

1. Three key stills: beat 1 (55 terminals), beat 10 (sunset themes), beat 13 (the night). Owner yes.
2. One probe of 0–28 s on both music edits; the owner picks the track in /decide.
3. Animatic at full length.
4. Owner notes.
5. Production.
6. Fresh Opus review.
7. Final MP4 check at full size and phone size, muted and with sound.

v5 code stays in `src/v5`; v6 lives in `src/v6` with its own composition `V6`.
