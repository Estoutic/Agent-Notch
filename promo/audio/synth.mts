/*
 * Procedural soundtrack + SFX for the films. No samples, no downloaded audio: every sound is computed here.
 * Run: node audio/synth.mts   (Node >= 22.18 strips the types)   -> public/audio/{promo,vertical}.wav
 * The music follows src/timeline.ts: 120 BPM, one beat = 15 frames, sections set per shot.
 */
import {writeFileSync, mkdirSync} from 'node:fs';
import {PROMO, VERTICAL, FPS, cues, sections, filmLength, type Shot, type Cue} from '../src/timeline.ts';

const SR = 48000;
const BEAT_S = 0.5;
const TAU = Math.PI * 2;

/* ---------- deterministic noise ---------- */
let seed = 1;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const noise = () => rnd() * 2 - 1;

/* ---------- buses ---------- */
type Bus = {L: Float32Array; R: Float32Array};
const bus = (n: number): Bus => ({L: new Float32Array(n), R: new Float32Array(n)});

/** Writes a mono voice into a bus with pan (-1..1) and an optional reverb send. */
class Mix {
  dry: Bus; wet: Bus; n: number;
  constructor(n: number) { this.n = n; this.dry = bus(n); this.wet = bus(n); }
  put(t0: number, dur: number, fn: (t: number, i: number) => number, gain = 1, pan = 0, send = 0) {
    const s0 = Math.round(t0 * SR), len = Math.round(dur * SR);
    const gl = gain * Math.cos((pan + 1) * Math.PI / 4) * Math.SQRT2, gr = gain * Math.sin((pan + 1) * Math.PI / 4) * Math.SQRT2;
    for (let i = 0; i < len; i++) {
      const k = s0 + i;
      if (k < 0) continue;
      if (k >= this.n) break;
      const v = fn(i / SR, i);
      this.dry.L[k] += v * gl; this.dry.R[k] += v * gr;
      if (send) { this.wet.L[k] += v * gl * send; this.wet.R[k] += v * gr * send; }
    }
  }
}

