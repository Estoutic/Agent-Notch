/* v7 variants of v4's awareness scenes (states, anatomy, usage, jump) on the app's real marks, panel and wing pixels. */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {BODY, DISPLAY} from '../../fonts';
import {Backdrop, C, Cursor, Grain, Ripple, State, Vignette, camAt, cursorPath, easeIO, expoOut, lerp, popAt, range, stateColor, toScreen, useShot, useV} from '../../lib';
import {BAR, NOTCH_CX, WingItem, layoutWing} from '../../world';
import {Blur} from '../../scenes/Open';
import {Caption, Pin} from '../../scenes/common';
import {Term} from '../../scenes/terminals';
import {Desk7, JOURNEY, RealPanel7, RealWing7} from './world7';

/* ---------- states: one mark runs through the four states, then four marks hold them, labelled ---------- */
const ST_WING: WingItem[] = [
  {v: 'claude', st: 'working'},
  {v: 'codex', st: 'working'},
  {v: 'claude', st: 'working'},
  {v: 'codex', st: 'working'},
];
const ST_NAMES: Record<State, string> = {working: 'Working', waiting: 'Waiting for you', stuck: 'Stuck', done: 'Done'};
const ST_TEXT: Record<State, string> = {working: C.green, waiting: C.amber, stuck: C.red, done: '#d6d6dc'};

export const States7: React.FC = () => {
  const {f, ev, len} = useShot('states');
  const {W, V} = useV();
  const L = layoutWing(ST_WING);
  const focusX = (L.marks[0].cx + L.marks[3].cx) / 2;
  const cam = camAt(f, V
    ? [{f: 0, s: 3.5, fx: focusX, fy: 32, ax: W / 2, ay: 640}, {f: len, s: 3.7, fx: focusX, fy: 32, ax: W / 2, ay: 640}]
    : [{f: 0, s: 5.2, fx: focusX, fy: 32, ax: W / 2, ay: 250}, {f: len, s: 5.5, fx: focusX, fy: 32, ax: W / 2, ay: 250}]);
  const cyc: State = f < ev.waiting ? 'working' : f < ev.stuck ? 'waiting' : f < ev.done ? 'stuck' : 'done';
  const frozen = f >= ev.freeze;
  const HOLD: State[] = ['working', 'waiting', 'stuck', 'done'];
  const state = (i: number): State => (frozen ? HOLD[i] : i === 3 ? cyc : 'working');
  const changeAt = [0, ev.waiting, ev.stuck, ev.done].filter((t) => t <= f).pop() ?? 0;
  const m3 = toScreen(cam, L.marks[3].cx, BAR / 2);
  const bigOut = range(f, ev.freeze - 4, ev.freeze);
  const bigIn = range(f, changeAt, changeAt + 6, expoOut);
  return (
    <Desk7 f={f} cam={cam} screen={{wing: {items: ST_WING, state, glow: (i) => (state(i) === 'waiting' ? 0.6 : 0),
      rings: frozen ? [] : [{i: 3, t: range(f, changeAt, changeAt + 16, (t) => t), color: stateColor(cyc)}]}}}>
      {!frozen && (
        <div style={{position: 'absolute', left: m3.x, top: m3.y + (V ? 120 : 130), transform: `translate(-50%, ${(1 - bigIn) * 14}px)`, opacity: bigIn * (1 - bigOut),
          fontFamily: DISPLAY, fontWeight: 640, fontSize: V ? 92 : 96, letterSpacing: -3, color: ST_TEXT[cyc], whiteSpace: 'nowrap', textShadow: '0 4px 30px rgba(0,0,0,0.9)'}}>
          {ST_NAMES[cyc]}
        </div>
      )}
      {frozen && L.marks.map((m, i) => (
        <Pin key={i} cam={cam} x={m.cx} y={BAR / 2 + 8} dy={i % 2 ? (V ? 190 : 200) : (V ? 100 : 110)} t={range(f, ev.freeze + i * 2, ev.freeze + i * 2 + 8)} color={ST_TEXT[HOLD[i]]} size={V ? 36 : 38}>
          {ST_NAMES[HOLD[i]]}
        </Pin>
      ))}
      <Caption f={f} from={ev.freeze + 6} to={len + 1} V={V} vy={1380} sub="One look at the notch.">Four states, one glance.</Caption>
    </Desk7>
  );
};

