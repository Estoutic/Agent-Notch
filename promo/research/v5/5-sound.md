# Agent Notch: sound that makes the bottleneck physical

Research date: **13 October 2026**. All linked sources were checked on that date; publication or revision dates appear where available. Undated sources use this access date. Creative settings and work estimates below are recommendations, not vendor guarantees. Commands are proposed for a later production session; no installation, purchase, account connection or generation was performed.

## What v4 already has

I inspected both supplied contact sheets, the rendered `promo/out/agent-notch-promo.mp4`, and the local audio implementation. The sheets show the right opening argument—twelve agents, a blocked permission, “You.”—followed by many feature demonstrations. The selected laptop reveal frame has a dark screen. Sound can give that reveal weight, but cannot replace a convincing demonstration.

The soundtrack is more developed than the brief suggests: [timeline.ts](/Users/nikita/Projects/agent-notch-release/promo/src/timeline.ts) already shares a 123.05 BPM grid between picture and cues; [synth.mts](/Users/nikita/Projects/agent-notch-release/promo/audio/synth.mts) synthesizes clicks, keys, approval/denial sounds, risers and impacts, ducks music, and runs two-pass normalization. This is local primary evidence checked 13 October, not a claim about the public repository’s current branch.

FFprobe reports approximately 59.65 seconds, stereo AAC at 48 kHz. A fresh FFmpeg analysis of the actual MP4 returned **−14.01 LUFS integrated, −1.39 dBTP, 3.50 LU loudness range**, exit 0. The 4.10–4.90-second stop measures −52.41 dBFS RMS, so it contains residual audio rather than digital silence. That does not establish audibility. I did **not** audition playback; timbre, emotional impact and phone translation remain unverified. Buying a mastering service before changing the audio arc would be my lowest-priority spend.

## The direction: overload, interruption, release

Use a tense electronic bed with dry mechanical percussion, a restrained bass line and one identifiable motif. My starting point is 120–124 BPM, 4/4. Keep 123.05 if the current take remains competitive: changing tempo moves the existing film.

This proposed 40-second cut gives sound a job at every major turn:

| Time | Picture argument | Audio direction |
|---|---|---|
| 0–3 s | Twelve agents working | Increasing ticks and terminal texture; narrow stereo field; no full groove yet |
| 3–4 s | One permission waits | Activity stops; leave one unresolved alert |
| 4–5 s | “You.” | Cut music and effects returns; hold near-silence |
| 5–9 s | Notch appears; first Allow | Short reveal swell; put the strongest musical release on the approval |
| 9–21 s | Agents resume; hotkeys answer | Full groove; precise tactile clicks; sparse motion accents |
| 21–25 s | Risky command denied | Remove drums; short descending cue; let the decision read |
| 25–34 s | Completion, themes | Restore groove with a brighter variation; completion repeats the motif |
| 34–40 s | Local logs; install | Thin arrangement for reading; logo sting and clean tail |

These timings are an editorial proposal, not a request to squeeze every feature into forty seconds. Sound should explain the causal change: the user answers, the work moves. A drop on an empty laptop shot spends the climax too early.

