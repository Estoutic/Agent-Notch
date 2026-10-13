/*
 * Inspection and completion: the agent card (React recreation of CardView.swift / CardTabBody.swift, Terminal theme,
 * @2x) with tabs that switch, and the finish toast (ToastPanel.swift: 340 pt wide, under the notch, 6 s).
 */
import React from 'react';
import {C, Cursor, Mark, Ripple, State, camAt, cursorPath, easeIn, easeIO, expoOut, range, toScreen, useShot, useV} from '../lib';
import {Header, ListRow, P, PanelBox} from '../ui/app';
import {NOTCH_CX, WingItem} from '../world';
import {UI, UI_MONO} from '../lib';
import {Caption, Desk} from './common';
import {J_WING} from './Open';

/* ---------- card ---------- */
export type CardTab = 'done' | 'remaining' | 'files' | 'log';
const TABS: {id: CardTab; label: string; w: number}[] = [
  {id: 'done', label: 'Done', w: 82},
  {id: 'remaining', label: 'Remaining', w: 140},
  {id: 'files', label: 'Files', w: 78},
  {id: 'log', label: 'Log', w: 64},
];
export const CARD = {x: 1190, y: 77, w: 680, h: 660, pad: 24};
/** Stage centre of a tab pill. */
export const tabAt = (id: CardTab) => {
  let x = CARD.x + CARD.pad;
  for (const t of TABS) {
    if (t.id === id) return {x: x + t.w / 2, y: CARD.y + 196 + 18};
    x += t.w + 10;
  }
  return {x, y: CARD.y + 214};
};

const Sec: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{fontSize: 21, fontWeight: 500, color: P.dim, marginTop: 14, marginBottom: 4}}>{children}</div>;
const Item: React.FC<{mark: string; color: string; children: React.ReactNode}> = ({mark, color, children}) => (
  <div style={{display: 'flex', gap: 12, lineHeight: '32px'}}>
    <span style={{color, width: 18, flexShrink: 0}}>{mark}</span>
    <span style={{color: P.text}}>{children}</span>
  </div>
);
const Cmd: React.FC<{ok: boolean; test?: boolean; children: string}> = ({ok, test, children}) => (
  <div style={{display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 4}}>
    <span style={{color: ok ? C.green : P.red, width: 18, lineHeight: '28px'}}>{ok ? '✓' : '✕'}</span>
    <div>
      {test && <div style={{fontSize: 20, color: P.dim, lineHeight: '24px'}}>test</div>}
      <div style={{fontFamily: UI_MONO, fontSize: 22, color: P.strong, lineHeight: '28px'}}>{children}</div>
    </div>
  </div>
);

const TabBody: React.FC<{tab: CardTab}> = ({tab}) => {
  if (tab === 'done')
    return (
      <>
        <Item mark="✓" color={C.green}>Read the upload code in apps/app/features/upload</Item>
        <Item mark="✓" color={C.green}>Add WebCodecs compression down to 720p</Item>
        <Sec>Recent commands</Sec>
        <Cmd ok test>pnpm --filter api test</Cmd>
        <Cmd ok>pnpm build</Cmd>
        <Sec>Last message</Sec>
        <div style={{color: P.text, lineHeight: '32px'}}>Uploads now compress to 720p in the browser before they leave the phone. Edge sizes are next.</div>
      </>
    );
  if (tab === 'remaining')
    return (
      <>
        <Item mark="●" color={P.amber}>Reject files over 200 MB before compressing</Item>
        <Item mark="○" color={P.dim}>Cover the edge sizes with tests</Item>
        <Item mark="○" color={P.dim}>Check on a phone with agent-browser</Item>
      </>
    );
  if (tab === 'files')
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
        {[
          ['apps/app/features/upload/compress.ts', 84, 0],
          ['apps/app/features/upload/UploadForm.tsx', 19, 6],
          ['apps/api/src/routes/upload.ts', 12, 3],
          ['apps/api/src/services/media.test.ts', 41, 2],
        ].map(([p, a, r]) => (
          <div key={p as string} style={{display: 'flex', alignItems: 'baseline', gap: 14, lineHeight: '30px'}}>
            <span style={{fontFamily: UI_MONO, fontSize: 22, color: P.strong, flex: 1}}>{p}</span>
            <span style={{color: C.green, fontVariantNumeric: 'tabular-nums'}}>+{a}</span>
            <span style={{color: P.red, fontVariantNumeric: 'tabular-nums', width: 34}}>−{r}</span>
          </div>
        ))}
      </div>
    );
  return (
    <>
      <Cmd ok test>pnpm --filter api test</Cmd>
      <Cmd ok={false} test>pnpm --filter api test</Cmd>
      <Cmd ok>pnpm build</Cmd>
      <Cmd ok>git commit -m "Compress uploads to 720p"</Cmd>
      <Sec>Errors and repeats</Sec>
      <div style={{display: 'flex', gap: 12, lineHeight: '30px'}}>
        <span style={{color: P.text, flex: 1}}>ReferenceError: VideoEncoder is not defined</span>
        <span style={{color: P.red, fontVariantNumeric: 'tabular-nums'}}>×2</span>
      </div>
    </>
  );
};

