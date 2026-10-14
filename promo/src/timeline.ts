/*
 * THE timeline of every film: cuts, in-shot events and sound effects, all in musical time.
 *
 * Everything is written in beats. Two numbers turn beats into frames:
 *   BPM            tempo of the music track (placeholder bed: 120)
 *   OFFSET_FRAMES  frame of the track's first downbeat (beat 0) from the start of the film
 * Re-timing the edit to a new track = measure its tempo and first downbeat, change these two numbers,
 * run `node audio/synth.mts`, render. NUDGE moves a single cut by a few frames if a section drifts.
 *
 * Plain TypeScript with erasable types only: Node runs this file directly for the synth.
 */
export const FPS = 30;
/** Tempo of the music track (Suno take v1, measured with librosa: 123.05 BPM, beat interval 0.4876 s ± 0.009). */
export const BPM = 123.05;
/** Film beat 10 (the reveal, the drop) lands at exactly 5.0 s: 150 frames - 10 beats. */
export const OFFSET_FRAMES = 150 - (10 * FPS * 60) / BPM;

export type ShotId =
  | 'cascade' | 'freeze' | 'you' | 'reveal' | 'approve' | 'title'
  | 'states' | 'anatomy' | 'open'
  | 'usage' | 'jump'
  | 'keys' | 'risky' | 'question' | 'plan' | 'trust'
  | 'card' | 'toast'
  | 'themes' | 'sounds' | 'presets'
  | 'hosts' | 'local' | 'end';

/** Per-cut nudges in frames (positive = later), applied to the start of the named shot. */
export const NUDGE: Partial<Record<ShotId, number>> = {};

export const FPB = (FPS * 60) / BPM; // frames per beat (15 at 120 BPM)
/** Absolute frame of an absolute beat. */
export const beatFrame = (beat: number) => Math.round(OFFSET_FRAMES + beat * FPB);

/** Music under a shot: the section map the Suno prompt asks for (see README). */
export type Section = 'intro' | 'stop' | 'drop' | 'grooveA' | 'dark' | 'grooveB' | 'breakdown' | 'bright' | 'final';
export type ShotDef = {id: ShotId; beats: number; music: Section};

/*
 * Landscape cut. Film beats in brackets; the sections of the music take sit on them (see MUSIC below):
 * intro [0-8] · dead stop [8-10] · drop [10] · groove [10-34] · breakdown [34-42] · groove [42-66]
 * · breakdown [66-74] · groove [74-113] · the track's final hit [114.8] and its fade to the end [122].
 */
export const PROMO: ShotDef[] = [
  {id: 'cascade', beats: 4, music: 'intro'},
  {id: 'freeze', beats: 4, music: 'intro'},
  {id: 'you', beats: 2, music: 'stop'},
  {id: 'reveal', beats: 4, music: 'drop'},
  {id: 'approve', beats: 5, music: 'grooveA'},
  {id: 'title', beats: 3, music: 'grooveA'},
  {id: 'states', beats: 5, music: 'grooveA'},
  {id: 'anatomy', beats: 6, music: 'grooveA'},
  {id: 'open', beats: 4, music: 'breakdown'},
  {id: 'usage', beats: 4, music: 'breakdown'},
  {id: 'jump', beats: 4, music: 'grooveA'},
  {id: 'keys', beats: 5, music: 'grooveA'},
  {id: 'question', beats: 7, music: 'grooveA'},
  {id: 'plan', beats: 9, music: 'grooveA'},
  {id: 'risky', beats: 8, music: 'dark'},
  {id: 'card', beats: 9, music: 'grooveB'},
  {id: 'toast', beats: 4, music: 'grooveB'},
  {id: 'trust', beats: 5, music: 'grooveB'},
  {id: 'sounds', beats: 4, music: 'grooveB'},
  {id: 'themes', beats: 8, music: 'bright'},
  {id: 'presets', beats: 3, music: 'bright'},
  {id: 'hosts', beats: 3, music: 'bright'},
  {id: 'local', beats: 3, music: 'bright'},
  {id: 'end', beats: 9, music: 'final'},
];

