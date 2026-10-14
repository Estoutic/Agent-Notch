/*
 * Keys, drawn from the app's own pixels: still in Claude's terminal after the jump, the panel holds two requests.
 * ⌃⌥Y allows the oldest (Claude's), the panel becomes the real one-waiting snapshot; ⌃⌥N denies Codex's rm -rf and
 * the panel folds away. Replaces v7's 3D keyboard macro.
 */
import React, {useContext} from 'react';
import {AbsoluteFill} from 'remotion';
import {C, Combo, ShotCtx, camAt, expoOut, range, useV} from '../../lib';
import {NOTCH_CX} from '../../world';
import {Caption} from '../../scenes/common';
import {Term} from '../../scenes/terminals';
import {EV7, local7, type Placed7} from '../timeline7';
import {Desk7, RealPanel7, RealWing7, type SnapRef} from './world7';
import {useCurrentFrame} from 'remotion';

/** snap4/ask.png: both requests waiting; snap5/ask-codex.png: Claude's allowed, Codex's rm -rf still waiting. */
const ASK: SnapRef = {src: 'snap4/ask.png', h: 772, wing: 695, panel: {top: 77, bottom: 749}};
const ASK_CODEX: SnapRef = {src: 'snap5/ask-codex.png', h: 558, wing: 695, panel: {top: 77, bottom: 536}};

export const Keys7: React.FC = () => {
  const p = useContext(ShotCtx) as unknown as Placed7;
  const f = useCurrentFrame();
  const {V} = useV();
  const len = p.to - p.from;
  const y = local7(p, EV7.keys.y), n = local7(p, EV7.keys.n);
  const cam = camAt(f, [
    {f: 0, s: 1.4, fx: 780, fy: 413, ax: 1300, ay: 540},
    {f: len, s: 1.47, fx: 780, fy: 405, ax: 1300, ay: 540, e: (t) => t},
  ]);
  const two = range(f, y, y + 4);          // the allowed request leaves on the key's frame
  const fold = range(f, n + 2, n + 12, expoOut);
  const term = {x: NOTCH_CX - 1300, y: 200, w: 2600, h: 1560};
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Desk7 f={f} cam={cam} screen={{wing: {items: []},
        under: (
          <Term x={term.x} y={term.y} w={term.w} h={term.h} kind="claude" title="claude — wedding-app — fix/upload-compress" f={f + 400} seed={1} speed={4} font={40}
            style={{boxShadow: '0 60px 160px rgba(0,0,0,0.8), 0 0 0 2px rgba(255,255,255,0.18)', filter: 'brightness(0.55)'}} />
        ),
        over: (
          <>
            <RealWing7 s={ASK} opacity={1 - two} />
            <RealWing7 s={ASK_CODEX} opacity={two} />
            {two < 1 && <div style={{opacity: 1 - two}}><RealPanel7 s={ASK} /></div>}
            {two > 0 && <div style={{opacity: two}}><RealPanel7 s={ASK_CODEX} reveal={1 - fold} /></div>}
          </>
        )}} />
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 900, background: 'linear-gradient(90deg, rgba(0,0,0,0.82) 40%, transparent)'}} />
      <Caption f={f} from={4} to={len + 1} V={V} ly={150} lx={120} size={64} sub="Oldest request first. No mouse.">⌃⌥Y allows.<br />⌃⌥N denies.</Caption>
      {[{at: y, k: 'Y', tone: C.green}, {at: n, k: 'N', tone: C.red}].map(({at, k, tone}) => {
        const a = range(f, at - 10, at - 4, expoOut) * (1 - range(f, at + 16, at + 22));
        return a > 0 ? (
          <div key={k} style={{position: 'absolute', left: 120, top: 600, opacity: a, transform: `translateY(${(1 - a) * 16}px)`}}>
            <Combo f={f} at={at} keys={['⌃', '⌥', k]} size={120} tone={tone} hold={16} />
          </div>
        ) : null;
      })}
    </AbsoluteFill>
  );
};
