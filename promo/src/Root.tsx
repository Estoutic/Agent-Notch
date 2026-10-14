import React from 'react';
import {Composition, Still} from 'remotion';
import {Promo, Vertical, PROMO_LEN, VERTICAL_LEN} from './Film';
import {Hero, HERO_LEN} from './Hero';
import {Poster} from './Poster';
import {Film5} from './v5/Film5';
import {LEN as V5_LEN} from './v5/common';
import {PROTO_LEN, ProbeA, ProbeB} from './v5/Proto';
import {Film6} from './v6/Film6';
import {LEN as V6_LEN} from './v6/kit';
import {Film7, LEN7} from './v7/Film7';

export const Root: React.FC = () => (
  <>
    <Composition id="Promo" component={Promo} durationInFrames={PROMO_LEN} fps={30} width={1920} height={1080} />
    <Composition id="Vertical" component={Vertical} durationInFrames={VERTICAL_LEN} fps={30} width={1080} height={1920} />
    <Composition id="Hero" component={Hero} durationInFrames={HERO_LEN} fps={30} width={1920} height={1080} />
    <Composition id="V5" component={Film5} durationInFrames={V5_LEN} fps={30} width={1920} height={1080} />
    <Composition id="V5ProbeA" component={ProbeA} durationInFrames={PROTO_LEN} fps={30} width={1920} height={1080} />
    <Composition id="V5ProbeB" component={ProbeB} durationInFrames={PROTO_LEN} fps={30} width={1920} height={1080} />
    <Composition id="V6" component={Film6} durationInFrames={V6_LEN} fps={30} width={1920} height={1080} />
    <Composition id="V7" component={Film7} durationInFrames={LEN7} fps={30} width={1920} height={1080} />
    <Still id="Poster" component={Poster} width={1280} height={640} />
  </>
);
