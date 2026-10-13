import React from 'react';
import {AbsoluteFill, Audio, Sequence, getStaticFiles, staticFile} from 'remotion';
import {loadFonts} from './fonts';
import {C, ShotCtx} from './lib';
import {PROMO, ShotDef, ShotId, VERTICAL, filmFrames, place} from './timeline';
import {Approve, Cascade, Freeze, Reveal, TitleCard, You} from './scenes/Open';
import {Anatomy, Jump, OpenList, States, Usage} from './scenes/Aware';
import {Keys, PlanShot, QuestionShot, Risky, Trust} from './scenes/Answer';
import {CardShot, ToastShot} from './scenes/Finish';
import {Presets, Sounds, Themes} from './scenes/Custom';
import {End, Hosts, Local} from './scenes/Close';

loadFonts();

const Todo: React.FC<{id: string}> = ({id}) => (
  <AbsoluteFill style={{background: '#111', color: '#666', alignItems: 'center', justifyContent: 'center', fontSize: 80}}>{id}</AbsoluteFill>
);

const SHOTS: Partial<Record<ShotId, React.FC>> = {
  cascade: Cascade, freeze: Freeze, you: You, reveal: Reveal, approve: Approve, title: TitleCard,
  states: States, anatomy: Anatomy, open: OpenList, usage: Usage, jump: Jump,
  keys: Keys, risky: Risky, question: QuestionShot, plan: PlanShot, trust: Trust,
  card: CardShot, toast: ToastShot, themes: Themes, sounds: Sounds, presets: Presets,
  hosts: Hosts, local: Local, end: End,
};

const hasFile = (name: string) => {
  try {
    return getStaticFiles().some((f) => f.name === name);
  } catch {
    return false;
  }
};

const Chain: React.FC<{shots: ShotDef[]; audio: string}> = ({shots, audio}) => (
  <AbsoluteFill style={{background: C.bg}}>
    {place(shots).map((p) => {
      const S = SHOTS[p.id];
      return (
        <Sequence key={p.id} from={p.from} durationInFrames={p.to - p.from} name={p.id}>
          <ShotCtx.Provider value={p}>{S ? <S /> : <Todo id={p.id} />}</ShotCtx.Provider>
        </Sequence>
      );
    })}
    {hasFile(audio) && <Audio src={staticFile(audio)} />}
  </AbsoluteFill>
);

export const PROMO_LEN = filmFrames(PROMO);
export const VERTICAL_LEN = filmFrames(VERTICAL);
export const Promo: React.FC = () => <Chain shots={PROMO} audio="audio/promo.wav" />;
export const Vertical: React.FC = () => <Chain shots={VERTICAL} audio="audio/vertical.wav" />;
