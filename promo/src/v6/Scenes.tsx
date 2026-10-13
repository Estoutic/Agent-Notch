/* v6 scenes. Beat numbers and times follow research/v6/treatment.md section 4. */
import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Mark} from '../lib';
import {Snap} from '../v5/Beats';
import {Dramatisation, P, Plate, T, clamp01, lerp, span} from '../v5/common';
import {THEMES} from '../v5/Orbit';
import {BAR, Cap, Note, clockText, minutesAt, rise} from './kit';

/* The swarm fixture (Sources/NotchCore/Fixtures.swift, "swarm"): 11 projects, one lead branch each. */
export const PROJECTS: [string, string, 'claude' | 'codex'][] = [
  ['wedding-app', 'fix/upload-compress', 'claude'], ['agents-village', 'v6/notch', 'claude'], ['agenttrack', 'ingest-v2', 'claude'],
  ['billing-api', 'invoice-retry', 'claude'], ['design-system', 'tokens-v3', 'claude'], ['docs-site', 'search-index', 'codex'],
  ['hexhaven', 'release-notes', 'codex'], ['hexhaven-kit', 'map-editor', 'claude'], ['infra', 'k8s-upgrade', 'claude'],
  ['mobile-shell', 'push-tokens', 'claude'], ['stickers', 'pack-07', 'codex'],
];

/* ---------- a small terminal tile that keeps itself busy ---------- */
const VERBS = ['● Reading', '● Editing', '● Running', '✓', '● Searching', '● Writing'];
const FILES = ['src/upload.ts', 'api/routes.ts', 'tests/e2e.spec.ts', 'README.md', 'lib/queue.ts', 'ui/Button.tsx', 'infra/main.tf', 'store.swift'];
const line = (seed: number) => {
  const v = VERBS[Math.floor(random(`v${seed}`) * VERBS.length)];
  return v === '✓' ? `✓ ${4 + Math.floor(random(`n${seed}`) * 30)} passed` : `${v} ${FILES[Math.floor(random(`f${seed}`) * FILES.length)]}`;
};
const Tile: React.FC<{f: number; i: number; w: number; h: number; typed?: string}> = ({f, i, w, h, typed}) => {
  const [proj, branch, vendor] = PROJECTS[i % PROJECTS.length];
  const fs = Math.max(7, Math.min(26, h / 9));
  const rows = Math.max(1, Math.floor((h - fs * 2.6) / (fs * 1.35)));
  const tick = Math.floor((f + i * 7) / (6 + (i % 5)));
  const waiting = i === 0 ? false : random(`w${i}`) < 0.08;
  return (
    <div style={{position: 'absolute', width: w, height: h, boxSizing: 'border-box', borderRadius: Math.max(4, w / 40), background: '#121214', border: '1px solid #26262b', overflow: 'hidden'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: fs * 0.5, padding: `${fs * 0.4}px ${fs * 0.6}px`, background: '#19191c', fontFamily: T.body, fontSize: fs * 0.8, color: P.dim, whiteSpace: 'nowrap'}}>
        <Mark vendor={vendor} size={fs * 0.8} state={waiting ? 'waiting' : 'working'} />
        <span>{proj} · {branch}</span>
      </div>
      <div style={{padding: `${fs * 0.3}px ${fs * 0.6}px`, fontFamily: T.mono, fontSize: fs, lineHeight: 1.35, color: '#B8B8C0', whiteSpace: 'pre'}}>
        {typed !== undefined
          ? <span>{'> '}{typed}<span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0}}>▍</span></span>
          : Array.from({length: rows}, (_, r) => {
              const t = line(i * 1000 + tick + r);
              return <div key={r} style={{color: t.startsWith('✓') ? P.green : r === rows - 1 && waiting ? P.amber : undefined}}>{r === rows - 1 && waiting ? '? Allow Bash: pnpm test' : t}</div>;
            })}
      </div>
    </div>
  );
};

