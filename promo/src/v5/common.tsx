/* v5 "Slowest Process": shared palette, type roles, timing and the Blender plate player. */
import React from 'react';
import {Easing, Img, getStaticFiles, interpolate, staticFile} from 'remotion';
import {BODY, CODE, DISPLAY} from '../fonts';

export const FPS = 30;
export const LEN = 1770;
/** Film seconds -> frames. */
export const s = (sec: number) => Math.round(sec * FPS);

/* Status colours from Theme.swift; ground and paper from the visual bible. */
export const P = {
  amber: '#FFB01F',
  red: '#FF453B',
  green: '#30D159',
  ground: '#0B0B0D',
  graphite: '#1C1C1F',
  paper: '#F2EFE8',
  text: '#EDEDEF',
  dim: '#8A8A93',
  faint: '#4A4A52',
};

export const T = {display: DISPLAY, body: BODY, mono: CODE};

/* Motion: travel, drop, clack. Nothing else. */
export const travel = Easing.bezier(0.22, 1, 0.36, 1);
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const span = (f: number, a: number, b: number, e: (t: number) => number = travel) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Clack: 3 frames down to 0.96, 2 hold, 6 back. */
export const clack = (f: number, at: number) => {
  if (f < at - 3 || f > at + 8) return 1;
  if (f < at) return lerp(1, 0.96, (f - (at - 3)) / 3);
  if (f <= at + 2) return 0.96;
  return lerp(0.96, 1, (f - at - 2) / 6);
};

/** Phrase reveal through a clipped mask with 16 px travel. Still once arrived. */
export const Reveal: React.FC<{f: number; at: number; out?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({f, at, out = 1e9, children, style}) => {
  if (f < at || f >= out) return null;
  const p = span(f, at, at + 10);
  const o = span(f, out - 6, out);
  return (
    <div style={{overflow: 'hidden', ...style}}>
      <div style={{transform: `translateY(${(1 - p) * 16 + o * -8}px)`, opacity: p * (1 - o)}}>{children}</div>
    </div>
  );
};

/** Plays a Blender plate: frame i of public/blender/<shot>/, or the nearest rendered one (stills, previews). */
const plateFiles = (shot: string) => {
  try {
    return getStaticFiles()
      .map((x) => x.name)
      .filter((n) => n.startsWith(`blender/${shot}/`) && n.endsWith('.png'))
      .sort();
  } catch {
    return [];
  }
};
export const Plate: React.FC<{shot: string; frame: number; style?: React.CSSProperties}> = ({shot, frame, style}) => {
  const list = plateFiles(shot);
  if (!list.length) return null;
  const want = Math.floor(frame);
  let best = list[0];
  for (const n of list) {
    const k = Number(n.slice(-8, -4));
    if (Math.abs(k - want) < Math.abs(Number(best.slice(-8, -4)) - want)) best = n;
  }
  return <Img src={staticFile(best)} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, ...style}} />;
};

export const Dramatisation: React.FC = () => (
  <div style={{position: 'absolute', right: 40, bottom: 32, fontFamily: T.body, fontSize: 16, fontWeight: 500, color: P.dim, letterSpacing: 0.2}}>Dramatisation</div>
);

/** macOS-style pointer. (x, y) is the tip. */
export const Pointer: React.FC<{x: number; y: number; press?: number; size?: number}> = ({x, y, press = 1, size = 54}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{position: 'absolute', left: x - size * 0.17, top: y - size * 0.08, transform: `scale(${press})`,
    transformOrigin: `${size * 0.17}px ${size * 0.08}px`, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.55))', overflow: 'visible'}}>
    <path d="M4 2 L4 19 L8.6 14.8 L11.6 21.6 L14.4 20.4 L11.4 13.8 L17.6 13.6 Z" fill="#fff" stroke="#000" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);
