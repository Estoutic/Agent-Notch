/*
 * v7 animatic: v4's 2D scenes and EEVEE plates (public/blender/v7/<shot>/NNNN.png, blender/v7_plates.py) on the v7
 * timeline (timeline7.ts). 3D shots carry small 2D type on top; a shot that comes in with a dissolve, zoom or light
 * transition starts `x` frames early (3D: from the plate's handle frames, 2D: frozen on its first frame).
 */
import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Audio, Freeze, Img, Sequence, getStaticFiles, staticFile, useCurrentFrame} from 'remotion';
import icon from '../../../assets/icon-1024.png';
import {BODY, CODE, DISPLAY, loadFonts} from '../fonts';
import {C, Combo, Grain, ShotCtx, Vignette, expoOut, range} from '../lib';
import type {Placed} from '../timeline';
import {THEME_BEATS, THEME_ORDER} from '../timeline';
import {Freeze as FreezeShot, You} from '../scenes/Open';
import {THEME_NAMES} from '../scenes/Custom';
import {INSTALL, Local} from '../scenes/Close';
// states and anatomy keep v4's drawn marks: the real snapshots carry the vendor glyphs, too big to show at that scale
import {Anatomy, States} from '../scenes/Aware';
import {CardShot7, Hosts7, Jump7, Keys7, Presets7, Sounds7, TitleCard7, ToastShot7, Trust7, Usage7} from './scenes7';
import {Caption} from '../scenes/common';
import {EV7, HANDLE, LEN7, local7, place7, type Placed7, type Shot7Id} from './timeline7';

loadFonts();

const TWO_D: Partial<Record<Shot7Id, React.FC>> = {
  freeze: FreezeShot, you: You, title: TitleCard7, states: States, anatomy: Anatomy, usage: Usage7, jump: Jump7, keys: Keys7,
  card: CardShot7, toast: ToastShot7, trust: Trust7, sounds: Sounds7, presets: Presets7, hosts: Hosts7, local: Local,
};

/* ---------- 3D shots: plate + type ---------- */
type Ctx = {p: Placed7; f: number; len: number; ev: Record<string, number>};
const Shot3DCtx = createContext<Ctx | null>(null);
const use3D = () => useContext(Shot3DCtx)!;

const pad = (n: number) => String(n).padStart(4, '0');
const Plate: React.FC = () => {
  const {p, f, len} = use3D();
  const idx = Math.min(len + HANDLE - 1, Math.max(0, f + HANDLE));
  return <Img src={staticFile(`blender/v7/${p.id}/${pad(idx)}.png`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />;
};

const shade = (side: 'left' | 'right' | 'bottom' | 'top', a = 0.55) => {
  const dir = {left: 'to right', right: 'to left', bottom: 'to top', top: 'to bottom'}[side];
  return <AbsoluteFill style={{background: `linear-gradient(${dir}, rgba(0,0,0,${a}), transparent 50%)`}} />;
};
const Cap: React.FC<React.ComponentProps<typeof Caption>> = (props) => <Caption size={60} {...props} />;

const Cascade: React.FC = () => {
  const {f, ev} = use3D();
  const cut = f >= ev.cut3 ? 2 : f >= ev.cut2 ? 1 : 0;
  const n = [4, 8, 12][cut];
  const local = f - [0, ev.cut2, ev.cut3][cut];
  return (
    <div style={{position: 'absolute', left: 120, top: 420}}>
      <div style={{display: 'inline-block', padding: '14px 40px', background: 'rgba(0,0,0,0.82)', borderRadius: 20, fontFamily: DISPLAY, fontWeight: 650, fontSize: 170,
        letterSpacing: -6, color: C.text, transform: `scale(${1 + 0.05 * Math.exp(-local / 3)})`, transformOrigin: '0 50%'}}>{n} agents.</div>
    </div>
  );
};

const Swarm: React.FC = () => {
  const {f, ev, len} = use3D();
  return (
    <>
      {shade('bottom', 0.6)}
      <Cap f={f} from={ev.caption} to={len + 1} V={false} ly={800} sub="One notch keeps count.">55 agents. 11 projects.</Cap>
    </>
  );
};

const Open: React.FC = () => {
  const {f, ev, len} = use3D();
  return (
    <>
      {shade('right', 0.6)}
      <Cap f={f} from={ev.click + 2} to={ev.pan - 2} V={false} ly={640} lx={1240} size={64} sub="or press ⌃⌥A from anywhere">Click the notch.</Cap>
      <Cap f={f} from={ev.pan + 8} to={len + 1} V={false} ly={760} lx={1240} size={64} sub={<>Subagents hang under<br />the agent that started them.</>}>Every project.<br />Every subagent.</Cap>
    </>
  );
};

const ComboAt: React.FC<{at: number; keys: string[]; tone: string; x: number; y: number}> = ({at, keys, tone, x, y}) => {
  const {f} = use3D();
  const a = range(f, at - 8, at - 2, expoOut) * (1 - range(f, at + 18, at + 24));
  if (a <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: a, transform: `translateY(${(1 - a) * 16}px)`}}>
      <Combo f={f} at={at} keys={keys} size={96} tone={tone} />
    </div>
  );
};