/** Phone cut: the same journey, shorter, every layout re-framed for 9:16. The music is edited to fit (MUSIC.vertical). */
export const VERTICAL: ShotDef[] = [
  {id: 'cascade', beats: 4, music: 'intro'},
  {id: 'freeze', beats: 4, music: 'intro'},
  {id: 'you', beats: 2, music: 'stop'},
  {id: 'reveal', beats: 4, music: 'drop'},
  {id: 'approve', beats: 5, music: 'grooveA'},
  {id: 'title', beats: 3, music: 'grooveA'},
  {id: 'states', beats: 5, music: 'grooveA'},
  {id: 'anatomy', beats: 6, music: 'grooveA'},
  {id: 'keys', beats: 5, music: 'grooveA'},
  {id: 'risky', beats: 8, music: 'dark'},
  {id: 'question', beats: 6, music: 'grooveB'},
  {id: 'card', beats: 9, music: 'grooveB'},
  {id: 'toast', beats: 4, music: 'grooveB'},
  {id: 'trust', beats: 4, music: 'breakdown'},
  {id: 'themes', beats: 8, music: 'bright'},
  {id: 'end', beats: 9, music: 'final'},
];

/*
 * Music edit: which part of the track plays under which film beats. Sample-accurate in audio/synth.mts, with short
 * crossfades at every cut. `src` is a beat of the track counted from its drop (negative = before the drop).
 * A new take drops in by changing MUSIC_FILE, the four TRACK_* numbers and, if its sections moved, the src beats.
 */
export const MUSIC_FILE = 'music-suno-v2-4.wav';
/** Track second of the drop (the first downbeat of the full groove), measured from the onset. */
export const TRACK_DROP_S = 3.968;
export const TRACK_BPM = BPM;
/**
 * Track sections in beats from the drop, measured (RMS per beat and onsets): groove 0-24, breakdown 24-32, groove
 * 32-56, breakdown 56-64, groove 64-103 (a softer stretch 89-96), final hit at 104.8 (55.08 s), fade to -60 dB by 112.
 */
export const TRACK_SECTIONS = {breakdown1: 24, groove2: 32, breakdown2: 56, groove3: 64, hit: 104.8, faded: 112};
export type MusicSeg = {from: number; to: number; src: number};
/**
 * Film beats [from, to) play the track from beat `src`. Gaps are silence. With `hit` set, the music stops there and
 * the synth adds a final hit and a reverb tail; without it the track plays out to its own ending.
 */
export const MUSIC: {promo: MusicSeg[]; vertical: MusicSeg[]; promoHit?: number; verticalHit?: number} = {
  promo: [
    {from: 0, to: 8, src: -8}, // the intro; the drop's onset falls exactly on film beat 8 and is cut there
    // 8-10: dead stop ("You.")
    {from: 10, to: 122, src: 0}, // from the drop, continuous: hit at film beat 114.8, the track's own fade ends the film
  ],
  vertical: [
    {from: 0, to: 8, src: -8},
    {from: 10, to: 34, src: 0}, // drop and groove
    {from: 34, to: 62, src: 20}, // back one bar on a bar line, so the first breakdown lands on risky (38-46)
    {from: 62, to: 86, src: 88}, // forward ten bars on a bar line: soft stretch under trust, groove under themes, the hit in end
  ],
};

export type Placed = ShotDef & {startBeat: number; from: number; to: number};
/** Shots with absolute beats and frames. The first shot starts at frame 0 and absorbs OFFSET_FRAMES. */
export const place = (shots: ShotDef[]): Placed[] => {
  let b = 0;
  const raw = shots.map((s) => {
    const startBeat = b;
    b += s.beats;
    return {...s, startBeat};
  });
  return raw.map((s, i) => {
    const from = i === 0 ? 0 : beatFrame(s.startBeat) + (NUDGE[s.id] ?? 0);
    const next = raw[i + 1];
    const to = next ? beatFrame(next.startBeat) + (NUDGE[next.id] ?? 0) : beatFrame(s.startBeat + s.beats);
    return {...s, from, to};
  });
};
export const filmFrames = (shots: ShotDef[]) => {
  const p = place(shots);
  return p[p.length - 1].to;
};
/** Frame (relative to the shot's own start) of a beat inside the shot. */
export const localFrame = (p: Placed, beat: number) => beatFrame(p.startBeat + beat) - p.from;

