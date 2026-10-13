/* v5 style probes for the owner, 0-17 s (frames 0-510): beats 1-7 at final timing in two directions.
 *   A "Punch": full-frame kinetic type, cuts on every beat, crash zooms, flashes, hit shake.
 *   B "Thriller": the same cut seen through a surveillance monitor: HUD, target lock on `you`, glitch type.
 * Both break the visual bible's "three behaviours" rule on purpose: the owner asked for more energy. */
import React from 'react';
import {AbsoluteFill, Audio, random, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {loadFonts} from '../fonts';
import {Combo} from '../lib';
import {AskBeat} from './Ask';
import {Dramatisation, P, Plate, T, clamp01, lerp, span, travel} from './common';
import {TopList, youCell} from './Top';

loadFonts();

export const PROTO_LEN = 510;
export type V = 'A' | 'B';

/* ---------- film devices ---------- */
const HITS: Record<V, {f: number; a: number}[]> = {
  A: [{f: 15, a: 10}, {f: 22, a: 14}, {f: 30, a: 18}, {f: 37, a: 24}, {f: 150, a: 26}, {f: 160, a: 10}, {f: 175, a: 10}, {f: 190, a: 14}, {f: 205, a: 10}, {f: 220, a: 16},
    {f: 390, a: 34}, {f: 420, a: 10}, {f: 450, a: 22}, {f: 462, a: 10}, {f: 480, a: 22}, {f: 492, a: 12}],
  B: [{f: 15, a: 6}, {f: 22, a: 8}, {f: 30, a: 10}, {f: 37, a: 14}, {f: 150, a: 22}, {f: 160, a: 8}, {f: 175, a: 8}, {f: 190, a: 12}, {f: 205, a: 8}, {f: 220, a: 12},
    {f: 390, a: 30}, {f: 420, a: 8}, {f: 450, a: 18}, {f: 462, a: 8}, {f: 480, a: 18}, {f: 492, a: 10}],
};
/** Decaying shake after each hit; B adds a constant handheld drift. */
const shake = (f: number, v: V) => shakeFrom(HITS[v], f, v === 'B');
export const shakeFrom = (hits: {f: number; a: number}[], f: number, drift: boolean) => {
  let x = 0, y = 0, r = 0;
  for (const h of hits) {
    const t = f - h.f;
    if (t < 0 || t > 10) continue;
    const k = h.a * Math.exp(-t / 3);
    x += (random(`sx${h.f}-${t}`) - 0.5) * 2 * k;
    y += (random(`sy${h.f}-${t}`) - 0.5) * 2 * k;
    r += (random(`sr${h.f}-${t}`) - 0.5) * 0.5 * (k / 20);
  }
  if (drift) {
    x += Math.sin(f / 23) * 5 + Math.sin(f / 9.3) * 2;
    y += Math.cos(f / 29) * 4 + Math.sin(f / 7.1) * 1.5;
  }
  return {x, y, r};
};
export const Flash: React.FC<{f: number; at: number; color?: string; len?: number; peak?: number}> = ({f, at, color = '#fff', len = 5, peak = 0.9}) => {
  if (f < at || f >= at + len) return null;
  return <AbsoluteFill style={{background: color, opacity: peak * (1 - (f - at) / len), mixBlendMode: 'screen'}} />;
};
/** Word that slams in: 1.18 -> 1 scale in 4 frames, on in 1. */
export const slam = (f: number, at: number) => {
  const t = clamp01((f - at) / 4);
  return {opacity: f >= at ? 1 : 0, transform: `scale(${lerp(1.18, 1, travel(t))})`};
};
/** RGB split for B's glitch frames. */
export const glitch = (f: number, at: number, n = 3) => (f >= at && f < at + n ? `drop-shadow(${8 - (f - at) * 3}px 0 0 rgba(255,40,40,0.9)) drop-shadow(${-(8 - (f - at) * 3)}px 0 0 rgba(40,220,255,0.9))` : undefined);

export const G: React.FC<{size: number; children: React.ReactNode; color?: string; style?: React.CSSProperties; mono?: boolean; weight?: number}> = ({size, children, color = P.text, style, mono, weight}) => (
  <div style={{fontFamily: mono ? T.mono : T.display, fontWeight: weight ?? (mono ? 600 : 700), fontSize: size, letterSpacing: mono ? 0 : -size * 0.035, lineHeight: 0.95, color, whiteSpace: 'pre', ...style}}>{children}</div>
);

/* ---------- 1-3 (0-150): the list, the lock, the accusation ---------- */
const SORT = 15;
const ZOOMS = [{f: 22, k: 2.0}, {f: 30, k: 3.6}, {f: 37, k: 7.0}];
export const Hook: React.FC<{f: number; v: V}> = ({f, v}) => {
  if (f < 45) {
    // crash zoom in three steps on the eighths into the `you` cell; each step travels over 3 frames
    let k = lerp(1, 1.06, f / 22), s = 0;
    for (let i = 0; i < ZOOMS.length; i++) {
      const z = ZOOMS[i];
      if (f >= z.f) {
        const t = travel(clamp01((f - z.f) / 3));
        const prev = i === 0 ? 1.06 : ZOOMS[i - 1].k;
        k = lerp(prev, z.k, t) * (1 + (f - z.f) * 0.004);
        s = lerp(i / ZOOMS.length, (i + 1) / ZOOMS.length, t);
      }
    }
    const c = youCell();
    const sx = lerp(c.x, 960, s), sy = lerp(c.y, 540, s);
    const locked = f >= SORT + 2;
    return (
      <AbsoluteFill style={{background: P.ground, overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${sx - c.x * k}px, ${sy - c.y * k}px) scale(${k})`}}>
          <TopList f={f} sortAt={SORT} snap={3} />
        </div>
        {v === 'B' && locked && <Lock f={f} map={(x, y) => ({x: sx + (x - c.x) * k, y: sy + (y - c.y) * k})} k={k} />}
        <Flash f={f} at={SORT} color={P.amber} len={4} peak={0.35} />
      </AbsoluteFill>
    );
  }
  if (f < 90) {
    const words = ['The', 'slowest', 'process', 'on', 'your', 'Mac'];
    const i = Math.min(5, Math.floor((f - 45) / 7.5));
    const at = Math.round(45 + i * 7.5);
    const w = words[i];
    const size = Math.min(v === 'A' ? 420 : 300, (v === 'A' ? 1700 : 1650) / (w.length * (v === 'A' ? 0.52 : 0.6)));
    const amber = w === 'slowest';
    return (
      <AbsoluteFill style={{background: v === 'A' && amber ? P.amber : P.ground, alignItems: 'center', justifyContent: 'center'}}>
        <div style={{...slam(f, at), filter: v === 'B' ? glitch(f, at, 3) : undefined}}>
          <G size={size} mono={v === 'B'} color={v === 'A' && amber ? P.ground : amber ? P.amber : P.text}>{v === 'B' ? w.toUpperCase() : w}</G>
        </div>
      </AbsoluteFill>
    );
  }
  if (f < 120) {
    // the sentence assembled, pushed hard, the riser builds into the cut
    const p = (f - 90) / 30;
    const k = lerp(1, 1.16, p * p);
    const jit = p * p * 6;
    return (
      <AbsoluteFill style={{background: P.ground, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 96, top: 320, transformOrigin: '0% 50%', transform: `scale(${k}) translate(${(random(`j${f}`) - 0.5) * jit}px, ${(random(`k${f}`) - 0.5) * jit}px)`}}>
          <G size={v === 'A' ? 168 : 132} mono={v === 'B'}>{v === 'A' ? 'The slowest process\non your Mac' : 'THE SLOWEST PROCESS\nON YOUR MAC'}</G>
        </div>
      </AbsoluteFill>
    );
  }
  // 4.0-5.0: silence. Nothing moves.
  return (
    <AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
      <G size={v === 'A' ? 360 : 300} style={{filter: v === 'B' ? glitch(f, 120, 2) : undefined}}>
        is you<span style={{color: P.amber}}>.</span>
      </G>
    </AbsoluteFill>
  );
};

/** B: the target box locks on the hero row, then on `you`. Drawn in screen space so it stays sharp through the zoom. */
const Lock: React.FC<{f: number; k: number; map: (x: number, y: number) => {x: number; y: number}}> = ({f, k, map}) => {
  const onYou = f >= 26;
  const c = youCell();
  const settle = 1 + 0.3 * Math.exp(-(f - (onYou ? 26 : 17)) / 2.5);
  const W = (onYou ? 120 : 1420) * k * settle, H = 56 * k * settle;
  const m = onYou ? map(c.x, c.y) : map(960, c.y);
  const cx = m.x, cy = m.y;
  const label = onYou ? 'CAUSE OF DELAY' : 'TARGET 4127 · BLOCKED 20:14';
  const blink = Math.floor(f / 4) % 2 === 0;
  const L = 34;
  const corner = (sx: number, sy: number) => ({position: 'absolute' as const, width: L, height: L, borderColor: P.red, borderStyle: 'solid', borderWidth: `${sy < 0 ? 5 : 0}px ${sx > 0 ? 5 : 0}px ${sy > 0 ? 5 : 0}px ${sx < 0 ? 5 : 0}px`,
    left: sx < 0 ? 0 : undefined, right: sx > 0 ? 0 : undefined, top: sy < 0 ? 0 : undefined, bottom: sy > 0 ? 0 : undefined});
  return (
    <div style={{position: 'absolute', left: cx - W / 2, top: cy - H / 2, width: W, height: H}}>
      <div style={corner(-1, -1)} /><div style={corner(1, -1)} /><div style={corner(-1, 1)} /><div style={corner(1, 1)} />
      <div style={{position: 'absolute', left: 0, top: -54, fontFamily: T.mono, fontSize: 32, fontWeight: 700, color: P.red, background: 'rgba(0,0,0,0.7)', padding: '2px 8px', opacity: blink || f > 40 ? 1 : 0.4, whiteSpace: 'pre'}}>{label}</div>
    </div>
  );
};

/* ---------- 4 (150-270): reveal plate, ramped; the states slam over it; the name ---------- */
const STATES = [
  {at: 160, w: 'working', c: P.green},
  {at: 175, w: 'waiting for you', c: P.amber},
  {at: 190, w: 'stuck', c: P.red},
  {at: 205, w: 'done', c: '#B8B8C0'},
];
export const Reveal: React.FC<{f: number; v: V}> = ({f, v}) => {
  const lf = f - 150;
  const pf = 89 * (1 - Math.pow(1 - clamp01(lf / 120), 2.2));
  const st = [...STATES].reverse().find((s) => f >= s.at && f < 220);
  const name = f >= 220;
  const push = lerp(1.0, 1.1, clamp01(lf / 120));
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${push})`}}>
        <Plate shot="reveal" frame={pf} />
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(0,0,0,0.85), rgba(0,0,0,0) 55%)'}} />
      {st && (
        <div style={{position: 'absolute', left: 96, bottom: 110, transformOrigin: '0 100%', ...slam(f, st.at), filter: v === 'B' ? glitch(f, st.at, 2) : undefined}}>
          <G size={st.w.length > 8 ? 190 : 260} color={st.c} mono={v === 'B'}>{v === 'B' ? st.w.toUpperCase() : st.w}</G>
        </div>
      )}
      {name && (
        <div style={{position: 'absolute', left: 96, bottom: 110}}>
          <div style={slam(f, 220)}><G size={230}>Agent Notch</G></div>
          <div style={{marginTop: 26, opacity: span(f, 228, 236), fontFamily: T.body, fontSize: 28, fontWeight: 500, color: P.text}}>Every agent. Every project. Beside the notch.</div>
        </div>
      )}
      <Flash f={f} at={150} len={6} />
    </AbsoluteFill>
  );
};

