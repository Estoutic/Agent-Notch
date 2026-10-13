/*
 * React recreation of the app's list panel (Terminal theme, @2x pixels), built from Sources/AgentsNotch/PanelView.swift
 * and AnswerViews.swift and checked against the app's own renders (public/ask.png, question.png, plan.png).
 * Used where a shot needs the panel to react: rows collapse after an answer, marks change state.
 * Static list views use the app's PNG renders directly.
 */
import React from 'react';
import {C, Mark, State, UI, UI_MONO, clamp01} from '../lib';

export const P = {
  bg: '#1c1c1c',
  waitBg: '#2b2919',
  errBg: '#2b1c1c',
  pill: '#3b3b3b',
  amber: '#ffb01f',
  red: '#ff453b',
  text: '#e0e0e0',
  strong: '#f2f2f2',
  sec: '#adadad',
  dim: '#8f8f8f',
  rule: '#2b2b2b',
  option: '#2e2e2e',
  optionOn: '#4a4130',
};
export const PANEL = {x: 401, y: 77, w: 758, r: 21};

export const Pill: React.FC<{children: React.ReactNode; primary?: boolean; hot?: number; press?: number; color?: string}> = ({children, primary, hot = 0, press = 0, color}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', height: 36, padding: '0 17px', borderRadius: 8, fontFamily: UI, fontSize: 23, fontWeight: 600, letterSpacing: 0.1,
    background: color ?? (primary ? P.amber : P.pill), color: primary ? '#111' : P.strong, whiteSpace: 'nowrap',
    transform: `scale(${1 - 0.06 * press})`, boxShadow: hot > 0 ? `0 0 0 ${3 * hot}px rgba(255,255,255,${0.55 * hot}), 0 0 ${26 * hot}px rgba(255,255,255,${0.25 * hot})` : undefined}}>{children}</div>
);

type Vendor = 'claude' | 'codex';
export const RowMark: React.FC<{v: Vendor; st: State; light?: boolean; size?: number}> = ({v, st, light, size = 16}) => <Mark vendor={v} size={size} state={st} light={light} />;

export const Header: React.FC<{claude: number; codex: number; waiting?: number; errors?: number; right: string}> = ({claude, codex, waiting = 0, errors = 0, right}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 20, height: 74, padding: '0 24px', borderBottom: `1px solid ${P.rule}`, fontFamily: UI, fontSize: 22, color: P.sec, boxSizing: 'border-box', marginBottom: 8}}>
    <span style={{display: 'flex', alignItems: 'center', gap: 8}}><RowMark v="claude" st="working" size={14} />{claude} Claude</span>
    <span style={{display: 'flex', alignItems: 'center', gap: 8}}><RowMark v="codex" st="working" size={14} />{codex} Codex</span>
    {waiting > 0 && <span style={{color: P.amber}}>{waiting} waiting</span>}
    {errors > 0 && <span style={{color: P.red}}>{errors} with errors</span>}
    <span style={{marginLeft: 'auto', color: P.dim}}>{right}</span>
  </div>
);

/** Shrinks a block to nothing (an answered request leaving the list). */
export const Collapse: React.FC<{t: number; h: number; children: React.ReactNode}> = ({t, h, children}) => {
  const k = clamp01(t);
  if (k >= 0.999) return null;
  return <div style={{height: k > 0 ? h * (1 - k) : undefined, overflow: k > 0 ? 'hidden' : undefined, opacity: 1 - k * 1.4}}>{children}</div>;
};

