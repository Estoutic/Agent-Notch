/*
 * The cut list of every film, shared by the React scenes (src/Film.tsx) and the synth (audio/synth.ts).
 * 30 fps, 120 BPM: one beat = 15 frames, one bar = 60 frames. Shot lengths are whole beats (or eighths in the
 * theme montage), so every cut lands on the grid and the music stays in step with the picture.
 * Plain TypeScript with erasable types only: Node runs this file directly (type stripping) for the synth.
 */
export const FPS = 30;
export const BEAT = 15;

export type ShotId =
  | 'chaos' | 'buried' | 'clock' | 'slam1' | 'slam2'
  | 'reveal' | 'legend' | 'kinds'
  | 'open' | 'list' | 'usage' | 'jump'
  | 'ask' | 'keys' | 'risky' | 'qp' | 'trust'
  | 'card' | 'themes' | 'themeMarks' | 'sounds' | 'toast' | 'presets' | 'everywhere'
  | 'outro' | 'end';

/** Music under a shot. */
export type Music = 'pulse' | 'tension' | 'stop' | 'drop' | 'break' | 'montage' | 'outro';
/** How the shot comes in. */
export type Enter = 'cut' | 'whipL' | 'whipR' | 'whipU' | 'flash' | 'zoom' | 'glitch';
export type Shot = {id: ShotId; len: number; music: Music; enter?: Enter};

export const PROMO: Shot[] = [
  {id: 'chaos', len: 60, music: 'pulse'},
  {id: 'buried', len: 75, music: 'pulse', enter: 'zoom'},
  {id: 'clock', len: 60, music: 'tension', enter: 'cut'},
  {id: 'slam1', len: 60, music: 'stop', enter: 'cut'},
  {id: 'slam2', len: 45, music: 'stop', enter: 'cut'},
  {id: 'reveal', len: 105, music: 'drop', enter: 'glitch'},
  {id: 'legend', len: 90, music: 'drop', enter: 'whipU'},
  {id: 'kinds', len: 60, music: 'drop', enter: 'zoom'},
  {id: 'open', len: 60, music: 'drop', enter: 'whipL'},
  {id: 'list', len: 60, music: 'drop', enter: 'cut'},
  {id: 'usage', len: 60, music: 'drop', enter: 'whipL'},
  {id: 'jump', len: 60, music: 'drop', enter: 'whipR'},
  {id: 'ask', len: 75, music: 'drop', enter: 'flash'},
  {id: 'keys', len: 60, music: 'drop', enter: 'cut'},
  {id: 'risky', len: 75, music: 'drop', enter: 'glitch'},
  {id: 'qp', len: 90, music: 'drop', enter: 'whipL'},
  {id: 'trust', len: 75, music: 'break', enter: 'cut'},
  {id: 'card', len: 60, music: 'drop', enter: 'zoom'},
  {id: 'themes', len: 120, music: 'montage', enter: 'flash'},
  {id: 'themeMarks', len: 45, music: 'montage', enter: 'cut'},
  {id: 'sounds', len: 60, music: 'drop', enter: 'whipU'},
  {id: 'toast', len: 60, music: 'drop', enter: 'whipL'},
  {id: 'presets', len: 45, music: 'drop', enter: 'cut'},
  {id: 'everywhere', len: 60, music: 'drop', enter: 'whipR'},
  {id: 'outro', len: 45, music: 'stop', enter: 'cut'},
  {id: 'end', len: 120, music: 'outro', enter: 'flash'},
];

export const VERTICAL: Shot[] = [
  {id: 'chaos', len: 60, music: 'pulse'},
  {id: 'buried', len: 60, music: 'pulse', enter: 'zoom'},
  {id: 'slam1', len: 60, music: 'stop', enter: 'cut'},
  {id: 'slam2', len: 45, music: 'stop', enter: 'cut'},
  {id: 'reveal', len: 105, music: 'drop', enter: 'glitch'},
  {id: 'legend', len: 90, music: 'drop', enter: 'whipU'},
  {id: 'open', len: 60, music: 'drop', enter: 'whipL'},
  {id: 'ask', len: 75, music: 'drop', enter: 'flash'},
  {id: 'keys', len: 60, music: 'drop', enter: 'cut'},
  {id: 'risky', len: 75, music: 'drop', enter: 'glitch'},
  {id: 'trust', len: 75, music: 'break', enter: 'cut'},
  {id: 'card', len: 60, music: 'drop', enter: 'zoom'},
  {id: 'themes', len: 120, music: 'montage', enter: 'flash'},
  {id: 'everywhere', len: 60, music: 'drop', enter: 'whipR'},
  {id: 'end', len: 120, music: 'outro', enter: 'flash'},
];