export const AgentCard: React.FC<{tab: CardTab; tabT: number; prev: CardTab; reveal?: number; hotTab?: CardTab; hot?: number}> = ({tab, tabT, prev, reveal = 1, hotTab, hot = 0}) => {
  if (reveal <= 0.001) return null;
  const show = tabT < 0.5 ? prev : tab;
  const a = tabT < 0.5 ? 1 - tabT * 2 : (tabT - 0.5) * 2;
  return (
    <div style={{position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: 21, background: P.bg, fontFamily: UI, fontSize: 24, color: P.text,
      boxShadow: '0 40px 90px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)', opacity: reveal, transform: `translateX(${(1 - reveal) * -30}px)`, overflow: 'hidden'}}>
      <div style={{padding: `22px ${CARD.pad}px 18px`, borderBottom: `1px solid ${P.rule}`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <Mark vendor="claude" size={18} state="working" />
          <div style={{fontSize: 26, fontWeight: 600, color: P.strong, flex: 1}}>Compress video uploads</div>
          <div style={{height: 36, padding: '0 16px', borderRadius: 8, background: P.pill, display: 'flex', alignItems: 'center', fontSize: 23, fontWeight: 600, color: P.strong}}>Open</div>
        </div>
        <div style={{fontSize: 24, color: P.dim, marginTop: 10}}>wedding-app · fix/upload-compress · upload</div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 21, color: P.dim, marginTop: 10}}>
          <span>opus</span>
          <span>18 min</span>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 21, color: P.dim, marginTop: 6}}>
          <span>context 37% of 200K</span>
          <span>session cost ≈ $2.14</span>
        </div>
      </div>
      <div style={{display: 'flex', gap: 10, padding: `18px ${CARD.pad}px 8px`, position: 'absolute', top: 178 - 18 + 18, left: 0}}>
        {TABS.map((t) => (
          <div key={t.id} style={{width: t.w, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 23, fontWeight: 600,
            background: t.id === tab ? P.amber : P.pill, color: t.id === tab ? '#111' : P.strong,
            boxShadow: hotTab === t.id && hot > 0 ? `0 0 0 ${3 * hot}px rgba(255,255,255,${0.5 * hot})` : undefined}}>{t.label}</div>
        ))}
      </div>
      <div style={{position: 'absolute', top: 254, left: CARD.pad, right: CARD.pad, opacity: a, transform: `translateY(${(1 - a) * 8}px)`}}>
        <TabBody tab={show} />
      </div>
    </div>
  );
};

export const CardShot: React.FC = () => {
  const {f, ev, len} = useShot('card');
  const {W, V} = useV();
  const cx = CARD.x + CARD.w / 2, cy = CARD.y + CARD.h / 2;
  const cam = camAt(f, V
    ? [{f: 0, s: 0.62, fx: 1130, fy: 420, ax: W / 2, ay: 700}, {f: 16, s: 1.42, fx: cx, fy: cy, ax: W / 2, ay: 780, e: expoOut}, {f: len, s: 1.46, fx: cx, fy: cy, ax: W / 2, ay: 780}]
    : [{f: 0, s: 0.72, fx: 1130, fy: 420, ax: W / 2, ay: 500}, {f: 16, s: 1.22, fx: cx, fy: cy, ax: 760, ay: 540, e: expoOut}, {f: len, s: 1.25, fx: cx, fy: cy, ax: 760, ay: 540}]);
  const order: [CardTab, number][] = [['done', ev.done], ['remaining', ev.remaining], ['files', ev.files], ['log', ev.log]];
  let tab: CardTab = 'done', prev: CardTab = 'done', at = -100;
  for (let i = 0; i < order.length; i++) if (f >= order[i][1]) { tab = order[i][0]; prev = order[Math.max(0, i - 1)][0]; at = order[i][1]; }
  const tabT = i0(f, at);
  const pts = order.slice(1).map(([id]) => toScreen(cam, tabAt(id).x, tabAt(id).y));
  const start = toScreen(cam, CARD.x + 300, CARD.y + 600);
  const cur = cursorPath(f, [
    {from: 14, arrive: ev.remaining - 3, a: start, b: pts[0], click: ev.remaining},
    {from: ev.remaining + 8, arrive: ev.files - 3, a: pts[0], b: pts[1], click: ev.files},
    {from: ev.files + 8, arrive: ev.log - 3, a: pts[1], b: pts[2], click: ev.log},
  ], ev.log + 12);
  const nextId = order.find(([, t]) => t > f)?.[0];
  const nextAt = order.find(([, t]) => t > f)?.[1] ?? 1e9;
  const wing: WingItem[] = J_WING;
  const captions: Record<CardTab, [string, string]> = {
    done: ['Done', 'what it finished, what it ran, what it said'],
    remaining: ['Remaining', 'its plan, step by step'],
    files: ['Files', 'every change, lines added and removed'],
    log: ['Log', 'commands, errors and loops'],
  };
  return (
    <Desk f={f} cam={cam} screen={{wing: {items: wing, state: (i) => (i === 0 ? 'working' : wing[i].st)},
      over: (
        <>
          <PanelBox>
            <Header claude={3} codex={1} right="wedding-app" />
            <ListRow v="claude" st="working" title="fix/upload-compress" model="opus" hi={1} />
            <ListRow v="claude" st="working" title="Explore · routes" model="haiku" light depth={1} last />
            <ListRow v="codex" st="working" title="CONF-360" model="sol" />
            <ListRow v="claude" st="working" title="docs/upload" model="sonnet" />
          </PanelBox>
          <AgentCard tab={tab} prev={prev} tabT={tabT} hotTab={nextId} hot={range(f, nextAt - 8, nextAt - 3)} />
        </>
      )}}>
      <Ripple x={cur.x} y={cur.y} t={cur.ripple} r={30} />
      <Cursor x={cur.x} y={cur.y} press={cur.press} opacity={cur.op} size={46} />
      {order.map(([id, t0], i) => {
        const t1 = order[i + 1]?.[1] ?? len + 1;
        return (
          <Caption key={id} f={f} from={Math.max(10, t0)} to={t1} V={V} vy={1440} ly={430} lx={1260} size={V ? 88 : 76} align={V ? 'center' : 'left'} sub={captions[id][1]}>
            {captions[id][0]}
          </Caption>
        );
      })}
    </Desk>
  );
};
const i0 = (f: number, at: number) => (at < 0 ? 1 : range(f, at, at + 6, easeIO));