/* ---------- filters ---------- */
class Biquad {
  b0 = 1; b1 = 0; b2 = 0; a1 = 0; a2 = 0; x1 = 0; x2 = 0; y1 = 0; y2 = 0;
  set(type: 'lp' | 'hp' | 'bp', f: number, q = 0.707) {
    const w = TAU * Math.min(f, SR * 0.45) / SR, c = Math.cos(w), s = Math.sin(w), a = s / (2 * q);
    let b0: number, b1: number, b2: number;
    if (type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
    else if (type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
    else { b0 = a; b1 = 0; b2 = -a; }
    const a0 = 1 + a;
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = (-2 * c) / a0; this.a2 = (1 - a) / a0;
    return this;
  }
  run(x: number) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

const saw = (ph: number) => 2 * (ph - Math.floor(ph + 0.5));
const sq = (ph: number) => (ph - Math.floor(ph) < 0.5 ? 1 : -1);
const env = (t: number, a: number, d: number) => (t < a ? t / a : Math.exp(-(t - a) / d));
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/* ---------- instruments ---------- */
const kick = (m: Mix, t0: number, g = 1) => {
  let ph = 0;
  m.put(t0, 0.45, (t) => {
    const f = 45 + 110 * Math.exp(-t / 0.035);
    ph += f / SR;
    const click = t < 0.004 ? noise() * 0.5 * (1 - t / 0.004) : 0;
    return (Math.sin(TAU * ph) * Math.exp(-t / 0.16) + click) * 0.95;
  }, g);
};
const clap = (m: Mix, t0: number, g = 1) => {
  const bp = new Biquad().set('bp', 1400, 0.9);
  m.put(t0, 0.3, (t) => {
    const bursts = [0, 0.011, 0.022].reduce((s, o) => s + (t >= o ? Math.exp(-(t - o) / (o === 0.022 ? 0.09 : 0.008)) : 0), 0);
    return bp.run(noise()) * bursts * 1.6;
  }, g, 0.05, 0.25);
};
const hat = (m: Mix, t0: number, open: boolean, g = 1, pan = 0.25) => {
  const hp = new Biquad().set('hp', 7000, 0.8);
  m.put(t0, open ? 0.25 : 0.06, (t) => hp.run(noise()) * Math.exp(-t / (open ? 0.07 : 0.014)), g * 0.28, pan, 0.04);
};
const bassNote = (m: Mix, t0: number, f: number, dur: number, g = 1) => {
  const lp = new Biquad();
  let ph = 0, ph2 = 0;
  m.put(t0, dur, (t, i) => {
    if (i % 32 === 0) lp.set('lp', 180 + 900 * Math.exp(-t / 0.06), 1.1);
    ph += f / SR; ph2 += (f * 1.005) / SR;
    const v = saw(ph) * 0.6 + saw(ph2) * 0.4 + Math.sin(TAU * ph * 0.5) * 0.5;
    return lp.run(v) * env(t, 0.004, 0.18) * (t > dur - 0.01 ? (dur - t) / 0.01 : 1);
  }, g * 0.5);
};
const padChord = (m: Mix, t0: number, notes: number[], dur: number, g = 1, bright = 1) => {
  notes.forEach((n, k) => {
    [-0.09, 0.0, 0.08].forEach((det, j) => {
      const lp = new Biquad().set('lp', 900 * bright, 0.7);
      const f = mtof(n + det);
      let ph = rnd();
      m.put(t0, dur, (t) => {
        ph += f / SR;
        const a = Math.min(1, t / 0.35) * Math.min(1, (dur - t) / 0.4);
        return lp.run(saw(ph)) * a;
      }, g * 0.05, (j - 1) * 0.6 + (k - 1) * 0.1, 0.6);
    });
  });
};
const pluck = (m: Mix, t0: number, n: number, g = 1, pan = 0) => {
  const lp = new Biquad();
  const f = mtof(n);
  let ph = 0;
  m.put(t0, 0.35, (t, i) => {
    if (i % 32 === 0) lp.set('lp', 600 + 5000 * Math.exp(-t / 0.05), 1.4);
    ph += f / SR;
    return lp.run(sq(ph) * 0.6 + saw(ph * 2.0) * 0.3) * Math.exp(-t / 0.09);
  }, g * 0.16, pan, 0.45);
};
const tickSnd = (m: Mix, t0: number, g = 1, p = 1) => {
  m.put(t0, 0.05, (t) => Math.sin(TAU * 2600 * p * t) * Math.exp(-t / 0.006) + noise() * 0.2 * Math.exp(-t / 0.002), g * 0.5, 0.15, 0.15);
};
const thump = (m: Mix, t0: number, g = 1) => {
  let ph = 0;
  m.put(t0, 0.35, (t) => { ph += (40 + 50 * Math.exp(-t / 0.05)) / SR; return Math.sin(TAU * ph) * Math.exp(-t / 0.12); }, g);
};

/* ---------- SFX ---------- */
const sfx = (m: Mix, c: Cue, t0: number) => {
  const v = c.v ?? 1, p = c.p ?? 1, d = (c.d ?? 8) / FPS;
  switch (c.s) {
    case 'whoosh': {
      const bp = new Biquad();
      const len = Math.max(0.18, d + 0.12);
      m.put(t0 - 0.06, len, (t, i) => {
        const x = t / len;
        if (i % 16 === 0) bp.set('bp', 250 * Math.pow(14, x), 1.2);
        const a = Math.sin(Math.PI * Math.pow(x, 0.8));
        return bp.run(noise()) * a * 1.8;
      }, v * 0.55, 0, 0.3);
      break;
    }
    case 'impact': {
      let ph = 0;
      const lp = new Biquad().set('lp', 900, 0.7);
      m.put(t0, 1.4, (t) => {
        ph += (32 + 90 * Math.exp(-t / 0.06)) / SR;
        return Math.sin(TAU * ph) * Math.exp(-t / 0.45) * 0.9 + lp.run(noise()) * Math.exp(-t / 0.12) * 0.7;
      }, v * 0.85, 0, 0.5);
      break;
    }
    case 'boom': {
      m.put(t0, 2.2, (t) => Math.sin(TAU * 38 * t) * Math.exp(-t / 0.7) * Math.min(1, t / 0.01), v * 0.55);
      break;
    }
    case 'click':
      m.put(t0, 0.03, (t) => (Math.sin(TAU * 3800 * t) * 0.6 + noise() * 0.5) * Math.exp(-t / 0.003), v * 0.55, 0.1, 0.1);
      break;
    case 'dclick':
      sfx(m, {...c, s: 'click'}, t0); sfx(m, {...c, s: 'click'}, t0 + 0.09);
      break;
    case 'key': {
      const bp = new Biquad().set('bp', 2400, 1.5);
      let ph = 0;
      m.put(t0, 0.09, (t) => { ph += 170 / SR; return bp.run(noise()) * Math.exp(-t / 0.01) * 1.4 + Math.sin(TAU * ph) * Math.exp(-t / 0.025) * 0.8; }, v * 0.6, -0.1, 0.12);
      break;
    }
    case 'tick':
      tickSnd(m, t0, v, p);
      break;
    case 'pop': {
      let ph = 0;
      m.put(t0, 0.12, (t) => { ph += (420 * p + 700 * p * Math.exp(-t / 0.015)) / SR; return Math.sin(TAU * ph) * Math.exp(-t / 0.03); }, v * 0.5, (p - 1.2) * 1.5, 0.2);
      break;
    }
    case 'glitch': {
      const steps = 9;
      for (let k = 0; k < steps; k++) {
        const f = 80 + rnd() * 1800, crush = 4 + Math.floor(rnd() * 12), on = rnd() > 0.25;
        if (!on) continue;
        let hold = 0, ph = 0;
        m.put(t0 + k * 0.028, 0.026, (t, i) => {
          ph += f / SR;
          if (i % crush === 0) hold = sq(ph) * 0.5 + noise() * 0.5;
          return hold;
        }, v * 0.32, rnd() * 1.4 - 0.7);
      }
      break;
    }
    case 'riser': {
      const hp = new Biquad();
      let ph = 0;
      m.put(t0, d, (t, i) => {
        const x = t / d;
        if (i % 16 === 0) hp.set('hp', 300 + 6000 * x * x, 0.9);
        ph += (180 + 900 * x * x) / SR;
        return (hp.run(noise()) * 0.8 + Math.sin(TAU * ph) * 0.25) * x * x;
      }, v * 0.6, 0, 0.3);
      break;
    }
    case 'thud': {
      let ph = 0;
      const lp = new Biquad().set('lp', 500, 0.7);
      m.put(t0, 0.9, (t) => {
        ph += (44 + 60 * Math.exp(-t / 0.04)) / SR;
        return Math.sin(TAU * ph) * Math.exp(-t / 0.22) + lp.run(noise()) * Math.exp(-t / 0.03) * 0.6;
      }, v * 0.9, 0, 0.55);
      break;
    }
    case 'beep':
      [0, 0.12].forEach((o) => m.put(t0 + o, 0.09, (t) => Math.sin(TAU * 988 * t) * Math.min(1, t / 0.004) * Math.min(1, (0.09 - t) / 0.01), v * 0.22, 0.2, 0.3));
      break;
    case 'chime': {
      const f = 660 * p;
      m.put(t0, 1.2, (t) => [1, 2.76, 5.4].reduce((s, h, k) => s + Math.sin(TAU * f * h * t) * Math.exp(-t / (0.5 / (k + 1))) / (k + 1.5), 0) * Math.min(1, t / 0.002), v * 0.4, 0, 0.5);
      break;
    }
    case 'buzz': {
      let ph1 = 0, ph2 = 0;
      const lp = new Biquad().set('lp', 2200, 0.9);
      m.put(t0, 0.7, (t) => {
        ph1 += 55 / SR; ph2 += 58.3 / SR;
        const raw = Math.tanh((saw(ph1) + saw(ph2)) * 2.5) + sq(t * (t < 0.2 ? 440 : 350)) * 0.25;
        return lp.run(raw) * Math.exp(-t / 0.3);
      }, v * 0.5, 0, 0.3);
      break;
    }
    case 'type': {
      for (let t = 0; t < d; t += 0.055 + rnd() * 0.03) sfx(m, {f: 0, s: 'key', v: v * (0.5 + rnd() * 0.4)}, t0 + t);
      break;
    }
    case 'swell': {
      const lp = new Biquad();
      m.put(t0, 0.7, (t, i) => {
        if (i % 16 === 0) lp.set('lp', 400 + 3000 * (t / 0.7), 0.8);
        return lp.run(noise()) * Math.sin(Math.PI * t / 0.7) * 0.8;
      }, v * 0.35, 0, 0.6);
      break;
    }
  }
};

/* ---------- reverb (Schroeder) ---------- */
const reverb = (x: Float32Array, n: number, off: number) => {
  const out = new Float32Array(n);
  const combs = [1557, 1617, 1491, 1422].map((d) => ({buf: new Float32Array(d + off), i: 0, fb: 0.8, lp: 0}));
  const aps = [225, 556].map((d) => ({buf: new Float32Array(d + off), i: 0}));
  for (let k = 0; k < n; k++) {
    let s = 0;
    for (const c of combs) {
      const y = c.buf[c.i];
      c.lp = y * 0.75 + c.lp * 0.25;
      c.buf[c.i] = x[k] + c.lp * c.fb;
      c.i = (c.i + 1) % c.buf.length;
      s += y;
    }
    s *= 0.25;
    for (const a of aps) {
      const b = a.buf[a.i];
      const y = -s + b;
      a.buf[a.i] = s + b * 0.5;
      a.i = (a.i + 1) % a.buf.length;
      s = y;
    }
    out[k] = s;
  }
  return out;
};

/* ---------- music ---------- */
const CHORDS = [
  {root: 45, notes: [57, 60, 64, 67]}, // Am7
  {root: 41, notes: [57, 60, 65, 69]}, // Fmaj7
  {root: 48, notes: [55, 60, 64, 67]}, // C
  {root: 43, notes: [55, 59, 62, 67]}, // G
];

const music = (m: Mix, shots: Shot[]) => {
  const secs = sections(shots);
  const firstDrop = secs.find((s) => s.music === 'drop');
  const grooveStart = firstDrop ? firstDrop.from + 30 : 0; // the reveal impact
  const at = (fr: number) => fr / FPS;
  const beatFrames = 15;
  const total = filmLength(shots);
  for (let b = 0; b * beatFrames < total; b++) {
    const fr = b * beatFrames;
    const sec = secs.find((s) => fr >= s.from && fr < s.to);
    if (!sec) continue;
    const t = at(fr);
    const kind = sec.music;
    const gb = Math.floor((fr - grooveStart) / beatFrames); // beats since the groove started
    const inBar = ((gb % 4) + 4) % 4;
    const chord = CHORDS[((Math.floor(gb / 4) % 4) + 4) % 4];
    if (kind === 'pulse' || kind === 'tension') {
      // clock and heartbeat under the pain
      tickSnd(m, t, 0.8, b % 2 ? 0.8 : 1);
      if (kind === 'tension') tickSnd(m, t + BEAT_S / 2, 0.35, 0.7);
      if (b % 4 === 0) { thump(m, t, 0.9); thump(m, t + 0.2, 0.6); }
      if (b % 8 === 0 || fr === sec.from) {
        const len = Math.min(4 * BEAT_S * 2, (sec.to - fr) / FPS + 0.3);
        m.put(t, len, (x) => (Math.sin(TAU * 55 * x) * 0.5 + Math.sin(TAU * 110.4 * x) * 0.18 + Math.sin(TAU * 164.8 * x) * 0.08) * Math.min(1, x / 0.3) * Math.min(1, (len - x) / 0.3), 0.5, 0, 0.3);
      }
    }
    if ((kind === 'drop' || kind === 'montage') && fr >= grooveStart) {
      kick(m, t, 0.95);
      if (inBar === 1 || inBar === 3) clap(m, t, 0.7);
      for (let s = 0; s < 4; s++) hat(m, t + (s * BEAT_S) / 4, false, s === 2 ? 0.8 : 0.45, s % 2 ? 0.3 : 0.2);
      hat(m, t + BEAT_S / 2, true, 0.35, -0.25);
      // bass: 8ths, octave on the off-beat
      bassNote(m, t, mtof(chord.root - 12 + 12), BEAT_S / 2 - 0.02, 0.9);
      bassNote(m, t + BEAT_S / 2, mtof(chord.root + (inBar === 3 ? 12 : 0)), BEAT_S / 2 - 0.02, 0.8);
      if (inBar === 0) padChord(m, t, chord.notes, 4 * BEAT_S + 0.1, 1, kind === 'montage' ? 1.8 : 1);
      // arp: 16ths over the chord, brighter in the montage
      const arp = [...chord.notes, chord.notes[1] + 12];
      for (let s = 0; s < 4; s++) {
        const n = arp[(gb * 4 + s) % arp.length] + 12;
        pluck(m, t + (s * BEAT_S) / 4, n, kind === 'montage' ? 1.25 : 0.7, s % 2 ? 0.4 : -0.4);
      }
      if (fr === grooveStart || (fr === sec.from && kind === 'montage')) {
        // crash
        const hp = new Biquad().set('hp', 3500, 0.7);
        m.put(t, 2.4, (x) => hp.run(noise()) * Math.exp(-x / 0.7), 0.5, 0, 0.4);
      }
    }
    if (kind === 'break') {
      if (inBar === 0 || fr === sec.from) padChord(m, t, chord.notes, 4 * BEAT_S + 0.1, 1.3, 0.8);
      if (inBar === 0) kick(m, t, 0.5);
      if (b % 2 === 0) pluck(m, t, chord.notes[(b / 2) % 4] + 12, 0.6, 0);
    }
    if (kind === 'outro' && fr === sec.from) {
      padChord(m, t, [57, 60, 64, 67, 71], (sec.to - fr) / FPS + 1.5, 1.6, 1.1);
      bassNote(m, t, mtof(33), 2.5, 0.8);
      [0, 1, 2, 3, 4, 5, 6, 7].forEach((k) => pluck(m, t + 0.5 + k * 0.25, [69, 72, 76, 79, 81, 79, 76, 72][k], 0.5 * (1 - k / 10), k % 2 ? 0.4 : -0.4));
    }
  }
};

/* ---------- render ---------- */
const render = (shots: Shot[], V: boolean, file: string) => {
  seed = 7;
  const tail = 0.5;
  const dur = filmLength(shots) / FPS;
  const n = Math.round((dur + tail) * SR);
  const m = new Mix(n);
  music(m, shots);
  for (const c of cues(shots, V)) sfx(m, c, c.f / FPS);
  const wetL = reverb(m.wet.L, n, 0), wetR = reverb(m.wet.R, n, 23);
  const outN = Math.round(dur * SR);
  const L = new Float32Array(outN), R = new Float32Array(outN);
  let peak = 0;
  for (let k = 0; k < outN; k++) {
    // gentle bus saturation
    L[k] = Math.tanh((m.dry.L[k] + wetL[k] * 0.9) * 0.6);
    R[k] = Math.tanh((m.dry.R[k] + wetR[k] * 0.9) * 0.6);
    peak = Math.max(peak, Math.abs(L[k]), Math.abs(R[k]));
  }
  const fadeOut = Math.round(0.6 * SR);
  const target = Math.pow(10, -2.5 / 20) / peak;
  const buf = Buffer.alloc(44 + outN * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + outN * 4, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(outN * 4, 40);
  for (let k = 0; k < outN; k++) {
    const f = k > outN - fadeOut ? (outN - k) / fadeOut : 1;
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[k] * target * f)) * 32767), 44 + k * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[k] * target * f)) * 32767), 46 + k * 4);
  }
  writeFileSync(file, buf);
  console.log(`${file}: ${dur.toFixed(2)} s, peak before normalize ${peak.toFixed(3)}`);
};

const out = new URL('../public/audio/', import.meta.url).pathname;
mkdirSync(out, {recursive: true});
render(PROMO, false, out + 'promo.wav');
render(VERTICAL, true, out + 'vertical.wav');