/* ---------- 1 (0-240): one agent, then eleven projects, then 55 ---------- */
const GRIDS = [{at: 0, c: 1, r: 1}, {at: 60, c: 2, r: 2}, {at: 120, c: 4, r: 4}, {at: 180, c: 11, r: 5}];
export const Morning: React.FC<{f: number}> = ({f}) => {
  const g = [...GRIDS].reverse().find((x) => f >= x.at)!;
  const gp = rise(f, g.at);
  const W = 1920, H = 1080, pad = 60, top = 110, gap = g.c > 4 ? 10 : 18;
  const tw = (W - pad * 2 - gap * (g.c - 1)) / g.c, th = (H - pad - top - gap * (g.r - 1)) / g.r;
  const pull = lerp(1.0, 0.86, span(f, 190, 240, (t) => t));
  const typed = 'claude'.slice(0, Math.max(0, Math.floor((f - 14) / 4)));
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${pull * lerp(1.08, 1, gp)})`, opacity: f < 6 ? f / 6 : 1}}>
        {Array.from({length: g.c * g.r}, (_, i) => {
          const cx = i % g.c, cy = Math.floor(i / g.c);
          const d = Math.min(1, gp * 1.6 - (cx + cy) * 0.02);
          return (
            <div key={i} style={{position: 'absolute', left: pad + cx * (tw + gap), top: top + cy * (th + gap), opacity: clamp01(d * 2)}}>
              <Tile f={f} i={i} w={tw} h={th} typed={g.c === 1 ? typed : undefined} />
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(10,8,7,0.92) 0%, rgba(10,8,7,0.6) 26%, rgba(10,8,7,0) 45%)'}} />
      <Cap f={f} at={20} out={56} style={{left: 96, bottom: 90}}>One agent.</Cap>
      <Cap f={f} at={66} out={116} style={{left: 96, bottom: 90}}>Then eleven projects.</Cap>
      <Cap f={f} at={186} style={{left: 96, bottom: 90}} size={160}>Fifty-five agents.</Cap>
    </AbsoluteFill>
  );
};

/* ---------- 10 (1680-1920): sunset, the 13 themes, a name per bar half ---------- */
export const Sunset: React.FC<{f: number}> = ({f}) => {
  const lf = f - 1680;
  const per = 240 / THEMES.length;
  const i = Math.min(THEMES.length - 1, Math.floor(lf / per));
  const sweep = lf / 240;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/* the low sun crosses the room: a warm band that drifts over the frame and turns magenta */}
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 90% at ${lerp(85, 20, sweep)}% 30%, rgba(255,${Math.round(lerp(140, 70, sweep))},${Math.round(lerp(40, 140, sweep))},0.38) 0%, rgba(0,0,0,0) 70%)`}} />
      <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 35%', transform: `scale(${lerp(0.74, 0.8, sweep)})`, mixBlendMode: 'screen'}}>
        <Plate shot="themes" frame={(lf * 195) / 240} />
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(0,0,0,0.7), rgba(0,0,0,0) 34%)'}} />
      <div style={{position: 'absolute', left: 96, bottom: 84, display: 'flex', alignItems: 'baseline', gap: 24}}>
        <span style={{fontFamily: T.mono, fontSize: 30, color: P.dim}}>{String(i + 1).padStart(2, '0')}/13</span>
        <span key={i} style={{fontFamily: T.display, fontWeight: 700, fontSize: 72, color: P.text, display: 'inline-block', opacity: Math.min(1, rise(f, 1680 + i * per) * 1.5), transform: `translateY(${(1 - rise(f, 1680 + i * per)) * 24}px)`}}>{THEMES[i]}</span>
      </div>
      <Cap f={f} at={1690} out={1850} size={120} style={{right: 96, bottom: 84, textAlign: 'right'}}>13 themes.</Cap>
      <Cap f={f} at={1860} size={120} style={{right: 96, bottom: 84, textAlign: 'right'}}>Yes, Rubber Ducks.</Cap>
    </AbsoluteFill>
  );
};

/* ---------- 13 (2100-2340): Keep awake, close the lid, the night runs ---------- */
export const Night: React.FC<{f: number}> = ({f}) => {
  const on = 2124, lid = 2156, shut = 2176, end = 2330;
  if (f < shut) {
    const hk = 2.6, hx = 232, hy = 400;
    const close = span(f, lid, shut, (t) => t * t);
    return (
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: hx, top: hy, transform: `scale(${lerp(1, 1.04, span(f, 2100, shut, (t) => t))})`, transformOrigin: '70% 50%'}}>
          <Snap dir={f >= on ? 'snap4/awake' : 'snap4'} src="one.png" x0={600} y0={78} x1={1160} y1={200} k={hk} r={0} style={{position: 'relative'}} />
        </div>
        <Cap f={f} at={on + 2} out={lid} size={150} color={P.amber} style={{left: hx, top: 150}}>Keep awake.</Cap>
        <Note f={f} at={on + 14} out={lid - 10} style={{left: hx + 4, top: hy + 360}}>The Mac stays on with the lid closed, until you switch it off.</Note>
        {f >= lid && <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 1080 * close, background: '#03040A', borderBottom: '4px solid #2a2f45'}} />}
        <Cap f={f} at={lid + 2} size={130} style={{left: hx, top: 760}}>Close the lid.</Cap>
      </AbsoluteFill>
    );
  }
  const n = Math.floor(PROJECTS.length * span(f, shut + 20, end - 10, (t) => t));
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 1180, top: 150, display: 'flex', flexDirection: 'column', gap: 18}}>
        {PROJECTS.map(([p, b, v], i) => (
          <div key={p} style={{display: 'flex', alignItems: 'center', gap: 18, fontFamily: T.body, fontSize: 30, color: i < n ? P.text : P.dim, opacity: i < n ? 1 : 0.7}}>
            <Mark vendor={v} size={30} state={i < n ? 'done' : 'working'} />
            <span style={{fontWeight: 600}}>{p}</span>
            <span style={{color: P.dim, fontSize: 24}}>{b}{i < n ? ' · done' : ''}</span>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 90, top: 150, fontFamily: T.mono, fontWeight: 600, fontSize: 240, color: '#DCE3FF', letterSpacing: -4}}>{clockText(minutesAt(f))}</div>
      <Cap f={f} at={shut + 4} size={110} style={{left: 96, top: 520}}>They keep working.</Cap>
      <Note f={f} at={shut + 30} style={{left: 100, top: 670}}>Anything that needs your answer waits for you.</Note>
      <Dramatisation />
    </AbsoluteFill>
  );
};

/** A beat not built yet: its number and name, so the animatic timing reads. */
export const Todo: React.FC<{f: number; n: number; name: string}> = ({n, name}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
    <div style={{fontFamily: T.mono, fontSize: 34, color: P.faint}}>{`${n} · ${name}`}</div>
  </AbsoluteFill>
);
export {BAR};
