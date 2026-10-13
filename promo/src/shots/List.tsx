import React from 'react';
import {AbsoluteFill, Img, spring, staticFile, useCurrentFrame} from 'remotion';
import {C, Caption, Cursor, Keycap, MONO, Ripple, SANS, camAt, countUp, cursorState, lerp, range, win} from '../lib';
import {K} from '../timeline';
import {HEAVY_WING, Laptop, Panel, World, useV} from '../world';
import {Terminal} from '../scenes/Terminals';

const blinkAt = (f: number) => 0.55 + 0.45 * Math.cos((f / 30) * Math.PI * 2.4);

/* ---------- open: click the notch (or ⌃⌥A) ---------- */
export const Open: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {W, V} = useV();
  const cam = camAt(f, V
    ? [{f: 0, s: 2.4, fx: 760, fy: 32, ax: 540, ay: 300}, {f: K.openClick, s: 2.3, fx: 760, fy: 32, ax: 540, ay: 300}, {f: K.openClick + 16, s: 1.05, fx: 780, fy: 0, ax: 540, ay: 90}, {f: len, s: 1.03, fx: 780, fy: 0, ax: 540, ay: 80}]
    : [{f: 0, s: 2.6, fx: 760, fy: 32, ax: 1180, ay: 300}, {f: K.openClick, s: 2.5, fx: 760, fy: 32, ax: 1180, ay: 300}, {f: K.openClick + 16, s: 1.0, fx: 780, fy: 0, ax: 1340, ay: 70}, {f: len, s: 1.0, fx: 780, fy: 0, ax: 1340, ay: 60}]);
  const reveal = spring({frame: f - K.openClick - 2, fps: 30, config: {damping: 20, stiffness: 160, mass: 0.8}});
  const cur = cursorState(f, 0, K.openClick - 3, K.openClick, {x: 960, y: 260}, {x: 700, y: 34}, K.openClick + 8);
  const kp = range(f, K.openClick - 3, K.openClick) * (1 - range(f, K.openClick + 2, K.openClick + 8));
  const keyIn = range(f, 4, 14);
  return (
    <AbsoluteFill>
      <World cam={cam} tone={1}>
        <Laptop clock="Tue 14:25" calm={1} wing={{items: HEAVY_WING, blink: (i) => (i === 4 ? blinkAt(f) : 1)}}
          over={<>
            <Panel layers={[{shot: 'heavy', o: 1}]} reveal={reveal} />
            <Ripple x={700} y={34} t={cur.ripple} r={26} />
            <Cursor x={cur.x} y={cur.y} press={cur.press} opacity={cur.op} size={40} />
          </>} />
      </World>
      {!V && <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 820, background: 'linear-gradient(90deg, rgba(5,5,7,0.92) 55%, transparent)', opacity: range(f, K.openClick, K.openClick + 10)}} />}
      <div style={{position: 'absolute', left: V ? 0 : 110, right: V ? 0 : undefined, top: V ? 1340 : 380, textAlign: V ? 'center' : 'left', fontFamily: SANS, color: C.text}}>
        <div style={{fontWeight: 760, fontSize: V ? 104 : 104, letterSpacing: -4, lineHeight: 1.02, opacity: keyIn, transform: `translateY(${(1 - keyIn) * 24}px)`}}>Click the<br />notch.</div>
        <div style={{display: 'flex', gap: 14, alignItems: 'center', justifyContent: V ? 'center' : 'flex-start', marginTop: 34, fontSize: 44, fontWeight: 600, color: '#a1a1a8', opacity: range(f, 10, 20)}}>
          <span style={{marginRight: 8}}>or</span><Keycap pressed={kp} size={82}>⌃</Keycap><Keycap pressed={kp} size={82}>⌥</Keycap><Keycap pressed={kp} size={82}>A</Keycap>
        </div>
      </div>
      {W && null}
    </AbsoluteFill>
  );
};

/* ---------- list: every project, session, subagent ---------- */
export const List: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const cam = camAt(f, [{f: 0, s: 1.0, fx: 780, fy: 0, ax: 1340, ay: 60}, {f: len, s: 1.08, fx: 780, fy: 600, ax: 1340, ay: 640}]);
  const sp = range(f, 2, 16);
  return (
    <AbsoluteFill>
      <World cam={cam} tone={1}>
        <Laptop clock="Tue 14:25" calm={1} wing={{items: HEAVY_WING, blink: (i) => (i === 4 ? blinkAt(f) : 1)}}
          over={<Panel layers={[{shot: 'heavy', o: 1}]} reveal={1} spot={{y0: lerp(160, 520, sp), y1: lerp(418, 1052, sp), a: sp}} />} />
      </World>
      <Caption frame={f} from={0} to={len + 20} x={110} y={360} w={760} align="left" size={96} segs={[{t: 'Every project.'}, {t: 'Every subagent.', br: true, c: '#a1a1a8'}]}
        sub={<>What each one is running, right now.</>} />
    </AbsoluteFill>
  );
};

