/* v6 "One Person": the time-of-day device (clock and ground light) and the caption that rises on a spring.
 * Treatment: research/v6/treatment.md. Frames are absolute film frames, 30 fps, 120 BPM (bar = 60 frames). */
import React from 'react';
import {AbsoluteFill, spring} from 'remotion';
import {P, T, clamp01, lerp} from '../v5/common';

export const FPS = 30;
export const BAR = 60;
export const LEN = 2700;
export const sec = (x: number) => Math.round(x * FPS);

/* ---------- clock: minutes of the day at a film frame ---------- */
type K = {f: number; m: number};
const hm = (h: number, m: number) => h * 60 + m;
/** Keys from the beat sheet; between keys the clock runs linearly. The night wraps past midnight. */
export const CLOCK: K[] = [
  {f: 0, m: hm(9, 0)}, {f: 240, m: hm(9, 2)}, {f: 241, m: hm(9, 40)}, {f: 420, m: hm(9, 41)},
  {f: 660, m: hm(10, 14)}, {f: 840, m: hm(11, 30)}, {f: 960, m: hm(13, 5)}, {f: 1200, m: hm(14, 40)},
  {f: 1380, m: hm(16, 0)}, {f: 1560, m: hm(17, 30)}, {f: 1680, m: hm(19, 10)}, {f: 1920, m: hm(20, 30)},
  {f: 2040, m: hm(21, 0)}, {f: 2100, m: hm(23, 40)}, {f: 2180, m: hm(23, 41)}, {f: 2330, m: hm(31, 12)},
  {f: 2340, m: hm(31, 12)}, {f: 2520, m: hm(31, 13)}, {f: 2700, m: hm(31, 14)},
];
export const minutesAt = (f: number) => {
  let i = 0;
  while (i < CLOCK.length - 2 && f >= CLOCK[i + 1].f) i++;
  const a = CLOCK[i], b = CLOCK[i + 1];
  // a jump between scenes is a hard cut, a slope inside one is the clock running
  return Math.floor(lerp(a.m, b.m, clamp01((f - a.f) / Math.max(1, b.f - a.f))));
};
export const clockText = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export const Clock: React.FC<{f: number; color?: string}> = ({f, color = P.text}) => (
  <div style={{position: 'absolute', left: 64, top: 48, fontFamily: T.mono, fontSize: 28, fontWeight: 600, color, opacity: 0.85, letterSpacing: 1}}>{clockText(minutesAt(f))}</div>
);

/* ---------- ground light: the colour of the room by time of day ---------- */
type L = {m: number; edge: string; core: string};
const LIGHT: L[] = [
  {m: hm(8, 0), edge: '#3A2418', core: '#120D0B'},     // morning, peach
  {m: hm(11, 0), edge: '#1E1E24', core: '#0B0B0D'},    // day, neutral
  {m: hm(17, 0), edge: '#1E1E24', core: '#0B0B0D'},
  {m: hm(19, 0), edge: '#5A2A12', core: '#160B08'},    // sunset, amber
  {m: hm(20, 15), edge: '#4A1640', core: '#120714'},   // dusk, magenta
  {m: hm(22, 0), edge: '#101C44', core: '#04060D'},    // night, blue
  {m: hm(30, 30), edge: '#101C44', core: '#04060D'},
  {m: hm(31, 10), edge: '#4A2C1C', core: '#130D0B'},   // morning again
];
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const x = hex(a), y = hex(b);
  return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], t))).join(',')})`;
};
export const lightAt = (m: number) => {
  if (m <= LIGHT[0].m) return LIGHT[0];
  for (let i = 0; i < LIGHT.length - 1; i++) {
    const a = LIGHT[i], b = LIGHT[i + 1];
    if (m <= b.m) {
      const t = (m - a.m) / (b.m - a.m);
      return {m, edge: mix(a.edge, b.edge, t), core: mix(a.core, b.core, t)};
    }
  }
  return LIGHT[LIGHT.length - 1];
};
/** The room: a big radial light from the upper left, the colour of the hour. `m` overrides the clock. */
export const Ground: React.FC<{f: number; m?: number}> = ({f, m}) => {
  const l = lightAt(m ?? minutesAt(f));
  return <AbsoluteFill style={{background: `radial-gradient(ellipse 120% 100% at 18% 10%, ${l.edge} 0%, ${l.core} 70%)`}} />;
};

/* ---------- caption: rises on a spring, leaves with a drift ---------- */
export const rise = (f: number, at: number) => spring({frame: f - at, fps: FPS, config: {damping: 18, mass: 0.8}});
export const Cap: React.FC<{f: number; at: number; out?: number; size?: number; color?: string; weight?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({f, at, out = 1e9, size = 140, color = P.text, weight = 700, style, children}) => {
  if (f < at || f >= out + 10) return null;
  const p = rise(f, at);
  const o = clamp01((f - out) / 10);
  return (
    <div style={{position: 'absolute', fontFamily: T.display, fontWeight: weight, fontSize: size, letterSpacing: -size * 0.03, lineHeight: 1.0, color, whiteSpace: 'pre',
      opacity: Math.min(1, p * 1.4) * (1 - o), transform: `translateY(${(1 - p) * 40 - o * 20}px)`, filter: p < 0.9 ? `blur(${(1 - p) * 6}px)` : undefined, ...style}}>{children}</div>
  );
};
export const Note: React.FC<{f: number; at: number; out?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({f, at, out = 1e9, style, children}) => (
  <Cap f={f} at={at} out={out} size={30} weight={500} color={P.dim} style={{letterSpacing: 0, ...style}}>{children}</Cap>
);
