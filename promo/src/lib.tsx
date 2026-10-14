import React, {createContext, useContext} from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import {BODY, DISPLAY} from './fonts';
import {EV, Placed, ShotId, localFrame} from './timeline';

/** App UI is drawn in the app's own system font (it is a recreation of SwiftUI views); titles never use it. */
export const UI = '-apple-system, "SF Pro Text", system-ui, sans-serif';
export const UI_MONO = 'ui-monospace, "SF Mono", Menlo, monospace';

/* Neutral blacks; amber = needs you, red = danger, green = done/working. */
export const C = {
  bg: '#070708',
  bg2: '#0d0d0f',
  text: '#f4f4f5',
  sub: '#a3a3ab',
  faint: '#5c5c64',
  green: '#30d158',
  amber: '#ffb01f',
  red: '#ff453a',
  grey: '#4a4a4f',
};
export type State = 'working' | 'waiting' | 'stuck' | 'done';
export const stateColor = (s: State) => ({working: C.green, waiting: C.amber, stuck: C.red, done: C.grey}[s]);

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const easeIO = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.55, 0, 0.9, 0.4);
export const expoOut = Easing.bezier(0.16, 1, 0.3, 1);
export const range = (f: number, a: number, b: number, e: (t: number) => number = ease) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const win = (f: number, a: number, b: number, i = 8, o = 8) => Math.min(range(f, a, a + i), 1 - range(f, b - o, b));

/* ---------- shot context: beats -> local frames ---------- */
export const ShotCtx = createContext<Placed | null>(null);
/** Inside a shot: `b(x)` is the local frame of beat x, `ev.name` the local frame of a named event. */
export const useShot = <K extends ShotId>(id: K) => {
  const p = useContext(ShotCtx);
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const k = (p as {k?: number} | null)?.k ?? 1; // v7 stretches a shot's in-shot beats by k
  const b = (beat: number) => (p ? localFrame(p, beat * k) : Math.round(beat * 15));
  const evs = EV[id] as Record<string, number>;
  const ev = Object.fromEntries(Object.entries(evs).map(([k, v]) => [k, b(v)])) as {[P in keyof (typeof EV)[K]]: number};
  const len = p ? p.to - p.from : durationInFrames;
  return {f, b, ev, len};
};
export const useV = () => {
  const {width, height} = useVideoConfig();
  return {W: width, H: height, V: height > width};
};

/* ---------- camera ---------- */
export type Cam = {s: number; fx: number; fy: number; ax: number; ay: number};
export type CamKey = Cam & {f: number; e?: (t: number) => number};
export const camAt = (frame: number, keys: CamKey[]): Cam => {
  if (frame <= keys[0].f) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (frame <= b.f) {
      const t = (b.e ?? easeIO)(clamp01((frame - a.f) / Math.max(1, b.f - a.f)));
      const s = Math.exp(lerp(Math.log(a.s), Math.log(b.s), t));
      return {s, fx: lerp(a.fx, b.fx, t), fy: lerp(a.fy, b.fy, t), ax: lerp(a.ax, b.ax, t), ay: lerp(a.ay, b.ay, t)};
    }
  }
  return keys[keys.length - 1];
};
/** Stage point -> screen point. */
export const toScreen = (cam: Cam, x: number, y: number) => ({x: (x - cam.fx) * cam.s + cam.ax, y: (y - cam.fy) * cam.s + cam.ay});
/** Slow handheld drift from @remotion/noise, in px. */
export const drift = (f: number, amp = 6, seed = 'cam') => ({x: noise2D(seed, f / 90, 0) * amp, y: noise2D(seed, 0, f / 90) * amp});

