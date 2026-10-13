/* Beats 1-3 (0-150): the fictional `top`-style list, the sort flip, the push into `you`, the accusation. */
import React from 'react';
import {random} from 'remotion';
import {Dramatisation, P, T, clamp01, lerp, span} from './common';

type Row = {pid: number; agent: string; blocked?: string};
export const ROWS: Row[] = [
  {pid: 3982, agent: 'codex · CONF-360'},
  {pid: 4051, agent: 'claude · docs/upload'},
  {pid: 4127, agent: 'claude · fix/upload-compress', blocked: '20:14'},
  {pid: 4133, agent: 'claude · Explore routes'},
  {pid: 4208, agent: 'codex · release-notes'},
  {pid: 4219, agent: 'claude · code-reviewer'},
  {pid: 4302, agent: 'codex · fixtures'},
  {pid: 4377, agent: 'claude · v6/notch'},
  {pid: 4410, agent: 'codex · ui-card'},
  {pid: 4456, agent: 'claude · migrate-db'},
  {pid: 4511, agent: 'codex · lint-fix'},
  {pid: 4590, agent: 'claude · e2e-flaky'},
  {pid: 4623, agent: 'claude · i18n-ru'},
];
const HERO = 2;

const FONT = 34;
const CH = FONT * 0.6; // Geist Mono advance
const LINE = 52;
const COLS = [0, 7, 38, 48, 57]; // PID AGENT STATE BLOCKED WAITING-ON, in characters
const TABLE_W = 66 * CH;
const X0 = (1920 - TABLE_W) / 2;
const Y0 = 210; // first data row baseline box top
export const SORT_AT = 24;

const pad = (v: string, n: number) => v.padEnd(n, ' ');

/** Position of row r in the list at frame f: PID order, then BLOCKED order from SORT_AT. */
const slot = (r: number, f: number, at = SORT_AT, snap = 9) => {
  const sorted = r === HERO ? 0 : r < HERO ? r + 1 : r;
  return lerp(r, sorted, span(f, at, at + snap));
};

export const youCell = () => ({x: X0 + COLS[4] * CH + CH * 1.5, y: Y0 + LINE / 2});