/* ---------- events inside shots, in beats from the shot start ---------- */
export const EV = {
  cascade: {cut2: 1, cut3: 2, caption: 1},
  freeze: {stop: 0.5, prompt: 0.75, caption: 1.5, dive: 3.3},
  you: {word: 0},
  reveal: {pull: 0.25, land: 2.75},
  approve: {click: 0.75, open: 0.9, allow: 3, resume: 3.25},
  title: {in: 0},
  states: {waiting: 1, stuck: 2, done: 3, freeze: 3.75},
  anatomy: {sub: 0.4, light: 1.9, crowd: 3.2, fold: 4.0},
  open: {click: 0.75, pan: 2},
  usage: {limit: 0.4, context: 1.6, cost: 2.7},
  jump: {dclick: 1.2, whip: 1.9},
  keys: {y: 1, n: 3},
  risky: {tryKey: 1.25, move: 3, deny: 5.25},
  question: {pick: 2.5, resume: 3},
  plan: {comment: 1.25, typeFrom: 1.75, typeTo: 3, sendBack: 3.25, revised: 4, approve: 6},
  trust: {timer: 1.25},
  card: {done: 0.5, remaining: 2.5, files: 4.5, log: 6.5},
  toast: {finish: 0.5},
  themes: {first: 0},
  sounds: {play: 1.5},
  presets: {detailed: 1, everything: 2},
  hosts: {vscode: 1, desktop: 2},
  local: {line2: 1},
  end: {hit: 1.81, install: 2.4, url: 3.6}, // hit = the track's final hit (track beat 104.8, 55.08 s)
} as const;

/** Theme montage: 13 skins; Terminal, Synthwave and Pixel are the three hero looks and hold longer. */
export const THEME_ORDER = ['terminal', 'glass', 'paper', 'midnight', 'console', 'phosphor', 'synthwave', 'blueprint', 'brutal', 'hologram', 'wasteland', 'pixel', 'ducks'] as const;
export const THEME_BEATS = [0, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 4, 4.25, 4.5, 4.75, 5, 6.75];

/* ---------- sound effects ---------- */
export type Sfx = 'whoosh' | 'impact' | 'boom' | 'click' | 'dclick' | 'key' | 'tick' | 'pop' | 'riser' | 'thud' | 'chime' | 'approve' | 'deny' | 'buzz' | 'type' | 'swell' | 'glass' | 'rewind';
/** b: beat inside the shot; d: duration in beats (whoosh, riser, type); v: gain; p: pitch factor. */
export type Cue = {b: number; s: Sfx; d?: number; v?: number; p?: number};

