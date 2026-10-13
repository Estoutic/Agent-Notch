/* v5 "Slowest Process", 59 s at 30 fps. Built beat by beat from research/v5/creative-treatment.md section 3. */
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {loadFonts} from '../fonts';
import {P, T} from './common';
import {Hook} from './Top';
import {AskBeat} from './Ask';
import {OrbitBeat} from './Orbit';
import {Bookend15, End19, Keys7, Net18, Plan11, Question10, Resume6, Reveal4, Risky8, Sounds17, Toast14, Tower12, Usage13, Yours9} from './Beats';

loadFonts();

/* Music edit from audio/v5_edit.py; heist-2 until the owner picks a take. */
const MUSIC = 'audio/v5-heist-2.wav';

type Beat = {n: number; from: number; to: number; C?: React.FC<{f: number}>};
const BEATS: Beat[] = [
  {n: 1, from: 0, to: 150, C: Hook}, // beats 1-3
  {n: 4, from: 150, to: 270, C: Reveal4},
  {n: 5, from: 270, to: 390, C: AskBeat},
  {n: 6, from: 390, to: 420, C: Resume6},
  {n: 7, from: 420, to: 510, C: Keys7},
  {n: 8, from: 510, to: 630, C: Risky8},
  {n: 9, from: 630, to: 690, C: Yours9},
  {n: 10, from: 690, to: 780, C: Question10},
  {n: 11, from: 780, to: 870, C: Plan11},
  {n: 12, from: 870, to: 990, C: Tower12},
  {n: 13, from: 990, to: 1080, C: Usage13},
  {n: 14, from: 1080, to: 1230, C: Toast14},
  {n: 15, from: 1230, to: 1290, C: Bookend15},
  {n: 16, from: 1290, to: 1485, C: OrbitBeat},
  {n: 17, from: 1485, to: 1575, C: Sounds17},
  {n: 18, from: 1575, to: 1650, C: Net18},
  {n: 19, from: 1650, to: 1770, C: End19},
];

const Todo: React.FC<{n: number}> = ({n}) => (
  <AbsoluteFill style={{background: P.ground, alignItems: 'center', justifyContent: 'center', fontFamily: T.mono, fontSize: 40, color: P.faint}}>beat {n}</AbsoluteFill>
);

export const Film5: React.FC = () => {
  const f = useCurrentFrame();
  const b = BEATS.find((x) => f >= x.from && f < x.to) ?? BEATS[BEATS.length - 1];
  return (
    <AbsoluteFill style={{background: P.ground}}>
      {b.C ? <b.C f={f} /> : <Todo n={b.n} />}
      <Audio src={staticFile(MUSIC)} />
    </AbsoluteFill>
  );
};