/** One attention row: mark, "Vendor · title", then the request body. Waiting rows are amber-tinted, stuck ones red. */
export const AttnRow: React.FC<{v: Vendor; st: State; title: string; project?: string; flash?: {color: string; a: number}; children: React.ReactNode}> = ({v, st, title, project, flash, children}) => (
  <div style={{position: 'relative', display: 'flex', gap: 14, padding: '12px 24px 12px 24px', background: st === 'stuck' ? P.errBg : st === 'waiting' ? P.waitBg : 'transparent', fontFamily: UI}}>
    <div style={{paddingTop: 7}}><RowMark v={v} st={st} /></div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1}}>
      <div style={{fontSize: 25.5, color: P.text, whiteSpace: 'nowrap', lineHeight: '34px'}}>
        {v === 'claude' ? 'Claude' : 'Codex'} · {title}{project && <span style={{color: P.dim}}> {project}</span>}
      </div>
      {children}
    </div>
    {flash && flash.a > 0.001 && <div style={{position: 'absolute', inset: 0, background: flash.color, opacity: flash.a, mixBlendMode: 'screen'}} />}
  </div>
);

/** Tool + the exact command, then Allow [⌃⌥Y] · Always · Deny [⌃⌥N] · In the agent window (· dangerous). */
export const Request: React.FC<{tool: string; cmd: string[]; risky?: boolean; hint?: boolean; always?: boolean; hot?: 'allow' | 'deny' | 'always'; hotA?: number; press?: number}> = ({tool, cmd, risky, hint, always, hot, hotA = 0, press = 0}) => {
  const long = cmd.length > 1;
  const allowHint = hint && !risky && !long; // Hook.needsClick: risky or long requests never take the allow hotkey
  return (
    <>
      <div style={{display: 'flex', gap: 10, fontSize: 22, lineHeight: '28px'}}>
        <span style={{color: P.dim, fontFamily: UI}}>{tool}</span>
        <div style={{fontFamily: UI_MONO, color: risky ? P.red : P.strong, whiteSpace: 'pre'}}>{cmd.join('\n')}</div>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 6}}>
        <Pill primary hot={hot === 'allow' ? hotA : 0} press={hot === 'allow' ? press : 0}>Allow{allowHint ? ' ⌃⌥Y' : ''}</Pill>
        {always && !risky && !long && <Pill hot={hot === 'always' ? hotA : 0}>Always</Pill>}
        <Pill hot={hot === 'deny' ? hotA : 0} press={hot === 'deny' ? press : 0}>Deny{hint ? ' ⌃⌥N' : ''}</Pill>
        <span style={{fontSize: 22, color: P.dim, whiteSpace: 'nowrap'}}>In the agent window</span>
        {risky && <span style={{fontSize: 21, color: P.red, fontWeight: 500}}>dangerous</span>}
      </div>
    </>
  );
};

export const Question: React.FC<{picked?: number; hover?: number}> = ({picked = -1, hover = -1}) => {
  const opts = [
    ['On the client', "WebCodecs in the guest's browser, no load on the server"],
    ['On the server', 'ffmpeg in a worker, slower but predictable'],
  ];
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4, fontFamily: UI}}>
      <div style={{fontSize: 25.5, color: P.text, lineHeight: '34px'}}>Compression · How should video be compressed?</div>
      {opts.map(([l, d], i) => (
        <div key={l} style={{display: 'flex', gap: 10, padding: '6px 14px', borderRadius: 12, background: picked === i ? P.optionOn : P.option, marginRight: 24,
          boxShadow: hover === i && picked !== i ? 'inset 0 0 0 2px rgba(255,255,255,0.25)' : undefined}}>
          <span style={{fontSize: 24, color: picked === i ? P.amber : P.dim, width: 22}}>{picked === i ? '●' : '○'}</span>
          <div>
            <div style={{fontSize: 25.5, color: P.strong, lineHeight: '32px'}}>{l}</div>
            <div style={{fontSize: 21, color: P.dim, lineHeight: '26px'}}>{d}</div>
          </div>
        </div>
      ))}
      <div style={{fontSize: 25.5, color: P.dim, lineHeight: '40px'}}>Your own answer…</div>
      <div style={{fontSize: 22, color: P.dim, lineHeight: '30px'}}>In the agent window</div>
    </div>
  );
};

