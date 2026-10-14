/*
 * v7 card and toast from the app's real renders: public/snap5/card-<tab>.png (CardView on each tab, 340 pt wide @2x),
 * snap5/toast.png (ToastView) and the journey list and wing (snap5/list). Timing, camera, captions and cursor as in v4.
 */
import React from 'react';
import {Img, staticFile} from 'remotion';
import {Cursor, Ripple, camAt, cursorPath, easeIn, easeIO, expoOut, range, toScreen, useShot, useV} from '../../lib';
import {NOTCH_CX} from '../../world';
import {Caption} from '../../scenes/common';
import {Desk7, JOURNEY, JOURNEY_DONE, JOURNEY_MARK0, RealPanel7, RealWing7} from './world7';

export type CardTab = 'done' | 'remaining' | 'files' | 'log';
/** The card sits right of the list; 680 x 840 stage px (the render's own pixels). */
export const CARD7 = {x: 1190, y: 77, w: 680, h: 840};
/** Tab pills in the render: x ranges and the row's centre y (card pixels). */
const PILL: Record<CardTab, [number, number]> = {done: [20, 107], remaining: [120, 264], files: [277, 358], log: [371, 442]};
const PILL_Y = [230, 266] as const;
export const tabAt = (id: CardTab) => ({x: CARD7.x + (PILL[id][0] + PILL[id][1]) / 2, y: CARD7.y + (PILL_Y[0] + PILL_Y[1]) / 2});

export const AgentCard7: React.FC<{tab: CardTab; tabT: number; prev: CardTab; hotTab?: CardTab; hot?: number}> = ({tab, tabT, prev, hotTab, hot = 0}) => {
  return (
    <div style={{position: 'absolute', left: CARD7.x, top: CARD7.y, width: CARD7.w, height: CARD7.h, borderRadius: 21, overflow: 'hidden', filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.6))'}}>
      <Img src={staticFile(`snap5/card-${prev}.png`)} style={{position: 'absolute', inset: 0, width: CARD7.w, height: CARD7.h}} />
      {tab !== prev && <Img src={staticFile(`snap5/card-${tab}.png`)} style={{position: 'absolute', inset: 0, width: CARD7.w, height: CARD7.h, opacity: tabT}} />}
      {hotTab && hot > 0 && (
        <div style={{position: 'absolute', left: PILL[hotTab][0], top: PILL_Y[0], width: PILL[hotTab][1] - PILL[hotTab][0] + 1, height: PILL_Y[1] - PILL_Y[0], borderRadius: 9, boxShadow: `0 0 0 ${3 * hot}px rgba(255,255,255,${0.5 * hot})`}} />
      )}
    </div>
  );
};

