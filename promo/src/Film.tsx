import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, easeIn, ease, range} from './lib';
import {Enter, PROMO, Shot, ShotId, VERTICAL, filmLength, starts} from './timeline';
import {Buried, Chaos, Clock, Outro, Slam1, Slam2} from './shots/Pain';
import {Kinds, Legend, Reveal} from './shots/Reveal';
import {Jump, List, Open, Usage} from './shots/List';
import {Ask, Keys, QP, Risky, Trust} from './shots/Answer';
import {Card, Everywhere, Presets, Sounds, ThemeMarks, Themes, Toast} from './shots/More';
import {End} from './shots/End';

const SHOTS: Record<ShotId, React.FC<{len: number}>> = {
  chaos: Chaos, buried: Buried, clock: Clock, slam1: Slam1, slam2: Slam2,
  reveal: Reveal, legend: Legend, kinds: Kinds,
  open: Open, list: List, usage: Usage, jump: Jump,
  ask: Ask, keys: Keys, risky: Risky, qp: QP, trust: Trust,
  card: Card, themes: Themes, themeMarks: ThemeMarks, sounds: Sounds, toast: Toast, presets: Presets, everywhere: Everywhere,
  outro: Outro, end: End,
};

const IN = 7; // frames of an entrance
const OUT = 4; // frames of the matching exit on the previous shot

/** A horizontal/vertical motion blur through an SVG filter (CSS blur is round). */
const DirBlur: React.FC<{id: string; x: number; y: number}> = ({id, x, y}) => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation={`${x} ${y}`} />
    </filter>
  </svg>
);

const dirOf = (e?: Enter) => (e === 'whipL' ? [1, 0] : e === 'whipR' ? [-1, 0] : e === 'whipU' ? [0, 1] : null);

const Transit: React.FC<{len: number; enter?: Enter; exit?: Enter; uid: string; W: number; H: number; children: React.ReactNode}> = ({len, enter, exit, uid, W, H, children}) => {
  const f = useCurrentFrame();
  let tf = '';
  let filter: string | undefined;
  let blur: [number, number] | null = null;
  const over: React.ReactNode[] = [];
  // entrance
  const pi = range(f, 0, IN, ease);
  const din = dirOf(enter);
  if (din && f < IN) {
    const d = 1 - pi;
    tf += `translate(${din[0] * d * W * 0.35}px, ${din[1] * d * H * 0.35}px) `;
    blur = [Math.abs(din[0]) * d * 60, Math.abs(din[1]) * d * 60];
  }
  if (enter === 'zoom' && f < IN + 3) {
    const d = 1 - range(f, 0, IN + 3, ease);
    tf += `scale(${1 + 0.18 * d}) `;
    filter = `blur(${d * 14}px)`;
  }
  if (enter === 'flash' && f < 10) over.push(<div key="fl" style={{position: 'absolute', inset: 0, background: '#fff', opacity: 0.85 * (1 - range(f, 0, 10, ease))}} />);
  if (enter === 'glitch' && f < 8) {
    const j = Math.sin(f * 91.7) * 40;
    tf += `translateX(${j}px) `;
    filter = `drop-shadow(${14 - f}px 0 0 rgba(255,30,80,0.85)) drop-shadow(${-(14 - f)}px 0 0 rgba(0,220,255,0.85))`;
    const bands = [0.18, 0.47, 0.71].map((y, k) => ({y: (y + ((f * 0.13 * (k + 1)) % 0.2)) * H, h: 30 + ((f * 37 * (k + 2)) % 90), dx: Math.sin(f * 13 + k) * 120}));
    bands.forEach((b, k) => over.push(<div key={`g${k}`} style={{position: 'absolute', left: b.dx, top: b.y, width: W, height: b.h, background: k % 2 ? 'rgba(255,40,90,0.18)' : 'rgba(40,220,255,0.18)', mixBlendMode: 'screen'}} />));
  }
  // exit (the next shot's entrance decides it)
  const dout = dirOf(exit);
  const po = range(f, len - OUT, len, easeIn);
  if (dout && po > 0) {
    tf += `translate(${-dout[0] * po * W * 0.3}px, ${-dout[1] * po * H * 0.3}px) `;
    blur = [Math.abs(dout[0]) * po * 60, Math.abs(dout[1]) * po * 60];
  }
  if (exit === 'zoom' && po > 0) tf += `scale(${1 + 0.1 * po}) `;
  const fid = `db-${uid}`;
  if (blur && (blur[0] > 0.5 || blur[1] > 0.5)) filter = `url(#${fid})`;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: C.bg}}>
      {blur && <DirBlur id={fid} x={blur[0]} y={blur[1]} />}
      <AbsoluteFill style={{transform: tf || undefined, filter}}>{children}</AbsoluteFill>
      {over}
    </AbsoluteFill>
  );
};

const Chain: React.FC<{shots: Shot[]; W: number; H: number; audio?: string}> = ({shots, W, H, audio}) => {
  const at = starts(shots);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {shots.map((s, i) => {
        const S = SHOTS[s.id];
        return (
          <Sequence key={i} from={at[i]} durationInFrames={s.len} name={s.id}>
            <Transit len={s.len} enter={s.enter} exit={shots[i + 1]?.enter} uid={String(i)} W={W} H={H}>
              <S len={s.len} />
            </Transit>
          </Sequence>
        );
      })}
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const PROMO_LEN = filmLength(PROMO);
export const VERTICAL_LEN = filmLength(VERTICAL);
export const Promo: React.FC = () => <Chain shots={PROMO} W={1920} H={1080} audio="audio/promo.wav" />;
export const Vertical: React.FC = () => <Chain shots={VERTICAL} W={1080} H={1920} audio="audio/vertical.wav" />;
