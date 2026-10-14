/*
 * v7 timeline: v4 remastered (research/v7/plan.md). Same beat grid as v4 (BPM, OFFSET_FRAMES from ../timeline), so the
 * hook (cascade, freeze, you, reveal) keeps v4's exact frames. The middle (anatomy..card) runs about 1.2x its v4 beats,
 * two shots are new (swarm after anatomy, night after toast), 147 beats = 71.8 s.
 *
 * 2D shots reuse the v4 scenes; `k` stretches their in-shot events (useShot multiplies every beat by k).
 * 3D shots play EEVEE plates from public/blender/v7/<shot>/ (blender/v7_plates.py), rendered with HANDLE extra frames
 * before frame 0 so a transition can show the incoming plate already moving.
 *
 * Plain TypeScript with erasable types only: Node runs this file directly (audio/v7_synth.mts, scripts/v7_dump.mts).
 */
import {FPS, FPB, OFFSET_FRAMES, beatFrame, SHOT_CUES, EV, THEME_BEATS, type Cue, type Sfx, type ShotId, type MusicSeg} from '../timeline.ts';

export {FPS, FPB, OFFSET_FRAMES, beatFrame};
export type Shot7Id = ShotId | 'swarm' | 'night';
export type Kind = '2d' | '3d';
/** How the shot comes in: cut, or a dissolve/match of `x` frames over the end of the previous shot. */
export type Trans = {type: 'cut'} | {type: 'dissolve' | 'zoom' | 'flash' | 'light'; x: number; note: string};
export type Shot7 = {id: Shot7Id; beats: number; kind: Kind; k?: number; in?: Trans};

/** Frames rendered before frame 0 of every 3D plate. */
export const HANDLE = 12;

const CUT: Trans = {type: 'cut'};
export const V7: Shot7[] = [
  {id: 'cascade', beats: 4, kind: '3d'},
  {id: 'freeze', beats: 4, kind: '2d', in: CUT},
  {id: 'you', beats: 2, kind: '2d', in: CUT},
  {id: 'reveal', beats: 4, kind: '3d', in: {type: 'zoom', x: 3, note: 'the amber period of "You." is the mark in the notch; hard cut on the drop'}},
  {id: 'approve', beats: 5, kind: '3d', in: CUT}, // continuous camera: the plate starts where reveal lands
  {id: 'title', beats: 3, kind: '2d', in: {type: 'dissolve', x: 3, note: 'the panel blurs into the title card'}},
  {id: 'states', beats: 5, kind: '2d', in: CUT},
  {id: 'anatomy', beats: 7, kind: '2d', k: 7 / 6, in: CUT},
  {id: 'swarm', beats: 6, kind: '3d', in: {type: 'dissolve', x: 3, note: 'counters in the notch -> the city of 55 agents'}},
  {id: 'open', beats: 5, kind: '3d', in: {type: 'dissolve', x: 4, note: 'the fly-over rises to the whole panel'}},
  {id: 'usage', beats: 5, kind: '2d', k: 1.25, in: {type: 'dissolve', x: 3, note: 'the panel row becomes the usage card'}},
  {id: 'jump', beats: 4, kind: '2d', in: CUT},
  {id: 'keys', beats: 6, kind: '3d', in: CUT}, // jump ends in a whip; the music jumps back to groove 2 on this cut
  {id: 'question', beats: 6, kind: '3d', in: {type: 'zoom', x: 4, note: 'the pressed key becomes the next panel button'}},
  {id: 'plan', beats: 8, kind: '3d', in: {type: 'dissolve', x: 3, note: 'answered question -> the plan on the same panel'}},
  {id: 'risky', beats: 10, kind: '3d', in: CUT}, // cut on the breakdown: everything goes dark, the red row lights the desk
  {id: 'card', beats: 11, kind: '2d', k: 11 / 9, in: {type: 'zoom', x: 4, note: 'the red row becomes the Deny chip, then the card'}},
  {id: 'toast', beats: 4, kind: '2d', in: CUT},
  {id: 'night', beats: 12, kind: '3d', in: {type: 'dissolve', x: 6, note: 'the toast becomes the closing lid'}},
  {id: 'trust', beats: 5, kind: '2d', in: {type: 'light', x: 6, note: 'the lid light line becomes the morning'}},
  {id: 'sounds', beats: 4, kind: '2d', in: CUT},
  {id: 'themes', beats: 8, kind: '3d', in: CUT},
  {id: 'presets', beats: 3, kind: '2d', in: CUT},
  {id: 'hosts', beats: 3, kind: '2d', in: CUT},
  {id: 'local', beats: 3, kind: '2d', in: CUT},
  {id: 'end', beats: 10, kind: '3d', in: {type: 'dissolve', x: 4, note: 'local logs -> the laptop on the desk'}},
];

