/*
 * Seamless 9 s loop for the README: a mark turns amber, click the notch, Allow, green, the list closes.
 * Shot on one held frame of the Blender `push` shot (falls back to the 2D desk when the renders are missing).
 */
import React from 'react';
import {AbsoluteFill, Img, spring} from 'remotion';
import {BlenderDevice, hasBlender, stageToQuad, useBlenderQuad} from './device';
import icon from '../../assets/icon-1024.png';
import {loadFonts, DISPLAY} from './fonts';
import {Backdrop, C, Cursor, Grain, Vignette, Ripple, State, camAt, cursorPath, range, toScreen, useV} from './lib';
import {useCurrentFrame} from 'remotion';
import {AttnRow, Collapse, Header, ListRow, PanelBox, Request} from './ui/app';
import {layoutWing, ScreenProps} from './world';
import {Desk} from './scenes/common';
import {J_WING} from './scenes/Open';
import {Term} from './scenes/terminals';

loadFonts();
export const HERO_LEN = 270;
const T = {wait: 24, click: 78, allow: 138, close: 176};
/** Held push frame and the 2D zoom laid on it: output = frame px * Z.s + (Z.x, Z.y). */
const PUSH_FRAME = 23;
const Z = {s: 1.8, x: -120, y: 0};

export const Hero: React.FC = () => {
  const f = useCurrentFrame();
  const {W} = useV();
  const cam = camAt(f, [{f: 0, s: 1.6, fx: 780, fy: 300, ax: W / 2 - 40, ay: 520}]);
  const blender = hasBlender('push');
  const quad = useBlenderQuad('push', PUSH_FRAME, 1920, 1080);
  const L = layoutWing(J_WING);
  const NOTCH_PT = [L.marks[0].cx + 50, 32] as const;
  const ALLOW_PT = [456 + 70, 160 + 12 + 34 + 4 + 28 + 6 + 18] as const;
  const at = (x: number, y: number) => {
    if (!blender) return toScreen(cam, x, y);
    const p = stageToQuad(quad, x, y);
    return {x: p.x * Z.s + Z.x, y: p.y * Z.s + Z.y};
  };
  const notch = at(...NOTCH_PT);
  const allowBtn = at(...ALLOW_PT);
  const rest = blender ? {x: notch.x + 300, y: notch.y + 760} : {x: notch.x + 520, y: notch.y + 700};
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
  const screen: ScreenProps = {clock: 'Tue 14:25', app: 'Terminal', menus: ['Shell', 'Edit', 'View', 'Window', 'Help'],
    // frozen terminals: the loop must end on the frame it starts with
    under: blender ? (
      <>
        <Term x={1180} y={150} w={1300} h={900} kind="codex" title="codex — wedding-app — CONF-360" f={0} frozen={0} seed={3} font={26} style={{filter: 'brightness(0.3)'}} />
        <Term x={-420} y={120} w={1480} h={980} kind="claude" title="claude — wedding-app — fix/upload-compress" f={0} frozen={0} seed={1} font={28} style={{filter: 'brightness(0.38)'}} />
      </>
    ) : undefined,
    wing: {items: J_WING, state, glow: (i) => (i === 0 && waiting ? 0.6 : 0),
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
        )};
  const overlay = (
    <>
        <Ripple x={cur.x} y={cur.y} t={cur.ripple} r={30} />
        <Cursor x={cur.x} y={cur.y} press={cur.press} opacity={cur.op} size={46} />
        <div style={{position: 'absolute', right: 70, bottom: 60, display: 'flex', alignItems: 'center', gap: 22}}>
          <Img src={icon} style={{width: 76, height: 76, borderRadius: 17}} />
          <span style={{fontFamily: DISPLAY, fontWeight: 650, fontSize: 64, letterSpacing: -2.4, color: C.text}}>Agent Notch</span>
        </div>
    </>
  );
  if (!blender) return (
    <AbsoluteFill>
      <Desk f={f} cam={cam} screen={screen}>{overlay}</Desk>
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop f={f} light="rgba(255,255,255,0.06)" at={[40, 0]} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(${Z.x}px, ${Z.y}px) scale(${Z.s})`}}>
        <BlenderDevice shot="push" frame={PUSH_FRAME} screen={screen} w={1920} h={1080} />
      </div>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 900px 420px at 100% 100%, rgba(0,0,0,0.8), transparent)'}} />
      {overlay}
      <Vignette a={0.42} />
      <Grain f={f} />
    </AbsoluteFill>
  );
};
