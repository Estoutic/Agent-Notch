/* v6 "One Person", ~90 s at 30 fps: one developer's day and night with 55 agents. research/v6/treatment.md */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {loadFonts} from '../fonts';
import {Clock, Ground} from './kit';
import {Morning, Night, Sunset, Todo} from './Scenes';

loadFonts();

type Scene = {from: number; to: number; C: React.FC<{f: number}>; clock?: boolean};
const todo = (n: number, name: string): React.FC<{f: number}> => ({f}) => <Todo f={f} n={n} name={name} />;
export const SCENES: Scene[] = [
  {from: 0, to: 240, C: Morning},
  {from: 240, to: 420, C: todo(2, 'the slowest process')},
  {from: 420, to: 660, C: todo(3, 'reveal')},
  {from: 660, to: 840, C: todo(4, 'first request')},
  {from: 840, to: 960, C: todo(5, 'hotkeys')},
  {from: 960, to: 1200, C: todo(6, 'rm -rf, yours')},
  {from: 1200, to: 1380, C: todo(7, 'question, plan')},
  {from: 1380, to: 1560, C: todo(8, 'swarm')},
  {from: 1560, to: 1680, C: todo(9, 'limits')},
  {from: 1680, to: 1920, C: Sunset},
  {from: 1920, to: 2040, C: todo(11, 'listen')},
  {from: 2040, to: 2100, C: todo(12, 'zero bytes')},
  {from: 2100, to: 2340, C: Night, clock: false},
  {from: 2340, to: 2520, C: todo(14, 'morning')},
  {from: 2520, to: 2700, C: todo(15, 'end')},
];

export const Film6: React.FC = () => {
  const f = useCurrentFrame();
  const sc = SCENES.find((x) => f >= x.from && f < x.to) ?? SCENES[SCENES.length - 1];
  const night = sc.C === Night && f >= 2176;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Ground f={f} />
      <sc.C f={f} />
      {!night && <Clock f={f} />}
    </AbsoluteFill>
  );
};