const Question: React.FC = () => {
  const {f, len} = use3D();
  return (
    <>
      {shade('right', 0.65)}
      <Cap f={f} from={30} to={len + 1} V={false} ly={760} lx={1350} sub="One click sends it.">Questions get<br />answered here.</Cap>
    </>
  );
};

const Plan: React.FC = () => {
  const {f, ev, len} = use3D();
  return (
    <>
      {shade('right', 0.65)}
      <Cap f={f} from={4} to={ev.approve} V={false} ly={840} lx={1380} sub={<>Approve it, or send it<br />back with a note.</>}>Plans come to you.</Cap>
      <Cap f={f} from={ev.approve + 2} to={len + 1} V={false} ly={840} lx={1380} color={C.green}>Approved.<br />Back to work.</Cap>
    </>
  );
};

const Risky: React.FC = () => {
  const {f, ev, len} = use3D();
  return (
    <>
      {shade('right', 0.65)}
      {shade('left', 0.5)}
      <Cap f={f} from={4} to={ev.move + 2} V={false} ly={700} lx={1350} color="#ff6b61" sub={<>rm -rf, sudo,<br />git push --force, curl | sh</>}>Risky commands<br />turn red.</Cap>
      <Cap f={f} from={ev.move + 4} to={ev.deny + 2} V={false} ly={760} sub="No hotkey can allow them.">They take<br />a click.</Cap>
      <Cap f={f} from={ev.deny + 4} to={len + 1} V={false} ly={760} sub={<>The agent is told no<br />and moves on.</>}>Denied.</Cap>
      <ComboAt at={ev.tryKey} keys={['⌃', '⌥', 'Y']} tone={C.red} x={1410} y={480} />
    </>
  );
};

const Night: React.FC = () => {
  const {f, ev, len} = use3D();
  return (
    <>
      {shade('bottom', 0.5)}
      <Cap f={f} from={4} to={ev.open} V={false} ly={820} sub="The Mac stays on with the lid closed.">Keep awake.</Cap>
      <Cap f={f} from={ev.open + 16} to={len - 10} V={false} ly={820} sub="Five agents finished overnight.">Done by morning.</Cap>
      <div style={{position: 'absolute', right: 60, top: 48, fontFamily: BODY, fontWeight: 600, fontSize: 22, letterSpacing: 4, color: 'rgba(255,255,255,0.6)'}}>DRAMATISATION</div>
    </>
  );
};

