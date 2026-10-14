/*
 * v7 stage pieces drawn from the app's real pixels (public/snap5, made by a fresh master build with --snapshot and
 * --snapshot-film): status marks are the app's own mark renders, the list panel and wing are crops of the app's
 * snapshots. The MacBook screen is v4's Laptop without the Apple menu glyph.
 */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Backdrop, C, Cam, State, UI, Vignette, Grain, clamp01} from '../../lib';
import {BAR, NOTCH_CX, NOTCH_L, NOTCH_R, SCREEN_H, SCREEN_W, SX0, ScreenProps, WingProps, World, layoutWing} from '../../world';

const stateColor = (s: State) => ({working: C.green, waiting: C.amber, stuck: C.red, done: C.grey}[s]);

/** The app's own mark (app icon + status dot) at layout size `size` (stage px). `sub` uses the small child size. */
export const Mark7: React.FC<{vendor: 'claude' | 'codex'; size: number; state: State; light?: boolean; sub?: boolean; glow?: number}> = ({vendor, size, state, light, sub, glow = 0}) => {
  const box = size * (sub ? 10 / 6 : 13 / 9); // sprites carry 2 pt of room around the mark for the dot
  const off = (box - size) / 2;
  const dot = Math.max(5, size * 0.42);
  const col = stateColor(state);
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      {glow > 0 && (
        <div style={{position: 'absolute', left: size * 0.92 - dot * 1.6, top: size * 0.92 - dot * 1.6, width: dot * 3.2, height: dot * 3.2, borderRadius: '50%',
          background: `radial-gradient(closest-side, ${col}, transparent)`, opacity: clamp01(glow) * 0.8}} />
      )}
      <Img src={staticFile(`snap5/marks/${vendor}-${state}-${light ? 'light' : 'full'}-${sub ? 'small' : 'big'}.png`)}
        style={{position: 'absolute', left: -off, top: -off, width: box, height: box}} />
    </div>
  );
};

