import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame} from 'remotion';
import {C, Caption, Cursor, Keycap, MONO, Ripple, SANS, State, camAt, clamp01, cursorState, easeIO, range} from '../lib';
import {K} from '../timeline';
import {ASK_WING, Laptop, Panel, World, useV} from '../world';

const blink = (f: number) => 0.5 + 0.5 * Math.cos((f / 30) * Math.PI * 2.4);

/* ---------- ask: permission prompts land in the notch ---------- */
export const Ask: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {W, V} = useV();
  const p = K.askPanel;
  const cam = camAt(f, V
    ? [{f: 0, s: 3.4, fx: 743, fy: 32, ax: 540, ay: 420}, {f: p - 6, s: 3.5, fx: 743, fy: 32, ax: 540, ay: 420}, {f: p + 14, s: 1.3, fx: 780, fy: 0, ax: 540, ay: 120}, {f: len, s: 1.3, fx: 780, fy: 0, ax: 540, ay: 110}]
    : [{f: 0, s: 3.6, fx: 743, fy: 32, ax: 960, ay: 380}, {f: p - 6, s: 3.7, fx: 743, fy: 32, ax: 960, ay: 380}, {f: p + 14, s: 1.0, fx: 780, fy: 0, ax: 1340, ay: 130}, {f: len, s: 1.0, fx: 780, fy: 0, ax: 1340, ay: 120}]);
  const reveal = spring({frame: f - p, fps: 30, config: {damping: 20, stiffness: 160, mass: 0.8}});
  const rings = [0, 2].map((i) => ({i, t: ((f + i * 10) % 30) / 30, color: C.yellow}));
  return (
    <AbsoluteFill>
      <World cam={cam} tone={1}>
        <Laptop clock="Tue 14:25" calm={1}
          wing={{items: ASK_WING, blink: (i) => (ASK_WING[i].st === 'waiting' ? blink(f) : 1), rings: f < p + 10 ? rings : [], glow: (i) => (ASK_WING[i].st === 'waiting' ? 0.9 : 0)}}
          over={<Panel layers={[{shot: 'ask', o: 1}]} reveal={reveal} spot={{y0: 162, y1: 504, a: range(f, p + 18, p + 28) * 0.6}} />} />
      </World>
      {V ? (
        <Caption frame={f} from={4} to={len + 20} x={60} w={W - 120} y={1160} size={92} segs={[{t: 'Two agents'}, {t: 'need you.', c: C.yellow}]}
          sub={<>Allow · Deny · Always<br />or answer in the agent window.</>} />
      ) : (
        <>
          <Caption frame={f} from={2} to={p + 8} y={720} size={110} segs={[{t: 'Two agents'}, {t: 'need you.', c: C.yellow}]} />
          <Caption frame={f} from={p + 6} to={len + 20} x={110} y={340} w={760} align="left" size={96} segs={[{t: 'Answer'}, {t: 'from the notch.', br: true}]}
            sub={<>Allow · Deny · Always<br />or answer in the agent window.</>} />
        </>
      )}
    </AbsoluteFill>
  );
};

