/* v7 trust: the request mark is the app's real waiting mark. */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BODY, CODE, DISPLAY} from '../../fonts';
import {Backdrop, C, Grain, Vignette, expoOut, range, useShot, useV} from '../../lib';
import {Mark7} from './world7';

/* ---------- trust: only you approve; after 100 s the question goes back to the agent's own window ---------- */
export const Trust7: React.FC = () => {
  const {f, ev, len} = useShot('trust');
  const {W, V} = useV();
  const inP = range(f, 0, 12, expoOut);
  const t = range(f, ev.timer, len - 14, (x) => x);
  const secs = Math.round(t * 100);
  const bar = V ? {x: 120, y: 1100, w: 840} : {x: 300, y: 660, w: 1320};
  const end = range(f, len - 14, len - 6, expoOut);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop f={f} light="rgba(255,255,255,0.05)" at={[50, 30]} />
      <div style={{position: 'absolute', left: 0, right: 0, top: V ? 520 : 200, textAlign: 'center', opacity: inP, transform: `translateY(${(1 - inP) * 24}px)`, filter: inP < 0.98 ? `blur(${(1 - inP) * 10}px)` : undefined}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 650, fontSize: V ? 116 : 150, letterSpacing: -6, color: C.text, lineHeight: 1.02}}>Only you approve.</div>
        <div style={{fontFamily: BODY, fontWeight: 500, fontSize: V ? 42 : 38, color: C.sub, marginTop: 30, opacity: range(f, 8, 18)}}>A click or your hotkey. Nothing answers on its own.</div>
      </div>
      <div style={{position: 'absolute', left: bar.x, top: bar.y, width: bar.w, opacity: range(f, ev.timer - 8, ev.timer)}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: BODY, fontWeight: 600, fontSize: V ? 34 : 30, color: C.sub, marginBottom: 22}}>
          <span style={{display: 'flex', alignItems: 'center', gap: 14}}><Mark7 vendor="claude" size={V ? 40 : 36} state="waiting" glow={0.5} />request in the notch</span>
          <span style={{fontFamily: CODE, fontSize: V ? 40 : 36, color: C.amber, fontVariantNumeric: 'tabular-nums'}}>{secs} s</span>
        </div>
        <div style={{height: 10, borderRadius: 5, background: '#26262b', overflow: 'hidden'}}>
          <div style={{width: `${t * 100}%`, height: '100%', background: `linear-gradient(90deg, ${C.amber}88, ${C.amber})`}} />
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 26, fontFamily: BODY, fontWeight: 600, fontSize: V ? 36 : 32, color: C.text, opacity: end, transform: `translateY(${(1 - end) * 12}px)`}}>
          → back to the agent's own window
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: V ? 1500 : 900, textAlign: 'center', fontFamily: BODY, fontWeight: 500, fontSize: V ? 38 : 32, color: C.sub, opacity: range(f, ev.timer + 6, ev.timer + 16)}}>
        No answer in 100 seconds? The agent asks you there, as usual.
      </div>
      <Vignette a={0.4} />
      <Grain f={f} />
    </AbsoluteFill>
  );
};

