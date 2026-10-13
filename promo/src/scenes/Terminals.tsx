/* Generic terminal windows the agents run in (illustration, not app UI). Screen pixels. */
import React from 'react';
import {C, UI, UI_MONO} from '../lib';

type Line = {t: string; c: string};
const CL: Line[] = [
  {t: '⏺ Read(apps/api/src/routes/upload.ts)', c: '#e8e8ea'},
  {t: '  ⎿  Read 214 lines', c: '#8a8a90'},
  {t: '⏺ Bash(pnpm --filter api test)', c: '#e8e8ea'},
  {t: '  ⎿  PASS src/services/media.test.ts (38)', c: '#4cd964'},
  {t: '✻ Thinking…', c: '#e0583a'},
  {t: '⏺ Edit(src/services/media.ts)', c: '#e8e8ea'},
  {t: '  ⎿  Updated with 12 additions, 3 removals', c: '#8a8a90'},
  {t: '⏺ Task(Explore · routes)', c: '#e8e8ea'},
  {t: '⏺ Grep("compress", path: apps/)', c: '#e8e8ea'},
  {t: '  ⎿  Found 9 files', c: '#8a8a90'},
  {t: '⏺ Bash(git diff --stat)', c: '#e8e8ea'},
  {t: '   4 files changed, 61 insertions(+)', c: '#8a8a90'},
  {t: '✻ Cogitating… (esc to interrupt)', c: '#e0583a'},
];
const CX: Line[] = [
  {t: '• Running pnpm lint', c: '#e8e8ea'},
  {t: '  └ 0 problems', c: '#8a8a90'},
  {t: '• Explored', c: '#e8e8ea'},
  {t: '  └ Read schema.prisma, migrations/', c: '#8a8a90'},
  {t: '• Edited src/db/schema.ts (+18 -4)', c: '#e8e8ea'},
  {t: '• Running vitest run related', c: '#e8e8ea'},
  {t: '  └ ✓ 42 passed', c: '#4cd964'},
  {t: '• Updated Plan', c: '#e8e8ea'},
  {t: '  └ ✔ Inspect release notes', c: '#8a8a90'},
  {t: '◦ Working (12s • esc to interrupt)', c: '#8f9bff'},
];
const rnd = (s: number) => {
  const x = Math.sin(s * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};
export const lineAt = (kind: 'claude' | 'codex', seed: number, n: number): Line => {
  const pool = kind === 'claude' ? CL : CX;
  return pool[Math.floor(rnd(seed * 131 + n * 7.3) * pool.length)];
};

export const LH = 30;
export const TitleBar: React.FC<{title: string; right?: React.ReactNode; h?: number; font?: number}> = ({title, right, h = 52, font = 22}) => (
  <div style={{height: h, background: '#2a2a2f', display: 'flex', alignItems: 'center', padding: '0 22px', position: 'relative', borderBottom: '1px solid #000', flexShrink: 0}}>
    {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{width: h * 0.34, height: h * 0.34, borderRadius: '50%', background: c, marginRight: h * 0.23}} />)}
    <div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: UI, fontSize: font, fontWeight: 600, color: '#a8a8ae'}}>{title}</div>
    {right && <div style={{position: 'absolute', right: 22, top: 0, height: h, display: 'flex', alignItems: 'center'}}>{right}</div>}
  </div>
);

/** A streaming terminal window. `frozen` stops the stream at that frame. */
export const Term: React.FC<{x: number; y: number; w: number; h: number; kind: 'claude' | 'codex'; title: string; f: number; speed?: number; seed: number; frozen?: number; font?: number; style?: React.CSSProperties; children?: React.ReactNode; right?: React.ReactNode}> = ({x, y, w, h, kind, title, f, speed = 3, seed, frozen, font = 21, style, children, right}) => {
  const lh = font * 1.43;
  const rows = Math.floor((h - 52 - 28) / lh);
  const t = frozen !== undefined ? Math.min(f, frozen) : f;
  const n = Math.floor(t / speed) + 30;
  const lines: Line[] = [];
  if (!children) for (let k = n - rows + 1; k <= n; k++) lines.push(lineAt(kind, seed, k));
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 18, overflow: 'hidden', background: 'rgba(22,22,25,0.98)', display: 'flex', flexDirection: 'column',
      boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.12)', ...style}}>
      <TitleBar title={title} right={right} />
      <div style={{padding: '14px 24px', fontFamily: UI_MONO, fontSize: font, lineHeight: `${lh}px`, whiteSpace: 'pre', flex: 1, position: 'relative'}}>
        {children ?? lines.map((l, i) => <div key={i} style={{color: l.c}}>{l.t}</div>)}
      </div>
    </div>
  );
};

export const AmberDot: React.FC<{size: number; glow?: number; color?: string}> = ({size, glow = 0, color = C.amber}) => (
  <span style={{display: 'inline-block', width: size, height: size, borderRadius: '50%', background: color, verticalAlign: 'middle',
    boxShadow: glow > 0 ? `0 0 ${size * 1.2}px ${size * 0.3}px ${color}${Math.round(glow * 170).toString(16).padStart(2, '0')}` : undefined}} />
);
