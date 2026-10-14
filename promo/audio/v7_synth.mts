/*
 * v7 soundtrack: the v4 music track re-edited to the v7 timeline (src/v7/timeline7.ts) plus synthesised UI/foley SFX
 * and a room-tone layer. Run: node audio/v7_synth.mts  (Node >= 22.18, ffmpeg on PATH)  -> public/audio/v7.wav
 * Everything is synthesised (no samples); the music file is public/music-suno-v2-4.wav (gitignored, never committed).
 *
 * Layers: music (editTrack, with a night dip and a morning return) -> ducked by UI sounds; accents (impact, boom, sub,
 * lid ...) are not ducking; room tone (day / night) is a separate very quiet bus; mastered to -14 LUFS, TP -1.5.
 */
import {mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {FPS, MUSIC_FILE} from '../src/timeline.ts';
import {LEN7, MUSIC7, NIGHT_MUSIC, cues7, ROOM7, FPB, type Sfx7} from '../src/v7/timeline7.ts';
import {
  SR, TAU, setSeed, rnd, noise, bus, Mix, Biquad, sfx, reverb, filmT, srcT, decode, place, writeWav, ACCENTS, master, type Cue, type Bus,
} from './synth.mts';

const ACC7 = new Set<string>([...ACCENTS, 'sub', 'lid', 'birds']);
const ROOM = new Set<string>(['room', 'roomNight']);

/* ---------- new v7 SFX ---------- */
const sfx7 = (m: Mix, c: Cue, t0: number) => {
  const v = c.v ?? 1, p = c.p ?? 1, d = (c.d ?? 8) / FPS;
  switch (c.s as Sfx7) {
    case 'lid': {
      // soft hinge friction (band-passed noise, slowly sweeping, rough amplitude) + for closing a low thump at the end
      const opening = p > 1;
      const len = opening ? 0.6 : 0.5;
      const bp = new Biquad();
      let wob = 0;
      m.put(t0 - (opening ? 0 : len * 0.8), len, (t, i) => {
        const x = t / len;
        if (i % 16 === 0) bp.set('bp', 700 + 500 * x, 1.4);
        wob += (noise() - wob) * 0.003;
        const a = Math.sin(Math.PI * x) * (0.7 + 6 * wob);
        return bp.run(noise()) * a * 0.9;
      }, v * (opening ? 0.2 : 0.3), -0.1, 0.25);
      if (!opening) {
        let ph = 0;
        m.put(t0, 0.5, (t) => { ph += (70 - 20 * Math.min(1, t / 0.1)) / SR; return Math.sin(TAU * ph) * Math.exp(-t / 0.09) * Math.min(1, t / 0.003); }, v * 0.55, 0, 0.3);
      }
      break;
    }
    case 'latch': {
      // magnetic close: short, dull click
      const lp = new Biquad().set('lp', 1600, 0.8);
      let ph = 0;
      m.put(t0, 0.07, (t) => { ph += 240 / SR; return (lp.run(noise()) * Math.exp(-t / 0.004) * 0.9 + Math.sin(TAU * ph) * Math.exp(-t / 0.014)) * Math.min(1, t / 0.0008); }, v * 0.5, 0.05, 0.1);
      break;
    }
    case 'sub': {
      // sub-bass hit: sine dropping 62 -> 42 Hz, ~1 s
      let ph = 0;
      m.put(t0, 1.1, (t) => {
        ph += (42 + 20 * Math.exp(-t / 0.08)) / SR;
        return (Math.sin(TAU * ph) + Math.sin(TAU * ph * 2) * 0.12 * Math.exp(-t / 0.1)) * Math.min(1, t / 0.006) * Math.exp(-t / 0.38) * Math.min(1, (1.1 - t) / 0.15);
      }, v * 0.9, 0, 0.08);
      break;
    }
    case 'keyclick': {
      // a real laptop key: short travel click, brighter than 'key'
      const bp = new Biquad().set('bp', 3600, 1.3), lp = new Biquad().set('lp', 900, 0.8);
      let ph = 0, ph2 = 0;
      m.put(t0, 0.07, (t) => {
        ph += 1900 / SR; ph2 += 210 / SR;
        const top = bp.run(noise()) * Math.exp(-t / 0.004) * 1.5 + Math.sin(TAU * ph) * Math.exp(-t / 0.003) * 0.5;
        const bot = (t > 0.022 ? 1 : 0) * (lp.run(noise()) * 0.5 + Math.sin(TAU * ph2)) * Math.exp(-(t - 0.022) / 0.012) * 0.4; // bottom-out
        return top + bot;
      }, v * 0.5, -0.05, 0.1);
      break;
    }
    case 'roomNight': {
      // dark filtered noise + a faint low hum, 0.3 s fades centred on the start/end of the window
      const lp = new Biquad().set('lp', 380, 0.7), lp2 = new Biquad().set('lp', 380, 0.7);
      const len = d + 0.3, fade = 0.3;
      const fn = (hum: number) => (t: number, nz: number) => {
        const a = Math.min(1, t / fade) * Math.min(1, (len - t) / fade);
        return (nz * 3.2 + (Math.sin(TAU * 50 * t) * 0.35 + Math.sin(TAU * 100 * t) * 0.12) * hum) * a;
      };
      const fl = fn(1), fr = fn(0.8);
      // two independent channels via two puts, hard-panned
      m.put(t0 - 0.15, len, (t) => fl(t, lp.run(noise())), v * 0.00375, -1);
      m.put(t0 - 0.15, len, (t) => fr(t, lp2.run(noise())), v * 0.00375, 1);
      break;
    }
    case 'birds': {
      // dawn: three soft chirps (two-note trills), quiet
      const chirps = [{o: 0.05, f: 3300, n: 2}, {o: 0.42 * d, f: 3900, n: 3}, {o: 0.78 * d, f: 3050, n: 2}];
      for (const ch of chirps) {
        for (let k = 0; k < ch.n; k++) {
          const f0 = ch.f * (1 + k * 0.08), pan = (ch.f - 3400) / 1200;
          let ph = 0;
          m.put(t0 + ch.o + k * 0.095, 0.07, (t) => {
            ph += (f0 * (1 + 0.45 * (t / 0.07)) * (1 + 0.02 * Math.sin(TAU * 38 * t))) / SR;
            return Math.sin(TAU * ph) * Math.sin(Math.PI * t / 0.07);
          }, v * 0.07, pan, 0.45);
        }
      }
      break;
    }
    case 'room':
      break;
    default:
      sfx(m, c, t0);
  }
};

/* ---------- day room tone: soft pink-ish noise, low-passed ~1.5 kHz ---------- */
const dayTone = (n: number) => {
  const out = bus(n);
  for (const ch of [out.L, out.R]) {
    let b0 = 0, b1 = 0, b2 = 0;
    const lp = new Biquad().set('lp', 1500, 0.7);
    for (let k = 0; k < n; k++) {
      const w = noise();
      b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; // Paul Kellet pink
      ch[k] = lp.run(b0 + b1 + b2 + w * 0.1848);
    }
  }
  // scale to -45 dBFS rms
  let s = 0;
  for (let k = 0; k < n; k++) s += out.L[k] * out.L[k] + out.R[k] * out.R[k];
  const g = Math.pow(10, -45 / 20) / Math.sqrt(s / (2 * n));
  for (let k = 0; k < n; k++) { out.L[k] *= g; out.R[k] *= g; }
  return out;
};

/** 1 outside [a, b] seconds, `lo` inside, with `fade`-second raised-cosine edges centred on a and b. */
const dip = (t: number, a: number, b: number, lo: number, fade: number) => {
  const sm = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, x)));
  const into = sm((t - (a - fade / 2)) / fade), outof = sm((t - (b - fade / 2)) / fade);
  return 1 - (1 - lo) * (into - outof);
};

