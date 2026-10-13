import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame} from 'remotion';
import {C, Caption, Mark, SANS, State, camAt, clamp01, easeIn, popAt, range, stateColor, toScreen} from '../lib';
import {K} from '../timeline';
import {Laptop, World, WingItem, layoutWing, useV} from '../world';
import {Terminals} from './Pain';
import {TERMS} from '../scenes/Terminals';

export const REVEAL_WING: WingItem[] = [
  {v: 'claude', st: 'working'},
  {v: 'codex', st: 'working'},
  {v: 'claude', st: 'working', sub: true},
  {v: 'codex', st: 'stuck'},
  {v: 'codex', st: 'waiting'},
];

/* ---------- reveal: the pile collapses into the notch ---------- */
export const Reveal: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {W, V} = useV();
  const hit = K.revealHit;
  const cam = camAt(f, V
    ? [{f: 0, s: 0.64, fx: 940, fy: 940, ax: 540, ay: 860}, {f: hit, s: 0.5, fx: 975, fy: 980, ax: 540, ay: 860}, {f: hit + 34, s: 0.3, fx: 975, fy: 1000, ax: 540, ay: 760, rx: 18}, {f: len, s: 0.33, fx: 975, fy: 1000, ax: 540, ay: 740, rx: 12}]
    : [{f: 0, s: 0.58, fx: 950, fy: 960, ax: 960, ay: 500}, {f: hit, s: 0.5, fx: 975, fy: 980, ax: 960, ay: 500}, {f: hit + 34, s: 0.3, fx: 975, fy: 1000, ax: 960, ay: 400, rx: 18}, {f: len, s: 0.33, fx: 975, fy: 1000, ax: 960, ay: 390, rx: 12}]);
  const n = TERMS.length;
  const fly = (i: number) => range(f, K.revealSuck + (n - 1 - i) * 1.2, K.revealSuck + 12 + (n - 1 - i) * 1.2, easeIn);
  const grow = spring({frame: f - (hit - 4), fps: 30, config: {damping: 15, stiffness: 140}});
  const pop = (i: number) => popAt(f, K.revealPop(i), 9);
  const flash = range(f, hit, hit + 2) * (1 - range(f, hit + 2, hit + 16));
  const shake = f >= hit && f < hit + 10 ? Math.sin(f * 7.3) * (10 - (f - hit)) * 2.2 : 0;
  const wingGlow = range(f, hit, hit + 20);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
        <World cam={cam} tone={range(f, hit, hit + 30)}>
          <Laptop clock="Tue 14:25" calm={range(f, hit - 6, hit + 20)} glow={wingGlow * 0.9} under={<Terminals f={f + 120} fly={fly} />}
            wing={{items: REVEAL_WING, grow, pop, glow: () => wingGlow * (1 - range(f, hit + 40, len))}} />
        </World>
      </AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: flash * 0.85, mixBlendMode: 'screen'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: V ? 1180 : 760, textAlign: 'center', fontFamily: SANS, color: C.text}}>
        <div style={{fontWeight: 760, fontSize: V ? 150 : 150, letterSpacing: -6, opacity: range(f, hit + 14, hit + 26), transform: `translateY(${(1 - range(f, hit + 14, hit + 30)) * 40}px)`,
          filter: `blur(${(1 - range(f, hit + 14, hit + 26)) * 12}px)`}}>Agent Notch</div>
        <div style={{marginTop: 18, fontWeight: 520, fontSize: V ? 46 : 44, color: '#b4b4ba', letterSpacing: -0.6, lineHeight: 1.25, padding: V ? '0 70px' : 0,
          opacity: range(f, hit + 26, hit + 38)}}>
          Every Claude Code and Codex agent,{V ? <br /> : ' '}right beside your MacBook notch.
        </div>
      </div>
      {W && null}
    </AbsoluteFill>
  );
};