export const SHOT_CUES: Record<ShotId, Cue[]> = {
  cascade: [
    {b: 0, s: 'thud', v: 0.8}, {b: EV.cascade.cut2, s: 'thud', v: 0.9}, {b: EV.cascade.cut3, s: 'thud', v: 1},
    ...Array.from({length: 12}, (_, i) => ({b: 0.15 + i * 0.3, s: 'pop' as Sfx, v: 0.3, p: 0.8 + (i % 5) * 0.08})),
  ],
  freeze: [{b: EV.freeze.stop, s: 'tick', v: 0.9}, {b: EV.freeze.prompt, s: 'chime', p: 0.75, v: 0.35}, {b: EV.freeze.dive - 0.3, s: 'riser', d: 0.7, v: 0.8}],
  you: [], // dead silence under "You."
  reveal: [{b: 0, s: 'impact'}, {b: 0, s: 'boom'}, {b: EV.reveal.pull, s: 'whoosh', d: 1.2, v: 0.8}],
  approve: [{b: EV.approve.click, s: 'click'}, {b: EV.approve.open, s: 'swell', v: 0.5}, {b: EV.approve.allow, s: 'click'}, {b: EV.approve.allow + 0.05, s: 'approve'}],
  title: [{b: 0, s: 'whoosh', d: 0.5, v: 0.5}],
  states: [{b: 0, s: 'tick', v: 0.6}, {b: EV.states.waiting, s: 'tick', v: 0.6, p: 1.12}, {b: EV.states.stuck, s: 'tick', v: 0.6, p: 0.84}, {b: EV.states.done, s: 'tick', v: 0.6, p: 0.75}, {b: EV.states.freeze, s: 'swell', v: 0.4}],
  anatomy: [
    {b: EV.anatomy.sub, s: 'pop', v: 0.6, p: 1.3}, {b: EV.anatomy.light, s: 'pop', v: 0.6, p: 0.9},
    ...Array.from({length: 6}, (_, i) => ({b: EV.anatomy.crowd + i * 0.15, s: 'pop' as Sfx, v: 0.4, p: 1 + i * 0.08})),
    {b: EV.anatomy.fold, s: 'whoosh', d: 0.4, v: 0.5}, {b: EV.anatomy.fold + 0.3, s: 'tick', v: 0.7},
  ],
  open: [{b: EV.open.click, s: 'click'}, {b: EV.open.click + 0.1, s: 'swell', v: 0.45}, {b: EV.open.pan, s: 'whoosh', d: 0.5, v: 0.4}],
  usage: [{b: EV.usage.limit, s: 'tick', v: 0.5}, {b: EV.usage.context, s: 'tick', v: 0.5, p: 1.1}, {b: EV.usage.cost, s: 'tick', v: 0.5, p: 1.2}],
  jump: [{b: EV.jump.dclick, s: 'dclick'}, {b: EV.jump.whip, s: 'whoosh', d: 0.4}],
  keys: [
    {b: EV.keys.y - 0.2, s: 'key'}, {b: EV.keys.y - 0.1, s: 'key'}, {b: EV.keys.y, s: 'key'}, {b: EV.keys.y + 0.05, s: 'approve'},
    {b: EV.keys.n - 0.2, s: 'key'}, {b: EV.keys.n - 0.1, s: 'key'}, {b: EV.keys.n, s: 'key'}, {b: EV.keys.n + 0.05, s: 'deny'},
  ],
  risky: [{b: 0, s: 'buzz', v: 0.7}, {b: EV.risky.tryKey - 0.2, s: 'key'}, {b: EV.risky.tryKey - 0.1, s: 'key'}, {b: EV.risky.tryKey, s: 'key'}, {b: EV.risky.deny, s: 'click'}, {b: EV.risky.deny + 0.05, s: 'deny'}],
  question: [{b: EV.question.pick, s: 'click'}, {b: EV.question.pick + 0.05, s: 'approve', v: 0.8}],
  plan: [{b: EV.plan.comment, s: 'click'}, {b: EV.plan.typeFrom, s: 'type', d: EV.plan.typeTo - EV.plan.typeFrom, v: 0.5}, {b: EV.plan.sendBack, s: 'click'}, {b: EV.plan.sendBack + 0.05, s: 'rewind', v: 0.6}, {b: EV.plan.approve, s: 'click'}, {b: EV.plan.approve + 0.05, s: 'approve'}],
  trust: [{b: 0, s: 'swell', v: 0.5}, ...Array.from({length: 6}, (_, i) => ({b: EV.trust.timer + i * 0.5, s: 'tick' as Sfx, v: 0.3, p: 0.9}))],
  card: [{b: 0, s: 'whoosh', d: 0.4, v: 0.6}, {b: EV.card.done, s: 'click', v: 0.7}, {b: EV.card.remaining, s: 'click', v: 0.7}, {b: EV.card.files, s: 'click', v: 0.7}, {b: EV.card.log, s: 'click', v: 0.7}],
  toast: [{b: EV.toast.finish, s: 'chime', p: 1.5, v: 0.6}],
  themes: THEME_BEATS.map((b, i) => ({b, s: 'tick' as Sfx, v: 0.45, p: 0.9 + i * 0.03})),
  sounds: [{b: EV.sounds.play - 0.05, s: 'click', v: 0.7}, {b: EV.sounds.play, s: 'glass', v: 0.9}],
  presets: [{b: 0, s: 'click', v: 0.6}, {b: EV.presets.detailed, s: 'click', v: 0.6}, {b: EV.presets.everything, s: 'click', v: 0.6}],
  hosts: [{b: 0, s: 'whoosh', d: 0.3, v: 0.5}, {b: EV.hosts.vscode, s: 'whoosh', d: 0.3, v: 0.5}, {b: EV.hosts.desktop, s: 'whoosh', d: 0.3, v: 0.5}],
  local: [{b: 0, s: 'tick', v: 0.5}, {b: EV.local.line2, s: 'tick', v: 0.5, p: 0.8}],
  end: [{b: 0, s: 'whoosh', d: 0.5, v: 0.5}, {b: EV.end.install, s: 'type', d: 1, v: 0.45}],
};

/** Absolute cue list of a film, in frames. */
export const cues = (shots: ShotDef[]) => {
  const out: {f: number; s: Sfx; d: number; v: number; p: number}[] = [];
  for (const p of place(shots)) {
    for (const c of SHOT_CUES[p.id]) {
      const f = p.from + localFrame(p, c.b);
      if (f >= p.to) continue;
      const d = c.d ? Math.max(1, beatFrame(p.startBeat + c.b + c.d) - beatFrame(p.startBeat + c.b)) : 8;
      out.push({f: Math.max(0, f), s: c.s, d, v: c.v ?? 1, p: c.p ?? 1});
    }
  }
  return out.sort((a, b) => a.f - b.f);
};

/** Music sections in absolute frames and beats, merged across neighbouring shots. */
export const sections = (shots: ShotDef[]) => {
  const out: {from: number; to: number; music: Section; fromBeat: number; toBeat: number}[] = [];
  for (const p of place(shots)) {
    const last = out[out.length - 1];
    if (last && last.music === p.music) {
      last.to = p.to;
      last.toBeat = p.startBeat + p.beats;
    } else out.push({from: p.from, to: p.to, music: p.music, fromBeat: p.startBeat, toBeat: p.startBeat + p.beats});
  }
  return out;
};
