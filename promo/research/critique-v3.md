# Agent Notch — art-director critique

## 1. Verdict

Solid indie explainer, below premium launch-film level: the problem gets repeated instead of escalating.  
Flat UI panels, purple pools and word-by-word headlines make the film feel like an animated landing page.  
Features get named faster than viewers can read them; too few interactions end with a visible consequence.

## 2. Shot-by-shot

Times identify sampled moments, not exact edit boundaries. “Cut” removes the standalone beat, not the feature.

| Shot / sample | Decision | Change |
|---|---|---|
| Chaos / 1.2s | Redo | Three violent window cuts; isolate one frozen agent. Make the overload physical. |
| Buried / 3.5s | Keep | Punch directly into the unanswered prompt; dim everything else. |
| Clock / 5.7s | Redo | Label “WAITING” beside 23:39; smash-cut after 0.6s. It currently resembles a clock. |
| “Your agents are waiting” / 7.7–8.3s | Cut | Already established. Both supplied frames belong to this headline build. |
| “You just can’t see them” / 9.4s | Cut | Replace explanation with the notch solving the problem. Lose the RGB glitch. |
| Device reveal / 12.1s | Redo | Reach product by 6–8s. Macro notch, rim light, decisive pullback; remove the white flash. |
| Status legend / 15.3s | Keep | Animate one agent through states; freeze four labelled examples briefly afterward. |
| Mark anatomy / 17.7s | Redo | Overflow marks fold into a count; subagent joins smaller. Replace leader-line diagram with behaviour. |
| Open notch / 19.7s | Keep | Cursor arrives, clicks, panel opens on contact. Keep notch position continuous. |
| Projects/subagents / 21.7s | Redo | Reveal one hierarchy branch; pan to another project. Stop asking viewers to scan everything. |
| Usage / 23.7s | Keep | Show limits, context, cost sequentially; anchor each enlarged number to its UI source. |
| Jump to window / 25.7s | Keep | Two clicks, immediate window switch, same agent highlighted. Hold the destination. |
| Two waiting agents / Answer / 27–28s | Redo | Make Allow/Deny/Always readable. Resolve a safe request; yellow becomes green and terminal output resumes. |
| Keyboard / 30.2s | Redo | Press keys visibly; resolve oldest request in adjacent UI. Static keycaps aren’t proof. |
| Dangerous request / 32.5s | Keep | Tight red crop; pointer goes to Deny, then show rejection. Current Allow hover muddies intent. |
| Question / ~34s | Keep | Enlarge actual choices; select one, submit, show acknowledgement. |
| Plan / 35.3s | Keep | Two readable steps, approve, work resumes; briefly show send-back with comment too. |
| Trust / 38s | Redo | “Only you approve.” Current “without your click” contradicts keyboard approval. Show 100s fallback legibly. |
| Agent card / 40.2s | Redo | Push into card; cycle Done, Remaining, Files, Log with one readable detail each. |
| Themes / 43.4s | Redo | Same panel changes skins in place; three hero looks, “13 themes.” Lose chip catalogue. |
| Theme marks / 45.9s | Cut | Fold a notch close-up into theme changes; preserve the restyled marks. |
| Sounds / 47.7s | Redo | Preview one event sound, mute another; show permission-only default. “32 events / 14 sounds” is secondary. |
| Completion toast / 49.7s | Keep | Arrive immediately after task completion; enlarge changed-file summary, then dismiss. |
| Presets / 51.4s | Redo | Brief → Detailed → Everything visibly changes the same view. No miniature settings screenshot. |
| Compatibility/local / 53.2s | Redo | Three fast host-window swaps; persistent notch. Finish “Local logs. No network.” |
| “Stop making them wait” / 54.9s | Cut | Return to opening agent, now working. Earn the payoff visually. |
| End / 57.9s | Keep | Hold 3s; enlarge install command. Prioritise name, free/open-source, installation. |

Vertical needs re-editing: giant dead zones surround small panels. Use enlarged stacked detail crops. Restore usage, window jump, questions/plans, sounds, toast, presets and mark anatomy; they disappear from this cut. Test at phone size, with platform overlays.

## 3. Story and alternative cold opens

The hook identifies a real irritation but pulls its punch. An agent has waited 23 minutes for its operator: that's the accusation. Build around one task: blocked → spotted → answered → working → finished. Fit every feature into that journey.

**A — “You’re the bottleneck.”** 0–2s: terminal cascade, text “12 agents.” 2–4s: one permission prompt freezes; “One bottleneck.” 4–5s: black, “You.” 5–7s: prompt’s amber dot match-cuts beside the notch. 7–10s: click notch, approve a safe command, output resumes; “Agent Notch. Keep them moving.”

**B — “Expensive patience.”** 0–3s: request sits behind terminal stacks; “Your agent is waiting.” 3–5s: elapsed counter reaches the existing 23:39; “For one letter.” 5–7s: crush windows into an amber notch mark; “Put the interruption here.” 7–10s: keyboard approval, mark turns green, task runs; “Agent Notch.” Don’t imply idle time incurs token charges.

Suggested 60s allocation: hook/reveal 10; awareness 9; permission/question/plan workflow 17; inspection/completion 9; customisation 8; compatibility/local/install 7.

## 4. Craft upgrades, ranked by impact per effort

1. **Edit structure — highest / low.** Alternate 12–24-frame connective cuts with 60–90-frame reading holds. Delete duplicate claims. Speed-ramp travel, never essential UI reading.
2. **Cursor and consequences — highest / medium.** Drive cursor, keypresses and agent states from one event timeline using [useCurrentFrame](https://www.remotion.dev/docs/use-current-frame). Pause before consequential clicks; show the result.
3. **Type/composition — high / low.** One sans family, two weights, fixed headline/detail roles. Whole-phrase entrances; readable holds. Replace repetitive left-copy/right-panel staging with fullscreen detail and notch-wide shots.
4. **Sound dramaturgy — high / medium.** Proposed cues: claustrophobic terminal ticks, sudden silence at “You,” dry approval click, working pulse, completion chime. Schedule audio against the same frame events; duck music around demonstration sounds. Soundtrack was not auditioned here.
5. **Transitions/blur/colour — medium / medium.** Match-cut amber prompt to amber mark; panel expands from notch. Restrict [motion blur](https://www.remotion.dev/docs/motion-blur) to fast travel. Neutral blacks; amber needs attention, red signals danger, green confirms action. Reduce purple fog.
6. **3D/DOF — medium / high.** One convincing device reveal using [@remotion/three](https://www.remotion.dev/docs/three), restrained camera arc, screen texture and rim lighting. Depth of field only around hardware; keep interaction text sharp.

## 5. Reference films: borrowing targets

- [Apple, Scary fast event — MacBook Pro segment](https://www.youtube.com/watch?v=ctkW3V0Mh-k&t=716s): study hardware lighting and scale changes for the single reveal.
- [Linear, next-generation Projects launch video](https://www.linkedin.com/posts/linearapp_the-next-generation-of-linear-projects-activity-7191832553505345536-yjo_): use workflow continuity as the model for connecting features.
- [Introducing Raycast Pro](https://www.youtube.com/watch?v=Ho4JNQMEgSA): take keyboard-led demonstrations and customisation variety; apply them to notch actions.
- [Vercel Ship 2024 opening](https://www.youtube.com/watch?v=CHP3aDTP5Qo): borrowing target for graphic scale and chapter punctuation, not keynote pacing.

Verified against both supplied contact sheets, the full-size plan frame and MP4 samples every 0.25s at 5.5–14.5s and 26–38s; audio mix judgment NOT verified because no listening pass was run.