export const filmLength = (shots: Shot[]) => shots.reduce((s, x) => s + x.len, 0);
export const starts = (shots: Shot[]) => {
  let at = 0;
  return shots.map((s) => {
    const from = at;
    at += s.len;
    return from;
  });
};

/* ---------- sound effects, in frames relative to the start of each shot ---------- */
export type Sfx = 'whoosh' | 'impact' | 'boom' | 'click' | 'dclick' | 'key' | 'tick' | 'pop' | 'glitch' | 'riser' | 'thud' | 'beep' | 'chime' | 'buzz' | 'type' | 'swell';
export type Cue = {f: number; s: Sfx; d?: number; v?: number; p?: number};

/** Theme montage timing (shared with the picture). */
export const THEME_INTRO = 22;
export const THEME_STEP = 7.5;
export const THEME_ORDER = ['terminal', 'glass', 'paper', 'midnight', 'console', 'phosphor', 'synthwave', 'blueprint', 'brutal', 'hologram', 'wasteland', 'pixel', 'ducks'] as const;

/** Key moments inside shots; scenes read the same numbers. */
export const K = {
  chaosAppear: (i: number) => 2 + i * 4, // terminal i pops in
  revealSuck: 8, // windows start flying into the notch
  revealHit: 30, // they land on a beat: impact, the groove starts
  revealPop: (i: number) => 38 + i * 4,
  legendCols: [15, 27, 39, 51],
  kindsCall: [6, 18, 30, 42],
  openClick: 14,
  jumpClick: 18,
  jumpWhip: 26,
  askPanel: 26,
  keysY: [6, 12, 18],
  keysN: [36, 40, 44],
  riskyHit: 2,
  riskyClick: 58,
  qpClick1: 30,
  qpSwap: 45,
  qpClick2: 75,
  cardTabs: [16, 26, 36, 46],
  presets: [0, 15, 30],
  toastIn: 10,
  endType: [40, 70],
} as const;