Joey Korenman’s [Making Giants sound-design breakdown](https://schoolofmotion.com/blog/making-giants-sound-design) combines voice, music and effects into a film’s audio arc and supplies a linked YouTube episode. Its page is undated; checked 13 October 2026. Use that workflow as a reference, not its numerical claim about sound’s share of emotional impact.

## Suno v5/v6: generate material, then enforce the edit

v6 is verified, not a rumored upgrade: Suno announced it on **9 September 2026**. Its [current model guide](https://help.suno.com/en/articles/13924801), revised the same day, distinguishes core v6, more experimental v6-wild, and v6-mini. Start with core v6 for this brief. [v5’s release note](https://suno.com/release-notes/introducing-v5-the-world-s-best-music-model) is dated **23 September 2025**; retain an excellent v5 take rather than regenerate solely for a newer label.

Give the owner this original prompt, with Instrumental selected:

> Instrumental electronic score for a confrontational developer-tool launch. 123 BPM, 4/4, dry mechanical percussion, tightly controlled bass, clipped metallic synth motif, tension turning into confident forward motion. Short sparse opening, accelerating rhythmic pressure, abrupt stop before the main groove. Punchy drop, open space between accents for interface sounds. Midway breakdown with percussion removed, then a brighter return. Decisive final sting with a short decay. No vocals, choir, acoustic strumming, orchestral trailer brass or long ambient introduction. Modular four-bar phrases; clear drums, bass and synth layers.

Optional section directions: `[Intro: sparse ticks]`, `[Build]`, `[Break: stop]`, `[Drop: full groove]`, `[Breakdown: drums out]`, `[Final drop]`, `[Outro: sting]`. **UNVERIFIED:** those tags or exact timestamps reliably produce frame-accurate structure. Treat them as creative instructions. Make the one-second stop, riser landing and ending deterministic in the local mix.

Bound the search: three directions × two candidates—mechanical electro, aggressive breakbeat, restrained industrial—then one revision of the winner. Compare all six at matched loudness, first without picture and then against the opening. Reject unintended vocals, smeared percussion and a hook that competes with captions. These limits are production choices, not a quality benchmark.

[Suno pricing](https://suno.com/pricing), checked 13 October, displays Pro at **$8/month billed yearly ($96/year)** and Premier at **$24/month billed yearly ($288/year)**, before tax. Premier includes Studio; Pro already includes stem extraction. These are annual commitments, not one-month purchase prices. The verified [stem guide](https://help.suno.com/en/articles/13925185), revised **9 September 2026**, lists Auto Split up to twelve stems at 50 credits, and single-part Split from Mix at 10 credits per stem; Advanced Split is Premier-only. Extract drums, bass and the remaining mix; mute drums under decisions and trim all returns before “You.” Listen for separation bleed.

The [commercial-rights guide](https://help.suno.com/en/articles/9601665), revised **3 September 2026**, now describes rights for songs downloaded while subscribed. Preserve the download receipt, song ID and applicable terms. Do not substitute older advice about free-versus-paid generation dates for the current wording.

Claude Code prepares prompts, a candidate manifest and edit decisions; the owner operates Suno and exports the winner. **UNVERIFIED:** an official public Suno generation API or MCP suitable for this workflow. Avoid unofficial services marketed as “Suno API.”

## Effects: a small palette with meaning

My proposed sound grammar:

- **Interaction:** 20–60 ms dry clicks; keyboard sequences land on the final keypress. Avoid a loud sound on every caption.
- **Movement:** 120–350 ms filtered swishes for substantial moves. Place their crest at arrival, not automatically at animation start.
- **Decision:** amber gets a restrained unresolved interval, Allow a short ascending answer, Deny a firm descending answer. These are designed film cues; do not imply they are the app’s default sounds.
- **Scale:** one layered reveal impact—attack, body and low end. A 45–70 Hz sub drop needs audible upper harmonics or a separate midrange layer for the phone test.
- **Completion:** a 0.3–0.6-second variation of the approval motif. Use the app’s actual permission sound when demonstrating its sound settings.

Suggested mix starting points: keep ordinary UI cues roughly 8–12 dB below the hero impact; use 3–6 dB music ducking around important cues, 5–15 ms attack and 120–250 ms recovery. Audition these relationships. High-pass incidental texture around 150–250 Hz; reserve bass space for music and selected impacts. Fade into silence over 2–10 ms to avoid clicks, including reverb returns. These are proposed settings, not universal engineering rules.

**ElevenLabs Sound Effects v2** is the quickest paid custom-effects route. The [API](https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert) verifies `eleven_text_to_sound_v2`, 0.5–30-second duration, looping and prompt influence. Generate isolated sounds, then trim: its minimum generation duration is longer than a tactile click.

```bash
curl --fail-with-body -X POST https://api.elevenlabs.io/v1/sound-generation \
  -H "xi-api-key: $ELEVENLABS_API_KEY" -H 'Content-Type: application/json' \
  -d '{"text":"Single tight metallic interface latch, dry close sound, immediate attack, short clean decay, no music or ambience","duration_seconds":0.5,"prompt_influence":0.65,"model_id":"eleven_text_to_sound_v2"}' \
  --output latch.mp3
ffmpeg -i latch.mp3 -ar 48000 -c:a pcm_s24le latch.wav
```

This documentation-based example was not executed. Resampling does not restore information lost in MP3. There is an entitlement discrepancy: the [SFX product page](https://elevenlabs.io/sound-effects) lists Starter WAV downloads, while the API reference places 44.1 kHz PCM at Pro. **UNVERIFIED:** lossless API access on Starter. Use the documented default MP3 or verify account formats before budgeting for WAV.

[Current pricing](https://elevenlabs.io/pricing), checked 13 October, lists Starter **$6/month**, 30,000 credits and a commercial license; the temporary first-month price is $1 through 18 October. Budget $6. Free output is not the commercial-release choice indicated by the SFX page.

Claude can use the [official skills](https://github.com/elevenlabs/skills) or [plugin](https://github.com/elevenlabs/plugin), both checked 13 October:

```text
npx skills add elevenlabs/skills
/plugin marketplace add elevenlabs/plugin
/plugin install elevenlabs@elevenlabs
```

Alternatively connect the hosted server:

```bash
claude mcp add --transport http elevenlabs https://api.elevenlabs.io/v1/mcp
```

Authenticate with `/mcp`. The endpoint comes from [ElevenLabs’ assistant documentation](https://elevenlabs.io/docs/eleven-agents/operate/architect/external-assistants); command syntax from [Anthropic](https://code.claude.com/docs/en/mcp), checked 13 October. The [old local server](https://github.com/elevenlabs/elevenlabs-mcp) is explicitly deprecated. For repeatable batches, prefer direct REST scripts with cue ID, prompt, duration, source/license, selected take and status; retry only failed items, at most twice. Inspect available hosted tools rather than inventing their names.

**Stable Audio 3.0** is the useful local alternative. The official [Apple Silicon MLX instructions](https://github.com/Stability-AI/stable-audio-3/blob/main/optimized/mlx/README.md), checked 13 October, provide:

```bash
git clone https://github.com/Stability-AI/stable-audio-3.git
cd stable-audio-3/optimized/mlx
./install.sh
./sa3 --dit sm-sfx --decoder same-s --seconds 5 \
  --prompt "Short rising synthetic air sweep, dry ending, no speech or music" \
  --out sweep.wav
```

Claude runs the CLI and trims the output. The installer creates a local environment but can offer to install uv if absent; inspect it first in production. **UNVERIFIED here:** performance and installation success on this M1 Max. The provider’s benchmarks are not our measurements. [Licensing](https://kb.stability.ai/knowledge-base/stable-audio-commerical-and-usage-licensing) distinguishes hosted output from self-hosted weights; qualifying commercial self-hosting requires registration and compliance with the Community License’s revenue threshold. The [API price](https://platform.stability.ai/pricing) is 26 credits, **$0.26/generation**. Local inference has no per-generation fee, but setup time makes it lower priority for one film.

An optional music alternative is **Eleven Music v2.5**: [composition plans](https://elevenlabs.io/docs/eleven-api/guides/how-to/music/composition-plans) define ordered chunks with `duration_ms`; the [compose API](https://elevenlabs.io/docs/api-reference/music/compose) enforces chunk lengths for v2/v2.5. Claude POSTs JSON to `/v1/music` using `model_id: music_v2_5`. A chunk’s minimum is three seconds, so construct the one-second silence locally. [Music terms](https://elevenlabs.io/music-terms), updated **9 October 2026**, permit online commercial uses on paid self-serve tiers but exclude film/TV/radio and restrict lossless downloads to higher tiers. Treat this as an online product advertisement; theatrical/broadcast use needs separate clearance. It shares the Starter subscription, consumes credits, and is a fallback rather than another mandatory purchase.

## Libraries: buy selection time

| Library | Cost and license evidence | Agent Notch use |
|---|---|---|
| [Freesound](https://freesound.org/help/faq/) | $0; per-file CC0 or CC BY can support commercial use; BY requires attribution. Exclude BY-NC and Sampling+ for the ad. Checked 13 October. | Physical keys and latch layers; Claude filters licenses and records file IDs. |
| [Sonniss GDC bundle](https://sonniss.com/gdc-bundle-license/) | $0; license v2.0 effective **27 August 2026** permits commercial synchronized projects without attribution, restricts redistribution and AI training. | Select a few impacts/air movements; mix locally, retain provenance. |
| [Gfx Sounds Motion Graphics bundle](https://www.asoundeffect.com/sound-library/motion-graphics-sound-effects-bundle-ui-clicks-and-transition-sounds/) | Listed $25 sale / $35 regular, excluding VAT, checked 13 October. [Marketplace EULA](https://www.asoundeffect.com/license-agreement/) permits synchronized advertising, with workstation/user licensing and raw-asset/AI-training restrictions. | Fastest stock option: choose six coherent clicks/transitions, then script placement. |
| [Epidemic Sound](https://www.epidemicsound.com/pricing/) | Pro or Enterprise covers ads; monthly Pro is available. **UNVERIFIED:** exact current price, absent from the retrieved primary page. | Consider only if already subscribed; owner downloads, Claude edits locally. |

Keep licensed raw assets outside the public MIT repository unless redistribution is expressly allowed. A film-use license does not make samples MIT. Do not upload restricted stock sounds to generative models as reference audio.

## Beat analysis, voice and delivery

Keep the existing `audio/measure.py` workflow. [librosa 1.0.0](https://github.com/librosa/librosa/releases/tag/1.0.0) was released **11 August 2026**; the project’s familiar [0.11 beat API](https://librosa.org/doc/0.11.0/generated/librosa.beat.beat_track.html) documents beat tracking. For reproducibility, pin the existing workflow to 0.11.0 first:

```bash
python3 -m venv .venv-audio
.venv-audio/bin/pip install librosa==0.11.0
.venv-audio/bin/python audio/measure.py public/music-suno-v2-4.wav --bpm 123.05 --drop 3.968
```

Claude should add onset timestamps alongside beats, ideally analyzing a drum stem at a 128-sample hop, and export a JSON cue grid. Beat trackers do not label the first beat of a bar reliably enough to skip listening. Mark the actual drop and verify at least four bars. At 30 fps a picture frame lasts 33.3 ms: round each absolute picture timestamp independently; place audio in samples at 48 kHz. Do not accumulate rounded beat lengths. Cut important arrivals on transients; allow readable UI holds between them.

[Essentia RhythmExtractor2013](https://essentia.upf.edu/reference/std_RhythmExtractor2013.html) adds beat confidence but requires 44.1 kHz input; its [AGPL/proprietary licensing](https://essentia.upf.edu/documentation.html) and extra setup make it a secondary diagnostic, not a migration recommendation. Both pages checked 13 October.

I would test the main cut **without continuous voiceover**. If cold viewers miss the premise, add only “Twelve agents. One bottleneck. You.” and a closing line. Claude can generate alternate readings through the [TTS API](https://elevenlabs.io/docs/api-reference/text-to-speech/convert), using documented `eleven_multilingual_v2`, then place takes with measured durations. Suggested voice treatment: high-pass around 80 Hz, gentle 3:1 compression and 4–6 dB music ducking. Do not time-compress an awkward reading into place.

Retain a 48 kHz/24-bit mix master and separate music/effects/voice buses. My delivery target is **−14 LUFS integrated, ≤−1.5 dBTP** for all three platforms; test a −12 LUFS alternate only if it improves the short cut without flattening attacks. **UNVERIFIED as platform mandates:** −14 for YouTube, X or Instagram. YouTube’s [official encoding guide](https://support.google.com/youtube/answer/1722171?hl=en) verifies AAC-LC, stereo and 48 kHz, not that loudness target.

```bash
ffmpeg -i final.mp4 -vn \
  -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null -
```

Analyze the final encoded MP4, not just the WAV: v4’s AAC peak differs from its stated master ceiling. Reuse the repo’s two-pass implementation; [FFmpeg’s documentation](https://ffmpeg.org/ffmpeg-filters.html#loudnorm), checked 13 October, describes measured-value linear normalization. `LRA=11` is not an instruction to manufacture eleven LU of dynamics. Compare versions at equal loudness, check mono, headphones, MacBook speakers and a phone, then verify uploaded platform playback during the authorized publishing session.

Discovery also covered [HN workflow discussion](https://news.ycombinator.com/item?id=47442374), [Reddit SFX discussion](https://www.reddit.com/r/ElevenLabs/comments/1ruoxjb/where_is_the_videotosound_tool/), skills marketplaces and MCP registry metadata; community claims were not used as capability evidence. The [ElevenLabs X announcement](https://x.com/elevenlabsio/status/1962912811392131214) returned 403: **UNVERIFIED content**. Official [Remotion skills](https://www.remotion.dev/docs/ai/skills), updated **13 October 2026**, install with `npx skills add remotion-dev/skills`; use them for placement/render guidance, without upgrading the pinned Remotion 4.0.290 during the sound pass.

## Top 10 recommendations for Agent Notch

Ranked by expected impact per hour; times are estimates, not measured results.

1. **Move the main release to Allow** (1–2 h). Why: makes progress causal. How: edit music segments and the approval cue together. Cost: $0. Risk: picture must support the new climax.
2. **Protect the “You.” stop** (30–60 min). Why: gives the accusation space. How: audition and fade all buses/returns. Cost: $0. Risk: dead air if held too long.
3. **Choose from six matched-level music candidates** (1–2 h plus owner generation). Why: avoids endless random rerolls. How: bounded Suno v6 brief above. Cost: existing paid account, or Pro $96/year. Risk: none beats v4.
4. **Edit drum/bass stems** (1–2 h). Why: meaningful changes under Deny and completion. How: Suno extraction and scripted bus edits. Cost: included plan plus credits. Risk: bleed.
5. **Buy one focused stock pack** (1 h). Why: cuts browsing time. How: Motion Graphics bundle; select six useful cues. Cost: $25 observed sale, $35 regular. Risk: generic palette without editing.
6. **Generate two custom hero effects** (1–2 h). Why: gives the reveal and approval an identity. How: Eleven SFX v2 REST batch, two alternatives each. Cost: $6 Starter month. Risk: artifact cleanup and MP3 limits.
7. **Check transients against the shared grid** (1 h). Why: tightens arrivals without speeding reading. How: librosa plus manual downbeat checks. Cost: $0. Risk: half/double-tempo errors.
8. **Repeat a short approval motif at completion** (1 h). Why: connects answering with finishing. How: synthesize variations in the existing mixer. Cost: $0. Risk: accidental ringtone feel.
9. **A/B minimal VO against no VO** (1–2 h). Why: resolves comprehension by listening. How: alternate TTS readings and matched mixes. Cost: same $6 plan. Risk: explaining captions twice.
10. **Verify the encoded mix on real devices** (1 h). Why: confirms intelligibility and impact where viewers hear it. How: FFmpeg measurements, mono check and phone playback; platform check after authorized upload. Cost: $0. Risk: upload behavior remains unverified beforehand.

## What NOT to do

Do not make every word whoosh, put a sub boom on every transition, or use continuous typing beneath complex UI. Do not choose music by loudness, trust timestamp prose to place a Suno drop, or spend the climax on a dark laptop. Do not install deprecated MCP servers because a registry listing still exists. Do not buy a broad annual audio subscription before auditioning the current take. Do not claim a universal social-platform LUFS requirement, redistribute restricted samples under MIT, or call the film 10/10 from measurements and contact sheets.

Verified on 13 October 2026: both v4 contact sheets visually inspected; actual MP4 inspected with FFprobe and FFmpeg, commands exited 0. Listening quality and uploaded-platform playback: **NOT verified**; no audition or upload was performed.
