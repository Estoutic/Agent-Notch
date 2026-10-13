import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS, camAt, range, toScreen} from '../lib';
import {K} from '../timeline';
import {Laptop, World, layoutWing, useV} from '../world';
import {REVEAL_WING} from './Reveal';

const L = layoutWing(REVEAL_WING);
export const CMD = 'brew install --cask forichok/tap/agent-notch';

export const End: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {V} = useV();
  const cam = camAt(f, V
    ? [{f: 0, s: 2.6, fx: 900, fy: 32, ax: 540, ay: 360}, {f: len, s: 2.4, fx: 900, fy: 32, ax: 540, ay: 360}]
    : [{f: 0, s: 2.4, fx: 900, fy: 32, ax: 960, ay: 170}, {f: len, s: 2.25, fx: 900, fy: 32, ax: 960, ay: 170}]);
  const mk = toScreen(cam, L.marks[2].cx, 32);
  const pulses = [0, 8, 16].map((d) => range(f, d, 50 + d, (t) => 1 - Math.pow(1 - t, 2)));
  const a = (s: number, e: number) => range(f, s, e);
  const row = (o: number, y = 30) => ({opacity: o, transform: `translateY(${(1 - o) * y}px)`, filter: `blur(${(1 - o) * 6}px)`});
  const typed = Math.round(CMD.length * range(f, K.endType[0], K.endType[1], (t) => t));
  const caret = Math.floor(f / 8) % 2 === 0;
  const T = V
    ? {title: 740, tag: 930, chip: 1110, badges: 1290, url: 1360, tSize: 150, cmdSize: 29}
    : {title: 380, tag: 570, chip: 680, badges: 840, url: 910, tSize: 168, cmdSize: 38};
  return (
    <AbsoluteFill>
      <World cam={cam} tone={1}>
        <Laptop clock="Tue 14:32" calm={1} wing={{items: REVEAL_WING, state: () => 'working', glow: () => 1 - range(f, 10, 60)}} />
      </World>
      {pulses.map((t, k) => t > 0 && t < 1 && (
        <div key={k} style={{position: 'absolute', left: mk.x - 1600 * t, top: mk.y - 1600 * t, width: 3200 * t, height: 3200 * t, borderRadius: '50%',
          border: `${3 + 6 * (1 - t)}px solid ${k === 0 ? C.green : 'rgba(255,255,255,0.8)'}`, opacity: (1 - t) * (k === 0 ? 0.9 : 0.35)}} />
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: T.title, textAlign: 'center', fontFamily: SANS, fontWeight: 760, fontSize: T.tSize, letterSpacing: -T.tSize * 0.045, color: C.text, ...row(a(4, 20), 40)}}>Agent Notch</div>
      <div style={{position: 'absolute', left: V ? 60 : 0, right: V ? 60 : 0, top: T.tag, textAlign: 'center', fontFamily: SANS, fontWeight: 520, fontSize: V ? 46 : 48, color: '#b4b4ba', letterSpacing: -0.5, lineHeight: 1.25, ...row(a(12, 26))}}>
        See every Claude Code and Codex agent{V ? <br /> : ' '}from your MacBook notch.
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: T.chip, display: 'flex', justifyContent: 'center', ...row(a(24, 36))}}>
        <div style={{fontFamily: MONO, fontSize: T.cmdSize, color: C.text, padding: V ? '20px 30px' : '24px 46px', borderRadius: 999, background: 'rgba(255,255,255,0.07)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.16) inset, 0 20px 60px rgba(0,0,0,0.5)', display: 'flex', gap: 16, whiteSpace: 'pre'}}>
          <span style={{color: C.green}}>$</span>
          <span style={{position: 'relative'}}>
            <span style={{visibility: 'hidden'}}>{CMD}</span>
            <span style={{position: 'absolute', left: 0, top: 0}}>{CMD.slice(0, typed)}<span style={{opacity: caret ? 1 : 0, color: C.green}}>▍</span></span>
          </span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: T.badges, textAlign: 'center', fontFamily: SANS, fontWeight: 650, fontSize: 40, color: C.text, ...row(a(34, 46), 16)}}>
        Free &amp; open source <span style={{color: C.dim}}>·</span> MIT <span style={{color: C.dim}}>·</span> 100% local
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: T.url, textAlign: 'center', fontFamily: MONO, fontSize: 32, color: '#a1a1a8', ...row(a(40, 52), 12)}}>github.com/Forichok/Agent-Notch</div>
      <div style={{position: 'absolute', inset: 0, background: '#000', opacity: range(f, len - 8, len)}} />
    </AbsoluteFill>
  );
};
