/* Seamless 9 s loop for the README: a mark turns amber, click the notch, Allow, green, the list closes. */
import React from 'react';
import {AbsoluteFill, Img, spring} from 'remotion';
import icon from '../../assets/icon-1024.png';
import {loadFonts, DISPLAY} from './fonts';
import {C, Cursor, Ripple, State, camAt, cursorPath, range, toScreen, useV} from './lib';
import {useCurrentFrame} from 'remotion';
import {AttnRow, Collapse, Header, ListRow, PanelBox, Request} from './ui/app';
import {layoutWing} from './world';
import {Desk} from './scenes/common';
import {J_WING} from './scenes/Open';

loadFonts();
export const HERO_LEN = 270;
const T = {wait: 24, click: 78, allow: 138, close: 176};

export const Hero: React.FC = () => {
  const f = useCurrentFrame();
  const {W} = useV();
  const cam = camAt(f, [{f: 0, s: 1.6, fx: 780, fy: 300, ax: W / 2 - 40, ay: 520}]);
  const L = layoutWing(J_WING);
  const notch = toScreen(cam, L.marks[0].cx + 50, 32);
  const allowBtn = toScreen(cam, 456 + 70, 160 + 12 + 34 + 4 + 28 + 6 + 18);
  const rest = {x: notch.x + 520, y: notch.y + 700};
  const cur = cursorPath(f, [
    {from: T.wait + 14, arrive: T.click - 2, a: rest, b: notch, click: T.click},
    {from: T.click + 14, arrive: T.allow - 4, a: notch, b: allowBtn, click: T.allow},
    {from: T.allow + 16, arrive: T.close + 30, a: allowBtn, b: rest},
  ], T.close + 22);
  const waiting = f >= T.wait && f < T.allow + 1;
  const allowed = f >= T.allow + 1;
  const open = spring({frame: f - T.click - 1, fps: 30, config: {damping: 20, stiffness: 170, mass: 0.8}});
  const reveal = open * (1 - range(f, T.close, T.close + 9));
  const state = (i: number): State => (i === 0 ? (waiting ? 'waiting' : 'working') : J_WING[i].st === 'waiting' ? 'working' : J_WING[i].st);
  return (
    <AbsoluteFill>
      <Desk f={f} cam={cam} screen={{clock: 'Tue 14:25', wing: {items: J_WING, state, glow: (i) => (i === 0 && waiting ? 0.6 : 0),
        rings: [{i: 0, t: range(f, T.wait, T.wait + 20, (t) => t), color: C.amber}, {i: 0, t: range(f, T.allow + 1, T.allow + 22, (t) => t), color: C.green}]},
        over: (
          <PanelBox reveal={reveal}>
            <Header claude={3} codex={1} waiting={allowed ? 0 : 1} right="wedding-app" />
            <Collapse t={range(f, T.allow + 3, T.allow + 12)} h={132}>
              <AttnRow v="claude" st="waiting" title="fix/upload-compress" flash={{color: C.green, a: 0.25 * range(f, T.allow, T.allow + 2) * (1 - range(f, T.allow + 2, T.allow + 10))}}>
                <Request tool="Bash" cmd={['pnpm --filter api test']} hint always hot="allow" hotA={range(f, T.allow - 8, T.allow - 3)} press={cur.press} />
              </AttnRow>
            </Collapse>
            <ListRow v="claude" st={allowed ? 'working' : 'waiting'} title="fix/upload-compress" model="opus" />
            <ListRow v="claude" st="working" title="Explore · routes" model="haiku" light depth={1} last />
            <ListRow v="codex" st="working" title="CONF-360" model="sol" />
            <ListRow v="claude" st="working" title="docs/upload" model="sonnet" />
          </PanelBox>
        )}}>
        <Ripple x={cur.x} y={cur.y} t={cur.ripple} r={30} />
        <Cursor x={cur.x} y={cur.y} press={cur.press} opacity={cur.op} size={46} />
        <div style={{position: 'absolute', right: 70, bottom: 60, display: 'flex', alignItems: 'center', gap: 22}}>
          <Img src={icon} style={{width: 76, height: 76, borderRadius: 17}} />
          <span style={{fontFamily: DISPLAY, fontWeight: 650, fontSize: 64, letterSpacing: -2.4, color: C.text}}>Agent Notch</span>
        </div>
      </Desk>
    </AbsoluteFill>
  );
};
