import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BODY} from './fonts';
import {C, Cam, Mark, State, UI, clamp01} from './lib';

/*
 * Stage coordinates = pixel coordinates of the app's own renders in public/ (@2x). Menu bar 64 px tall, the black
 * notch bar ends at x = 1160, the list panel sits at x 401..1159 from y = 77. Hardware notch ≈ [792, 1160].
 */
export const BAR = 64;
export const NOTCH_L = 792;
export const NOTCH_R = 1160;
export const NOTCH_CX = 976;
export const SCREEN_W = 3024;
export const SCREEN_H = 1964;
export const SX0 = NOTCH_CX - SCREEN_W / 2;

/* ---------- wing ---------- */
export type WingItem = {v: 'claude' | 'codex'; st: State; light?: boolean; sub?: boolean; count?: number};
export type WingLayout = {left: number; marks: {cx: number; size: number; textX?: number}[]};
export const layoutWing = (items: WingItem[], right = 778): WingLayout => {
  const marks: WingLayout['marks'] = new Array(items.length);
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    const size = it.sub ? 11 : 16;
    const w = size + (it.count ? 22 : 0);
    const l = right - w;
    marks[i] = {cx: l + size / 2, size, textX: it.count ? l + size + 5 : undefined};
    right = l - (it.sub ? 6 : 14);
  }
  return {left: items.length ? marks[0].cx - marks[0].size / 2 - 22 : NOTCH_L, marks};
};

export type WingProps = {
  items: WingItem[];
  /** 0..1+ scale per mark (pop-in). */
  pop?: (i: number) => number;
  state?: (i: number) => State;
  glow?: (i: number) => number;
  rings?: {i: number; t: number; color: string}[];
  /** Wing edge override (animated growth). */
  left?: number;
};
export const Wing: React.FC<WingProps> = ({items, pop, state, glow, rings = [], left}) => {
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
              <Mark vendor={it.v} size={m.size} state={st} light={it.light} glow={glow ? glow(i) : 0} />
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

/* ---------- the screen: wallpaper, menu bar, wing, overlays (stage coordinates) ---------- */
const Wallpaper: React.FC<{tone?: number}> = ({tone = 0}) => (
  <div style={{position: 'absolute', inset: 0, background: '#16161a', overflow: 'hidden'}}>
    {/* graphite dunes: neutral, a whisper of warm and cool */}
    <div style={{position: 'absolute', left: -400, top: -600, width: 2600, height: 1900, background: 'radial-gradient(closest-side, rgba(150,150,165,0.32), transparent)'}} />
    <div style={{position: 'absolute', left: 1500, top: 700, width: 2400, height: 1800, background: 'radial-gradient(closest-side, rgba(190,120,80,0.20), transparent)'}} />
    <div style={{position: 'absolute', left: 200, top: 1100, width: 2200, height: 1500, background: 'radial-gradient(closest-side, rgba(80,110,170,0.20), transparent)'}} />
    <div style={{position: 'absolute', inset: 0, background: `rgba(6,6,8,${0.2 + 0.45 * tone})`}} />
  </div>
);

export const MenuBar: React.FC<{clock: string; app?: string; menus?: string[]}> = ({clock, app = 'Terminal', menus = ['Shell', 'Edit', 'View', 'Window', 'Help']}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: SCREEN_W, height: BAR, background: 'rgba(28,28,32,0.78)', fontFamily: UI, color: '#f2f2f5'}}>
    <div style={{position: 'absolute', left: 44, top: 0, height: BAR, display: 'flex', alignItems: 'center', gap: 40, fontSize: 27, fontWeight: 500}}>
      <svg width="26" height="30" viewBox="0 0 26 30"><path d="M21.5 16c0-3.6 3-5.3 3.1-5.4-1.7-2.5-4.3-2.8-5.2-2.8-2.2-.2-4.3 1.3-5.4 1.3-1.1 0-2.8-1.3-4.7-1.2C6.9 8 4.6 9.4 3.4 11.6c-2.6 4.4-.7 11 1.8 14.6 1.2 1.8 2.7 3.7 4.6 3.6 1.8-.1 2.5-1.2 4.8-1.2 2.2 0 2.9 1.2 4.8 1.1 2 0 3.2-1.8 4.4-3.6 1.4-2 2-4 2-4.1-.1 0-3.9-1.5-4.3-6zM17.9 5.3c1-1.2 1.7-2.9 1.5-4.6-1.4.1-3.2 1-4.2 2.2-.9 1.1-1.7 2.8-1.5 4.4 1.6.1 3.2-.8 4.2-2z" fill="#f2f2f5" /></svg>
      <span style={{fontWeight: 700}}>{app}</span>
      {menus.map((t) => <span key={t}>{t}</span>)}
    </div>
    <div style={{position: 'absolute', right: 44, top: 0, height: BAR, display: 'flex', alignItems: 'center', gap: 34, fontSize: 27, fontWeight: 500}}>
      <svg width="46" height="22" viewBox="0 0 46 22"><rect x="1" y="1" width="38" height="20" rx="5" fill="none" stroke="#bdbdc2" strokeWidth="2" /><rect x="4" y="4" width="26" height="14" rx="3" fill="#f2f2f5" /><rect x="41" y="7" width="3" height="8" rx="1.5" fill="#bdbdc2" /></svg>
      <span style={{fontVariantNumeric: 'tabular-nums'}}>{clock}</span>
    </div>
  </div>
);

