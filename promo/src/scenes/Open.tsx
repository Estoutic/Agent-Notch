/* Cold open: 12 agents -> one frozen prompt -> "You." -> the amber dot becomes a mark in the notch -> approve. */
import React from 'react';
import {AbsoluteFill, Img, spring} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import icon from '../../../assets/icon-1024.png';
import {BODY, CODE, DISPLAY} from '../fonts';
import {Backdrop, C, Cursor, Grain, Ripple, Title, Vignette, camAt, clamp01, cursorPath, drift, easeIn, expoOut, lerp, range, toScreen, useShot, useV} from '../lib';
import {AttnRow, Collapse, Header, ListRow, PanelBox, Request} from '../ui/app';
import {BAR, Laptop, NOTCH_CX, World, WingItem, layoutWing} from '../world';
import {BlenderDevice, hasBlender} from '../device';
import {AmberDot, Term} from './terminals';

export const Blur: React.FC<{on: boolean; children: React.ReactNode; samples?: number}> = ({on, children, samples = 6}) =>
  on ? <CameraMotionBlur samples={samples} shutterAngle={200}>{children}</CameraMotionBlur> : <AbsoluteFill>{children}</AbsoluteFill>;

/* ---------- the journey's agents in the wing ---------- */
export const J_WING: WingItem[] = [
  {v: 'claude', st: 'waiting'}, // fix/upload-compress, the one we follow
  {v: 'claude', st: 'working', sub: true, light: true}, // its Explore subagent on haiku
  {v: 'codex', st: 'working'}, // CONF-360
  {v: 'claude', st: 'working'}, // docs/upload
];
const J_LAYOUT = layoutWing(J_WING);
/** Stage centre of the followed agent's status dot. */
export const J_DOT = {x: J_LAYOUT.marks[0].cx - 8 + 16 - 0.12 * 16 * 0.42, y: BAR / 2 - 8 + 16 - 0.12 * 16 * 0.42};
const DOT_STAGE = 16 * 0.42 - 2 * Math.max(1.5, 16 * 0.42 * 0.22); // visible amber diameter in stage px (inside the black ring)

/** Where the amber period of "You." sits, and how big it is (screen px). The match cut runs through it. */
export const periodAt = (W: number, H: number) => (W > H ? {x: 1206, y: 586, d: 40} : {x: 846, y: 1004, d: 40});

