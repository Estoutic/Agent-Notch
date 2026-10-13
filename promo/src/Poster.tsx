/*
 * 1280x640 social poster: name and line on the left, the notch with a waiting request on the right, on the
 * Blender `push` frame the hero holds (2D laptop when the renders are missing).
 */
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import icon from '../../assets/icon-1024.png';
import {BODY, DISPLAY, loadFonts} from './fonts';
import {Backdrop, C, Grain, Vignette} from './lib';
import {AttnRow, Header, ListRow, PanelBox, Request} from './ui/app';
import {Laptop, ScreenProps, World} from './world';
import {BlenderDevice, hasBlender} from './device';
import {Term} from './scenes/terminals';
import {J_WING} from './scenes/Open';

loadFonts();
const PUSH_FRAME = 23;
const Z = {s: 1.34, x: 0, y: 0};
const panel = (
  <PanelBox>
    <Header claude={3} codex={1} waiting={1} right="wedding-app" />
    <AttnRow v="claude" st="waiting" title="fix/upload-compress">
      <Request tool="Bash" cmd={['pnpm --filter api test']} hint always />
    </AttnRow>
    <ListRow v="claude" st="waiting" title="fix/upload-compress" model="opus" />
    <ListRow v="claude" st="working" title="Explore · routes" model="haiku" light depth={1} last />
    <ListRow v="codex" st="working" title="CONF-360" model="sol" />
    <ListRow v="claude" st="working" title="docs/upload" model="sonnet" />
  </PanelBox>
);
const wing = {items: J_WING, glow: (i: number) => (i === 0 ? 0.6 : 0)};

export const Poster: React.FC = () => {
  const blender = hasBlender('push');
  const screen: ScreenProps = {clock: 'Tue 14:25', app: 'Terminal', menus: ['Shell', 'Edit', 'View', 'Window', 'Help'], wing, over: panel,
    under: (
      <>
        <Term x={1180} y={150} w={1300} h={900} kind="codex" title="codex — wedding-app — CONF-360" f={0} frozen={0} seed={3} font={26} style={{filter: 'brightness(0.3)'}} />
        <Term x={-420} y={120} w={1480} h={980} kind="claude" title="claude — wedding-app — fix/upload-compress" f={0} frozen={0} seed={1} font={28} style={{filter: 'brightness(0.38)'}} />
      </>
    )};
  return (
  <AbsoluteFill style={{background: C.bg}}>
    {blender ? (
      <>
        <Backdrop f={0} light="rgba(255,255,255,0.06)" at={[70, 0]} />
        <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(${Z.x}px, ${Z.y}px) scale(${Z.s})`}}>
          <BlenderDevice shot="push" frame={PUSH_FRAME} screen={screen} w={1920} h={1080} />
        </div>
      </>
    ) : (
    <World cam={{s: 0.62, fx: 780, fy: 0, ax: 900, ay: 40}} bg={<Backdrop f={0} light="rgba(255,255,255,0.07)" at={[70, 10]} />}>
      <Laptop clock="Tue 14:25" tone={0.6} wing={wing} over={panel} />
    </World>
    )}
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(7,7,8,0.96) 0%, rgba(7,7,8,0.92) 40%, transparent 54%)'}} />
    <div style={{position: 'absolute', left: 70, top: 170, width: 560}}>
      <Img src={icon} style={{width: 104, height: 104, borderRadius: 24}} />
      <div style={{fontFamily: DISPLAY, fontWeight: 650, fontSize: 84, letterSpacing: -3.4, color: C.text, lineHeight: 1, marginTop: 30}}>Agent Notch</div>
      <div style={{fontFamily: BODY, fontWeight: 500, fontSize: 30, color: C.sub, marginTop: 22, lineHeight: 1.3}}>Your Claude Code and Codex agents in the MacBook notch. Answer them without switching windows.</div>
      <div style={{fontFamily: BODY, fontWeight: 500, fontSize: 22, color: '#6c6c74', marginTop: 26}}>Free and open source · MIT</div>
    </div>
    <Vignette a={0.35} />
    <Grain f={0} amount={0.05} />
  </AbsoluteFill>
  );
};
