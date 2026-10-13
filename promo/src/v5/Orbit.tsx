/* Beat 16 (43.0-49.5 s, frames 1290-1485): Blender E, the laptop on black; the screen changes theme every beat. */
import React from 'react';
import {P, Plate, Reveal, T} from './common';

export const THEMES = ['Terminal', 'Midnight', 'Paper', 'Blueprint', 'Phosphor', 'Console', 'Synthwave',
  'Hologram', 'Pixel', 'Brutal', 'Wasteland', 'Marks', 'Rubber Ducks'];
export const START = 1290;
export const LEN = 195;

export const OrbitBeat: React.FC<{f: number}> = ({f}) => {
  const lf = f - START;
  const i = Math.min(THEMES.length - 1, Math.floor(lf / 15));
  const tick = lf - i * 15;
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000', overflow: 'hidden'}}>
      <Plate shot="themes" frame={lf} />
      <Reveal f={f} at={START} out={START + 150} style={{position: 'absolute', left: 96, top: 836}}>
        <div style={{fontFamily: T.display, fontWeight: 680, fontSize: 96, letterSpacing: -96 * 0.02, color: P.text}}>13 themes.</div>
      </Reveal>
      <Reveal f={f} at={START + 180} style={{position: 'absolute', left: 96, top: 836}}>
        <div style={{fontFamily: T.display, fontWeight: 680, fontSize: 96, letterSpacing: -96 * 0.02, color: P.text}}>Yes, Rubber Ducks.</div>
      </Reveal>
      <div style={{position: 'absolute', left: 96, bottom: 72, fontFamily: T.mono, fontSize: 22, fontWeight: 600, color: P.text, letterSpacing: 1, display: 'flex', gap: 18}}>
        <span style={{color: P.dim}}>{String(i + 1).padStart(2, '0')}/13</span>
        <span style={{opacity: tick < 2 ? 0.4 : 1}}>{THEMES[i]}</span>
      </div>
    </div>
  );
};