export type Placed7 = Shot7 & {startBeat: number; from: number; to: number; music: string};
export const place7 = (shots: Shot7[] = V7): Placed7[] => {
  let b = 0;
  return shots.map((s, i) => {
    const startBeat = b;
    b += s.beats;
    const from = i === 0 ? 0 : beatFrame(startBeat);
    return {...s, startBeat, from, to: beatFrame(startBeat + s.beats), music: ''};
  });
};
export const LEN7 = beatFrame(V7.reduce((a, s) => a + s.beats, 0));
export const local7 = (p: Placed7, beat: number) => beatFrame(p.startBeat + beat) - p.from;

/*
 * Music edit (v4 track, music-suno-v2-4.wav). Film beat = track beat + offset; every jump keeps offset = 2 (mod 4), so
 * the track's bars stay on the film's bar lines. Track: groove 0-24, breakdown 24-32, groove 32-56, breakdown 56-64,
 * groove 64-103 (softer 89-96), final hit 104.8.
 *   0-8     intro (as v4)
 *   8-10    dead stop: "You."
 *   10-54   drop and groove, offset 10 (as v4): the first breakdown sits under swarm (34-42)
 *   54-98.5 back two bars on the cut to keys (offset 18): groove 2 re-enters on the keys; breakdown 2 = risky (74-82)
 *   98.5-101 silence before the night (room tone only)
 *   101-111 the softer stretch under the night time-lapse (offset 14)
 *   111-     the morning: groove 3 from bar 77 (offset 34); the final hit lands at film beat 138.8 = end + 1.8 (v4: 1.81)
 */
export const MUSIC7: MusicSeg[] = [
  {from: 0, to: 8, src: -8},
  {from: 10, to: 54, src: 0},
  {from: 54, to: 98.5, src: 36},
  {from: 101, to: 111, src: 87},
  {from: 111, to: 147, src: 77},
];
export const HIT7 = undefined; // the track's own final hit (track beat 104.8) plays out; no synth hit
export const HIT7_BEAT = 104.8 + 34;

/* ---------- events of the 3D shots and new shots, in beats from the shot start ---------- */
export const EV7 = {
  cascade: EV.cascade,
  reveal: EV.reveal,
  approve: EV.approve,
  swarm: {flip: 1.5, caption: 0.5, rise: 4.5},
  open: EV.open,
  keys: {y: 1.5, n: 3.75},
  question: {pick: 3.5, resume: 4.25},
  plan: {approve: 6},
  risky: {tryKey: 1.75, move: 4, deny: 6.75},
  night: {shut: 1.5, out: 2.25, dawn: 9.0, open: 10.0},
  themes: {first: 0},
  end: {hit: HIT7_BEAT - 137, install: 2.6, url: 4.0},
} as const;

/* ---------- sound ---------- */
export type Sfx7 = Sfx | 'lid' | 'latch' | 'sub' | 'keyclick' | 'room' | 'roomNight' | 'birds';
export type Cue7 = {b: number; s: Sfx7; d?: number; v?: number; p?: number};

