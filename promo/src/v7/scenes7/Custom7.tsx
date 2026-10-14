/* v7 sounds and presets from the app's real Settings renders (public/snap5/sounds.png, preset-*.png, fresh master build). */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {BODY, DISPLAY} from '../../fonts';
import {Backdrop, C, Cursor, Grain, Ripple, Vignette, cursorPath, expoOut, range, useShot, useV} from '../../lib';
import {Caption} from '../../scenes/common';

/** Crop of an image: shows source rect (sx, sy, sw, sh) at (x, y) scaled by k. */
const Crop: React.FC<{src: string; iw: number; ih: number; sx: number; sy: number; sw: number; sh: number; x: number; y: number; k: number; style?: React.CSSProperties; radius?: number}> = ({src, iw, ih, sx, sy, sw, sh, x, y, k, style, radius = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, width: sw * k, height: sh * k, overflow: 'hidden', borderRadius: radius, ...style}}>
    <Img src={staticFile(src)} style={{position: 'absolute', left: -sx * k, top: -sy * k, width: iw * k, height: ih * k}} />
  </div>
);

/* ---------- sounds: preview one event's sound (Sound set, library and the per-event list) ---------- */
export const Sounds7: React.FC = () => {
  const {f, ev, len} = useShot('sounds');
  const {W, V} = useV();
  const k = V ? 0.9 : 0.95;
  const src = {sx: 0, sy: 200, sw: 1140, sh: 900};
  const at = V ? {x: (W - 1140 * k) / 2, y: 300} : {x: 100, y: 90};
  const pt = (x: number, y: number) => ({x: at.x + (x - src.sx) * k, y: at.y + (y - src.sy) * k});
  const play = pt(1052, 1055);
  const rowL = pt(20, 1022), rowR = pt(1120, 1090);
  const cur = cursorPath(f, [{from: 4, arrive: ev.play - 3, a: {x: play.x - 300, y: play.y + 300}, b: play, click: ev.play}], len - 8);
  const sound = range(f, ev.play, ev.play + 40, (t) => t);
  const hi = range(f, ev.play - 12, ev.play - 4);
  const inP = range(f, 0, 10, expoOut);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop f={f} light="rgba(255,255,255,0.05)" at={[30, 30]} />
      <div style={{opacity: inP}}>
        <Crop src="snap5/sounds.png" iw={1140} ih={1500} {...src} x={at.x} y={at.y} k={k} radius={20} style={{boxShadow: '0 40px 100px rgba(0,0,0,0.7)'}} />
        <div style={{position: 'absolute', left: rowL.x, top: rowL.y, width: rowR.x - rowL.x, height: rowR.y - rowL.y, borderRadius: 12,
          boxShadow: `0 0 0 3px rgba(255,176,31,${0.85 * hi}), 0 0 0 3000px rgba(0,0,0,${0.35 * hi})`}} />
      </div>
      {sound > 0 && sound < 1 && [0, 1, 2].map((r) => {
        const t = Math.max(0, Math.min(1, sound * 1.6 - r * 0.25));
        return t > 0 && t < 1 ? <div key={r} style={{position: 'absolute', left: play.x - 40, top: play.y - 40, width: 80, height: 80, borderRadius: '50%', border: `3px solid ${C.amber}`, opacity: (1 - t) * 0.9, transform: `scale(${0.5 + t * 2.2})`}} /> : null;
      })}
      <Ripple x={cur.x} y={cur.y} t={cur.ripple} r={26} />
      <Cursor x={cur.x} y={cur.y} press={cur.press} opacity={cur.op} size={44} />
      <Caption f={f} from={4} to={len + 1} V={V} vy={1120} ly={V ? 0 : 330} lx={1400} size={V ? 80 : 64} align={V ? 'center' : 'left'}
        sub={V ? 'Out of the box, only a permission request makes a sound.' : <>Out of the box, only a<br />permission request<br />makes a sound.</>}>
        {V ? 'A sound for each event.' : <>A sound<br />for each event.</>}
      </Caption>
      <Vignette a={0.35} />
      <Grain f={f} />
    </AbsoluteFill>
  );
};

/* ---------- presets: Brief, Detailed, Everything change the same preview ---------- */
const PRESETS = [
  {id: 'brief', label: 'Brief', x: 191},
  {id: 'detailed', label: 'Detailed', x: 529},
  {id: 'everything', label: 'Everything', x: 871},
] as const;
export const Presets7: React.FC = () => {
  const {f, ev, len} = useShot('presets');
  const {W, V} = useV();
  const k = V ? 0.98 : 1.5;
  const at = V ? {x: (W - 1060 * k) / 2, y: 520} : {x: (W - 1060 * k) / 2, y: 50};
  const idx = f >= ev.everything ? 2 : f >= ev.detailed ? 1 : 0;
  const switchAt = [0, ev.detailed, ev.everything][idx];
  const fade = idx === 0 ? 1 : range(f, switchAt, switchAt + 5);
  const seg = (i: number) => ({x: at.x + PRESETS[i].x * k, y: at.y + 483 * k});
  const cur = cursorPath(f, [
    {from: 2, arrive: ev.detailed - 3, a: {x: seg(1).x + 120, y: seg(1).y + 160}, b: seg(1), click: ev.detailed},
    {from: ev.detailed + 6, arrive: ev.everything - 3, a: seg(1), b: seg(2), click: ev.everything},
  ], len - 6);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop f={f} light="rgba(255,255,255,0.05)" at={[50, 30]} />
      <div style={{position: 'absolute', left: at.x, top: at.y, width: 1060 * k, height: 520 * k, borderRadius: 18, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.7)'}}>
        {idx > 0 && <Img src={staticFile(`snap5/preset-${PRESETS[idx - 1].id}.png`)} style={{position: 'absolute', width: 1060 * k, height: 520 * k}} />}
        <Img src={staticFile(`snap5/preset-${PRESETS[idx].id}.png`)} style={{position: 'absolute', width: 1060 * k, height: 520 * k, opacity: fade}} />
      </div>
      <Ripple x={cur.x} y={cur.y} t={cur.ripple} r={26} />
      <Cursor x={cur.x} y={cur.y} press={cur.press} opacity={cur.op} size={44} />
      <div style={{position: 'absolute', left: 0, right: 0, top: V ? 1140 : 870, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 650, fontSize: V ? 92 : 80, letterSpacing: -3, lineHeight: 1.1}}>
        {PRESETS.map((p, i) => (
          <span key={p.id} style={{color: i === idx ? C.text : '#45454b', display: V ? 'block' : 'inline'}}>{p.label}.{!V && i < 2 ? ' ' : ''}</span>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: V ? 1520 : 980, textAlign: 'center', fontFamily: BODY, fontWeight: 500, fontSize: V ? 40 : 32, color: C.sub}}>
        One preset sets the row, the list, the limits and the card.
      </div>
      <Vignette a={0.35} />
      <Grain f={f} />
    </AbsoluteFill>
  );
};