/* ---------- keys: ⌃⌥Y / ⌃⌥N ---------- */
export const Keys: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {V} = useV();
  const press = (at: number) => range(f, at - 2, at) * (1 - range(f, at + 3, at + 9));
  const held = (ats: readonly number[], k: number) => (f >= ats[k] - 2 && f < ats[ats.length - 1] + 9 ? Math.max(press(ats[k]), f >= ats[k] ? 0.75 : 0) : 0);
  const okY = range(f, K.keysY[2], K.keysY[2] + 6), okN = range(f, K.keysN[2], K.keysN[2] + 6);
  const size = V ? 150 : 170;
  const group = (keys: string[], ats: readonly number[], label: string, col: string, ok: number) => (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36}}>
      <div style={{display: 'flex', gap: 22}}>
        {keys.map((k, i) => <Keycap key={k} pressed={held(ats, i)} size={size}>{k}</Keycap>)}
      </div>
      <div style={{height: 84, padding: '0 40px', borderRadius: 42, display: 'flex', alignItems: 'center', fontFamily: SANS, fontWeight: 720, fontSize: 52, letterSpacing: -1,
        background: ok > 0 ? col : 'rgba(255,255,255,0.06)', color: ok > 0 ? '#08130b' : '#a1a1a8', transform: `scale(${1 + 0.12 * Math.sin(ok * Math.PI)})`,
        boxShadow: ok > 0 ? `0 0 60px ${col}88` : undefined}}>{label}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{background: C.bg, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(closest-side at ${V ? '50% 40%' : '30% 50%'}, rgba(52,199,89,${0.18 * okY * (1 - okN)}), transparent 70%)`}} />
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(closest-side at ${V ? '50% 70%' : '70% 50%'}, rgba(255,69,58,${0.16 * okN}), transparent 70%)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: V ? 240 : 150, textAlign: 'center', fontFamily: SANS, fontWeight: 760, fontSize: V ? 92 : 96, letterSpacing: -3.5, color: C.text, lineHeight: 1.05,
        opacity: range(f, 0, 8)}}>
        Or never touch{V ? <br /> : ' '}the mouse.
      </div>
      <div style={{display: 'flex', flexDirection: V ? 'column' : 'row', gap: V ? 120 : 200, marginTop: V ? 160 : 120}}>
        {group(['⌃', '⌥', 'Y'], K.keysY, 'Allow', C.green, okY)}
        {group(['⌃', '⌥', 'N'], K.keysN, 'Deny', C.red, okN)}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: V ? 220 : 110, textAlign: 'center', fontFamily: SANS, fontWeight: 540, fontSize: 44, color: '#a1a1a8', opacity: range(f, 10, 20)}}>
        The oldest request goes first.
      </div>
      {len && null}
    </AbsoluteFill>
  );
};

/* ---------- risky: rm -rf turns red and needs a click ---------- */
export const Risky: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {W, V} = useV();
  const cam = camAt(f, V
    ? [{f: 0, s: 1.75, fx: 640, fy: 440, ax: 440, ay: 420}, {f: len, s: 1.65, fx: 640, fy: 440, ax: 440, ay: 420}]
    : [{f: 0, s: 1.95, fx: 640, fy: 440, ax: 1210, ay: 470}, {f: len, s: 1.85, fx: 640, fy: 440, ax: 1210, ay: 470}]);
  const pulse = 0.5 + 0.5 * Math.cos((f / 30) * Math.PI * 4);
  const hit = 1 - range(f, K.riskyHit, K.riskyHit + 18);
  const cur = cursorState(f, 26, K.riskyClick - 4, K.riskyClick, {x: 700, y: 640}, {x: 501, y: 474}, len);
  const state = (i: number): State => (i === 2 && f >= K.riskyClick + 2 ? 'working' : ASK_WING[i].st);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <World cam={cam} tone={1}>
        <Laptop clock="Tue 14:25" calm={1} wing={{items: ASK_WING, state}}
          over={<>
            <Panel layers={[{shot: 'ask', o: 1}]} reveal={1} spot={{y0: 380, y1: 504, a: 1}} />
            <div style={{position: 'absolute', left: 508, top: 418, width: 248, height: 34, borderRadius: 8, boxShadow: `0 0 ${20 + 30 * pulse}px rgba(255,69,58,${0.5 + 0.4 * pulse})`, border: `2px solid rgba(255,69,58,${0.5 + 0.5 * pulse})`}} />
            <Ripple x={cur.x} y={cur.y} t={cur.ripple} r={30} color={C.green} />
            <Cursor x={cur.x} y={cur.y} press={cur.press} opacity={cur.op} size={34} />
          </>} />
      </World>
      {V && <div style={{position: 'absolute', left: 0, right: 0, top: 820, bottom: 0, background: 'linear-gradient(transparent, rgba(5,5,7,0.96) 22%)'}} />}
      <div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 ${200 + 100 * hit}px rgba(255,30,30,${0.35 + 0.4 * hit})`}} />
      <div style={{position: 'absolute', left: V ? 0 : 110, right: V ? 0 : undefined, width: V ? undefined : 760, top: V ? 1060 : 250, textAlign: V ? 'center' : 'left', fontFamily: SANS, color: C.text}}>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: V ? 54 : 56, color: C.red, lineHeight: 1.3, opacity: range(f, 0, 6)}}>rm -rf<br />git push --force</div>
        <div style={{fontWeight: 760, fontSize: V ? 92 : 92, letterSpacing: -3.5, lineHeight: 1.04, marginTop: 30, opacity: range(f, 6, 16), transform: `translateY(${(1 - range(f, 6, 16)) * 24}px)`}}>
          Risky ones<br />turn <span style={{color: C.red}}>red.</span>
        </div>
        <div style={{fontWeight: 540, fontSize: 44, color: '#a1a1a8', marginTop: 26, lineHeight: 1.3, opacity: range(f, 18, 28)}}>No hotkey. They wait<br />for your click.</div>
      </div>
      {W && clamp01(0) && null}
    </AbsoluteFill>
  );
};