/** Locate the source attack in atempo's output; WSOLA can shift it by several milliseconds. */
const alignAttack = (clip: Bus, track: Bus, source: number, expected: number) => {
  const src = Math.round(source * SR), guess = Math.round(expected * SR);
  if (src < 0) return expected;
  const width = Math.round(0.03 * SR), search = Math.round(0.04 * SR);
  let best = -Infinity, found = guess;
  for (let offset = Math.max(0, guess - search); offset <= Math.min(clip.L.length - width, guess + search); offset += 4) {
    let xy = 0, xx = 0, yy = 0;
    for (let k = 0; k < width && src + k < track.L.length; k += 4) {
      const x = track.L[src + k] + track.R[src + k], y = clip.L[offset + k] + clip.R[offset + k];
      xy += x * y; xx += x * x; yy += y * y;
    }
    const score = xy / Math.sqrt(Math.max(1e-20, xx * yy));
    if (score > best) { best = score; found = offset; }
  }
  if (best < 0.7) throw new Error(`Unable to align source attack ${source}: correlation ${best}`);
  return found / SR;
};

/** v7 uses measured source attacks and endpoint rates; atempo preserves the track's pitch. */
const editMusic7 = (dst: Bus, track: Bus) => {
  const raw = Buffer.alloc(track.L.length * 8);
  for (let k = 0; k < track.L.length; k++) {
    raw.writeFloatLE(track.L[k], k * 8); raw.writeFloatLE(track.R[k], k * 8 + 4);
  }
  const pts: string[] = [];
  MUSIC7.forEach((s, i) => {
    const rate = s.rate ?? 1;
    const joinedIn = MUSIC7[i - 1]?.to === s.from, joinedOut = MUSIC7[i + 1]?.from === s.to;
    let t0 = filmT(s.from), s0 = srcT(s.src);
    const t1 = filmT(s.to);
    if (s.from === 0) { s0 -= t0 * rate; t0 = 0; }
    // Leave source context for the tempo filter, then trim back to the measured attack.
    const handle = Math.max(0, Math.min(0.25, s0 / rate));
    const start = Math.max(0, s0 - handle * rate);
    const finish = Math.min(track.L.length / SR, s0 + (t1 - t0 + 0.25) * rate);
    const filtered = execFileSync('ffmpeg', [
      '-v', 'error', '-f', 'f32le', '-ar', String(SR), '-ac', '2', '-i', 'pipe:0',
      '-af', `atempo=${rate}`,
      '-f', 'f32le', '-ac', '2', '-ar', String(SR), 'pipe:1',
    ], {input: raw.subarray(Math.round(start * SR) * 8, Math.round(finish * SR) * 8), maxBuffer: 1 << 28});
    const clip = bus(filtered.length / 8);
    for (let k = 0; k < clip.L.length; k++) {
      clip.L[k] = filtered.readFloatLE(k * 8); clip.R[k] = filtered.readFloatLE(k * 8 + 4);
    }
    // One 40 ms complementary raised-cosine overlap, centred on the measured downbeats.
    const xf = 0.04, pre = joinedIn ? xf / 2 : 0, post = joinedOut ? xf / 2 : 0;
    const fi = s.from === 0 ? 0.08 : joinedIn ? xf : 0.002;
    const fo = joinedOut ? xf : 0.002;
    const expected = (s0 - start) / rate;
    const aligned = alignAttack(clip, track, s0, expected);
    place(dst, clip, t0 - pre, aligned - pre, t1 - t0 + pre + post, fi, fo);
    pts.push(`film ${s.from}-${s.to} <- track ${s.src.toFixed(6)}, rate ${rate.toFixed(9)}, atempo attack correction ${((aligned - expected) * 1000).toFixed(2)} ms`);
  });
  return pts;
};

