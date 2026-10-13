/* Shared staging for the middle of the film: the MacBook screen under a camera, captions, screen-space callouts. */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BODY, DISPLAY} from '../fonts';
import {Backdrop, C, Cam, Grain, Vignette, clamp01, easeIn, expoOut, range, toScreen} from '../lib';
import {Laptop, ScreenProps, World, layoutWing, WingItem, BAR} from '../world';

/** The MacBook screen under a camera, with vignette and grain. */
export const Desk: React.FC<{f: number; cam: Cam; screen: ScreenProps; children?: React.ReactNode; dim?: number}> = ({f, cam, screen, children, dim = 0}) => (
  <AbsoluteFill style={{background: C.bg}}>
    <World cam={cam} bg={<Backdrop f={f} light="rgba(255,255,255,0.06)" at={[50, 10]} />}>
      <Laptop clock="Tue 14:31" tone={0.6} {...screen} />
    </World>
    {dim > 0 && <AbsoluteFill style={{background: `rgba(0,0,0,${dim})`}} />}
    {children}
    <Vignette a={0.42} />
    <Grain f={f} />
  </AbsoluteFill>
);

/**
 * Caption: one headline (Geist) and an optional detail line (Inter). Landscape: lower left. Vertical: centred at `vy`.
 * The phrase enters whole and leaves whole.
 */
export const Caption: React.FC<{f: number; from: number; to: number; V: boolean; children: React.ReactNode; sub?: React.ReactNode; vy?: number; ly?: number; lx?: number; size?: number; color?: string; align?: 'left' | 'center' | 'right'}> = ({f, from, to, V, children, sub, vy = 1520, ly = 846, lx = 120, size, color = C.text, align}) => {
  if (f < from || f >= to) return null;
  const p = range(f, from, from + 10, expoOut);
  const out = range(f, to - 6, to, easeIn);
  const ps = range(f, from + 5, from + 15, expoOut);
  const sz = size ?? (V ? 84 : 72);
  const al = align ?? (V ? 'center' : 'left');
  return (
    <div style={{position: 'absolute', left: V ? 60 : lx, right: V ? 60 : al === 'left' ? undefined : lx, top: V ? vy : ly, textAlign: al, opacity: p * (1 - out),
      transform: `translateY(${(1 - p) * 22 - out * 8}px)`, filter: p < 0.98 ? `blur(${(1 - p) * 8}px)` : undefined, textShadow: '0 4px 40px rgba(0,0,0,0.85)'}}>
      <div style={{fontFamily: DISPLAY, fontWeight: 640, fontSize: sz, letterSpacing: -sz * 0.035, lineHeight: 1.06, color}}>{children}</div>
      {sub && <div style={{fontFamily: BODY, fontWeight: 500, fontSize: V ? 40 : 34, color: C.sub, marginTop: V ? 18 : 14, lineHeight: 1.3, opacity: ps}}>{sub}</div>}
    </div>
  );
};

/** A small label pinned to a stage point (screen space), with an optional leader line going up to it. */
export const Pin: React.FC<{cam: Cam; x: number; y: number; dy: number; t: number; color?: string; size?: number; children: React.ReactNode; align?: 'center' | 'left' | 'right'}> = ({cam, x, y, dy, t, color = C.text, size = 30, children, align = 'center'}) => {
  if (t <= 0.001) return null;
  const p = toScreen(cam, x, y);
  const k = clamp01(t);
  const tx = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
  return (
    <>
      <div style={{position: 'absolute', left: p.x - 1, top: p.y + 16, width: 2, height: Math.max(0, (dy - 22) * k), background: `${color}`, opacity: 0.55 * k}} />
      <div style={{position: 'absolute', left: p.x, top: p.y + dy, transform: `translate(${tx}, ${(1 - k) * 10}px)`, opacity: k,
        fontFamily: BODY, fontWeight: 600, fontSize: size, color, whiteSpace: 'nowrap', textShadow: '0 2px 20px rgba(0,0,0,0.9)'}}>{children}</div>
    </>
  );
};

/** Stage centre of mark `i` of a wing. */
export const markAt = (items: WingItem[], i: number) => {
  const L = layoutWing(items);
  return {x: L.marks[i].cx, y: BAR / 2, size: L.marks[i].size};
};

/** A soft amber/red/green light behind a region (screen px). */
export const Glow: React.FC<{x: number; y: number; r: number; color: string; a: number}> = ({x, y, r, color, a}) =>
  a <= 0.001 ? null : <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(closest-side, ${color}, transparent)`, opacity: a}} />;