/* ---------- anatomy: a subagent joins smaller, a light model dims, a crowd folds into counters ---------- */
const AN_FULL: WingItem[] = [
  {v: 'claude', st: 'working'}, {v: 'claude', st: 'working'}, {v: 'claude', st: 'working'}, {v: 'claude', st: 'working'},
  {v: 'codex', st: 'working'}, // CONF-360
  {v: 'claude', st: 'working'}, // docs/upload
  {v: 'claude', st: 'waiting'}, // fix/upload-compress (the one we follow)
  {v: 'claude', st: 'working', sub: true}, // its Explore subagent, haiku
];
const AN_FOLD: WingItem[] = [
  {v: 'claude', st: 'working', count: 6},
  {v: 'codex', st: 'working', count: 1},
  {v: 'claude', st: 'waiting'},
];
export const Anatomy7: React.FC = () => {
  const {f, ev, len} = useShot('anatomy');
  const {W, V} = useV();
  const crowdAt = (i: number) => ev.crowd + (3 - i) * 2.25; // the crowd fills in from the right
  const appear = (i: number) => (i < 4 ? crowdAt(i) : i === 7 ? ev.sub : -100);
  const light = f >= ev.light;
  const folded = f >= ev.fold + 4;
  const LF = layoutWing(AN_FULL);
  const LN = layoutWing(AN_FOLD);
  // wing edge follows the leftmost visible mark
  const edgeOf = (i: number) => LF.marks[i].cx - LF.marks[i].size / 2 - 22;
  let edge = edgeOf(4);
  for (let i = 3; i >= 0; i--) edge = lerp(edge, edgeOf(i), range(f, crowdAt(i), crowdAt(i) + 6));
  edge = lerp(edge, LN.left, range(f, ev.fold, ev.fold + 10, easeIO));
  const items = folded ? AN_FOLD : AN_FULL.map((it, i) => (i === 7 ? {...it, light} : it));
  const pop = folded
    ? (i: number) => popAt(f, ev.fold + 4 + i * 2, 9)
    : (i: number) => {
        const a = appear(i);
        const p = a < 0 ? 1 : popAt(f, a, 9);
        const squash = i === 6 ? 1 : 1 - range(f, ev.fold, ev.fold + 4);
        return p * squash;
      };
  const fx = V ? 690 : 700;
  const cam = camAt(f, V
    ? [{f: 0, s: 2.9, fx, fy: 32, ax: W / 2, ay: 620}, {f: len, s: 3.0, fx, fy: 32, ax: W / 2, ay: 620}]
    : [{f: 0, s: 3.4, fx, fy: 32, ax: W / 2, ay: 240}, {f: len, s: 3.55, fx, fy: 32, ax: W / 2, ay: 240}]);
  const sub = LF.marks[7];
  const subT = range(f, ev.sub + 3, ev.sub + 11) * (1 - range(f, ev.crowd - 4, ev.crowd));
  const cnt = LN.marks[0];
  const pinSize = V ? 34 : 34;
  return (
    <Desk7 f={f} cam={cam} screen={{wing: {items, pop, left: edge, glow: (i) => (items[i].st === 'waiting' ? 0.5 : 0)}}}>
      <Pin cam={cam} x={sub.cx} y={BAR / 2 + 4} dy={V ? 120 : 130} t={subT} size={pinSize} color={light ? C.sub : C.text}>
        {light ? 'haiku · dimmed' : 'Subagent'}
      </Pin>
      <Pin cam={cam} x={cnt.cx + 10} y={BAR / 2 + 6} dy={V ? 120 : 130} t={range(f, ev.fold + 10, ev.fold + 18)} size={pinSize}>6 Claude working</Pin>
      <Pin cam={cam} x={LN.marks[2].cx} y={BAR / 2 + 6} dy={V ? 230 : 230} t={range(f, ev.fold + 14, ev.fold + 22)} size={pinSize} color={C.amber}>still needs you</Pin>
      <Caption f={f} from={ev.sub + 2} to={ev.light} V={V} vy={1360}>Subagents ride along, smaller.</Caption>
      <Caption f={f} from={ev.light} to={ev.crowd} V={V} vy={1360} sub="haiku and luna sit back a little.">Light models dim.</Caption>
      <Caption f={f} from={ev.crowd} to={ev.fold + 4} V={V} vy={1360}>More than six in a project…</Caption>
      <Caption f={f} from={ev.fold + 4} to={len + 1} V={V} vy={1360} sub="Anyone who needs you keeps a mark of their own.">…fold into counters.</Caption>
    </Desk7>
  );
};