/* ---------- render ---------- */
const render = (file: string) => {
  setSeed(7);
  const dur = LEN7 / FPS, n = Math.round(dur * SR);
  const beatS = FPB / FPS;
  const sfxMix = new Mix(n), accent = new Mix(n), room = new Mix(n);

  // Measured v7 edit, then the night dip (-4 dB, 0.5 beat fade-in) and morning return (0.25 beat)
  const mus = bus(n);
  const track = decode(new URL(`../public/${MUSIC_FILE7}`, import.meta.url).pathname);
  if (!track) throw new Error(`music file public/${MUSIC_FILE7} is missing`);
  const edit = editMusic7(mus, track);
  if (process.env.V7_MUSIC_AUDIT) writeWav(process.env.V7_MUSIC_AUDIT, mus.L, mus.R);
  // Under the lid: a resonant-free low-pass sweeps down on the latch (60 ms), holds, and opens over one beat as the lid
  // swings open. No make-up gain: under the lid the track sits a little lower, never silent.
  {
    const tS = filmT(NIGHT_MUSIC.shut), tO = filmT(NIGHT_MUSIC.open), tE = tO + beatS, HI = 20000, LO = 650;
    const fc = (t: number) => t < tS ? HI : t < tS + 0.06 ? HI * Math.pow(LO / HI, (t - tS) / 0.06)
      : t < tO ? LO : t < tE ? LO * Math.pow(HI / LO, ((t - tO) / beatS) ** 1.6) : HI;
    const k0 = Math.max(0, Math.round((tS - 0.05) * SR)), k1 = Math.min(n, Math.round((tE + 0.05) * SR));
    const st = [[0, 0, 0, 0], [0, 0, 0, 0]];
    let b0 = 1, b1 = 0, b2 = 0, a1 = 0, a2 = 0;
    const fadeK = Math.round(0.01 * SR);
    for (let k = k0; k < k1; k++) {
      const t = k / SR;
      if ((k - k0) % 32 === 0) {
        const w = 2 * Math.PI * Math.min(fc(t), 0.45 * SR) / SR, al = Math.sin(w) / (2 * Math.SQRT1_2), c = Math.cos(w), a0 = 1 + al;
        b0 = (1 - c) / 2 / a0; b1 = (1 - c) / a0; b2 = b0; a1 = -2 * c / a0; a2 = (1 - al) / a0;
      }
      const gain = 1;
      const edge = Math.min(1, (k - k0) / fadeK, (k1 - 1 - k) / fadeK);  // 10 ms crossfades from and back to the dry track
      for (const [ch, x] of [[0, mus.L], [1, mus.R]] as const) {
        const z = st[ch], v = x[k];
        const y = b0 * v + b1 * z[0] + b2 * z[1] - a1 * z[2] - a2 * z[3];
        z[1] = z[0]; z[0] = v; z[3] = z[2]; z[2] = y;
        x[k] = v + (y * gain - v) * edge;
      }
    }
  }

  // sfx
  for (const c of cues7()) {
    const dst = ROOM.has(c.s) ? room : ACC7.has(c.s) ? accent : sfxMix;
    sfx7(dst, c as Cue, c.f / FPS);
  }

  // day room tone with its holes: "You." (121..150), the silence before the night, the night itself
  const day = dayTone(n);
  const youA = 121 / FPS, youB = 150 / FPS;
  const silA = ROOM7.silenceFrom / FPS, silB = ROOM7.silenceTo / FPS, niA = ROOM7.nightFrom / FPS, niB = ROOM7.nightTo / FPS;
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    // 'you' hole: gone before 121, back after 150 (short fades placed outside the window)
    const you = dip(t, youA - 0.04, youB + 0.04, 0, 0.08);
    const g = you * dip(t, silA, silB, 0.12, 0.3) * dip(t, niA, niB, 0, 0.3);
    room.dry.L[k] += day.L[k] * g; room.dry.R[k] += day.R[k] * g;
  }

  // wet buses and soft-clip, exactly like v4
  const wetL = reverb(sfxMix.wet.L, n, 0), wetR = reverb(sfxMix.wet.R, n, 23);
  const aWL = reverb(accent.wet.L, n, 0), aWR = reverb(accent.wet.R, n, 23);
  const sL = new Float32Array(n), sR = new Float32Array(n), aL = new Float32Array(n), aR = new Float32Array(n);
  for (let k = 0; k < n; k++) {
    sL[k] = Math.tanh((sfxMix.dry.L[k] + wetL[k] * 0.9) * 0.6); sR[k] = Math.tanh((sfxMix.dry.R[k] + wetR[k] * 0.9) * 0.6);
    aL[k] = Math.tanh((accent.dry.L[k] + aWL[k] * 0.9) * 0.6); aR[k] = Math.tanh((accent.dry.R[k] + aWR[k] * 0.9) * 0.6);
  }
  // "You." is a real dead stop: reverb tails of the last cues are cut with a 30 ms fade into frame 121 and stay off until 150
  {
    const k0 = Math.round((121 / FPS - 0.03) * SR), k1 = Math.round(121 / FPS * SR), k2 = Math.round(150 / FPS * SR);
    for (let k = k0; k < k2; k++) {
      const g = k < k1 ? 0.5 + 0.5 * Math.cos(Math.PI * (k - k0) / (k1 - k0)) : 0;
      sL[k] *= g; sR[k] *= g; aL[k] *= g; aR[k] *= g;
    }
  }
  // duck: follow the SFX level (5 ms attack, 180 ms release), pull the music down up to 6 dB
  const att = Math.exp(-1 / (0.005 * SR)), rel = Math.exp(-1 / (0.18 * SR));
  let e = 0;
  const L = new Float32Array(n), R = new Float32Array(n);
  const MUS = 0.85, SFX = 0.75;
  const fadeN = Math.round(0.5 * SR);
  for (let k = 0; k < n; k++) {
    const x = Math.max(Math.abs(sL[k]), Math.abs(sR[k]));
    e = x > e ? att * e + (1 - att) * x : rel * e + (1 - rel) * x;
    const duck = 1 - 0.5 * Math.min(1, e / 0.25);
    const end = k > n - fadeN ? (n - k) / fadeN : 1;
    L[k] = (mus.L[k] * MUS * duck + (sL[k] + aL[k] * 0.8) * SFX + room.dry.L[k]) * end;
    R[k] = (mus.R[k] * MUS * duck + (sR[k] + aR[k] * 0.8) * SFX + room.dry.R[k]) * end;
  }
  const tmp = file.replace(/\.wav$/, '.raw.wav');
  writeWav(tmp, L, R);
  const m2 = master(tmp, file, true);
  console.log(`${file}: ${dur.toFixed(2)} s · ${m2.input_i} LUFS · TP ${m2.input_tp} dBTP · LRA ${m2.input_lra}`);
  console.log(`  music edit (the track plays to its own ending):\n  ` + edit.join('\n  '));
};

const MUSIC_FILE7 = MUSIC_FILE;
void rnd;
const out = new URL('../public/audio/', import.meta.url).pathname;
mkdirSync(out, {recursive: true});
render(out + 'v7.wav');