/* ---------- wing built from real mark sprites ---------- */
export const Wing7: React.FC<WingProps> = ({items, pop, state, glow, rings = [], left}) => {
  const L = layoutWing(items);
  const edge = Math.min(NOTCH_L, left ?? L.left);
  const r = 18;
  return (
    <>
      <svg width={2000} height={200} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <path d={`M ${edge + r} ${BAR} Q ${edge} ${BAR} ${edge} ${BAR - r} L ${edge} -1 L ${NOTCH_R} -1 L ${NOTCH_R} ${BAR - r} Q ${NOTCH_R} ${BAR} ${NOTCH_R - r} ${BAR} Z`} fill="#000" />
      </svg>
      {items.map((it, i) => {
        const m = L.marks[i];
        const p = pop ? pop(i) : 1;
        if (p <= 0.001) return null;
        const st = state ? state(i) : it.st;
        return (
          <React.Fragment key={i}>
            {rings.filter((rg) => rg.i === i && rg.t > 0 && rg.t < 1).map((rg, k) => (
              <div key={k} style={{position: 'absolute', left: m.cx - 15, top: BAR / 2 - 15, width: 30, height: 30, borderRadius: '50%', border: `1.5px solid ${rg.color}`, opacity: (1 - rg.t) * 0.9, transform: `scale(${0.35 + rg.t * 1.4})`}} />
            ))}
            <div style={{position: 'absolute', left: m.cx - m.size / 2, top: BAR / 2 - m.size / 2, transform: `scale(${p})`, opacity: clamp01(p * 2)}}>
              <Mark7 vendor={it.v} size={m.size} state={st} light={it.light} sub={it.sub} glow={glow ? glow(i) : 0} />
            </div>
            {m.textX !== undefined && (
              <div style={{position: 'absolute', left: m.textX, top: BAR / 2 - 14, fontFamily: UI, fontWeight: 600, fontSize: 22, color: '#fff', opacity: clamp01(p * 2), lineHeight: '28px'}}>{it.count}</div>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

/* ---------- the MacBook screen, without the Apple glyph ---------- */
const Wallpaper: React.FC<{tone?: number}> = ({tone = 0}) => (
  <div style={{position: 'absolute', inset: 0, background: '#16161a', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: -400, top: -600, width: 2600, height: 1900, background: 'radial-gradient(closest-side, rgba(150,150,165,0.32), transparent)'}} />
    <div style={{position: 'absolute', left: 1500, top: 700, width: 2400, height: 1800, background: 'radial-gradient(closest-side, rgba(190,120,80,0.20), transparent)'}} />
    <div style={{position: 'absolute', left: 200, top: 1100, width: 2200, height: 1500, background: 'radial-gradient(closest-side, rgba(80,110,170,0.20), transparent)'}} />
    <div style={{position: 'absolute', inset: 0, background: `rgba(6,6,8,${0.2 + 0.45 * tone})`}} />
  </div>
);
const MenuBar7: React.FC<{clock: string; app?: string; menus?: string[]}> = ({clock, app = 'Terminal', menus = ['Shell', 'Edit', 'View', 'Window', 'Help']}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: SCREEN_W, height: BAR, background: 'rgba(28,28,32,0.78)', fontFamily: UI, color: '#f2f2f5'}}>
    <div style={{position: 'absolute', left: 44, top: 0, height: BAR, display: 'flex', alignItems: 'center', gap: 40, fontSize: 27, fontWeight: 500}}>
      <span style={{fontWeight: 700}}>{app}</span>
      {menus.map((t) => <span key={t}>{t}</span>)}
    </div>
    <div style={{position: 'absolute', right: 44, top: 0, height: BAR, display: 'flex', alignItems: 'center', gap: 34, fontSize: 27, fontWeight: 500}}>
      <svg width="46" height="22" viewBox="0 0 46 22"><rect x="1" y="1" width="38" height="20" rx="5" fill="none" stroke="#bdbdc2" strokeWidth="2" /><rect x="4" y="4" width="26" height="14" rx="3" fill="#f2f2f5" /><rect x="41" y="7" width="3" height="8" rx="1.5" fill="#bdbdc2" /></svg>
      <span style={{fontVariantNumeric: 'tabular-nums'}}>{clock}</span>
    </div>
  </div>
);
export const ScreenContent7: React.FC<ScreenProps> = ({clock = 'Tue 14:02', tone, under, wing, over, app, menus}) => (
  <>
    <div style={{position: 'absolute', left: SX0, top: 0, width: SCREEN_W, height: SCREEN_H, overflow: 'hidden', borderRadius: '22px 22px 6px 6px'}}>
      <Wallpaper tone={tone} />
      <div style={{position: 'absolute', left: -SX0, top: 0}}>{under}</div>
      <MenuBar7 clock={clock} app={app} menus={menus} />
    </div>
    {wing ? <Wing7 {...wing} /> : <Wing7 items={[]} />}
    <div style={{position: 'absolute', left: NOTCH_CX - 5, top: 15, width: 10, height: 10, borderRadius: '50%', background: '#14141a', boxShadow: '0 0 0 2px #0a0a0e'}} />
    {over}
  </>
);
export const Laptop7: React.FC<ScreenProps> = (props) => (
  <>
    <div style={{position: 'absolute', left: SX0 - 420, top: SCREEN_H + 70, width: SCREEN_W + 840, height: 120, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,0,0,0.85), transparent)'}} />
    <div style={{position: 'absolute', left: SX0 - 260, top: SCREEN_H + 36, width: SCREEN_W + 520, height: 62,
      background: 'linear-gradient(#c9cace, #8f9095 45%, #4f5055)', clipPath: 'polygon(3% 0, 97% 0, 100% 62%, 99% 100%, 1% 100%, 0 62%)'}} />
    <div style={{position: 'absolute', left: NOTCH_CX - 260, top: SCREEN_H + 36, width: 520, height: 16, borderRadius: '0 0 18px 18px', background: 'linear-gradient(#6c6d72, #9a9ba0)'}} />
    <div style={{position: 'absolute', left: SX0 - 38, top: -38, width: SCREEN_W + 76, height: SCREEN_H + 76, borderRadius: 56, background: 'linear-gradient(#8a8b90, #45464b 3%, #36373b 60%, #6a6b70)', boxShadow: '0 60px 160px rgba(0,0,0,0.7)'}} />
    <div style={{position: 'absolute', left: SX0 - 34, top: -34, width: SCREEN_W + 68, height: SCREEN_H + 68, borderRadius: 52, background: '#050506'}} />
    <div style={{position: 'absolute', left: SX0 - 38, top: -38, width: SCREEN_W + 76, height: 6, borderRadius: 56, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55) 30%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0.55) 70%, transparent)'}} />
    <ScreenContent7 {...props} />
  </>
);

/** The MacBook screen under a camera, with vignette and grain (v4's Desk on Laptop7). */
export const Desk7: React.FC<{f: number; cam: Cam; screen: ScreenProps; children?: React.ReactNode; dim?: number}> = ({f, cam, screen, children, dim = 0}) => (
  <AbsoluteFill style={{background: C.bg}}>
    <World cam={cam} bg={<Backdrop f={f} light="rgba(255,255,255,0.06)" at={[50, 10]} />}>
      <Laptop7 clock="Tue 14:31" tone={0.6} {...screen} />
    </World>
    {dim > 0 && <AbsoluteFill style={{background: `rgba(0,0,0,${dim})`}} />}
    {children}
    <Vignette a={0.42} />
    <Grain f={f} />
  </AbsoluteFill>
);

/* ---------- crops of the app's own snapshots (3x PNGs, 1.5 px per stage px) ---------- */
export type SnapRef = {src: string; h: number; wing: number; panel: {top: number; bottom: number}};
/** public/snap5/list/journey*.png: stage height 428; black wing from x 665; panel y 77..407. */
export const JOURNEY: SnapRef = {src: 'snap5/list/journey.png', h: 428, wing: 665, panel: {top: 77, bottom: 407}};
export const JOURNEY_DONE: SnapRef = {...JOURNEY, src: 'snap5/list/journey-done.png'};
/** Stage centre of the first (followed) agent's mark in the real wing. */
export const JOURNEY_MARK0 = {x: 696.7, y: BAR / 2};

/** The wing of a real snapshot: the black bar from its left edge to the notch's right edge, marks included. */
export const RealWing7: React.FC<{s: SnapRef; opacity?: number}> = ({s, opacity = 1}) => (
  <div style={{position: 'absolute', left: s.wing, top: 0, width: NOTCH_R - s.wing, height: BAR, overflow: 'hidden', opacity, clipPath: 'inset(0 round 0 0 18px 18px)'}}>
    <Img src={staticFile(s.src)} style={{position: 'absolute', left: -s.wing, top: 0, width: 1280}} />
  </div>
);

/** The list panel of a real snapshot, revealed under the notch like v4's PanelBox. */
export const RealPanel7: React.FC<{s: SnapRef; reveal?: number; hi?: {y0: number; y1: number; a: number}}> = ({s, reveal = 1, hi}) => {
  if (reveal <= 0.001) return null;
  const rv = clamp01(reveal);
  const H = s.panel.bottom - s.panel.top;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: s.h, transformOrigin: `${NOTCH_CX}px 64px`,
      transform: `translateY(${(1 - rv) * -24}px) scale(${0.94 + 0.06 * rv})`, opacity: clamp01(reveal * 1.8), filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.6))'}}>
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(${s.panel.top}px 121px ${s.h - s.panel.bottom + (1 - rv) * H}px 401px round 21px)`}}>
        <Img src={staticFile(s.src)} style={{width: 1280, height: s.h}} />
        {hi && hi.a > 0.001 && <div style={{position: 'absolute', left: 401, width: 758, top: hi.y0, height: hi.y1 - hi.y0, background: `rgba(255,255,255,${0.09 * hi.a})`}} />}
      </div>
    </div>
  );
};