/* ---------- usage: limits, context, cost, each pinned to where it lives ---------- */
const USAGE_SPOTS = {
  limit: {x0: 14, y0: 76, x1: 742, y1: 230, big: '63%', line: 'of the weekly Codex limit · resets in 1 d'},
  context: {x0: 590, y0: 396, x1: 748, y1: 508, big: 'Context', line: 'how full each agent is, as a ring'},
  cost: {x0: 14, y0: 250, x1: 742, y1: 336, big: '$3.42', line: 'spent today on this project, estimated'},
};
export const Usage7: React.FC = () => {
  const {f, ev, len} = useShot('usage');
  const {W, V} = useV();
  const sc = V ? 1.36 : 1.42;
  const box = V ? {x: (W - 760 * sc) / 2, y: 250} : {x: 110, y: 150};
  const k = f < ev.context ? 'limit' : f < ev.cost ? 'context' : 'cost';
  const s = USAGE_SPOTS[k];
  const prev = k === 'context' ? USAGE_SPOTS.limit : k === 'cost' ? USAGE_SPOTS.context : s;
  const at = k === 'limit' ? ev.limit : k === 'context' ? ev.context : ev.cost;
  const t = range(f, at, at + 9, easeIO);
  const r = {x0: lerp(prev.x0, s.x0, t), y0: lerp(prev.y0, s.y0, t), x1: lerp(prev.x1, s.x1, t), y1: lerp(prev.y1, s.y1, t)};
  const on = range(f, ev.limit - 4, ev.limit + 4);
  const inP = range(f, 0, 12, expoOut);
  const txt = range(f, at + 2, at + 12, expoOut);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop f={f} light="rgba(255,255,255,0.06)" at={[30, 30]} />
      <div style={{position: 'absolute', left: box.x, top: box.y, width: 760 * sc, height: 478 * sc, borderRadius: 21 * sc, overflow: 'hidden', opacity: inP, transform: `scale(${0.96 + 0.04 * inP})`,
        boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)'}}>
        <Img src={staticFile('usage.png')} style={{position: 'absolute', left: 0, top: -61 * sc, width: 760 * sc, height: 600 * sc}} />
        <div style={{position: 'absolute', left: r.x0 * sc, top: (r.y0 - 61) * sc, width: (r.x1 - r.x0) * sc, height: (r.y1 - r.y0) * sc, borderRadius: 14,
          boxShadow: `0 0 0 3px rgba(255,176,31,${0.8 * on}), 0 0 0 3000px rgba(0,0,0,${0.5 * on})`}} />
      </div>
      <div style={{position: 'absolute', left: V ? 60 : 1260, right: V ? 60 : 80, top: V ? 1080 : 330, textAlign: V ? 'center' : 'left', opacity: txt, transform: `translateY(${(1 - txt) * 16}px)`}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 650, fontSize: V ? 170 : 150, letterSpacing: -6, color: C.text, lineHeight: 1}}>{s.big}</div>
        <div style={{fontFamily: BODY, fontWeight: 500, fontSize: V ? 44 : 36, color: C.sub, marginTop: 18, lineHeight: 1.3}}>{s.line}</div>
      </div>
      <Caption f={f} from={6} to={len + 1} V={V} vy={1560} ly={880} lx={1260} size={V ? 72 : 56}>Limits, context, cost.</Caption>
      <Vignette a={0.4} />
      <Grain f={f} />
    </AbsoluteFill>
  );
};