export const PLAN_STEPS = [
  'Read the upload code in apps/app/features/upload',
  'Add WebCodecs compression down to 720p',
  'Cover the edge sizes with tests',
  'Check on a phone with agent-browser',
];
export const Plan: React.FC<{steps: string[]; commenting?: boolean; typed?: string; caret?: boolean; hot?: 'approve' | 'comment' | 'send'; hotA?: number; newStep?: number}> = ({steps, commenting, typed = '', caret, hot, hotA = 0, newStep = -1}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 8, fontFamily: UI}}>
    <div style={{fontSize: 25.5, color: P.dim, lineHeight: '32px'}}>Plan</div>
    <div style={{fontSize: 22.5, color: P.text, lineHeight: '28px'}}>
      {steps.map((s, i) => (
        <div key={i} style={{background: i === newStep ? 'rgba(255,176,31,0.18)' : undefined, borderRadius: 4}}>{i + 1}. {s}</div>
      ))}
    </div>
    {commenting && (
      <div style={{height: 40, borderRadius: 7, background: '#141414', border: '1px solid #555', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 23, color: typed ? P.strong : P.dim, marginRight: 24}}>
        {typed || 'What to change in the plan'}{caret && <span style={{display: 'inline-block', width: 2, height: 26, background: '#fff', marginLeft: 2}} />}
      </div>
    )}
    <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
      <Pill primary hot={hot === 'approve' ? hotA : 0}>Approve</Pill>
      <Pill hot={hot === 'comment' || hot === 'send' ? hotA : 0}>{commenting ? 'Send back' : 'Send back with a comment…'}</Pill>
      <span style={{fontSize: 22, color: P.dim, whiteSpace: 'nowrap'}}>In the agent window</span>
    </div>
  </div>
);

/** A plain list row: mark, title, model; `depth` 1 draws the subagent tree line. */
export const ListRow: React.FC<{v: Vendor; st: State; title: string; model: string; light?: boolean; depth?: number; last?: boolean; hi?: number}> = ({v, st, title, model, light, depth = 0, last, hi = 0}) => (
  <div style={{position: 'relative', display: 'flex', alignItems: 'center', height: 44, paddingLeft: 24 + depth * 32, gap: 13, fontFamily: UI,
    background: hi > 0 ? `rgba(255,255,255,${0.09 * hi})` : undefined}}>
    {depth > 0 && <div style={{position: 'absolute', left: 30, top: 0, width: 14, height: last ? 22 : 44, borderLeft: `2px solid ${P.pill}`, borderBottom: last ? `2px solid ${P.pill}` : undefined}} />}
    <RowMark v={v} st={st} light={light} size={depth ? 13 : 16} />
    <span style={{fontSize: 26, color: P.text}}>{title}</span>
    <span style={{fontSize: 22, color: P.dim}}>{model}</span>
  </div>
);

export const PanelBox: React.FC<{reveal?: number; children: React.ReactNode; w?: number; style?: React.CSSProperties}> = ({reveal = 1, children, w = PANEL.w, style}) => {
  if (reveal <= 0.001) return null;
  const rv = clamp01(reveal);
  return (
    <div style={{position: 'absolute', left: PANEL.x, top: PANEL.y, width: w, borderRadius: PANEL.r, transformOrigin: '50% 0',
      transform: `translateY(${(1 - rv) * -24}px) scale(${0.94 + 0.06 * rv})`, opacity: clamp01(reveal * 1.8),
      clipPath: `inset(0 0 ${(1 - rv) * 100}% 0 round ${PANEL.r}px)`,
      boxShadow: '0 40px 90px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)', ...style}}>
      <div style={{background: P.bg, borderRadius: PANEL.r, overflow: 'hidden', paddingBottom: 12}}>{children}</div>
    </div>
  );
};

export const doneGreen = C.green;