const Themes: React.FC = () => {
  const {f, p} = use3D();
  const starts = THEME_BEATS.map((b) => local7(p, b));
  let i = 0;
  while (i + 1 < starts.length && f >= starts[i + 1]) i++;
  const id = THEME_ORDER[i];
  const nameIn = range(f, starts[i], starts[i] + 5, expoOut);
  return (
    <>
      {shade('left', 0.55)}
      <Cap f={f} from={2} to={10000} V={false} ly={780}>13 themes.</Cap>
      <div style={{position: 'absolute', left: 120, top: 880, opacity: nameIn, fontFamily: BODY, fontWeight: 600, fontSize: 46, color: C.sub, transform: `translateY(${(1 - nameIn) * 10}px)`}}>
        {THEME_NAMES[id]} <span style={{color: '#5c5c64', fontVariantNumeric: 'tabular-nums'}}>{i + 1}/13</span>
      </div>
    </>
  );
};

const End: React.FC = () => {
  const {f, ev, len} = use3D();
  const typed = INSTALL.slice(0, Math.floor(range(f, ev.install, ev.install + 14, (t) => t) * INSTALL.length));
  const nameIn = range(f, 10, 22, expoOut);
  const inst = range(f, ev.install - 4, ev.install + 4, expoOut);
  const url = range(f, ev.url, ev.url + 10, expoOut);
  const hit = f >= ev.hit ? Math.exp(-(f - ev.hit) / 5) : 0;
  return (
    <>
      <AbsoluteFill style={{background: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.35) 55%, transparent 75%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'scale(0.82)', transformOrigin: '50% 0'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 34, opacity: nameIn, transform: `translateY(${(1 - nameIn) * 24}px) scale(${1 + 0.035 * hit})`,
          filter: hit > 0.02 ? `drop-shadow(0 0 ${40 * hit}px rgba(255,255,255,${0.5 * hit}))` : undefined}}>
          <Img src={icon} style={{width: 128, height: 128, borderRadius: 29}} />
          <div style={{fontFamily: DISPLAY, fontWeight: 650, fontSize: 124, letterSpacing: -5, color: C.text, lineHeight: 1}}>Agent Notch</div>
        </div>
        <div style={{marginTop: 46, padding: '20px 34px', borderRadius: 18, background: '#141416', border: '1px solid #2c2c31', fontFamily: CODE, fontSize: 44, color: C.text,
          opacity: inst, transform: `translateY(${(1 - inst) * 14}px)`, whiteSpace: 'nowrap', minWidth: 1080}}>
          <span style={{color: C.green}}>$ </span>{typed}
          <span style={{display: 'inline-block', width: 3, height: 44, background: Math.floor(f / 8) % 2 ? C.text : 'transparent', marginLeft: 3, verticalAlign: 'middle'}} />
        </div>
        <div style={{marginTop: 40, fontFamily: BODY, fontWeight: 600, fontSize: 42, color: C.text, opacity: url, transform: `translateY(${(1 - url) * 12}px)`}}>github.com/Forichok/Agent-Notch</div>
        <div style={{marginTop: 16, fontFamily: BODY, fontWeight: 500, fontSize: 34, color: C.sub, opacity: range(f, ev.url + 6, ev.url + 16)}}>Free and open source · MIT</div>
      </div>
    </>
  );
};

const TYPE: Partial<Record<Shot7Id, React.FC>> = {cascade: Cascade, swarm: Swarm, open: Open, question: Question, plan: Plan, risky: Risky, night: Night, themes: Themes, end: End};

/** A 3D shot at local frame (sequence frame + off). Type is hidden while the shot is still a pre-roll. */
const Shot3D: React.FC<{p: Placed7; off?: number}> = ({p, off = 0}) => {
  const f = useCurrentFrame() + off;
  const len = p.to - p.from;
  const evs = (EV7 as Record<string, Record<string, number>>)[p.id] ?? {};
  const ev = Object.fromEntries(Object.entries(evs).map(([k, v]) => [k, local7(p, v)]));
  const T = TYPE[p.id];
  return (
    <Shot3DCtx.Provider value={{p, f, len, ev}}>
      <AbsoluteFill style={{background: '#000'}}>
        <Plate />
        {T && f >= 0 && <T />}
        <Vignette a={0.25} />
        <Grain f={f} amount={0.05} />
      </AbsoluteFill>
    </Shot3DCtx.Provider>
  );
};