/* ---------- legend: what the dot says ---------- */
const LEG: {st: State; v: 'claude' | 'codex'; t: string}[] = [
  {st: 'working', v: 'claude', t: 'working'},
  {st: 'waiting', v: 'codex', t: 'waiting for you'},
  {st: 'stuck', v: 'claude', t: 'stuck on an error'},
  {st: 'done', v: 'codex', t: 'done'},
];
export const Legend: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {W, V} = useV();
  const notchW = V ? 900 : 1500, notchH = V ? 560 : 250;
  const mark = V ? 150 : 128;
  const cols = LEG.map((l, i) => ({...l, at: K.legendCols[i]}));
  const titleIn = range(f, 2, 14);
  const drift = range(f, 0, len, (t) => t);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <div style={{position: 'absolute', left: '50%', top: -200, width: 2000, height: 1000, transform: 'translateX(-50%)', background: 'radial-gradient(closest-side, rgba(96,86,230,0.25), transparent)'}} />
      {/* a giant notch, marks inside */}
      <div style={{position: 'absolute', left: (W - notchW) / 2, top: 0, width: notchW, height: notchH, background: '#000', borderRadius: `0 0 ${V ? 70 : 60}px ${V ? 70 : 60}px`,
        boxShadow: '0 30px 90px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)', transform: `scale(${1 + 0.02 * drift})`, transformOrigin: '50% 0'}}>
        {cols.map((c, i) => {
          const p = popAt(f, c.at, 9);
          const cx = V ? (i % 2 ? 0.72 : 0.28) * notchW : ((i + 0.5) / 4) * notchW;
          const cy = V ? (i < 2 ? 160 : 400) : notchH / 2 + 4;
          const live = f >= c.at;
          const blink = c.st === 'waiting' && live ? 0.6 + 0.4 * Math.cos(((f - c.at) / 30) * Math.PI * 2.4) : 1;
          return (
            <div key={i} style={{position: 'absolute', left: cx - mark / 2, top: cy - mark / 2, transform: `scale(${Math.max(0.0001, p)})`, opacity: clamp01(p * 2)}}>
              <Mark vendor={c.v} size={mark} state={c.st} glow={live ? 0.9 : 0} dotOpacity={blink} />
            </div>
          );
        })}
      </div>
      {/* labels */}
      {cols.map((c, i) => {
        const p = range(f, c.at + 2, c.at + 12);
        const cx = V ? (W - notchW) / 2 + (i % 2 ? 0.72 : 0.28) * notchW : (W - notchW) / 2 + ((i + 0.5) / 4) * notchW;
        const top = V ? (i < 2 ? 160 : 400) + mark / 2 + 26 : notchH + 40;
        return (
          <div key={i} style={{position: 'absolute', left: cx - 220, width: 440, top, textAlign: 'center', fontFamily: SANS, fontWeight: 680, fontSize: V ? 44 : 46, letterSpacing: -1,
            color: stateColor(c.st) === C.grey ? '#b0b0b6' : stateColor(c.st), opacity: p, transform: `translateY(${(1 - p) * 16}px)`}}>{c.t}</div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: V ? 1000 : 600, textAlign: 'center', fontFamily: SANS, fontWeight: 760, fontSize: V ? 120 : 124, letterSpacing: -5, color: C.text, lineHeight: 1.02,
        opacity: titleIn, transform: `translateY(${(1 - titleIn) * 30}px)`, filter: `blur(${(1 - titleIn) * 10}px)`}}>
        One mark{V ? <br /> : ' '}per agent.
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: V ? 1300 : 770, textAlign: 'center', fontFamily: SANS, fontWeight: 520, fontSize: V ? 46 : 44, color: '#a1a1a8',
        opacity: range(f, 18, 30), padding: V ? '0 80px' : 0, lineHeight: 1.3}}>
        The logo says who. The dot says what it’s doing.
      </div>
    </AbsoluteFill>
  );
};

/* ---------- kinds: logo, subagent, light model, counters ---------- */
export const KIND_WING: WingItem[] = [
  {v: 'claude', st: 'working', count: 7},
  {v: 'codex', st: 'working'},
  {v: 'claude', st: 'working'},
  {v: 'claude', st: 'working', sub: true},
  {v: 'codex', st: 'waiting', dim: true},
];
export const Kinds: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {W} = useV();
  const L = layoutWing(KIND_WING);
  const midX = (L.marks[0].cx + L.marks[4].cx) / 2;
  const cam = camAt(f, [{f: 0, s: 4.2, fx: midX, fy: 32, ax: 960, ay: 250}, {f: len, s: 4.0, fx: midX, fy: 32, ax: 960, ay: 250}]);
  const labs = [
    {i: [0], t: 'more than six fold into a count', c: C.text, lx: 0.14},
    {i: [1, 2], t: 'Claude or Codex', c: C.text, lx: 0.38},
    {i: [3], t: 'smaller: a subagent', c: C.text, lx: 0.62},
    {i: [4], t: 'dimmed: a light model', c: '#b0b0b6', lx: 0.86},
  ];
  return (
    <AbsoluteFill>
      <World cam={cam} tone={1}>
        <Laptop clock="Tue 14:25" calm={1} wing={{items: KIND_WING, blink: (i) => (i === 4 ? 0.65 + 0.35 * Math.cos((f / 30) * Math.PI * 2.4) : 1)}} />
      </World>
      <svg width={W} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        {labs.map((l, k) => {
          const p = range(f, K.kindsCall[k], K.kindsCall[k] + 10);
          const xs = l.i.map((i) => toScreen(cam, L.marks[i].cx, 32).x);
          const x = (Math.min(...xs) + Math.max(...xs)) / 2;
          const top = toScreen(cam, 0, 32).y + 48;
          const lx = l.lx * W, ey = 400 + (k % 2) * 30;
          const pts = `${x},${top} ${x},${ey} ${lx},${ey} ${lx},${500}`;
          return (
            <g key={k} opacity={p}>
              {l.i.length > 1 && <line x1={Math.min(...xs)} x2={Math.max(...xs)} y1={top} y2={top} stroke="rgba(255,255,255,0.55)" strokeWidth={3} />}
              <polyline points={pts} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={3} strokeDasharray={1400} strokeDashoffset={1400 * (1 - p)} />
            </g>
          );
        })}
      </svg>
      {labs.map((l, k) => {
        const p = range(f, K.kindsCall[k] + 4, K.kindsCall[k] + 14);
        return (
          <div key={k} style={{position: 'absolute', left: l.lx * W - 210, width: 420, top: 516, textAlign: 'center', fontFamily: SANS, fontWeight: 680, fontSize: 42, letterSpacing: -1, lineHeight: 1.12,
            color: l.c, opacity: p, transform: `translateY(${(1 - p) * 14}px)`}}>{l.t}</div>
        );
      })}
      <Caption frame={f} from={2} to={len + 20} y={880} size={80} segs={[{t: 'Read the whole fleet'}, {t: 'at a glance.', c: '#a1a1a8'}]} />
    </AbsoluteFill>
  );
};