/* ---------- usage: limits, context, cost ---------- */
export const Usage: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {V} = useV();
  const imgIn = range(f, 0, 12);
  const nums = [
    {to: 81, fmt: (n: number) => `${Math.round(n)}%`, t: 'Claude plan used', c: C.yellow, at: 8},
    {to: 42, fmt: (n: number) => `${Math.round(n)}%`, t: 'context window', c: C.text, at: 16},
    {to: 1.37, fmt: (n: number) => `$${n.toFixed(2)}`, t: 'this session, est.', c: C.green, at: 24},
  ];
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <div style={{position: 'absolute', left: '50%', top: -300, width: 2200, height: 1200, transform: 'translateX(-50%)', background: 'radial-gradient(closest-side, rgba(96,86,230,0.2), transparent)'}} />
      <div style={{position: 'absolute', left: V ? 100 : 130, top: V ? 170 : 250, width: 880, height: 576, borderRadius: 28, overflow: 'hidden', opacity: imgIn,
        transform: `perspective(2000px) rotateY(${V ? 0 : 8 * (1 - imgIn) + 6}deg) scale(${0.96 + 0.04 * imgIn})`, boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)'}}>
        <Img src={staticFile('usage.png')} style={{position: 'absolute', left: 0, top: -72, width: 880, height: 695}} />
      </div>
      <div style={{position: 'absolute', left: V ? 0 : 1120, right: V ? 0 : undefined, top: V ? 860 : 200, display: 'flex', flexDirection: 'column', gap: V ? 30 : 26, alignItems: V ? 'center' : 'flex-start'}}>
        {nums.map((n, i) => {
          const p = range(f, n.at, n.at + 10);
          return (
            <div key={i} style={{opacity: p, transform: `translateY(${(1 - p) * 24}px)`, fontFamily: SANS, textAlign: V ? 'center' : 'left'}}>
              <div style={{fontWeight: 760, fontSize: V ? 150 : 148, letterSpacing: -5, color: n.c, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{n.fmt(countUp(f, n.at, n.at + 20, n.to))}</div>
              <div style={{fontWeight: 560, fontSize: 40, color: '#a1a1a8', marginTop: 4}}>{n.t}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: V ? 0 : 130, right: V ? 0 : undefined, top: V ? 1700 : 870, textAlign: V ? 'center' : 'left', fontFamily: SANS, fontWeight: 760, fontSize: V ? 76 : 84,
        letterSpacing: -3, color: C.text, opacity: range(f, 4, 14)}}>Limits. Context. Cost.</div>
      {len && null}
    </AbsoluteFill>
  );
};

/* ---------- jump: double-click, land in the agent's window ---------- */
const JUMP_TERM = {x: 0, y: 0, w: 1600, h: 900, kind: 'claude' as const, title: 'claude — wedding-app — fix/upload-compress', speed: 4, seed: 21};
export const Jump: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {W, H} = useV();
  const cam = camAt(f, [{f: 0, s: 1.25, fx: 780, fy: 584, ax: 1180, ay: 560}, {f: K.jumpWhip, s: 1.32, fx: 780, fy: 584, ax: 1180, ay: 560}]);
  const cur = cursorState(f, 0, K.jumpClick - 4, K.jumpClick, {x: 980, y: 760}, {x: 560, y: 584}, len);
  const press2 = range(f, K.jumpClick + 1, K.jumpClick + 3) * (1 - range(f, K.jumpClick + 4, K.jumpClick + 8));
  const w = range(f, K.jumpWhip, K.jumpWhip + 8);
  const rowHi = range(f, K.jumpClick, K.jumpClick + 2);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{transform: `translateX(${-w * W}px)`, filter: w > 0 && w < 1 ? `blur(${Math.sin(w * Math.PI) * 18}px)` : undefined}}>
        <World cam={cam} tone={1}>
          <Laptop clock="Tue 14:25" calm={1} wing={{items: HEAVY_WING}}
            over={<>
              <Panel layers={[{shot: 'heavy', o: 1}]} reveal={1} />
              <div style={{position: 'absolute', left: 412, top: 564, width: 736, height: 42, borderRadius: 10, background: `rgba(255,255,255,${0.12 * rowHi})`}} />
              <Ripple x={cur.x} y={cur.y} t={cur.ripple} r={28} />
              <Cursor x={cur.x} y={cur.y} press={Math.max(cur.press, press2)} opacity={cur.op} size={40} />
            </>} />
        </World>
      </AbsoluteFill>
      {w > 0 && (
        <AbsoluteFill style={{transform: `translateX(${(1 - w) * W}px)`, filter: w < 1 ? `blur(${Math.sin(w * Math.PI) * 18}px)` : undefined, background: '#0b0b12'}}>
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(closest-side at 30% 20%, rgba(94,80,220,0.35), transparent), radial-gradient(closest-side at 80% 90%, rgba(232,96,60,0.25), transparent)'}} />
          <div style={{position: 'absolute', left: 780, top: 180, transform: 'scale(0.72)', transformOrigin: '0 0'}}>
            <Terminal t={JUMP_TERM} f={f} />
          </div>
        </AbsoluteFill>
      )}
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 900, background: 'linear-gradient(90deg, rgba(0,0,0,0.8), transparent)'}} />
      <Caption frame={f} from={2} to={len + 20} x={110} y={380} w={600} align="left" size={96} segs={[{t: 'Double-click.'}, {t: 'You’re in its window.', c: '#a1a1a8', br: false}]} />
      {MONO && null}
    </AbsoluteFill>
  );
};