/* ---------- 5 (270-390): the dive, the request, the clock running ---------- */
export const Ask: React.FC<{f: number; v: V}> = ({f, v}) => {
  const push = lerp(1, 1.14, span(f, 318, 392, (t) => t * t * (3 - 2 * t)));
  // the clock runs fast: one second every 7.5 frames, on the sixteenths
  const secs = 14 + Math.max(0, Math.floor((f - 316) / 7.5));
  const t = `20:${String(secs).padStart(2, '0')}`;
  const tick = (f - 316) % 7.5 < 1.5 && f >= 316;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '40% 46%', transform: `scale(${push})`}}>
        <AskBeat f={f} />
      </div>
      {f >= 316 && <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.8) 12%, rgba(0,0,0,0) 21%)', opacity: span(f, 316, 322)}} />}
      {f >= 316 && (
        <div style={{position: 'absolute', left: 80, bottom: 50, display: 'flex', alignItems: 'baseline', gap: 28}}>
          <G size={170} mono color={P.amber} style={{opacity: tick ? 1 : 0.88, textShadow: `0 0 40px rgba(255,176,31,0.35)`}}>{t}</G>
          <div style={{fontFamily: T.mono, fontSize: 26, fontWeight: 600, color: P.amber, lineHeight: 1.4}}>{v === 'B' ? 'BLOCKED BY:\nYOU' : 'waiting\non you'}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ---------- 6 (390-420): the drop: green, 2 seconds ---------- */
export const Drop: React.FC<{f: number; v: V}> = ({f, v}) => {
  const lines = Array.from({length: 22}, (_, i) => `✓ ${['compresses 4K to 720p', 'keeps aspect ratio', 'skips files under 8 MB', 'falls back without WebCodecs', 'reports progress', 'cancels cleanly', 'retries on 503'][i % 7]}`);
  const scroll = (f - 390) * 26;
  const strike = span(f, 404, 410);
  return (
    <AbsoluteFill style={{background: P.ground, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 1240, top: 1080 - scroll, fontFamily: T.mono, fontSize: 34, lineHeight: 1.5, color: P.green, opacity: 0.4, whiteSpace: 'pre'}}>{lines.join('\n')}</div>
      <div style={{position: 'absolute', left: 96, top: 250}}>
        <div style={slam(f, 391)}><G size={250} mono={v === 'B'}>{v === 'B' ? '2 SECONDS.' : '2 seconds.'}</G></div>
        <div style={{position: 'relative', marginTop: 40, display: 'inline-block', opacity: f >= 398 ? 1 : 0}}>
          <G size={130} color={P.dim} mono={v === 'B'}>{v === 'B' ? 'NOT 20 MINUTES.' : 'Not 20 minutes.'}</G>
          <div style={{position: 'absolute', left: -10, top: '52%', height: 12, width: `calc(${strike * 100}% + 20px)`, background: P.red}} />
        </div>
      </div>
      <Flash f={f} at={390} color={P.green} len={7} peak={0.95} />
    </AbsoluteFill>
  );
};

/* ---------- 7 (420-510): two requests, two hotkeys, no mouse ---------- */
const Card: React.FC<{title: string; cmd: string; ok: boolean; n: number}> = ({title, cmd, ok, n}) => (
  <div style={{width: 1240, padding: '44px 56px', boxSizing: 'border-box', borderRadius: 36, background: ok ? 'rgba(48,209,89,0.16)' : '#1A1712', border: `3px solid ${ok ? P.green : P.amber}`, boxShadow: `0 0 80px ${ok ? 'rgba(48,209,89,0.25)' : 'rgba(255,176,31,0.18)'}`}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: T.mono, fontSize: 28, fontWeight: 600, color: ok ? P.green : P.amber, letterSpacing: 2}}>
      <span>REQUEST {n}</span><span>{ok ? 'ALLOWED' : 'WAITING ON YOU'}</span>
    </div>
    <div style={{fontFamily: T.body, fontSize: 40, fontWeight: 600, color: P.text, marginTop: 22}}>{title}</div>
    <div style={{fontFamily: T.mono, fontSize: 64, fontWeight: 600, color: P.text, marginTop: 10}}>{cmd}</div>
  </div>
);
export const Keys: React.FC<{f: number; v: V}> = ({f, v}) => {
  const second = f >= 462;
  const at = second ? 462 : 420;
  const key = second ? 480 : 450;
  const whip = second ? 1 - travel(clamp01((f - 462) / 6)) : 1 - travel(clamp01((f - 420) / 5));
  const showKeys = f >= key - 8 && f < key + 10;
  const end = f >= 492;
  if (end)
    return (
      <AbsoluteFill style={{background: P.ground, alignItems: 'flex-start', justifyContent: 'center', paddingLeft: 96}}>
        <div style={slam(f, 492)}><G size={170} mono={v === 'B'}>{v === 'B' ? 'NO MOUSE.\nNO WINDOW.' : 'No mouse.\nNo window.'}</G></div>
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{background: P.ground, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 340, top: 300, transform: `translateX(${whip * (second ? 1600 : -1600)}px)`, filter: whip > 0.05 ? `blur(${whip * 14}px)` : undefined}}>
        <Card n={second ? 3 : 2} title={second ? 'Claude · docs/upload' : 'Codex · CONF-360'} cmd={second ? 'git add docs/upload.md' : 'pnpm lint --fix'} ok={f >= key} />
      </div>
      <div style={{position: 'absolute', left: 340, top: 140, fontFamily: T.display, fontWeight: 700, fontSize: 64, letterSpacing: -1.5, color: P.text, opacity: f >= 424 ? 1 : 0}}>
        ⌃⌥Y allows. <span style={{color: P.dim}}>⌃⌥N denies.</span>
      </div>
      {showKeys && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: 'rgba(11,11,13,0.72)'}}>
          <div style={{transform: `scale(${lerp(1.15, 1, travel(clamp01((f - key + 8) / 5)))})`}}>
            <Combo f={f} at={key} keys={['⌃', '⌥', 'Y']} size={300} tone={P.green} hold={6} gap={40} />
          </div>
        </AbsoluteFill>
      )}
      <Flash f={f} at={key} color={P.green} len={6} peak={0.55} />
    </AbsoluteFill>
  );
};

