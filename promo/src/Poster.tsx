/* 1280x640 social poster: name and line on the left, the notch with a waiting request on the right. */
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import icon from '../../assets/icon-1024.png';
import {BODY, DISPLAY, loadFonts} from './fonts';
import {Backdrop, C, Grain, Vignette} from './lib';
import {AttnRow, Header, ListRow, PanelBox, Request} from './ui/app';
import {Laptop, World} from './world';
import {J_WING} from './scenes/Open';

loadFonts();
export const Poster: React.FC = () => (
  <AbsoluteFill style={{background: C.bg}}>
    <World cam={{s: 0.62, fx: 780, fy: 0, ax: 900, ay: 40}} bg={<Backdrop f={0} light="rgba(255,255,255,0.07)" at={[70, 10]} />}>
      <Laptop clock="Tue 14:25" tone={0.6} wing={{items: J_WING, glow: (i) => (i === 0 ? 0.6 : 0)}}
        over={
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
        } />
    </World>
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(7,7,8,0.96) 0%, rgba(7,7,8,0.85) 36%, transparent 52%)'}} />
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