const keyCombo = (b: number, ok: boolean): Cue7[] => [
  {b: b - 0.2, s: 'keyclick', v: 0.8}, {b: b - 0.1, s: 'keyclick', v: 0.8}, {b, s: 'keyclick'}, {b: b + 0.05, s: ok ? 'approve' : 'deny'},
];
/** Cues of the new and re-staged shots; the 2D shots keep their v4 cues with beats times k. */
const CUES7: Partial<Record<Shot7Id, Cue7[]>> = {
  reveal: [{b: 0, s: 'impact'}, {b: 0, s: 'boom'}, {b: 0, s: 'sub'}, {b: EV.reveal.pull, s: 'whoosh', d: 1.2, v: 0.8}],
  approve: [{b: 0, s: 'whoosh', d: 0.6, v: 0.5}, ...SHOT_CUES.approve],
  swarm: [
    {b: 0, s: 'whoosh', d: 1.5, v: 0.55},
    ...Array.from({length: 11}, (_, i) => ({b: EV7.swarm.flip + i * 0.12, s: 'tick' as Sfx7, v: 0.32, p: 1.4 + (i % 4) * 0.07})),
    {b: EV7.swarm.rise, s: 'whoosh', d: 1.2, v: 0.45},
  ],
  open: [{b: 0, s: 'whoosh', d: 0.6, v: 0.4}, ...SHOT_CUES.open],
  keys: [{b: 0, s: 'sub', v: 0.7}, ...keyCombo(EV7.keys.y, true), ...keyCombo(EV7.keys.n, false)],
  question: [{b: 0, s: 'whoosh', d: 0.5, v: 0.4}, {b: EV7.question.pick, s: 'click'}, {b: EV7.question.pick + 0.05, s: 'approve', v: 0.8}],
  plan: [{b: 1.5, s: 'type', d: 1.5, v: 0.35}, {b: EV7.plan.approve, s: 'click'}, {b: EV7.plan.approve + 0.05, s: 'approve'}],
  risky: [{b: 0, s: 'sub', v: 0.9}, {b: 0, s: 'buzz', v: 0.7}, ...keyCombo(EV7.risky.tryKey, false).slice(0, 3), {b: EV7.risky.deny, s: 'click'}, {b: EV7.risky.deny + 0.05, s: 'deny'}],
  night: [ // no whoosh: the night opens inside the pre-night silence (98.5-101)
    {b: EV7.night.shut - 0.35, s: 'lid'}, {b: EV7.night.shut - 0.3, s: 'latch', v: 0.8}, // on the picture: the lid lands ahead of its event
    {b: EV7.night.out, s: 'roomNight', d: EV7.night.dawn - EV7.night.out, v: 1}, {b: EV7.night.dawn, s: 'birds', d: 2.5, v: 0.6},
    {b: EV7.night.open + 0.5, s: 'lid', v: 0.6, p: 1.2}, {b: EV7.night.open + 0.9, s: 'chime', p: 1.5, v: 0.5},
  ],
  themes: [{b: 0, s: 'whoosh', d: 0.8, v: 0.45}, ...THEME_BEATS.map((b, i) => ({b, s: 'tick' as Sfx7, v: 0.45, p: 0.9 + i * 0.03}))],
  end: [{b: 0, s: 'whoosh', d: 0.5, v: 0.5}, {b: EV7.end.hit, s: 'sub'}, {b: EV7.end.install, s: 'type', d: 1, v: 0.45}],
};

export type AbsCue = {f: number; s: Sfx7; d: number; v: number; p: number};
export const cues7 = (shots: Shot7[] = V7): AbsCue[] => {
  const out: AbsCue[] = [];
  for (const p of place7(shots)) {
    const k = p.k ?? 1;
    const list: Cue7[] = CUES7[p.id] ?? (SHOT_CUES as Record<string, Cue[]>)[p.id].map((c) => ({...c, b: c.b * k, d: c.d && c.d * k}));
    for (const c of list) {
      const f = p.from + local7(p, c.b);
      if (f >= p.to) continue;
      const d = c.d ? Math.max(1, beatFrame(p.startBeat + c.b + c.d) - beatFrame(p.startBeat + c.b)) : 8;
      out.push({f: Math.max(0, f), s: c.s, d, v: c.v ?? 1, p: c.p ?? 1});
    }
  }
  return out.sort((a, b) => a.f - b.f);
};

/** Room tone: day under the whole film, night under the night shot (the synth crossfades them). */
export const ROOM7 = (() => {
  const n = place7().find((p) => p.id === 'night')!;
  return {nightFrom: n.from + local7(n, EV7.night.out), nightTo: n.from + local7(n, EV7.night.dawn), silenceFrom: beatFrame(98.5), silenceTo: beatFrame(101)};
})();