/* ---------- B: the monitor ---------- */
export const Hud: React.FC<{f: number}> = ({f}) => {
  const tc = (x: number) => {
    const fr = Math.floor(x);
    const s = Math.floor(fr / 30);
    return `14:32:${String(7 + s).padStart(2, '0')}:${String(fr % 30).padStart(2, '0')}`;
  };
  const rec = Math.floor(f / 15) % 2 === 0;
  const silent = f >= 120 && f < 150;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0, opacity: 0.16, mixBlendMode: 'overlay'}}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 97} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="1920" height="1080" filter="url(#grain)" />
      </svg>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 2px, rgba(0,0,0,0) 2px 4px)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)'}} />
      {!silent && (
        <>
          <div style={{position: 'absolute', left: 48, top: 36, fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: P.text, display: 'flex', gap: 16, alignItems: 'center'}}>
            <span style={{width: 16, height: 16, borderRadius: 8, background: P.red, opacity: rec ? 1 : 0.25}} /> REC · CAM 02 · DESK
          </div>
          <div style={{position: 'absolute', right: 48, top: 36, fontFamily: T.mono, fontSize: 22, fontWeight: 600, color: P.text}}>{tc(f)}</div>
          <div style={{position: 'absolute', left: 48, bottom: 36, fontFamily: T.mono, fontSize: 20, fontWeight: 600, color: P.dim}}>SUBJECT: YOU · LOCATION: YOUR MAC</div>
          {[[1, 1], [-1, 1], [1, -1], [-1, -1]].map(([sx, sy]) => (
            <div key={`${sx}${sy}`} style={{position: 'absolute', width: 60, height: 60, borderColor: 'rgba(237,237,239,0.7)', borderStyle: 'solid',
              borderWidth: `${sy > 0 ? 3 : 0}px ${sx < 0 ? 3 : 0}px ${sy < 0 ? 3 : 0}px ${sx > 0 ? 3 : 0}px`,
              left: sx > 0 ? 30 : undefined, right: sx < 0 ? 30 : undefined, top: sy > 0 ? 90 : undefined, bottom: sy < 0 ? 90 : undefined}} />
          ))}
        </>
      )}
    </AbsoluteFill>
  );
};