export const TopList: React.FC<{f: number; done?: boolean; sortAt?: number; snap?: number}> = ({f, done, sortAt = SORT_AT, snap = 9}) => {
  const SORT_AT = sortAt;
  const lit = done ? 0 : span(f, SORT_AT + Math.min(4, snap / 2), SORT_AT + Math.min(10, snap + 1));
  const header = done
    ? 'agents — 13 processes · 12 running · 0 blocked'
    : 'agents — 13 processes · 12 running · 1 blocked';
  const sortLabel = f >= SORT_AT || done ? 'sort: BLOCKED ▼' : 'sort: PID ▲';
  const clock = `14:${String(32 + Math.floor((f + 20) / 1800)).padStart(2, '0')}:${String(7 + Math.floor(f / 30)).padStart(2, '0')}`;
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: T.mono, fontSize: FONT, color: P.text, whiteSpace: 'pre'}}>
      <div style={{position: 'absolute', left: X0, top: 62, width: TABLE_W, display: 'flex', justifyContent: 'space-between', color: P.dim}}>
        <span>{header}</span>
        <span>{clock}</span>
      </div>
      <div style={{position: 'absolute', left: X0, top: 62 + LINE, color: f >= SORT_AT ? P.text : P.dim}}>{sortLabel}</div>
      <div style={{position: 'absolute', left: X0 - 14, top: Y0 - LINE - 6, width: TABLE_W + 28, height: LINE, background: P.graphite}} />
      <div style={{position: 'absolute', left: X0, top: Y0 - LINE + 2, color: P.dim, fontWeight: 600}}>
        {pad('PID', 7) + pad('AGENT', 31) + pad('STATE', 10) + pad('BLOCKED', 9) + 'WAITING ON'}
      </div>
      {ROWS.map((row, r) => {
        const y = Y0 + slot(r, f, SORT_AT, snap) * LINE;
        const hero = r === HERO;
        const churn = Math.floor(random(`b${r}-${Math.floor(f / 6)}`) * 4);
        const state = hero ? (done ? 'DONE' : 'BLOCKED') : 'running';
        const blocked = hero ? (done ? '—' : row.blocked!) : `0:0${churn}`;
        const on = hero ? (done ? '—' : 'you') : '—';
        const col = hero && !done ? P.amber : P.text;
        return (
          <div key={row.pid} style={{position: 'absolute', left: X0 - 14, top: y, width: TABLE_W + 28, height: LINE}}>
            {hero && <div style={{position: 'absolute', inset: 0, background: done ? 'rgba(48,209,89,0.14)' : `rgba(255,176,31,${0.16 * lit})`, borderLeft: `4px solid ${done ? P.green : `rgba(255,176,31,${lit})`}`}} />}
            <div style={{position: 'absolute', left: 14, top: 6, color: hero ? (lit > 0.5 || done ? col : P.text) : P.text}}>
              <span style={{color: hero ? undefined : P.dim}}>{pad(String(row.pid), 7)}</span>
              {pad(row.agent, 31)}
              <span style={{color: hero ? undefined : P.green}}>{pad(state, 10)}</span>
              <span style={{color: hero ? undefined : P.dim}}>{pad(blocked, 9)}</span>
              <span style={{fontWeight: hero ? 600 : 500}}>{on}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Beats 1-3. */
export const Hook: React.FC<{f: number}> = ({f}) => {
  // 2D push 1.0 -> 1.6 into the `you` cell; the origin travels from the hero row's centre to the cell
  const p = span(f, 30, 75, (t) => t * t * (3 - 2 * t));
  const sc = lerp(1, 1.6, p);
  const cell = youCell();
  // anchor travels from the hero row to the `you` cell; on screen it travels from where it is to frame centre
  // the hero row stays whole until late in the push, then the cell takes over
  const q = Math.pow(p, 2.6);
  const ax = lerp(1920 / 2, cell.x, q), ay = lerp(Y0 + LINE / 2, cell.y, q);
  const sx = lerp(ax, 960, q), sy = lerp(lerp(ay, 470, p), 540, q);
  const outT = span(f, 75, 92);
  const k = sc * (1 + outT * 3);
  return (
    <div style={{position: 'absolute', inset: 0, background: P.ground, overflow: 'hidden'}}>
      {f < 92 && (
        <div style={{position: 'absolute', inset: 0, opacity: 1 - outT, transformOrigin: '0 0', transform: `translate(${sx - ax * k}px, ${sy - ay * k}px) scale(${k})`}}>
          <TopList f={f} />
        </div>
      )}
      {f >= 78 && <Accusation f={f} />}
      {f < 150 && <Dramatisation />}
    </div>
  );
};

const Accusation: React.FC<{f: number}> = ({f}) => {
  const words = ['The', 'slowest', 'process', 'on', 'your', 'Mac'];
  const at = (i: number) => 80 + i * 7; // eighths at 120 BPM = 7.5 frames
  const dropAt = 120;
  const d = clamp01((f - dropAt) / 5);
  return (
    <div style={{position: 'absolute', left: 150, top: 300, fontFamily: T.display, fontWeight: 680, fontSize: 132, letterSpacing: -132 * 0.02, color: P.text, lineHeight: 1.05}}>
      <div>
        {words.slice(0, 3).map((w, i) => (
          <span key={w} style={{opacity: f >= at(i) ? 1 : 0, marginRight: 34}}>{w}</span>
        ))}
      </div>
      <div>
        {words.slice(3).map((w, i) => (
          <span key={w} style={{opacity: f >= at(i + 3) ? 1 : 0, marginRight: 34}}>{w}</span>
        ))}
        <span style={{display: 'inline-block', opacity: d, transform: `translateY(${(1 - d) * -40}px)`}}>
          is you<span style={{color: P.amber, fontSize: '1.18em', lineHeight: 0}}>.</span>
        </span>
      </div>
    </div>
  );
};
