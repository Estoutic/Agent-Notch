/* v7 title card: the blurred screen behind it carries the app's real marks. */
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import icon from '../../../../assets/icon-1024.png';
import {BODY, DISPLAY} from '../../fonts';
import {C, Grain, easeIn, expoOut, range, useShot, useV} from '../../lib';
import {World} from '../../world';
import {J_WING, revealCam} from '../../scenes/Open';
import {Laptop7} from './world7';

/* ---------- title ---------- */
export const TitleCard7: React.FC = () => {
  const {f, len} = useShot('title');
  const {W, H, V} = useV();
  const cam = revealCam(1000, 0, 1, 2, W, H);
  const inP = range(f, 0, 10, expoOut);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{filter: 'blur(14px) brightness(0.42)', transform: `scale(${1.04 + 0.03 * range(f, 0, len, (t) => t)})`}}>
        <World cam={cam}>
          <Laptop7 clock="Tue 14:26" wing={{items: J_WING, state: () => 'working'}} />
        </World>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: inP * (1 - range(f, len - 5, len, easeIn)), transform: `translateY(${(1 - inP) * 30}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: V ? 30 : 40, flexDirection: V ? 'column' : 'row'}}>
          <Img src={icon} style={{width: V ? 200 : 180, height: V ? 200 : 180, borderRadius: V ? 44 : 40, filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))'}} />
          <div style={{fontFamily: DISPLAY, fontWeight: 650, fontSize: V ? 150 : 170, letterSpacing: -7, color: C.text, lineHeight: 1}}>Agent Notch</div>
        </div>
        <div style={{marginTop: 40, fontFamily: BODY, fontWeight: 500, fontSize: V ? 58 : 56, color: C.sub, opacity: range(f, 5, 14)}}>Keep them moving.</div>
      </AbsoluteFill>
      <Grain f={f} />
    </AbsoluteFill>
  );
};