/* ---------- assembly ---------- */
const SCENES: {from: number; to: number; C: React.FC<{f: number; v: V}>}[] = [
  {from: 0, to: 150, C: Hook},
  {from: 150, to: 270, C: Reveal},
  {from: 270, to: 390, C: Ask},
  {from: 390, to: 420, C: Drop},
  {from: 420, to: 510, C: Keys},
];
/** Frames that get camera motion blur: crash zooms, the dive's whip, the card whips. */
const BLUR = [[22, 27], [30, 35], [37, 42], [270, 290], [420, 426], [462, 469]];

const Frame: React.FC<{v: V}> = ({v}) => {
  const f = useCurrentFrame();
  const sc = SCENES.find((s) => f >= s.from && f < s.to) ?? SCENES[SCENES.length - 1];
  const sh = shake(f, v);
  const dramatised = f < 150;
  return (
    <AbsoluteFill style={{background: P.ground, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg) scale(${1 + Math.abs(sh.x) / 900})`}}>
        <sc.C f={f} v={v} />
      </AbsoluteFill>
      {v === 'B' && <Hud f={f} />}
      {dramatised && f < 120 && <Dramatisation />}
    </AbsoluteFill>
  );
};

const Probe: React.FC<{v: V}> = ({v}) => {
  const f = useCurrentFrame();
  const blur = BLUR.some(([a, b]) => f >= a && f < b);
  return (
    <AbsoluteFill style={{background: P.ground}}>
      {blur ? (
        <CameraMotionBlur samples={6} shutterAngle={180}>
          <Frame v={v} />
        </CameraMotionBlur>
      ) : (
        <Frame v={v} />
      )}
      <Audio src={staticFile(`audio/v5-probe-${v}.wav`)} />
    </AbsoluteFill>
  );
};
export const ProbeA: React.FC = () => <Probe v="A" />;
export const ProbeB: React.FC = () => <Probe v="B" />;
