import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, Caption, MONO, SANS, camAt, CamKey, clamp01, easeIn, lerp, range} from '../lib';
import {K} from '../timeline';
import {HEAVY_WING, Laptop, World, useV} from '../world';
import {PROMPT_I, TERMS, Terminal} from '../scenes/Terminals';

/* ---------- the pile of terminals (chaos, buried, and the start of reveal) ---------- */
export const Terminals: React.FC<{f: number; xray?: number; fly?: (i: number) => number; timer?: string; count?: number}> = ({f, xray = 0, fly, timer, count = TERMS.length}) => {
  const blinkOn = Math.floor(f / 15) % 2 === 0;
  const pt = TERMS[PROMPT_I];
  return (
    <>
      {TERMS.slice(0, count).map((t, i) => {
        const a = clamp01((f - K.chaosAppear(i)) / 5);
        if (a <= 0) return null;
        const p = fly ? fly(i) : 0;
        if (p >= 1) return null;
        const cx = t.x + t.w / 2, cy = t.y + t.h / 2;
        const dx = lerp(0, 975 - cx, p), dy = lerp(0, 32 - cy, p);
        const sc = (0.86 + 0.14 * a) * lerp(1, 0.015, p);
        const op = Math.min(a, 1 - range(p, 0.6, 1, (x) => x));
        return (
          <div key={i} style={{position: 'absolute', left: 0, top: 0, opacity: op, transform: `translate(${dx}px, ${dy}px)`}}>
            <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: `${cx}px ${cy}px`, transform: `scale(${sc}) rotate(${p * (i % 2 ? 14 : -14)}deg)`}}>
              <Terminal t={t} f={f - K.chaosAppear(i)} cursorOn={blinkOn} />
            </div>
          </div>
        );
      })}
      {xray > 0.001 && (
        <>
          <div style={{position: 'absolute', left: -600, top: 0, width: 3200, height: 2000, background: `rgba(3,3,6,${0.7 * xray})`}} />
          <div style={{position: 'absolute', left: 0, top: 0, opacity: xray}}>
            <div style={{position: 'absolute', left: pt.x - 6, top: pt.y - 6, width: pt.w + 12, height: pt.h + 12, borderRadius: 24, boxShadow: `0 0 0 5px ${C.yellow}, 0 0 140px 16px rgba(255,179,31,0.4)`}} />
            <Terminal t={pt} f={0} cursorOn={blinkOn} />
            {timer && (
              <div style={{position: 'absolute', left: pt.x + pt.w - 330, top: pt.y - 90, height: 66, padding: '0 28px', borderRadius: 33, background: C.yellow, color: '#1a1200',
                fontFamily: SANS, fontWeight: 750, fontSize: 34, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', fontVariantNumeric: 'tabular-nums'}}>
                waiting {timer}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

const scrimBottom = (H: number, o = 1) => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: H * 0.42, opacity: o, background: 'linear-gradient(transparent, rgba(0,0,0,0.88))'}} />
);
const fmt = (secs: number) => `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(Math.floor(secs % 60)).padStart(2, '0')}`;

/* ---------- chaos ---------- */
export const Chaos: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {W, H, V} = useV();
  const cam = camAt(f, V
    ? [{f: 0, s: 0.56, fx: 975, fy: 980, ax: 540, ay: 860}, {f: len, s: 0.64, fx: 940, fy: 940, ax: 540, ay: 860}]
    : [{f: 0, s: 0.5, fx: 975, fy: 1000, ax: 960, ay: 500}, {f: len, s: 0.58, fx: 950, fy: 960, ax: 960, ay: 500}]);
  const n = Math.min(TERMS.length, Math.floor(f / 4) + 1);
  const agents = Math.round(17 * clamp01(n / TERMS.length));
  return (
    <AbsoluteFill>
      <World cam={cam} tone={0.4}>
        <Laptop clock="Tue 14:02" under={<Terminals f={f} />} />
      </World>
      {scrimBottom(H)}
      <div style={{position: 'absolute', left: 0, right: 0, top: V ? 1460 : 860, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: V ? 92 : 96, letterSpacing: -3,
        color: C.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1.05}}>
        <span>{agents} agents.</span>{V ? <br /> : ' '}<span style={{color: '#9a9aa2'}}>{n} terminals.</span>
      </div>
      {W && null}
    </AbsoluteFill>
  );
};

/* ---------- buried: the one prompt under the pile ---------- */
export const Buried: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {W, H, V} = useV();
  const cam = camAt(f, V
    ? [{f: 0, s: 0.64, fx: 940, fy: 940, ax: 540, ay: 860}, {f: 30, s: 0.98, fx: 910, fy: 860, ax: 540, ay: 760}, {f: len, s: 1.04, fx: 910, fy: 860, ax: 540, ay: 760}]
    : [{f: 0, s: 0.58, fx: 950, fy: 960, ax: 960, ay: 500}, {f: 30, s: 0.88, fx: 910, fy: 860, ax: 960, ay: 470}, {f: len, s: 0.94, fx: 910, fy: 860, ax: 960, ay: 470}]);
  const xr = range(f, 6, 20);
  const secs = 23 * 60 + 2 + (f / len) * 30;
  return (
    <AbsoluteFill>
      <World cam={cam} tone={0.4}>
        <Laptop clock="Tue 14:25" under={<Terminals f={f + 60} xray={xr} timer={fmt(secs)} />} />
      </World>
      {scrimBottom(H)}
      <Caption frame={f} from={8} to={len + 20} y={V ? 1480 : 880} size={V ? 88 : 92} x={V ? 60 : 0} w={V ? W - 120 : undefined}
        segs={[{t: 'One of them'}, {t: 'needs you.', c: C.yellow}]} />
    </AbsoluteFill>
  );
};

/* ---------- clock: the giant timer ---------- */
export const Clock: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {V} = useV();
  const ticks = Math.min(6, Math.floor((f - 4) / 9) + 1);
  const secs = 23 * 60 + 35 + Math.max(0, ticks);
  const kick = (f - 4) % 9 < 3 && f >= 4 ? 1 - ((f - 4) % 9) / 3 : 0;
  const push = 1 + 0.06 * range(f, 0, len, (t) => t);
  return (
    <AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(closest-side at 50% 50%, rgba(255,179,31,${0.13 + 0.05 * kick}), transparent 70%)`}} />
      <div style={{textAlign: 'center', transform: `scale(${push})`}}>
        <div style={{fontFamily: MONO, fontSize: V ? 34 : 34, color: '#8e8e94', letterSpacing: 0, opacity: range(f, 0, 8)}}>codex — wedding-app — CONF-360</div>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: V ? 240 : 330, letterSpacing: -6, color: C.yellow, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums',
          textShadow: `0 0 ${60 + 40 * kick}px rgba(255,179,31,0.45)`, transform: `scale(${1 + 0.025 * kick})`}}>{fmt(secs)}</div>
        <div style={{fontFamily: SANS, fontWeight: 650, fontSize: V ? 64 : 72, letterSpacing: -2, color: C.text, opacity: range(f, 14, 26), transform: `translateY(${(1 - range(f, 14, 26)) * 20}px)`}}>
          waiting for a single <span style={{fontFamily: MONO, color: C.yellow}}>y</span>.
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- slams: one word per beat ---------- */
export const Slam: React.FC<{words: {t: string; at: number; c?: string}[]; len: number; glitchAt?: number; size?: number; vSize?: number}> = ({words, len, glitchAt, size = 168, vSize = 150}) => {
  const f = useCurrentFrame();
  const {V} = useV();
  const g = glitchAt !== undefined && f >= glitchAt ? (f - glitchAt) : -1;
  const jit = g >= 0 ? Math.sin(g * 12.9898) * 26 : 0;
  const sz = V ? vSize : size;
  return (
    <AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: V ? 940 : 1700, textAlign: 'center', fontFamily: SANS, fontWeight: 760, fontSize: sz, letterSpacing: -sz * 0.045, lineHeight: 1.02, color: C.text,
        transform: `translateX(${jit}px)`, filter: g >= 0 ? `drop-shadow(${10 + g * 2}px 0 0 rgba(255,40,80,0.8)) drop-shadow(${-10 - g * 2}px 0 0 rgba(0,220,255,0.8))` : undefined,
        opacity: g >= 0 ? 1 - g / (len - glitchAt!) : 1}}>
        {words.map((w, i) => {
          const p = clamp01((f - w.at) / 5);
          if (p <= 0) return <span key={i} style={{display: 'inline-block', marginRight: sz * 0.22, opacity: 0}}>{w.t}</span>;
          const e = easeIn(1 - p);
          return (
            <span key={i} style={{display: 'inline-block', marginRight: sz * 0.22, color: w.c ?? C.text, transform: `scale(${1 + 0.5 * e})`, filter: `blur(${e * 14}px)`, opacity: p}}>{w.t}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Slam1: React.FC<{len: number}> = ({len}) => (
  <Slam len={len} words={[{t: 'Your', at: 0}, {t: 'agents', at: 15}, {t: 'are', at: 30}, {t: 'waiting.', at: 45, c: C.yellow}]} />
);
export const Slam2: React.FC<{len: number}> = ({len}) => (
  <Slam len={len} glitchAt={38} words={[{t: 'You', at: 0}, {t: 'just', at: 8}, {t: 'can’t', at: 16}, {t: 'see', at: 24}, {t: 'them.', at: 24}]} />
);
export const Outro: React.FC<{len: number}> = ({len}) => (
  <Slam len={len} words={[{t: 'Stop', at: 0}, {t: 'making', at: 0}, {t: 'them', at: 15}, {t: 'wait.', at: 15, c: C.green}]} />
);

export {HEAVY_WING};