/* ---------- vendor mark: vector redraw of the app's "Logos" mark (logo + status dot) ---------- */
export const Mark: React.FC<{vendor: 'claude' | 'codex'; size: number; state: State; light?: boolean; glow?: number; dotScale?: number}> = ({vendor, size, state, light, glow = 0, dotScale = 1}) => {
  const dot = Math.max(5, size * 0.42) * dotScale;
  const col = stateColor(state);
  const ring = Math.max(1.5, dot * 0.22);
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block', filter: light ? 'brightness(0.5) saturate(0.75)' : undefined}}>
        {vendor === 'claude' ? (
          <>
            <defs>
              <linearGradient id="mk-cl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f07a55" />
                <stop offset="1" stopColor="#d4502f" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx={22} fill="url(#mk-cl)" />
            <g stroke="#fff2ec" strokeWidth="6.5" strokeLinecap="round" transform="translate(50 50)">
              {Array.from({length: 12}).map((_, i) => (
                <line key={i} x1="0" y1={i % 2 ? -17 : -12} x2="0" y2="-33" transform={`rotate(${i * 30})`} />
              ))}
              <circle r="11" fill="#fff2ec" stroke="none" />
            </g>
          </>
        ) : (
          <>
            <defs>
              <linearGradient id="mk-cx" x1="0.2" y1="0" x2="0.6" y2="1">
                <stop offset="0" stopColor="#d6c9ff" />
                <stop offset="0.45" stopColor="#7b7fff" />
                <stop offset="1" stopColor="#3434ec" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx={22} fill="#141417" />
            <g fill="url(#mk-cx)">
              {Array.from({length: 8}).map((_, i) => (
                <circle key={i} cx={50 + 20 * Math.cos((i * Math.PI) / 4)} cy={50 + 18 * Math.sin((i * Math.PI) / 4)} r={15} />
              ))}
              <circle cx="50" cy="50" r="24" />
            </g>
            <path d="M35 41 L43 49 L35 57" fill="none" stroke="#e4e7ff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="49" y1="59" x2="64" y2="59" stroke="#e4e7ff" strokeWidth="6" strokeLinecap="round" />
          </>
        )}
      </svg>
      <div style={{position: 'absolute', left: size - dot * 0.62, top: size - dot * 0.62, width: dot, height: dot, borderRadius: '50%', boxSizing: 'border-box',
        background: col, border: `${ring}px solid #000`,
        boxShadow: glow > 0 ? `0 0 ${dot * 1.6}px ${dot * 0.35}px ${col}${Math.round(clamp01(glow) * 200).toString(16).padStart(2, '0')}` : undefined}} />
    </div>
  );
};

/* ---------- pointer, ripple, keys ---------- */
export const Cursor: React.FC<{x: number; y: number; press?: number; opacity?: number; size?: number}> = ({x, y, press = 0, opacity = 1, size = 44}) =>
  opacity <= 0.001 ? null : (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{position: 'absolute', left: x - size * 0.17, top: y - size * 0.08, opacity, transform: `scale(${1 - 0.14 * press})`, transformOrigin: `${size * 0.17}px ${size * 0.08}px`, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))', overflow: 'visible'}}>
      <path d="M4 2 L4 19 L8.6 14.8 L11.6 21.6 L14.4 20.4 L11.4 13.8 L17.6 13.6 Z" fill="#fff" stroke="#000" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );

export const Ripple: React.FC<{x: number; y: number; t: number; color?: string; r?: number}> = ({x, y, t, color = '#fff', r = 34}) =>
  t <= 0 || t >= 1 ? null : (
    <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `3px solid ${color}`, opacity: (1 - t) * 0.9, transform: `scale(${0.3 + t * 1.2})`}} />
  );

/** Cursor path: glides from a to b (arriving at `arrive`), presses at `click`. Several legs make a longer path. */
export type Pt = {x: number; y: number};
export type Leg = {from: number; arrive: number; a: Pt; b: Pt; click?: number; dbl?: boolean};
export const cursorPath = (f: number, legs: Leg[], fadeOutAt = Infinity) => {
  let leg = legs[0];
  for (const l of legs) if (f >= l.from) leg = l;
  const p = range(f, leg.from, leg.arrive, easeIO);
  const arc = Math.sin(p * Math.PI);
  const x = lerp(leg.a.x, leg.b.x, p) + arc * 24;
  const y = lerp(leg.a.y, leg.b.y, p) - arc * 16;
  let press = 0, ripple = 0;
  for (const l of legs) {
    if (l.click === undefined) continue;
    const c = l.click;
    press = Math.max(press, range(f, c - 3, c) * (1 - range(f, c + 1, c + 6)));
    if (l.dbl) press = Math.max(press, range(f, c + 4, c + 6) * (1 - range(f, c + 7, c + 11)));
    if (f >= c && f < c + 20) ripple = range(f, c, c + 18, (t) => t);
  }
  const op = range(f, legs[0].from, legs[0].from + 6) * (1 - range(f, fadeOutAt, fadeOutAt + 8));
  return {x, y, press, op, ripple};
};