/* ---------- toast: the agent finishes, a summary drops from the notch ---------- */
export const Toast: React.FC<{f: number; at: number; out?: number; x?: number; y?: number}> = ({f, at, out = 1e9, x = NOTCH_CX, y = 80}) => {
  const t = range(f, at, at + 10, expoOut) * (1 - range(f, out, out + 8, easeIn));
  if (t <= 0.001) return null;
  return (
    <div style={{position: 'absolute', left: x - 364, top: y, width: 728, boxSizing: 'border-box', padding: '18px 24px', borderRadius: 24, background: '#1c1c1c', border: '2px solid #3b3b3b',
      fontFamily: UI, opacity: t, transform: `translateY(${(1 - t) * -40}px) scale(${0.96 + 0.04 * t})`, transformOrigin: '50% 0', boxShadow: '0 30px 70px rgba(0,0,0,0.6)'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <Mark vendor="claude" size={16} state="done" />
        <span style={{fontSize: 24, fontWeight: 600, color: P.strong}}>Compress video uploads</span>
      </div>
      <div style={{fontSize: 22, color: P.text, marginTop: 6}}>done · 4 files · tests ✓ · commit 4f9c2e1</div>
      <div style={{fontSize: 22, color: P.dim, marginTop: 6, lineHeight: '28px'}}>Uploads now compress to 720p in the browser before they leave the phone.</div>
    </div>
  );
};
export const ToastShot: React.FC = () => {
  const {f, ev, len} = useShot('toast');
  const {W, V} = useV();
  const cam = camAt(f, V
    ? [{f: 0, s: 1.36, fx: NOTCH_CX, fy: 140, ax: W / 2, ay: 620}, {f: len, s: 1.4, fx: NOTCH_CX, fy: 140, ax: W / 2, ay: 620}]
    : [{f: 0, s: 2.0, fx: NOTCH_CX - 80, fy: 140, ax: W / 2, ay: 380}, {f: len, s: 2.1, fx: NOTCH_CX - 80, fy: 140, ax: W / 2, ay: 380}]);
  const doneNow = f >= ev.finish;
  const state = (i: number): State => (i === 0 ? (doneNow ? 'done' : 'working') : J_WING[i].st === 'waiting' ? 'working' : J_WING[i].st);
  return (
    <Desk f={f} cam={cam} screen={{wing: {items: J_WING, state, rings: [{i: 0, t: range(f, ev.finish, ev.finish + 20, (t) => t), color: '#ffffff'}]}, over: <Toast f={f} at={ev.finish + 2} out={len - 10} />}}>
      <Caption f={f} from={ev.finish + 8} to={len + 1} V={V} vy={1340} ly={760} size={V ? 84 : 72} align={V ? 'center' : 'center'} lx={0} sub="Files, tests and the commit, at a glance.">Finished.</Caption>
    </Desk>
  );
};