/* ---------- qp: questions, then plans ---------- */
export const QP: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {W, V} = useV();
  const swap = range(f, K.qpSwap - 3, K.qpSwap + 3, easeIO);
  const cam = camAt(f, [{f: 0, s: 1.25, fx: 780, fy: 300, ax: 1280, ay: 480}, {f: len, s: 1.3, fx: 780, fy: 300, ax: 1280, ay: 480}]);
  const c1 = cursorState(f, 4, K.qpClick1 - 4, K.qpClick1, {x: 900, y: 620}, {x: 700, y: 268}, K.qpSwap - 4);
  const c2 = cursorState(f, K.qpSwap + 4, K.qpClick2 - 4, K.qpClick2, {x: 800, y: 600}, {x: 517, y: 386}, len);
  const cur = f < K.qpSwap ? c1 : c2;
  const picked = f >= K.qpClick1 && f < K.qpSwap;
  const state = (i: number): State => (i === 0 && f >= K.qpClick2 + 2 ? 'working' : ASK_WING[i].st);
  return (
    <AbsoluteFill>
      <World cam={cam} tone={1}>
        <Laptop clock="Tue 14:25" calm={1} wing={{items: ASK_WING, state}}
          over={<>
            <Panel layers={[{shot: 'question', o: 1 - swap}, {shot: 'plan', o: swap}]} reveal={1} />
            {picked && <div style={{position: 'absolute', left: 456, top: 246, width: 654, height: 68, borderRadius: 10, border: `3px solid ${C.yellow}`, boxShadow: `0 0 30px ${C.yellow}66`}} />}
            <Ripple x={cur.x} y={cur.y} t={cur.ripple} r={30} />
            <Cursor x={cur.x} y={cur.y} press={cur.press} opacity={cur.op} size={40} />
          </>} />
      </World>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 760, background: 'linear-gradient(90deg, rgba(5,5,7,0.95) 60%, transparent)'}} />
      <Caption frame={f} from={2} to={K.qpSwap + 2} x={110} y={380} w={640} align="left" size={96} segs={[{t: 'Answer its'}, {t: 'questions.', br: true}]} />
      <Caption frame={f} from={K.qpSwap} to={len + 20} x={110} y={360} w={700} align="left" size={88} segs={[{t: 'Approve'}, {t: 'the plan.', br: true}, {t: 'Or send it back.', c: '#a1a1a8', br: true}]} />
      {W && V && null}
    </AbsoluteFill>
  );
};

/* ---------- trust ---------- */
export const Trust: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {W, V} = useV();
  const cam = camAt(f, [{f: 0, s: V ? 2.6 : 3.0, fx: 900, fy: 32, ax: V ? 540 : 960, ay: V ? 560 : 300}, {f: len, s: V ? 2.4 : 2.7, fx: 900, fy: 32, ax: V ? 540 : 960, ay: V ? 560 : 300}]);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{filter: 'blur(16px) brightness(0.45)'}}>
        <World cam={cam} tone={0.6}>
          <Laptop clock="Tue 14:26" calm={1} wing={{items: ASK_WING, state: () => 'working'}} />
        </World>
      </AbsoluteFill>
      <Caption frame={f} from={2} to={len + 20} y={V ? 700 : 340} x={V ? 60 : 0} w={V ? W - 120 : undefined} size={V ? 100 : 112}
        segs={[{t: 'Nothing is approved'}, {t: 'without your click.', c: C.green, br: false}]}
        sub={<>No answer in 100 seconds?{V ? <br /> : ' '}The agent asks in its own window, as usual.</>} />
    </AbsoluteFill>
  );
};