const Shot2D: React.FC<{p: Placed7}> = ({p}) => {
  const S = TWO_D[p.id];
  return <ShotCtx.Provider value={p as unknown as Placed}>{S ? <S /> : null}</ShotCtx.Provider>;
};

/** The incoming shot over the last `x` frames of the previous one. */
const TransIn: React.FC<{p: Placed7; x: number; type: string}> = ({p, x, type}) => {
  const f = useCurrentFrame();
  const t = (f + 1) / x;
  const a = range(t, 0, 1, (u) => u);
  const style: React.CSSProperties =
    type === 'zoom'
      ? {opacity: range(t, 0, 0.6), transform: `scale(${1.18 - 0.18 * range(t, 0, 1, expoOut)})`, filter: `blur(${(1 - a) * 14}px)`}
      : type === 'through' // the camera has flown into the screen: the next shot grows out of it, still moving forward
        ? {opacity: range(t, 0, 0.7), transform: `scale(${0.86 + 0.14 * range(t, 0, 1, expoOut)})`, filter: `blur(${(1 - a) * 10}px)`}
        : {opacity: a};
  const body = p.kind === '3d' ? <Shot3D p={p} off={-x} /> : <Freeze frame={0}><Shot2D p={p} /></Freeze>;
  return (
    <AbsoluteFill style={style}>
      {body}
      {type === 'light' && <AbsoluteFill style={{background: '#fff4e0', opacity: 0.75 * range(t, 0, 1, (u) => u * u)}} />}
    </AbsoluteFill>
  );
};

/** The light wash peaks on the cut and fades off over the first frames of the incoming shot. */
const WashOut: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{background: '#fff4e0', opacity: 0.75 * (1 - range(f, 0, 14))}} />;
};

const hasFile = (name: string) => {
  try {
    return getStaticFiles().some((f) => f.name === name);
  } catch {
    return false;
  }
};

/*
 * A soft settle on every hard cut (scale 1.02 -> 1 over 12 frames). Flashes and bar punches were cut after the owner's
 * round-2 note (too jerky).
 */
const PLACED = place7();
const QUIET = new Set(['freeze', 'you']); // the hook's dead stops stay still
const CUT_AT = PLACED.filter((p, i) => i > 0 && (!p.in || p.in.type === 'cut') && !QUIET.has(p.id)).map((p) => ({f: p.from}));
const kick = (f: number, at: number, dur: number) => (f >= at && f < at + dur ? Math.exp(-(f - at) / (dur / 3)) : 0);
const Punch: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  let s = 1;
  // owner, round 2: flashes and bar punches read as jerky; only a soft settle on hard cuts stays
  for (const c of CUT_AT) s += 0.02 * kick(f, c.f, 12);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${s})`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export {LEN7};
export const Film7: React.FC = () => (
  <AbsoluteFill style={{background: C.bg}}>
    <Punch>
    {place7().map((p) => {
      const x = p.in && p.in.type !== 'cut' ? p.in.x : 0;
      return (
        <React.Fragment key={p.id}>
          <Sequence from={p.from} durationInFrames={p.to - p.from} name={p.id}>
            {p.kind === '3d' ? <Shot3D p={p} /> : <Shot2D p={p} />}
          </Sequence>
          {x > 0 && (
            <Sequence from={p.from - x} durationInFrames={x} name={`${p.id} in`}>
              <TransIn p={p} x={x} type={p.in!.type} />
            </Sequence>
          )}
          {p.in?.type === 'light' && (
            <Sequence from={p.from} durationInFrames={14} name={`${p.id} wash`}>
              <WashOut />
            </Sequence>
          )}
        </React.Fragment>
      );
    })}
    </Punch>
    {hasFile('audio/v7.wav') && <Audio src={staticFile('audio/v7.wav')} />}
  </AbsoluteFill>
);
