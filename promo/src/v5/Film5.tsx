/* v5 "Slowest Process", 59 s at 30 fps. Hybrid direction (decide round 1, 2026-10-14): the hook and the rm -rf
 * beat are seen through the surveillance HUD; everything else is A "Punch". Scenes in Proto.tsx (1-7), Punch.tsx (8-19). */
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {loadFonts} from '../fonts';
import {Dramatisation, P} from './common';
import {Ask, Drop, Hook, Hud, Keys, Reveal, V, shakeFrom} from './Proto';
import {Ask2, End, Fixed, Listen, Night, Plan2, Risky, Swarm, Themes, Wall, Yours, Zero} from './Punch';

loadFonts();

/* Final music: audio/v5_edit.py heist-2, SFX and master by audio/v5_sfx.py film. */
const MUSIC = 'audio/v5-film.wav';

type Scene = {from: number; to: number; C: React.FC<{f: number; v: V}>; v?: V; hud?: boolean};
const SCENES: Scene[] = [
  {from: 0, to: 150, C: Hook, v: 'B', hud: true},
  {from: 150, to: 270, C: Reveal},
  {from: 270, to: 390, C: Ask},
  {from: 390, to: 420, C: Drop},
  {from: 420, to: 510, C: Keys},
  {from: 510, to: 630, C: Risky, hud: true},
  {from: 630, to: 690, C: Yours},
  {from: 690, to: 780, C: Ask2},
  {from: 780, to: 870, C: Plan2},
  {from: 870, to: 990, C: Swarm},
  {from: 990, to: 1080, C: Wall},
  {from: 1080, to: 1230, C: Night},
  {from: 1230, to: 1290, C: Fixed},
  {from: 1290, to: 1485, C: Themes},
  {from: 1485, to: 1575, C: Listen},
  {from: 1575, to: 1650, C: Zero},
  {from: 1650, to: 1770, C: End},
];

/** Shake hits; the same frames carry an SFX hit in audio/v5_sfx.py. */
export const HITS = [
  {f: 15, a: 6}, {f: 22, a: 8}, {f: 30, a: 10}, {f: 37, a: 14},
  {f: 150, a: 26}, {f: 160, a: 10}, {f: 175, a: 10}, {f: 190, a: 14}, {f: 205, a: 10}, {f: 220, a: 16},
  {f: 390, a: 34}, {f: 420, a: 10}, {f: 450, a: 22}, {f: 462, a: 10}, {f: 480, a: 22}, {f: 492, a: 12},
  {f: 510, a: 16}, {f: 540, a: 12}, {f: 579, a: 22}, {f: 627, a: 18}, {f: 640, a: 26},
  {f: 690, a: 10}, {f: 750, a: 14}, {f: 790, a: 10}, {f: 840, a: 16}, {f: 878, a: 14}, {f: 902, a: 14}, {f: 930, a: 16},
  {f: 990, a: 10}, {f: 1000, a: 12}, {f: 1030, a: 12}, {f: 1088, a: 12}, {f: 1106, a: 30}, {f: 1128, a: 20}, {f: 1170, a: 12}, {f: 1184, a: 16},
  {f: 1248, a: 10}, {f: 1268, a: 26}, {f: 1290, a: 30}, {f: 1470, a: 14},
  {f: 1486, a: 12}, {f: 1493, a: 12}, {f: 1500, a: 14}, {f: 1515, a: 14}, {f: 1530, a: 14}, {f: 1545, a: 16}, {f: 1560, a: 10},
  {f: 1590, a: 18}, {f: 1650, a: 34},
];
/** Frames that get camera motion blur: crash zooms, whips, the zoom through the toast. */
const BLUR = [[22, 27], [30, 35], [37, 42], [270, 290], [420, 426], [462, 469], [780, 790], [870, 878], [1172, 1185]];

const Frame: React.FC = () => {
  const f = useCurrentFrame();
  const sc = SCENES.find((s) => f >= s.from && f < s.to) ?? SCENES[SCENES.length - 1];
  const sh = shakeFrom(HITS, f, !!sc.hud && !(f >= 120 && f < 150));
  return (
    <AbsoluteFill style={{background: P.ground, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg) scale(${1 + Math.abs(sh.x) / 900})`}}>
        <sc.C f={f} v={sc.v ?? 'A'} />
      </AbsoluteFill>
      {sc.hud && <Hud f={f} />}
      {f < 120 && <Dramatisation />}
    </AbsoluteFill>
  );
};

export const Film5: React.FC = () => {
  const f = useCurrentFrame();
  const blur = BLUR.some(([a, b]) => f >= a && f < b);
  return (
    <AbsoluteFill style={{background: P.ground}}>
      {blur ? (
        <CameraMotionBlur samples={6} shutterAngle={180}>
          <Frame />
        </CameraMotionBlur>
      ) : (
        <Frame />
      )}
      <Audio src={staticFile(MUSIC)} />
    </AbsoluteFill>
  );
};