/* ---------- jump: double-click a row, land in that agent's window ---------- */
export const Jump7: React.FC = () => {
  const {f, ev, len} = useShot('jump');
  const {W, H, V} = useV();
  const camA = V ? camAt(f, [{f: 0, s: 1.3, fx: 780, fy: 260, ax: W / 2, ay: 600}]) : camAt(f, [{f: 0, s: 1.25, fx: 780, fy: 250, ax: 860, ay: 420}]);
  const row = toScreen(camA, 640, 243);
  const cur = cursorPath(f, [{from: 0, arrive: ev.dclick - 3, a: {x: row.x + 300, y: row.y + 380}, b: row, click: ev.dclick, dbl: true}], ev.whip);
  const whip = range(f, ev.whip, ev.whip + 9, (t) => t * t * (3 - 2 * t));
  const hi = range(f, ev.dclick, ev.dclick + 3);
  const camB = V ? {s: 0.36, fx: NOTCH_CX, fy: 900, ax: W / 2, ay: H * 0.36} : {s: 0.55, fx: NOTCH_CX, fy: 880, ax: W / 2, ay: H * 0.5};
  const landed = f >= ev.whip + 9;
  const glow = range(f, ev.whip + 9, ev.whip + 18);
  const term = {x: NOTCH_CX - 1300, y: 200, w: 2600, h: 1560};
  const tl = toScreen(camB, term.x, term.y), br = toScreen(camB, term.x + term.w, term.y + term.h);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Blur on={f >= ev.whip && f < ev.whip + 10} samples={7}>
        <AbsoluteFill style={{transform: `translateX(${-whip * W}px)`}}>
          <Desk7 f={f} cam={camA} screen={{wing: {items: []},
            over: (
              <>
                <RealWing7 s={JOURNEY} />
                <RealPanel7 s={JOURNEY} hi={{y0: 213, y1: 273, a: hi}} />
              </>
            )}}>
            <Ripple x={cur.x} y={cur.y} t={cur.ripple} r={30} />
            <Cursor x={cur.x} y={cur.y} press={cur.press} opacity={cur.op} size={46} />
          </Desk7>
        </AbsoluteFill>
        <AbsoluteFill style={{transform: `translateX(${(1 - whip) * W}px)`}}>
          <Desk7 f={f} cam={camB} screen={{wing: {items: []}, over: <RealWing7 s={JOURNEY} />,
            under: (
              <>
                <Term x={term.x - 260} y={term.y + 160} w={1500} h={1100} kind="codex" title="codex — wedding-app — CONF-360" f={f} seed={3} font={30} style={{filter: 'brightness(0.5)'}} />
                <Term x={term.x} y={term.y} w={term.w} h={term.h} kind="claude" title="claude — wedding-app — fix/upload-compress" f={f} seed={1} speed={4} font={40}
                  style={{boxShadow: '0 60px 160px rgba(0,0,0,0.8), 0 0 0 2px rgba(255,255,255,0.18)'}} />
              </>
            )}} />
          {landed && <div style={{position: 'absolute', left: tl.x, top: tl.y, width: br.x - tl.x, height: br.y - tl.y, borderRadius: 10, boxShadow: `0 0 0 ${3 * glow}px rgba(48,209,88,${0.8 * glow}), 0 0 60px rgba(48,209,88,${0.3 * glow})`}} />}
        </AbsoluteFill>
      </Blur>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: V ? 760 : 380, background: 'linear-gradient(transparent, rgba(0,0,0,0.88) 55%)', opacity: range(f, ev.whip + 6, ev.whip + 14)}} />
      <Caption f={f} from={ev.dclick - 8} to={ev.whip} V={V} vy={1360} ly={820} lx={1240} size={V ? 84 : 64}>Double-click an agent…</Caption>
      <Caption f={f} from={ev.whip + 10} to={len + 1} V={V} vy={1360} ly={V ? 0 : 880} size={V ? 84 : 64} sub="Terminal, VS Code or the desktop app.">…and you're in its window.</Caption>
    </AbsoluteFill>
  );
};