/* ---------- cascade: 4 -> 8 -> 12 terminals, three hard cuts ---------- */
const TITLES = [
  ['claude', 'claude — wedding-app — fix/upload-compress'], ['codex', 'codex — hexhaven — release-notes'], ['codex', 'codex — wedding-app — CONF-360'],
  ['claude', 'claude — agents-village — v6/notch'], ['claude', 'claude — wedding-app — docs/upload'], ['codex', 'codex — wedding-app — audit-b10'],
  ['claude', 'claude — wedding-app — feat/guest-tg'], ['codex', 'codex — wedding-app — schemas'], ['codex', 'codex — hexhaven — balance-pass'],
  ['claude', 'claude — wedding-app — code-review'], ['claude', 'claude — wedding-app — test-writer'], ['codex', 'codex — hexhaven — lint'],
] as const;
const r1 = (s: number) => {
  const x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const layout = (n: number, W: number, H: number) =>
  Array.from({length: n}, (_, i) => {
    const cols = n <= 4 ? 2 : n <= 8 ? 3 : 4;
    const rows = Math.ceil(n / cols);
    const cw = W / cols, ch = H / rows;
    const c = i % cols, r = Math.floor(i / cols);
    const w = cw * (1.25 + r1(i + n) * 0.3), h = ch * (1.25 + r1(i * 3 + n) * 0.25);
    return {x: c * cw + cw / 2 - w / 2 + (r1(i * 7 + n) - 0.5) * cw * 0.5, y: r * ch + ch / 2 - h / 2 + (r1(i * 11 + n) - 0.5) * ch * 0.4, w, h};
  });

export const Cascade: React.FC = () => {
  const {f, ev} = useShot('cascade');
  const {W, H, V} = useV();
  const cut = f >= ev.cut3 ? 2 : f >= ev.cut2 ? 1 : 0;
  const n = [4, 8, 12][cut];
  const start = [0, ev.cut2, ev.cut3][cut];
  const local = f - start;
  const punch = 1 + 0.07 * Math.exp(-local / 4);
  const rot = [-1.2, 1.6, -2.2][cut];
  const L = layout(n, W, H);
  const shake = cut === 2 ? drift(f * 6, 6, 'shake') : {x: 0, y: 0};
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${shake.x}px, ${shake.y}px) scale(${punch}) rotate(${rot}deg)`}}>
        {L.map((r, i) => (
          <Term key={i} {...r} kind={TITLES[i][0]} title={TITLES[i][1]} f={f} speed={2 + (i % 3)} seed={i + 1} font={V ? 24 : 21}
            style={{opacity: range(local, i * 0.6, i * 0.6 + 3, (t) => t)}} />
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.15), rgba(0,0,0,0.7))'}} />
      <div style={{position: 'absolute', left: V ? 0 : 120, right: V ? 0 : undefined, top: V ? 820 : 420, textAlign: V ? 'center' : 'left'}}>
        <div style={{display: 'inline-block', padding: V ? '16px 40px' : '14px 40px', background: 'rgba(0,0,0,0.82)', borderRadius: 20, fontFamily: DISPLAY, fontWeight: 650,
          fontSize: V ? 150 : 170, letterSpacing: -6, color: C.text, transform: `scale(${1 + 0.05 * Math.exp(-local / 3)})`, transformOrigin: V ? '50% 50%' : '0 50%'}}>
          {n} agents.
        </div>
      </div>
      <Grain f={f} />
    </AbsoluteFill>
  );
};

/* ---------- freeze: one prompt stops, everything else dims, the camera dives into its amber dot ---------- */
const PROMPT_LINES = [
  {t: '⏺ Read(apps/api/src/routes/upload.ts)', c: '#9a9aa0'},
  {t: '  ⎿  Read 214 lines', c: '#6e6e74'},
  {t: '⏺ Edit(src/services/media.ts)', c: '#9a9aa0'},
  {t: '  ⎿  Updated with 12 additions, 3 removals', c: '#6e6e74'},
];
export const Freeze: React.FC = () => {
  const {f, ev, len} = useShot('freeze');
  const {W, H, V} = useV();
  const T = V ? {x: 40, y: 360, w: 1000, h: 1060, font: 27} : {x: 250, y: 120, w: 1420, h: 840, font: 29};
  const lh = T.font * 1.43;
  const dotD = 16;
  const dot = {x: T.x + 24 + dotD / 2, y: T.y + 52 + 14 + 4 * lh + lh / 2};
  const P = periodAt(W, H);
  // camera: slow push, then a dive that lands the dot on the period of "You."
  const dive = range(f, ev.dive, len, (t) => t * t * t);
  const push = 1 + 0.06 * range(f, 0, ev.dive, (t) => t);
  const sEnd = P.d / dotD;
  const s = lerp(push, sEnd, dive);
  const fx = dot.x, fy = dot.y;
  const ax = lerp(W / 2 + (dot.x - W / 2) * push, P.x, dive), ay = lerp(H / 2 + (dot.y - H / 2) * push, P.y, dive);
  const prompt = f >= ev.stop;
  const box = range(f, ev.prompt, ev.prompt + 6);
  const fade = 1 - range(f, ev.dive, ev.dive + 8);
  const secs = 36 + Math.floor(range(f, ev.stop, len, (t) => t) * 3.9);
  const back = layout(12, W, H);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Blur on={f >= ev.dive}>
        <AbsoluteFill style={{transform: `translate(${ax}px, ${ay}px) scale(${s}) translate(${-fx}px, ${-fy}px)`, transformOrigin: '0 0'}}>
          <AbsoluteFill style={{opacity: 0.35 * fade, filter: 'blur(5px) saturate(0.4)'}}>
            {back.map((r, i) => i !== 0 && <Term key={i} {...r} kind={TITLES[i][0]} title={TITLES[i][1]} f={f} speed={2 + (i % 3)} seed={i + 1} frozen={ev.stop + i} font={V ? 24 : 21} />)}
          </AbsoluteFill>
          <Term x={T.x} y={T.y} w={T.w} h={T.h} kind="claude" title="claude — wedding-app — fix/upload-compress" f={f} seed={1} font={T.font}
            style={{opacity: fade, boxShadow: `0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.14)`}}
            right={prompt ? <span style={{fontFamily: BODY, fontSize: 22, fontWeight: 600, color: C.amber, letterSpacing: 0.4}}>WAITING 23:{String(secs).padStart(2, '0')}</span> : undefined}>
            {prompt ? (
              <>
                {PROMPT_LINES.map((l, i) => <div key={i} style={{color: l.c}}>{l.t}</div>)}
                <div style={{color: '#f2f2f5', fontWeight: 600}}>{'  '}Bash(pnpm --filter api test)</div>
                <div style={{marginTop: 10, border: `2px solid ${C.amber}`, borderRadius: 12, padding: '10px 20px', opacity: box, background: 'rgba(255,176,31,0.05)'}}>
                  <div style={{color: '#f2f2f5', fontWeight: 600}}>Bash command</div>
                  <div style={{color: '#f2f2f5'}}>{'  '}pnpm --filter api test</div>
                  <div style={{color: '#8a8a90'}}>{'  '}Run the API tests</div>
                  <div style={{color: '#f2f2f5', marginTop: 8}}>Do you want to proceed?</div>
                  <div style={{color: C.amber}}>❯ 1. Yes</div>
                  <div style={{color: '#b0b0b6'}}>{'  '}2. Yes, and don't ask again for pnpm</div>
                  <div style={{color: '#b0b0b6'}}>{'  '}3. No, and tell Claude what to do</div>
                </div>
              </>
            ) : undefined}
          </Term>
          {prompt && (
            <div style={{position: 'absolute', left: dot.x - dotD / 2, top: dot.y - dotD / 2, width: dotD, height: dotD}}>
              <AmberDot size={dotD} glow={0.5 + 0.5 * Math.sin(f / 4)} />
            </div>
          )}
        </AbsoluteFill>
      </Blur>
      <Title f={f} from={ev.caption} to={ev.dive + 4} x={V ? 0 : 0} y={V ? 1540 : 980 - 18} size={V ? 104 : 64} weight={640}>
        {V ? 'One bottleneck.' : ''}
      </Title>
      {!V && f >= ev.caption && f < ev.dive + 4 && (
        <div style={{position: 'absolute', right: 120, bottom: 70, fontFamily: DISPLAY, fontWeight: 640, fontSize: 96, letterSpacing: -3.5, color: C.text,
          opacity: range(f, ev.caption, ev.caption + 8) * (1 - range(f, ev.dive, ev.dive + 4)), textShadow: '0 4px 30px rgba(0,0,0,0.9)'}}>One bottleneck.</div>
      )}
      <Grain f={f} />
    </AbsoluteFill>
  );
};

/* ---------- you: black, silence, an amber period ---------- */
export const You: React.FC = () => {
  const {f} = useShot('you');
  const {W, H, V} = useV();
  const P = periodAt(W, H);
  const size = V ? 300 : 300;
  const inP = range(f, 1, 6, expoOut);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <div style={{position: 'absolute', right: W - (P.x - P.d / 2 - 10), top: P.y + P.d / 2 - size * 0.93, fontFamily: DISPLAY, fontWeight: 640, fontSize: size, letterSpacing: -size * 0.04,
        color: C.text, lineHeight: 1, opacity: inP, filter: inP < 1 ? `blur(${(1 - inP) * 8}px)` : undefined}}>You</div>
      <div style={{position: 'absolute', left: P.x - P.d / 2, top: P.y - P.d / 2}}>
        <AmberDot size={P.d} glow={0.6 + 0.3 * Math.sin(f / 5)} />
      </div>
      <Grain f={f} amount={0.06} />
    </AbsoluteFill>
  );
};

/* ---------- reveal: the period is the status dot of a mark in the notch; pull back to the MacBook ---------- */
export const revealCam = (f: number, pull: number, land: number, len: number, W: number, H: number) => {
  const P = periodAt(W, H);
  const s0 = P.d / DOT_STAGE;
  const V = H > W;
  const wide = V ? {s: 0.31, fx: NOTCH_CX, fy: 980, ax: W / 2, ay: H * 0.42} : {s: 0.5, fx: NOTCH_CX, fy: 980, ax: W / 2, ay: H * 0.5};
  return camAt(f, [
    {f: 0, s: s0, fx: J_DOT.x, fy: J_DOT.y, ax: P.x, ay: P.y},
    {f: pull, s: s0 * 0.96, fx: J_DOT.x, fy: J_DOT.y, ax: P.x, ay: P.y},
    {f: land, ...wide, e: expoOut},
    {f: len, ...wide, s: wide.s * 1.03},
  ]);
};
export const Reveal: React.FC = () => {
  const {f, ev, len} = useShot('reveal');
  const {W, H, V} = useV();
  const cam = revealCam(f, ev.pull, ev.land, len, W, H);
  const fast = f > ev.pull && f < ev.land - 6;
  const shot = V ? 'reveal-v' : 'reveal';
  const wing = {items: J_WING, glow: (i: number) => (i === 0 ? 0.6 + 0.3 * Math.sin(f / 5) : 0)};
  const blender = hasBlender(shot);
  const P = periodAt(W, H);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {blender && f >= 6 ? (
        <BlenderDevice shot={shot} frame={((f - 6) / (len - 6)) * 90} screen={{clock: 'Tue 14:25', wing}} />
      ) : (
        <Blur on={fast}>
          <World cam={cam} bg={<Backdrop f={f} light="rgba(255,255,255,0.07)" at={[50, 20]} />}>
            <Laptop clock="Tue 14:25" wing={wing} />
          </World>
        </Blur>
      )}
      {blender && f < 6 && (
        <div style={{position: 'absolute', left: P.x - P.d / 2, top: P.y - P.d / 2}}><AmberDot size={P.d} glow={0.6} /></div>
      )}
      <Vignette a={0.5} />
      <Grain f={f} />
    </AbsoluteFill>
  );
};

/* ---------- approve: click the notch, Allow, the mark turns green and the output resumes ---------- */
export const ApproveScene: React.FC<{f: number; click: number; open: number; allow: number; len: number; cam: ReturnType<typeof camAt>; inset?: {x: number; y: number; w: number; h: number; font: number}; cursorFrom?: {x: number; y: number}}> = ({f, click, open, allow, cam, inset, cursorFrom}) => {
  const reveal = spring({frame: f - open, fps: 30, config: {damping: 20, stiffness: 170, mass: 0.8}});
  const allowed = f >= allow + 1;
  const collapse = range(f, allow + 3, allow + 12);
  const notch = toScreen(cam, J_LAYOUT.marks[0].cx + 40, 32);
  const allowBtn = toScreen(cam, 456 + 46, 160 + 12 + 34 + 4 + 28 + 6 + 18);
  const from = cursorFrom ?? {x: notch.x + 520, y: notch.y + 520};
  const cur = cursorPath(f, [
    {from: 0, arrive: click - 2, a: from, b: notch, click},
    {from: click + 8, arrive: allow - 4, a: notch, b: allowBtn, click: allow},
  ], allow + 14);
  const hot = range(f, allow - 8, allow - 3);
  const state = (i: number) => (i === 0 ? (allowed ? 'working' : 'waiting') : J_WING[i].st);
  const resumed = range(f, allow + 4, allow + 30, (t) => t);
  return (
    <>
      <World cam={cam} bg={<Backdrop f={f} light="rgba(255,255,255,0.06)" at={[50, 10]} />}>
        <Laptop clock="Tue 14:25" tone={0.6}
          wing={{items: J_WING, state, glow: (i) => (i === 0 && !allowed ? 0.5 : 0), rings: [{i: 0, t: range(f, allow + 1, allow + 22, (t) => t), color: C.green}]}}
          over={
            <PanelBox reveal={reveal}>
              <Header claude={3} codex={1} waiting={allowed ? 0 : 1} right="wedding-app" />
              <Collapse t={collapse} h={132}>
                <AttnRow v="claude" st="waiting" title="fix/upload-compress" flash={{color: C.green, a: 0.25 * range(f, allow, allow + 2) * (1 - range(f, allow + 2, allow + 10))}}>
                  <Request tool="Bash" cmd={['pnpm --filter api test']} hint always hot="allow" hotA={hot} press={cur.press} />
                </AttnRow>
              </Collapse>
              <ListRow v="claude" st={allowed ? 'working' : 'waiting'} title="fix/upload-compress" model="opus" />
              <ListRow v="claude" st="working" title="Explore · routes" model="haiku" light depth={1} last />
              <ListRow v="codex" st="working" title="CONF-360" model="sol" />
              <ListRow v="claude" st="working" title="docs/upload" model="sonnet" />
            </PanelBox>
          } />
      </World>
      {inset && (
        <Term x={inset.x} y={inset.y} w={inset.w} h={inset.h} kind="claude" title="claude — fix/upload-compress" f={f} seed={1} font={inset.font}
          style={{opacity: range(f, open + 6, open + 14), transform: `translateY(${(1 - range(f, open + 6, open + 16)) * 30}px)`}}>
          <div style={{color: '#9a9aa0'}}>⏺ Edit(src/services/media.ts)</div>
          <div style={{color: allowed ? '#f2f2f5' : C.amber}}>{allowed ? '⏺' : '●'} Bash(pnpm --filter api test)</div>
          {!allowed && <div style={{color: C.amber}}>{'  '}⎿  Waiting for permission…</div>}
          {allowed && <div style={{color: '#4cd964', opacity: range(resumed, 0, 0.15)}}>{'  '}⎿  PASS src/services/media.test.ts (38)</div>}
          {allowed && <div style={{color: '#4cd964', opacity: range(resumed, 0.25, 0.4)}}>{'  '}⎿  PASS src/routes/upload.test.ts (12)</div>}
          {allowed && <div style={{color: '#e0583a', opacity: range(resumed, 0.55, 0.7)}}>✻ Wiring compression into the upload…</div>}
        </Term>
      )}
      <Ripple x={cur.x} y={cur.y} t={cur.ripple} r={30} />
      <Cursor x={cur.x} y={cur.y} press={cur.press} opacity={cur.op} size={46} />
    </>
  );
};

export const Approve: React.FC = () => {
  const {f, ev, len} = useShot('approve');
  const {V} = useV();
  const cam = V
    ? camAt(f, [{f: 0, s: 1.2, fx: 760, fy: 120, ax: 540, ay: 330}, {f: len, s: 1.26, fx: 760, fy: 120, ax: 540, ay: 330}])
    : camAt(f, [{f: 0, s: 1.15, fx: 760, fy: 210, ax: 820, ay: 340}, {f: len, s: 1.2, fx: 760, fy: 210, ax: 820, ay: 340}]);
  const inset = V ? {x: 60, y: 1150, w: 960, h: 360, font: 25} : {x: 1290, y: 620, w: 580, h: 330, font: 21};
  return (
    <AbsoluteFill>
      <ApproveScene f={f} click={ev.click} open={ev.open} allow={ev.allow} len={len} cam={cam} inset={inset} />
      <Vignette a={0.4} />
      <Grain f={f} />
    </AbsoluteFill>
  );
};

/* ---------- title ---------- */
export const TitleCard: React.FC = () => {
  const {f, len} = useShot('title');
  const {W, H, V} = useV();
  const cam = revealCam(1000, 0, 1, 2, W, H);
  const inP = range(f, 0, 10, expoOut);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{filter: 'blur(14px) brightness(0.42)', transform: `scale(${1.04 + 0.03 * range(f, 0, len, (t) => t)})`}}>
        <World cam={cam}>
          <Laptop clock="Tue 14:26" wing={{items: J_WING, state: () => 'working'}} />
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