export const Keycap: React.FC<{children: React.ReactNode; pressed?: number; size?: number; tone?: string}> = ({children, pressed = 0, size = 64, tone}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: size, height: size, padding: `0 ${size * 0.2}px`, borderRadius: size * 0.2, boxSizing: 'border-box',
    fontFamily: BODY, fontSize: size * 0.44, fontWeight: 600, color: C.text,
    background: pressed > 0.5 ? 'linear-gradient(#2c2c31, #232327)' : 'linear-gradient(#36363c, #26262b)',
    boxShadow: `0 ${size * 0.09 * (1 - pressed * 0.8)}px 0 #0b0b0d, 0 0 0 1px rgba(255,255,255,0.12) inset${pressed > 0.3 && tone ? `, 0 0 ${size * 0.6}px ${tone}66` : ''}`,
    transform: `translateY(${pressed * size * 0.07}px)`, outline: pressed > 0.3 && tone ? `2px solid ${tone}` : undefined, outlineOffset: 2}}>{children}</div>
);
/** A key combo like ⌃ ⌥ Y with each key pressed from `at` (staggered 1.5 frames) until `at + hold`. */
export const Combo: React.FC<{f: number; at: number; keys: string[]; size?: number; tone?: string; hold?: number; gap?: number}> = ({f, at, keys, size = 64, tone, hold = 14, gap}) => (
  <div style={{display: 'flex', gap: gap ?? size * 0.16}}>
    {keys.map((k, i) => {
      const t0 = at - (keys.length - 1 - i) * 3;
      const p = range(f, t0 - 2, t0) * (1 - range(f, at + hold, at + hold + 5));
      return <Keycap key={k + i} size={size} pressed={p} tone={tone}>{k}</Keycap>;
    })}
  </div>
);

/* ---------- type: fixed roles, whole-phrase entrances ---------- */
type TitleProps = {f: number; from: number; to?: number; x?: number; y: number; w?: number; align?: 'left' | 'center'; children: React.ReactNode; size?: number; color?: string; weight?: number; sub?: React.ReactNode; subSize?: number; subDelay?: number};
/** Headline (Geist) with an optional detail line (Inter). The phrase enters whole: rise + un-blur. */
export const Title: React.FC<TitleProps> = ({f, from, to = 1e9, x = 0, y, w, align = 'center', children, size = 96, color = C.text, weight = 620, sub, subSize, subDelay = 6}) => {
  if (f < from || f > to) return null;
  const p = range(f, from, from + 12, expoOut);
  const out = range(f, to - 8, to, easeIn);
  const ps = range(f, from + subDelay, from + subDelay + 12, expoOut);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w ?? (align === 'center' ? '100%' : undefined), textAlign: align, opacity: p * (1 - out),
      transform: `translateY(${(1 - p) * size * 0.28 - out * 10}px)`, filter: p < 0.99 ? `blur(${(1 - p) * 10}px)` : undefined}}>
      <div style={{fontFamily: DISPLAY, fontWeight: weight, fontSize: size, letterSpacing: -size * 0.035, lineHeight: 1.04, color}}>{children}</div>
      {sub && (
        <div style={{fontFamily: BODY, fontWeight: 500, fontSize: subSize ?? Math.max(30, size * 0.36), letterSpacing: -0.2, color: C.sub, lineHeight: 1.32, marginTop: size * 0.26,
          opacity: ps, transform: `translateY(${(1 - ps) * 12}px)`}}>{sub}</div>
      )}
    </div>
  );
};
/** Callout label (Inter) anchored to UI. */
export const Label: React.FC<{children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({children, color = C.text, size = 30, style}) => (
  <div style={{fontFamily: BODY, fontWeight: 600, fontSize: size, letterSpacing: -0.3, color, whiteSpace: 'nowrap', ...style}}>{children}</div>
);

export const popAt = (f: number, a: number, d = 10) => {
  const t = clamp01((f - a) / d);
  if (t <= 0) return 0;
  return 1 + Math.sin(t * Math.PI) * 0.18 * (1 - t) - Math.pow(1 - t, 3);
};

/* ---------- surface: neutral black, a soft key light that drifts, film grain ---------- */
export const Backdrop: React.FC<{f: number; light?: string; at?: [number, number]}> = ({f, light = 'rgba(255,255,255,0.055)', at = [50, 30]}) => {
  const d = drift(f, 4, 'bg');
  return (
    <div style={{position: 'absolute', inset: 0, background: C.bg}}>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 60% at ${at[0] + d.x}% ${at[1] + d.y}%, ${light}, transparent 70%)`}} />
    </div>
  );
};
export const Grain: React.FC<{f: number; amount?: number}> = ({f, amount = 0.08}) => (
  <svg style={{position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', mixBlendMode: 'overlay', opacity: amount}}>
    <filter id={`grain-${f % 6}`}>
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed={f % 6} stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter={`url(#grain-${f % 6})`} />
  </svg>
);
export const Vignette: React.FC<{a?: number}> = ({a = 0.55}) => (
  <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, rgba(0,0,0,${a}))`}} />
);
