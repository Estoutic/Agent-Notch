import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, Caption, MONO, Mark, SANS, State, camAt, countUp, range} from '../lib';
import {K, THEME_INTRO, THEME_ORDER, THEME_STEP} from '../timeline';
import {ASK_WING, Laptop, World, useV} from '../world';

const glowBg = (x = '50%', y = '0%', c = 'rgba(96,86,230,0.22)') => (
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(closest-side at ${x} ${y}, ${c}, transparent)`}} />
);

/* ---------- card ---------- */
const TABS = [{x: 20, w: 88}, {x: 120, w: 145}, {x: 277, w: 82}, {x: 371, w: 72}];
export const Card: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {V} = useV();
  const sc = V ? 0.92 : 1;
  const inP = range(f, 0, 12);
  const tab = K.cardTabs.reduce<number>((a, at, i) => (f >= at ? i : a), -1);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {glowBg(V ? '50%' : '75%', '20%')}
      <div style={{position: 'absolute', left: V ? (1080 - 680 * sc) / 2 : 1080, top: V ? 110 : 60, width: 680, height: 960, transformOrigin: '0 0',
        transform: `${V ? '' : `perspective(2400px) rotateY(${-10 + 4 * inP}deg)`} scale(${sc * (0.94 + 0.06 * inP)})`, opacity: inP, borderRadius: 26,
        boxShadow: '0 50px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)'}}>
        <Img src={staticFile('card.png')} style={{width: 680, height: 960, borderRadius: 26}} />
        {tab >= 0 && (
          <div style={{position: 'absolute', left: TABS[tab].x - 6, top: 224, width: TABS[tab].w + 12, height: 48, borderRadius: 16, border: `3px solid ${C.text}`,
            boxShadow: '0 0 30px rgba(255,255,255,0.4)', transition: 'none'}} />
        )}
        <div style={{position: 'absolute', left: 12, top: 112, width: 656, height: 84, borderRadius: 14, border: '2px solid rgba(255,255,255,0.5)', opacity: range(f, 6, 12) * (1 - range(f, K.cardTabs[0] - 2, K.cardTabs[0] + 4))}} />
      </div>
      <Caption frame={f} from={2} to={len + 20} x={V ? 60 : 110} y={V ? 1050 : 340} w={V ? 960 : 860} align={V ? 'center' : 'left'} size={V ? 96 : 100}
        segs={[{t: 'Every agent'}, {t: 'has a card.', br: true}]}
        sub={<>Done · Remaining · Files · Log<br />Model, context and cost on top.</>} />
    </AbsoluteFill>
  );
};

/* ---------- themes montage ---------- */
const THEME_NAMES: Record<(typeof THEME_ORDER)[number], string> = {
  terminal: 'Terminal', glass: 'Liquid Glass', paper: 'Paper', midnight: 'Midnight', console: 'Console', phosphor: 'Phosphor', synthwave: 'Synthwave',
  blueprint: 'Blueprint', brutal: 'Brutalism', hologram: 'Hologram', wasteland: 'Wasteland', pixel: 'Pixel', ducks: 'Rubber Ducks',
};
export const Themes: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {V} = useV();
  const idx = f < THEME_INTRO ? -1 : Math.min(12, Math.floor((f - THEME_INTRO) / THEME_STEP));
  const local = idx < 0 ? 0 : f - THEME_INTRO - idx * THEME_STEP;
  const kick = idx < 0 ? 0 : Math.max(0, 1 - local / 4);
  const intro = 1 - range(f, THEME_INTRO - 4, THEME_INTRO);
  const id = THEME_ORDER[Math.max(0, idx)];
  const imgW = V ? 1594 : 1920;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {idx >= 0 && (
        <div style={{position: 'absolute', left: V ? -6 : 0, top: V ? 380 : 0, width: imgW, height: imgW * 842 / 1920, transform: `scale(${1.02 + 0.03 * kick})`, transformOrigin: '30% 40%'}}>
          <Img src={staticFile(`themes/theme-${id}.jpg`)} style={{width: '100%', height: '100%'}} />
        </div>
      )}
      {/* hidden preload of every theme so cuts never flash */}
      <div style={{position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0}}>
        {THEME_ORDER.map((t) => <Img key={t} src={staticFile(`themes/theme-${t}.jpg`)} style={{width: 1, height: 1}} />)}
      </div>
      {!V && <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 300, background: 'linear-gradient(transparent, #000 45%)'}} />}
      {/* name grid: all 13 stay readable, the current one lights up */}
      <div style={{position: 'absolute', left: V ? 60 : 110, right: V ? 60 : 110, top: V ? 1150 : 880, display: 'flex', flexWrap: 'wrap', gap: V ? '14px 16px' : '12px 14px',
        justifyContent: V ? 'center' : 'flex-start', opacity: range(f, 6, 16)}}>
        {THEME_ORDER.map((t, i) => (
          <div key={t} style={{fontFamily: SANS, fontWeight: 650, fontSize: V ? 40 : 34, padding: V ? '8px 22px' : '6px 18px', borderRadius: 999, letterSpacing: -0.4,
            color: i === idx ? '#000' : i < idx ? '#d0d0d6' : '#6e6e76', background: i === idx ? '#fff' : 'rgba(255,255,255,0.07)'}}>{THEME_NAMES[t]}</div>
        ))}
      </div>
      {V && idx >= 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center', fontFamily: SANS, fontWeight: 760, fontSize: 120, letterSpacing: -5, color: C.text}}>13 themes.</div>
      )}
      {intro > 0.001 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: intro}}>
          <div style={{fontFamily: SANS, fontWeight: 780, fontSize: V ? 170 : 220, letterSpacing: -9, color: C.text, transform: `scale(${1 + 0.08 * range(f, 0, THEME_INTRO)})`}}>13 themes.</div>
        </AbsoluteFill>
      )}
      {len && null}
    </AbsoluteFill>
  );
};

export const ThemeMarks: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const y = -120 - 520 * range(f, 0, len, (t) => t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Img src={staticFile('themes/theme-marks.jpg')} style={{position: 'absolute', left: 0, top: y, width: 1920, height: 1773, transform: 'scale(1.04)', transformOrigin: '50% 0'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 560, background: 'linear-gradient(transparent, #000 50%)'}} />
      <Caption frame={f} from={2} to={len + 20} y={850} size={100} segs={[{t: 'Themes restyle'}, {t: 'the marks, too.', c: '#a1a1a8'}]} />
    </AbsoluteFill>
  );
};

/* ---------- sounds ---------- */
export const Sounds: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {V} = useV();
  const scroll = 260 * range(f, 10, len, (t) => t);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {glowBg('25%', '30%', 'rgba(232,96,60,0.16)')}
      <div style={{position: 'absolute', left: V ? 100 : 110, top: V ? 120 : 110, width: 880, height: V ? 800 : 860, borderRadius: 26, overflow: 'hidden', background: '#ececec',
        boxShadow: '0 50px 120px rgba(0,0,0,0.6)', opacity: range(f, 0, 10), transform: `translateY(${(1 - range(f, 0, 12)) * 40}px)`}}>
        <Img src={staticFile('sounds.jpg')} style={{position: 'absolute', left: 0, top: -scroll, width: 880, height: 1360}} />
      </div>
      <div style={{position: 'absolute', left: V ? 0 : 1100, right: V ? 0 : undefined, top: V ? 1000 : 230, textAlign: V ? 'center' : 'left', fontFamily: SANS, color: C.text}}>
        <div style={{fontWeight: 770, fontSize: 150, letterSpacing: -6, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{Math.round(countUp(f, 6, 22, 32))} <span style={{fontSize: 80, letterSpacing: -3}}>events.</span></div>
        <div style={{fontWeight: 770, fontSize: 150, letterSpacing: -6, lineHeight: 1, marginTop: 20, color: '#a1a1a8', fontVariantNumeric: 'tabular-nums'}}>{Math.round(countUp(f, 14, 30, 14))} <span style={{fontSize: 80, letterSpacing: -3}}>sounds.</span></div>
        <div style={{fontWeight: 540, fontSize: 42, color: '#a1a1a8', marginTop: 40, lineHeight: 1.3, opacity: range(f, 18, 28)}}>Volume and preview for each.<br />Only “waiting for permission”<br />is on by default.</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- toast ---------- */
export const Toast: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {V} = useV();
  const t = K.toastIn;
  const cam = camAt(f, V
    ? [{f: 0, s: 1.25, fx: 975, fy: 140, ax: 540, ay: 520}, {f: len, s: 1.32, fx: 975, fy: 140, ax: 540, ay: 520}]
    : [{f: 0, s: 1.7, fx: 975, fy: 140, ax: 960, ay: 300}, {f: len, s: 1.8, fx: 975, fy: 140, ax: 960, ay: 300}]);
  const state = (i: number): State => (i === 0 && f >= t - 2 ? 'done' : ASK_WING[i].st === 'waiting' ? 'working' : ASK_WING[i].st);
  const tin = range(f, t, t + 10);
  const toast = (
    <div style={{position: 'absolute', left: 975 - 364, top: 64 + 16 + (1 - tin) * -60, width: 728, padding: '18px 24px', borderRadius: 24, background: '#1c1c1c',
      border: '2px solid #3b3b3b', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', opacity: tin, fontFamily: SANS, boxSizing: 'border-box'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <Mark vendor="claude" size={24} state="done" />
        <span style={{fontSize: 24, fontWeight: 600, color: '#f2f2f2'}}>fix/upload-compress</span>
      </div>
      <div style={{fontSize: 22, color: '#e6e6e6', marginTop: 6}}>done · 3 files · tests ✓ · commit 4f2a9c1</div>
      <div style={{fontSize: 22, color: '#9a9a9a', marginTop: 4}}>Video now compresses to 720p in the browser before upload.</div>
    </div>
  );
  return (
    <AbsoluteFill>
      <World cam={cam} tone={1}>
        <Laptop clock="Tue 14:31" calm={1} wing={{items: ASK_WING, state, rings: [{i: 0, t: range(f, t - 2, t + 20, (x) => x), color: '#fff'}]}} over={toast} />
      </World>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 420, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))'}} />
      <Caption frame={f} from={2} to={len + 20} y={V ? 1260 : 800} x={V ? 60 : 0} w={V ? 960 : undefined} size={V ? 88 : 96}
        segs={[{t: 'Finished?'}, {t: 'A toast says what changed.', c: '#a1a1a8'}]} />
    </AbsoluteFill>
  );
};

/* ---------- presets ---------- */
export const Presets: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {V} = useV();
  const i = K.presets.reduce<number>((a, at, k) => (f >= at ? k : a), 0);
  const names = ['Brief.', 'Detailed.', 'Everything.'];
  const id = ['brief', 'detailed', 'everything'][i];
  const local = f - K.presets[i];
  const w = V ? 1000 : 1300;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {glowBg('50%', '60%')}
      <div style={{position: 'absolute', left: 0, right: 0, top: V ? 260 : 90, textAlign: 'center', fontFamily: SANS, fontWeight: 770, fontSize: V ? 96 : 110, letterSpacing: -4, lineHeight: 1.05}}>
        {names.map((n, k) => <span key={n} style={{color: k === i ? C.text : '#4a4a52', marginRight: V ? 0 : 30, display: V ? 'block' : 'inline'}}>{n}</span>)}
      </div>
      <div style={{position: 'absolute', left: (useV().W - w) / 2, top: V ? 760 : 300, width: w, height: w * 520 / 1060, borderRadius: 24, overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,0.6)', transform: `scale(${1 + 0.02 * Math.max(0, 1 - local / 6)})`}}>
        <Img src={staticFile(`preset-${id}.png`)} style={{width: '100%', height: '100%'}} />
      </div>
      <div style={{position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0}}>
        {['brief', 'detailed', 'everything'].map((p) => <Img key={p} src={staticFile(`preset-${p}.png`)} style={{width: 1, height: 1}} />)}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: V ? 1340 : 980, textAlign: 'center', fontFamily: SANS, fontWeight: 540, fontSize: 40, color: '#a1a1a8'}}>
        One preset sets the row, the list, limits and the card.
      </div>
      {len && null}
    </AbsoluteFill>
  );
};

/* ---------- everywhere ---------- */
export const Everywhere: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {V} = useV();
  const lines = [{t: 'Terminal.', at: 2}, {t: 'VS Code.', at: 8}, {t: 'Desktop app.', at: 14}];
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {glowBg('20%', '30%')}
      <div style={{position: 'absolute', left: V ? 0 : 130, right: V ? 0 : undefined, top: V ? 420 : 150, textAlign: V ? 'center' : 'left', fontFamily: SANS}}>
        <div style={{fontWeight: 560, fontSize: 44, color: '#a1a1a8', marginBottom: 20, opacity: range(f, 0, 8)}}>Works with agents in the</div>
        {lines.map((l) => {
          const p = range(f, l.at, l.at + 8);
          return <div key={l.t} style={{fontWeight: 780, fontSize: V ? 140 : 150, letterSpacing: -6, lineHeight: 1.0, color: C.text, opacity: p, transform: `translateX(${(1 - p) * -60}px)`, filter: `blur(${(1 - p) * 8}px)`}}>{l.t}</div>;
        })}
      </div>
      <div style={{position: 'absolute', left: V ? 0 : 1180, right: V ? 0 : undefined, top: V ? 1180 : 330, textAlign: V ? 'center' : 'left', fontFamily: SANS, opacity: range(f, 20, 30),
        transform: `translateY(${(1 - range(f, 20, 30)) * 20}px)`}}>
        <div style={{fontWeight: 720, fontSize: 64, letterSpacing: -2, color: C.green, lineHeight: 1.15}}>Reads local logs.</div>
        <div style={{fontWeight: 720, fontSize: 64, letterSpacing: -2, color: C.text, lineHeight: 1.15}}>No network.</div>
        <div style={{fontWeight: 540, fontSize: 40, color: '#a1a1a8', marginTop: 24}}>Opens at login, if you like.</div>
      </div>
      {MONO && len && null}
    </AbsoluteFill>
  );
};
