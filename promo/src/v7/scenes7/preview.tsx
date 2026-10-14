/* Scratch entry for stills of the v7 variants: `npx remotion still src/v7/scenes7/preview.tsx P-<shot> out.png --frame=N`. Not used by Root. */
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ShotCtx} from '../../lib';
import type {Placed} from '../../timeline';
import {loadFonts} from '../../fonts';
import {place7} from '../timeline7';
import {Anatomy7, CardShot7, Hosts7, Jump7, Presets7, Sounds7, States7, TitleCard7, ToastShot7, Trust7, Usage7} from './index';

loadFonts();
const SC: Record<string, React.FC> = {title: TitleCard7, states: States7, anatomy: Anatomy7, usage: Usage7, jump: Jump7, card: CardShot7, toast: ToastShot7, trust: Trust7, sounds: Sounds7, presets: Presets7, hosts: Hosts7};
const placed = place7();
const Root: React.FC = () => (
  <>
    {Object.entries(SC).map(([id, S]) => {
      const p = placed.find((x) => x.id === id)!;
      const C: React.FC = () => <ShotCtx.Provider value={p as unknown as Placed}><S /></ShotCtx.Provider>;
      return <Composition key={id} id={`P-${id}`} component={C} durationInFrames={p.to - p.from} fps={30} width={1920} height={1080} />;
    })}
  </>
);
registerRoot(Root);