export type ScreenProps = {clock?: string; tone?: number; under?: React.ReactNode; wing?: WingProps; over?: React.ReactNode; app?: string; menus?: string[]};
/** Screen content in stage coordinates. Laptop clips it to the 2D screen; BlenderDevice maps it onto the 3D screen. */
export const ScreenContent: React.FC<ScreenProps> = ({clock = 'Tue 14:02', tone, under, wing, over, app, menus}) => (
  <>
    <div style={{position: 'absolute', left: SX0, top: 0, width: SCREEN_W, height: SCREEN_H, overflow: 'hidden', borderRadius: '22px 22px 6px 6px'}}>
      <Wallpaper tone={tone} />
      <div style={{position: 'absolute', left: -SX0, top: 0}}>{under}</div>
      <MenuBar clock={clock} app={app} menus={menus} />
    </div>
    {wing ? <Wing {...wing} /> : <Wing items={[]} />}
    <div style={{position: 'absolute', left: NOTCH_CX - 5, top: 15, width: 10, height: 10, borderRadius: '50%', background: '#14141a', boxShadow: '0 0 0 2px #0a0a0e'}} />
    {over}
  </>
);

/** 2D MacBook (fallback when no Blender render exists). */
export const Laptop: React.FC<ScreenProps> = (props) => (
  <>
    <div style={{position: 'absolute', left: SX0 - 420, top: SCREEN_H + 70, width: SCREEN_W + 840, height: 120, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,0,0,0.85), transparent)'}} />
    <div style={{position: 'absolute', left: SX0 - 260, top: SCREEN_H + 36, width: SCREEN_W + 520, height: 62,
      background: 'linear-gradient(#c9cace, #8f9095 45%, #4f5055)', clipPath: 'polygon(3% 0, 97% 0, 100% 62%, 99% 100%, 1% 100%, 0 62%)'}} />
    <div style={{position: 'absolute', left: NOTCH_CX - 260, top: SCREEN_H + 36, width: 520, height: 16, borderRadius: '0 0 18px 18px', background: 'linear-gradient(#6c6d72, #9a9ba0)'}} />
    <div style={{position: 'absolute', left: SX0 - 38, top: -38, width: SCREEN_W + 76, height: SCREEN_H + 76, borderRadius: 56, background: 'linear-gradient(#8a8b90, #45464b 3%, #36373b 60%, #6a6b70)', boxShadow: '0 60px 160px rgba(0,0,0,0.7)'}} />
    <div style={{position: 'absolute', left: SX0 - 34, top: -34, width: SCREEN_W + 68, height: SCREEN_H + 68, borderRadius: 52, background: '#050506'}} />
    {/* rim light along the top edge of the lid */}
    <div style={{position: 'absolute', left: SX0 - 38, top: -38, width: SCREEN_W + 76, height: 6, borderRadius: 56, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55) 30%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0.55) 70%, transparent)'}} />
    <ScreenContent {...props} />
  </>
);

/** Stage with a camera: translate(anchor) scale translate(-focus). */
export const World: React.FC<{cam: Cam; children: React.ReactNode; bg?: React.ReactNode}> = ({cam, children, bg}) => {
  const {s, fx, fy, ax, ay} = cam;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: C.bg}}>
      {bg}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1, height: 1, transformOrigin: '0 0', transform: `translate(${ax}px, ${ay}px) scale(${s}) translate(${-fx}px, ${-fy}px)`}}>
        {children}
      </div>
    </AbsoluteFill>
  );
};

export const fontBody = BODY;