export const CardShot7: React.FC = () => {
  const {f, ev, len} = useShot('card');
  const {W, V} = useV();
  const cx = CARD7.x + CARD7.w / 2, cy = CARD7.y + CARD7.h / 2;
  const cam = camAt(f, V
    ? [{f: 0, s: 0.62, fx: 1130, fy: 420, ax: W / 2, ay: 700}, {f: 16, s: 1.42, fx: cx, fy: cy, ax: W / 2, ay: 780, e: expoOut}, {f: len, s: 1.46, fx: cx, fy: cy, ax: W / 2, ay: 780}]
    : [{f: 0, s: 0.72, fx: 1130, fy: 420, ax: W / 2, ay: 500}, {f: 16, s: 1.0, fx: cx, fy: cy, ax: 760, ay: 545, e: expoOut}, {f: len, s: 1.03, fx: cx, fy: cy, ax: 760, ay: 545}]);
  const order: [CardTab, number][] = [['done', ev.done], ['remaining', ev.remaining], ['files', ev.files], ['log', ev.log]];
  let tab: CardTab = 'done', prev: CardTab = 'done', at = -100;
  for (let i = 0; i < order.length; i++) if (f >= order[i][1]) { tab = order[i][0]; prev = order[Math.max(0, i - 1)][0]; at = order[i][1]; }
  const tabT = at < 0 ? 1 : range(f, at, at + 6, easeIO);
  const pts = order.slice(1).map(([id]) => toScreen(cam, tabAt(id).x, tabAt(id).y));
  const start = toScreen(cam, CARD7.x + 300, CARD7.y + 600);
  const cur = cursorPath(f, [
    {from: 14, arrive: ev.remaining - 3, a: start, b: pts[0], click: ev.remaining},
    {from: ev.remaining + 8, arrive: ev.files - 3, a: pts[0], b: pts[1], click: ev.files},
    {from: ev.files + 8, arrive: ev.log - 3, a: pts[1], b: pts[2], click: ev.log},
  ], ev.log + 12);
  const nextId = order.find(([, t]) => t > f)?.[0];
  const nextAt = order.find(([, t]) => t > f)?.[1] ?? 1e9;
  const captions: Record<CardTab, [string, string]> = {
    done: ['Done', 'what it finished, what it ran, what it said'],
    remaining: ['Remaining', 'its plan, step by step'],
    files: ['Files', 'every change, lines added and removed'],
    log: ['Log', 'commands, errors and loops'],
  };
  return (
    <Desk7 f={f} cam={cam} screen={{wing: {items: []},
      over: (
        <>
          <RealWing7 s={JOURNEY} />
          <RealPanel7 s={JOURNEY} hi={{y0: 213, y1: 273, a: 1}} />
          <AgentCard7 tab={tab} prev={prev} tabT={tabT} hotTab={nextId} hot={range(f, nextAt - 8, nextAt - 3)} />
        </>
      )}}>
      <Ripple x={cur.x} y={cur.y} t={cur.ripple} r={30} />
      <Cursor x={cur.x} y={cur.y} press={cur.press} opacity={cur.op} size={46} />
      {order.map(([id, t0], i) => {
        const t1 = order[i + 1]?.[1] ?? len + 1;
        return (
          <Caption key={id} f={f} from={Math.max(10, t0)} to={t1} V={V} vy={1440} ly={430} lx={1260} size={V ? 88 : 76} align={V ? 'center' : 'left'} sub={captions[id][1]}>
            {captions[id][0]}
          </Caption>
        );
      })}
    </Desk7>
  );
};

/* ---------- toast: the app's own ToastView render (364 x 81 pt), under the notch ---------- */
export const Toast7: React.FC<{f: number; at: number; out?: number; x?: number; y?: number}> = ({f, at, out = 1e9, x = NOTCH_CX, y = 80}) => {
  const t = range(f, at, at + 10, expoOut) * (1 - range(f, out, out + 8, easeIn));
  if (t <= 0.001) return null;
  return (
    <div style={{position: 'absolute', left: x - 364, top: y, width: 728, opacity: t, transform: `translateY(${(1 - t) * -40}px) scale(${0.96 + 0.04 * t})`, transformOrigin: '50% 0', filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.6))'}}>
      <Img src={staticFile('snap5/toast.png')} style={{width: 728, display: 'block'}} />
    </div>
  );
};
export const ToastShot7: React.FC = () => {
  const {f, ev, len} = useShot('toast');
  const {W, V} = useV();
  const cam = camAt(f, V
    ? [{f: 0, s: 1.36, fx: NOTCH_CX, fy: 140, ax: W / 2, ay: 620}, {f: len, s: 1.4, fx: NOTCH_CX, fy: 140, ax: W / 2, ay: 620}]
    : [{f: 0, s: 2.0, fx: NOTCH_CX - 80, fy: 140, ax: W / 2, ay: 380}, {f: len, s: 2.1, fx: NOTCH_CX - 80, fy: 140, ax: W / 2, ay: 380}]);
  const doneNow = f >= ev.finish;
  const ring = range(f, ev.finish, ev.finish + 20, (t) => t);
  return (
    <Desk7 f={f} cam={cam} screen={{wing: {items: []},
      over: (
        <>
          <RealWing7 s={doneNow ? JOURNEY_DONE : JOURNEY} />
          {ring > 0 && ring < 1 && (
            <div style={{position: 'absolute', left: JOURNEY_MARK0.x - 15, top: JOURNEY_MARK0.y - 15, width: 30, height: 30, borderRadius: '50%', border: '1.5px solid #ffffff', opacity: (1 - ring) * 0.9, transform: `scale(${0.35 + ring * 1.4})`}} />
          )}
          <Toast7 f={f} at={ev.finish + 2} out={len - 10} />
        </>
      )}}>
      <Caption f={f} from={ev.finish + 8} to={len + 1} V={V} vy={1340} ly={760} size={V ? 84 : 72} align="center" lx={0} sub="Files, tests and the commit, at a glance.">Finished.</Caption>
    </Desk7>
  );
};