const shotCues = (id: ShotId, len: number, V: boolean): Cue[] => {
  switch (id) {
    case 'chaos':
      return Array.from({length: V ? 12 : 14}, (_, i) => ({f: K.chaosAppear(i), s: 'pop' as Sfx, v: 0.35, p: 0.8 + (i % 5) * 0.08}));
    case 'buried':
      return [{f: 2, s: 'swell'}, {f: 10, s: 'beep', v: 0.5}, {f: 40, s: 'beep', v: 0.5}];
    case 'clock':
      return [...Array.from({length: 6}, (_, i) => ({f: 4 + i * 9, s: 'tick' as Sfx, v: 0.7})), {f: 0, s: 'riser', d: len, v: 0.8}];
    case 'slam1':
      return [0, 15, 30, 45].map((f) => ({f, s: 'thud' as Sfx}));
    case 'slam2':
      return [{f: 0, s: 'thud'}, {f: 8, s: 'thud', v: 0.6}, {f: 16, s: 'thud', v: 0.7}, {f: 24, s: 'thud', v: 0.8}, {f: 30, s: 'riser', d: 15, v: 1}, {f: 38, s: 'glitch'}];
    case 'reveal':
      return [{f: 0, s: 'glitch'}, {f: K.revealSuck, s: 'whoosh', d: 18}, {f: K.revealHit, s: 'impact'}, {f: K.revealHit, s: 'boom'},
        ...[0, 1, 2, 3, 4].map((i) => ({f: K.revealPop(i), s: 'pop' as Sfx, v: 0.5, p: 1 + i * 0.12}))];
    case 'legend':
      return [{f: 0, s: 'whoosh', d: 8}, ...K.legendCols.map((f, i) => ({f, s: 'chime' as Sfx, p: [1, 1.26, 0.84, 0.75][i], v: 0.6}))];
    case 'kinds':
      return K.kindsCall.map((f) => ({f, s: 'tick' as Sfx, v: 0.6}));
    case 'open':
      return [{f: 0, s: 'whoosh', d: 8}, {f: K.openClick, s: 'click'}, {f: K.openClick + 1, s: 'key', v: 0.6}, {f: K.openClick + 3, s: 'swell', v: 0.5}];
    case 'list':
      return [{f: 2, s: 'tick', v: 0.5}, {f: 30, s: 'tick', v: 0.5}];
    case 'usage':
      return [{f: 0, s: 'whoosh', d: 8}, ...Array.from({length: 10}, (_, i) => ({f: 10 + i * 3, s: 'tick' as Sfx, v: 0.3, p: 1 + i * 0.05}))];
    case 'jump':
      return [{f: 0, s: 'whoosh', d: 8}, {f: K.jumpClick, s: 'dclick'}, {f: K.jumpWhip, s: 'whoosh', d: 10}];
    case 'ask':
      return [{f: 0, s: 'impact', v: 0.5}, {f: 6, s: 'beep', v: 0.45}, {f: K.askPanel, s: 'swell', v: 0.6}];
    case 'keys':
      return [...K.keysY.map((f) => ({f, s: 'key' as Sfx})), {f: K.keysY[2] + 1, s: 'chime', p: 1.5, v: 0.5}, ...K.keysN.map((f) => ({f, s: 'key' as Sfx}))];
    case 'risky':
      return [{f: 0, s: 'glitch'}, {f: K.riskyHit, s: 'buzz'}, {f: K.riskyClick, s: 'click'}];
    case 'qp':
      return [{f: 0, s: 'whoosh', d: 8}, {f: K.qpClick1, s: 'click'}, {f: K.qpSwap, s: 'whoosh', d: 6, v: 0.5}, {f: K.qpClick2, s: 'click'}];
    case 'trust':
      return [{f: 0, s: 'swell', v: 0.7}];
    case 'card':
      return [{f: 0, s: 'whoosh', d: 8}, ...K.cardTabs.map((f) => ({f, s: 'tick' as Sfx, v: 0.5}))];
    case 'themes':
      return [{f: 0, s: 'impact', v: 0.6}, ...Array.from({length: 13}, (_, i) => ({f: Math.round(THEME_INTRO + i * THEME_STEP), s: 'tick' as Sfx, v: 0.55, p: 0.9 + i * 0.04}))];
    case 'themeMarks':
      return [{f: 0, s: 'whoosh', d: 10, v: 0.6}];
    case 'sounds':
      return [{f: 0, s: 'whoosh', d: 8}, {f: 14, s: 'chime', p: 1, v: 0.5}, {f: 22, s: 'chime', p: 1.26, v: 0.45}, {f: 30, s: 'chime', p: 1.5, v: 0.4}];
    case 'toast':
      return [{f: 0, s: 'whoosh', d: 8}, {f: K.toastIn, s: 'chime', p: 1.5, v: 0.55}];
    case 'presets':
      return K.presets.map((f) => ({f, s: 'click' as Sfx}));
    case 'everywhere':
      return [{f: 0, s: 'whoosh', d: 8}];
    case 'outro':
      return [{f: 0, s: 'thud'}, {f: 15, s: 'thud'}, {f: 30, s: 'riser', d: 15}];
    case 'end':
      return [{f: 0, s: 'impact'}, {f: 0, s: 'boom'}, {f: K.endType[0], s: 'type', d: K.endType[1] - K.endType[0], v: 0.5}];
  }
};

const ENTER_CUES: Partial<Record<Enter, Sfx>> = {whipL: 'whoosh', whipR: 'whoosh', whipU: 'whoosh'};

/** Absolute cue list of a film. */
export const cues = (shots: Shot[], V = false): Cue[] => {
  const at = starts(shots);
  const out: Cue[] = [];
  shots.forEach((s, i) => {
    const own = shotCues(s.id, s.len, V);
    const hasWhoosh = own.some((c) => c.s === 'whoosh' && c.f <= 1);
    const e = s.enter && ENTER_CUES[s.enter];
    if (e && !hasWhoosh) out.push({f: at[i], s: e, d: 8});
    own.forEach((c) => c.f < s.len && out.push({...c, f: at[i] + c.f}));
  });
  return out.sort((a, b) => a.f - b.f);
};

/** Music sections (absolute frames). */
export const sections = (shots: Shot[]) => {
  const at = starts(shots);
  return shots.map((s, i) => ({from: at[i], to: at[i] + s.len, music: s.music, id: s.id}));
};
