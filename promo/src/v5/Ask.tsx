/* Beat 5 (9.0-13.0 s, frames 270-390): Blender B dives square-on; the real `ask` snapshot drops from the notch at
 * 2.4x stage; a 50-frame hold on the command; the cursor clicks Allow on 13.0. */
import React from 'react';
import {Img, spring, staticFile} from 'remotion';
import {P, Plate, Pointer, Reveal, T, clack, lerp, span, travel} from './common';

/* The dive's last frame frames stage (780, 250) at 2.4x: 1 stage px = 2.4 film px. */
const K = 2.4;
const CX = 780, CY = 250;
export const st = (x: number, y: number) => ({x: 960 + (x - CX) * K, y: 540 + (y - CY) * K});

/* public/snap3/ask.png is the app's --snapshot at 3x (1.5 px per stage px). The list panel spans stage 401..1159 x 77..691. */
const SNAP = 1.5;
const PANEL = {x0: 401, y0: 77, x1: 1159, y1: 691, r: 24};
const ALLOW = {x: 501, y: 344};

export const START = 270;
export const DIVE_LEN = 45;
export const CLICK = 390;

export const AskBeat: React.FC<{f: number}> = ({f}) => {
  const lf = f - START;
  const plateF = Math.min(DIVE_LEN - 1, lf);
  const dropAt = START + DIVE_LEN - 2;
  const drop = (d: number) => spring({frame: f - dropAt - d, fps: 30, config: {mass: 1, stiffness: 190, damping: 28}});
  const tl = st(PANEL.x0, PANEL.y0), br = st(PANEL.x1, PANEL.y1);
  const w = br.x - tl.x, h = br.y - tl.y;
  const shown = f >= dropAt;
  // header, content, buttons 3 frames apart: three bands of the same snapshot
  const bands = [
    {y0: PANEL.y0, y1: 152, d: 0},
    {y0: 152, y1: 322, d: 3},
    {y0: 322, y1: PANEL.y1, d: 6},
  ];
  const allow = st(ALLOW.x, ALLOW.y);
  const arrive = CLICK - 14;
  const cp = span(f, CLICK - 34, arrive);
  const from = {x: 1500, y: 1010};
  const cur = {x: lerp(from.x, allow.x + 58, cp), y: lerp(from.y, allow.y + 18, cp) - Math.sin(cp * Math.PI) * 40};
  const press = clack(f, CLICK);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000', overflow: 'hidden'}}>
      <Plate shot="dive" frame={plateF} />
      {shown &&
        bands.map((b, i) => {
          const t = drop(b.d);
          const top = st(0, b.y0).y, bot = st(0, b.y1).y;
          return (
            <div key={i} style={{position: 'absolute', left: tl.x, top, width: w, height: bot - top, overflow: 'hidden',
              clipPath: i === 0 ? `inset(0 round ${PANEL.r * K}px ${PANEL.r * K}px 0 0)` : i === 2 ? `inset(0 round 0 0 ${PANEL.r * K}px ${PANEL.r * K}px)` : undefined,
              transform: `translateY(${(1 - t) * -60}px)`, opacity: t, boxShadow: i === 0 ? '0 30px 80px rgba(0,0,0,0.6)' : undefined}}>
              <Img src={staticFile('snap3/ask.png')} style={{position: 'absolute', width: 1920 * (K / SNAP), height: 1068 * (K / SNAP),
                left: -PANEL.x0 * K, top: -b.y0 * K, transformOrigin: `${allow.x - tl.x}px ${allow.y - top}px`}} />
              {i === 2 && <div style={{position: 'absolute', left: 0, right: 0, top: (380 - b.y0) * K, bottom: 0, background: 'linear-gradient(rgba(11,11,13,0.55), rgba(11,11,13,0.82) 30%)'}} />}
            </div>
          );
        })}
      {/* Allow clack: the button scales on the click, drawn over the snapshot's own button */}
      {shown && press < 1 && (
        <div style={{position: 'absolute', left: allow.x - 45 * K, top: allow.y - 18 * K, width: 90 * K, height: 36 * K, overflow: 'hidden', borderRadius: 8 * K, transform: `scale(${press})`}}>
          <Img src={staticFile('snap3/ask.png')} style={{position: 'absolute', width: 1920 * (K / SNAP), left: -(ALLOW.x - 45) * K, top: -(ALLOW.y - 18) * K}} />
        </div>
      )}
      <Reveal f={f} at={dropAt + 8} style={{position: 'absolute', left: 56, top: 34}}>
        <div style={{fontFamily: T.mono, fontSize: 22, fontWeight: 600, color: P.text, letterSpacing: 2}}>REQUEST 1</div>
      </Reveal>
      <Reveal f={f} at={dropAt + 12} style={{position: 'absolute', right: 1920 - st(1135, 0).x, top: st(0, 172).y}}>
        <div style={{fontFamily: T.mono, fontSize: 34, fontWeight: 600, color: P.amber, display: 'flex', alignItems: 'center', gap: 14}}>
          <span style={{width: 14, height: 14, borderRadius: 7, background: P.amber, boxShadow: `0 0 18px ${P.amber}`, opacity: 0.6 + 0.4 * Math.cos(((f - dropAt) / 30) * Math.PI * 2)}} />
          waiting 20:14
        </div>
      </Reveal>
      {f >= CLICK - 34 && <Pointer x={cur.x} y={cur.y} press={f >= CLICK - 3 && f <= CLICK + 8 ? press : 1} />}
      {/* whip blur stand-in on the dive's fast frames */}
      {lf < 18 && <div style={{position: 'absolute', inset: 0, backdropFilter: `blur(${(1 - span(lf, 0, 18, travel)) * 6}px)`}} />}
    </div>
  );
};
