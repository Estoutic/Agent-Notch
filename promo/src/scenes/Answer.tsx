/* Answering from the notch: hotkeys oldest-first, a risky command that needs a click, a question, a plan, and trust. */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BODY, CODE, DISPLAY} from '../fonts';
import {Backdrop, C, Cam, Combo, Cursor, Grain, Mark, Ripple, Vignette, camAt, cursorPath, drift, expoOut, range, toScreen, useShot, useV} from '../lib';
import {AttnRow, Collapse, Header, ListRow, PLAN_STEPS, PanelBox, Plan, Question, Request} from '../ui/app';
import {State} from '../lib';
import {WingItem} from '../world';
import {Caption, Desk} from './common';
import {Term} from './terminals';

/** Camera that frames the panel: landscape panel on the left third, vertical panel across the width. */
const panelCam = (f: number, len: number, V: boolean, W: number, s0: number, s1: number, fy = 77, ay?: number): Cam =>
  V
    ? camAt(f, [{f: 0, s: s0, fx: 780, fy, ax: W / 2, ay: ay ?? 300}, {f: len, s: s1, fx: 780, fy, ax: W / 2, ay: ay ?? 300}])
    : camAt(f, [{f: 0, s: s0, fx: 401, fy, ax: 110, ay: ay ?? 150}, {f: len, s: s1, fx: 401, fy, ax: 110, ay: ay ?? 150}]);

const flashOf = (f: number, at: number, color: string) => ({color, a: 0.28 * range(f, at, at + 2) * (1 - range(f, at + 2, at + 10))});
/** Left x of the request's pills (stage) and the y of their centre for an attention row starting at `top`. */
const PILL_X = 455;
const pillsY = (top: number) => top + 12 + 34 + 4 + 28 + 6 + 18;
const ROW0 = 77 + 82;

/* ---------- keys: ⌃⌥Y allows the oldest request, ⌃⌥N denies the next ---------- */
export const Keys: React.FC = () => {
  const {f, ev, len} = useShot('keys');
  const {W, V} = useV();
  const cam = panelCam(f, len, V, W, V ? 1.34 : 1.45, V ? 1.38 : 1.5);
  const y1 = f >= ev.y, n1 = f >= ev.n;
  const wing: WingItem[] = [{v: 'claude', st: 'waiting'}, {v: 'claude', st: 'waiting'}, {v: 'codex', st: 'working'}];
  const state = (i: number): State => (i === 0 ? (y1 ? 'working' : 'waiting') : i === 1 ? (n1 ? 'working' : 'waiting') : 'working');
  const comboPos = V ? {x: W / 2, y: 1230} : {x: 1560, y: 330};
  const which = f < (ev.y + ev.n) / 2 ? 'y' : 'n';
  const cIn = which === 'y' ? range(f, ev.y - 12, ev.y - 6, expoOut) : range(f, ev.n - 12, ev.n - 6, expoOut);
  return (
    <Desk f={f} cam={cam} screen={{wing: {items: wing, state, glow: (i) => (state(i) === 'waiting' ? 0.5 : 0),
      rings: [{i: 0, t: range(f, ev.y + 1, ev.y + 20, (t) => t), color: C.green}, {i: 1, t: range(f, ev.n + 1, ev.n + 20, (t) => t), color: C.red}]},
      over: (
        <PanelBox>
          <Header claude={2} codex={1} waiting={(y1 ? 0 : 1) + (n1 ? 0 : 1)} right="wedding-app" />
          <Collapse t={range(f, ev.y + 3, ev.y + 12)} h={132}>
            <AttnRow v="claude" st="waiting" title="docs/upload" flash={flashOf(f, ev.y, C.green)}>
              <Request tool="Bash" cmd={['pnpm build']} hint always />
            </AttnRow>
          </Collapse>
          <Collapse t={range(f, ev.n + 3, ev.n + 12)} h={132}>
            <AttnRow v="claude" st="waiting" title="feat/guest-tg" flash={flashOf(f, ev.n, C.red)}>
              <Request tool="Bash" cmd={['git push origin feat/guest-tg']} hint={y1} always />
            </AttnRow>
          </Collapse>
          <ListRow v="claude" st={y1 ? 'working' : 'waiting'} title="docs/upload" model="sonnet" />
          <ListRow v="claude" st={n1 ? 'working' : 'waiting'} title="feat/guest-tg" model="opus" />
          <ListRow v="codex" st="working" title="CONF-360" model="sol" />
        </PanelBox>
      )}}>
      <div style={{position: 'absolute', left: comboPos.x, top: comboPos.y, transform: `translate(-50%, ${(1 - cIn) * 20}px)`, opacity: cIn, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <Combo f={f} at={which === 'y' ? ev.y : ev.n} keys={['⌃', '⌥', which === 'y' ? 'Y' : 'N']} size={V ? 120 : 112} tone={which === 'y' ? C.green : C.red} />
        <div style={{fontFamily: BODY, fontWeight: 600, fontSize: V ? 44 : 38, whiteSpace: 'nowrap', color: which === 'y' ? C.green : '#ff8a80', opacity: range(f, (which === 'y' ? ev.y : ev.n) + 1, (which === 'y' ? ev.y : ev.n) + 6)}}>
          {which === 'y' ? 'Allowed: pnpm build' : 'Denied: git push'}
        </div>
      </div>
      <Caption f={f} from={6} to={len + 1} V={V} vy={1500} ly={V ? 0 : 760} lx={1240} size={V ? 80 : 60} align={V ? 'center' : 'left'} sub="Oldest request first. No mouse.">{V ? '⌃⌥Y allows. ⌃⌥N denies.' : <>⌃⌥Y allows.<br />⌃⌥N denies.</>}</Caption>
    </Desk>
  );
};

/* ---------- risky: red command, the hotkey does nothing, it takes a click ---------- */
export const Risky: React.FC = () => {
  const {f, ev, len} = useShot('risky');
  const {W, V} = useV();
  const cam = V
    ? camAt(f, [{f: 0, s: 1.9, fx: 640, fy: 220, ax: W / 2, ay: 620}, {f: len, s: 2.0, fx: 640, fy: 220, ax: W / 2, ay: 620}])
    : camAt(f, [{f: 0, s: 1.6, fx: 401, fy: 120, ax: 90, ay: 200}, {f: len, s: 1.68, fx: 401, fy: 120, ax: 90, ay: 200}]);
  const denied = f >= ev.deny + 1;
  const py = pillsY(ROW0);
  const allowC = toScreen(cam, PILL_X + 47, py);
  const denyC = toScreen(cam, PILL_X + 94 + 12 + 62, py);
  const cur = cursorPath(f, [{from: ev.move, arrive: ev.deny - 5, a: {x: denyC.x + 260, y: denyC.y + 300}, b: denyC, click: ev.deny}], ev.deny + 16);
  const shake = f >= ev.tryKey && f < ev.tryKey + 12 ? Math.sin((f - ev.tryKey) * 2.6) * 9 * (1 - (f - ev.tryKey) / 12) : 0;
  const nope = range(f, ev.tryKey, ev.tryKey + 3) * (1 - range(f, ev.move + 4, ev.move + 10));
  const comboT = range(f, ev.tryKey - 12, ev.tryKey - 6, expoOut) * (1 - range(f, ev.move, ev.move + 6));
  const comboPos = V ? {x: W / 2, y: 1100} : {x: 1620, y: 720};
  const wing: WingItem[] = [{v: 'claude', st: 'waiting'}, {v: 'claude', st: 'working', sub: true, light: true}, {v: 'codex', st: 'working'}, {v: 'claude', st: 'working'}];
  const sh = drift(f, 1.5, 'risky');
  return (
    <Desk f={f} cam={{...cam, ax: cam.ax + sh.x, ay: cam.ay + sh.y}} screen={{wing: {items: wing, state: (i) => (i === 0 ? (denied ? 'working' : 'waiting') : wing[i].st), glow: (i) => (i === 0 && !denied ? 0.5 : 0)},
      over: (
        <PanelBox>
          <Header claude={3} codex={1} waiting={denied ? 0 : 1} right="wedding-app" />
          <Collapse t={range(f, ev.deny + 3, ev.deny + 12)} h={132}>
            <AttnRow v="claude" st="waiting" title="fix/upload-compress" flash={flashOf(f, ev.deny, C.red)}>
              <Request tool="Bash" cmd={['rm -rf dist build']} risky hint hot="deny" hotA={range(f, ev.deny - 8, ev.deny - 3)} press={cur.press} />
            </AttnRow>
          </Collapse>
          <ListRow v="claude" st={denied ? 'working' : 'waiting'} title="fix/upload-compress" model="opus" />
          <ListRow v="claude" st="working" title="Explore · routes" model="haiku" light depth={1} last />
          <ListRow v="codex" st="working" title="CONF-360" model="sol" />
        </PanelBox>
      )}}>
      <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 70% at 40% 40%, transparent 50%, rgba(80,0,0,0.35))'}} />
      {nope > 0 && (
        <div style={{position: 'absolute', left: allowC.x - 70 + shake, top: allowC.y - 34, width: 140, height: 68, borderRadius: 14, border: `4px solid ${C.red}`, opacity: nope,
          boxShadow: `0 0 30px ${C.red}88`}} />
      )}
      {comboT > 0 && (
        <div style={{position: 'absolute', left: comboPos.x, top: comboPos.y, transform: `translate(-50%, ${(1 - comboT) * 20}px)`, opacity: comboT, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
          <Combo f={f} at={ev.tryKey} keys={['⌃', '⌥', 'Y']} size={V ? 110 : 96} tone={C.red} />
          <div style={{fontFamily: BODY, fontWeight: 600, fontSize: V ? 42 : 34, color: '#ff8a80', opacity: range(f, ev.tryKey + 1, ev.tryKey + 5)}}>Nothing happens.</div>
        </div>
      )}
      <AgentInset f={f} V={V} at={ev.deny + 8} y={V ? 980 : 600} lines={
        <>
          <div style={{color: '#f2f2f5'}}>⏺ Bash(rm -rf dist build)</div>
          <div style={{color: '#ff8a80', opacity: range(f, ev.deny + 10, ev.deny + 13)}}>{'  '}⎿  Denied by you in Agent Notch</div>
          <div style={{color: '#e0583a', opacity: range(f, ev.deny + 18, ev.deny + 22)}}>✻ Cleaning only the build cache instead…</div>
        </>
      } />
      <Ripple x={cur.x} y={cur.y} t={cur.ripple} r={30} color={C.red} />
      <Cursor x={cur.x} y={cur.y} press={cur.press} opacity={cur.op} size={48} />
      <Caption f={f} from={4} to={ev.move + 2} V={V} vy={1460} ly={V ? 0 : 330} lx={1400} size={V ? 84 : 60} color="#ff6b61" sub={V ? 'rm -rf, sudo, git push --force, curl | sh' : <>rm -rf, sudo,<br />git push --force, curl | sh</>}>{V ? 'Risky commands turn red.' : <>Risky commands<br />turn red.</>}</Caption>
      <Caption f={f} from={ev.move + 4} to={ev.deny + 2} V={V} vy={1460} ly={V ? 0 : 330} lx={1400} size={V ? 84 : 60} sub="No hotkey can allow them.">{V ? 'They take a click.' : <>They take<br />a click.</>}</Caption>
      <Caption f={f} from={ev.deny + 4} to={len + 1} V={V} vy={1460} ly={V ? 0 : 330} lx={1400} size={V ? 84 : 60} sub={V ? 'The agent is told no and moves on.' : <>The agent is told no<br />and moves on.</>}>Denied.</Caption>
    </Desk>
  );
};

/* ---------- question: pick an answer, the agent carries on with it ---------- */
const AgentInset: React.FC<{f: number; V: boolean; at: number; lines: React.ReactNode; y?: number}> = ({f, V, at, lines, y}) => {
  const box = V ? {x: 60, y: y ?? 1150, w: 960, h: 330, font: 25} : {x: 1240, y: y ?? 600, w: 640, h: 300, font: 23};
  const t = range(f, at, at + 10, expoOut);
  return (
    <Term x={box.x} y={box.y} w={box.w} h={box.h} kind="claude" title="claude — fix/upload-compress" f={f} seed={1} font={box.font}
      style={{opacity: t, transform: `translateY(${(1 - t) * 30}px)`}}>{lines}</Term>
  );
};
export const QuestionShot: React.FC = () => {
  const {f, ev, len} = useShot('question');
  const {W, V} = useV();
  const cam = panelCam(f, len, V, W, V ? 1.34 : 1.4, V ? 1.38 : 1.45, V ? 77 : 77, V ? 260 : 120);
  const opt = toScreen(cam, PILL_X + 160, ROW0 + 12 + 34 + 4 + 4 + 34 + 6 + 35);
  const cur = cursorPath(f, [{from: 4, arrive: ev.pick - 4, a: {x: opt.x + 360, y: opt.y + 340}, b: opt, click: ev.pick}], ev.pick + 14);
  const picked = f >= ev.pick ? 0 : -1;
  const done = f >= ev.resume;
  const wing: WingItem[] = [{v: 'claude', st: 'waiting'}, {v: 'claude', st: 'working', sub: true, light: true}, {v: 'codex', st: 'working'}, {v: 'claude', st: 'working'}];
  return (
    <Desk f={f} cam={cam} screen={{wing: {items: wing, state: (i) => (i === 0 ? (done ? 'working' : 'waiting') : wing[i].st), glow: (i) => (i === 0 && !done ? 0.5 : 0),
      rings: [{i: 0, t: range(f, ev.resume, ev.resume + 20, (t) => t), color: C.green}]},
      over: (
        <PanelBox>
          <Header claude={3} codex={1} waiting={done ? 0 : 1} right="wedding-app" />
          <Collapse t={range(f, ev.resume + 2, ev.resume + 11)} h={340}>
            <AttnRow v="claude" st="waiting" title="fix/upload-compress" flash={flashOf(f, ev.pick, C.green)}>
              <Question picked={picked} hover={f > ev.pick - 8 ? 0 : -1} />
            </AttnRow>
          </Collapse>
          <ListRow v="claude" st={done ? 'working' : 'waiting'} title="fix/upload-compress" model="opus" />
          <ListRow v="codex" st="working" title="CONF-360" model="sol" />
        </PanelBox>
      )}}>
      <AgentInset f={f} V={V} at={ev.resume - 2} lines={
        <>
          <div style={{color: '#f2f2f5'}}>⏺ User answered Claude's question:</div>
          <div style={{color: '#9a9aa0'}}>{'  '}⎿  How should video be compressed?</div>
          <div style={{color: C.amber, opacity: range(f, ev.resume + 2, ev.resume + 5)}}>{'     '}→ On the client</div>
          <div style={{color: '#e0583a', opacity: range(f, ev.resume + 10, ev.resume + 14)}}>✻ Adding WebCodecs compression…</div>
        </>
      } />
      <Cursor x={cur.x} y={cur.y} press={cur.press} opacity={cur.op} size={46} />
      <Ripple x={cur.x} y={cur.y} t={cur.ripple} r={30} />
      <Caption f={f} from={4} to={len + 1} V={V} vy={1560} ly={V ? 0 : 200} lx={1250} size={V ? 80 : 60} sub="One click sends it.">{V ? 'Questions get answered here.' : <>Questions get<br />answered here.</>}</Caption>
    </Desk>
  );
};

/* ---------- plan: send back with a comment, the revised plan returns, approve ---------- */
const COMMENT = 'Also reject files over 200 MB';
const REVISED = [PLAN_STEPS[0], PLAN_STEPS[1], 'Reject files over 200 MB before compressing', PLAN_STEPS[2], PLAN_STEPS[3]];
export const PlanShot: React.FC = () => {
  const {f, ev, len} = useShot('plan');
  const {W, V} = useV();
  const cam = panelCam(f, len, V, W, V ? 1.34 : 1.42, V ? 1.38 : 1.47, 77, V ? 260 : 130);
  const typed = COMMENT.slice(0, Math.floor(range(f, ev.typeFrom, ev.typeTo, (t) => t) * COMMENT.length));
  const commenting = f >= ev.comment + 1 && f < ev.sendBack + 2;
  const sentBack = f >= ev.sendBack;
  const second = f >= ev.revised;
  const approved = f >= ev.approve;
  const top = ROW0 + 12 + 34 + 4;
  const btnY = (steps: number, field: boolean) => top + 32 + 8 + steps * 28 + 8 + (field ? 48 : 0) + 18;
  const commentBtn = toScreen(cam, PILL_X + 110 + 12 + 150, btnY(4, false));
  const sendBtn = toScreen(cam, PILL_X + 110 + 12 + 62, btnY(4, true));
  const approveBtn = toScreen(cam, PILL_X + 55, btnY(5, false));
  const cur = cursorPath(f, [
    {from: 2, arrive: ev.comment - 4, a: {x: commentBtn.x + 300, y: commentBtn.y + 320}, b: commentBtn, click: ev.comment},
    {from: ev.typeTo - 6, arrive: ev.sendBack - 3, a: commentBtn, b: sendBtn, click: ev.sendBack},
    {from: ev.revised + 10, arrive: ev.approve - 4, a: sendBtn, b: approveBtn, click: ev.approve},
  ], ev.approve + 14);
  const wing: WingItem[] = [{v: 'claude', st: 'waiting'}, {v: 'codex', st: 'working'}, {v: 'claude', st: 'working'}];
  const st0: State = approved ? 'working' : second ? 'waiting' : sentBack ? 'working' : 'waiting';
  const inSecond = range(f, ev.revised, ev.revised + 10, expoOut);
  return (
    <Desk f={f} cam={cam} screen={{wing: {items: wing, state: (i) => (i === 0 ? st0 : wing[i].st), glow: (i) => (i === 0 && st0 === 'waiting' ? 0.5 : 0),
      rings: [{i: 0, t: range(f, ev.approve, ev.approve + 20, (t) => t), color: C.green}]},
      over: (
        <PanelBox>
          <Header claude={2} codex={1} waiting={st0 === 'waiting' ? 1 : 0} right="wedding-app" />
          {!second && (
            <Collapse t={range(f, ev.sendBack + 2, ev.sendBack + 11)} h={commenting ? 300 : 252}>
              <AttnRow v="claude" st="waiting" title="fix/upload-compress" flash={flashOf(f, ev.sendBack, C.amber)}>
                <Plan steps={PLAN_STEPS} commenting={commenting} typed={typed} caret={commenting && Math.floor(f / 8) % 2 === 0}
                  hot={commenting ? 'send' : 'comment'} hotA={commenting ? range(f, ev.sendBack - 8, ev.sendBack - 3) : range(f, ev.comment - 8, ev.comment - 3)} />
              </AttnRow>
            </Collapse>
          )}
          {second && (
            <div style={{opacity: inSecond, transform: `translateY(${(1 - inSecond) * -12}px)`}}>
              <Collapse t={range(f, ev.approve + 2, ev.approve + 11)} h={280}>
                <AttnRow v="claude" st="waiting" title="fix/upload-compress" flash={flashOf(f, ev.approve, C.green)}>
                  <Plan steps={REVISED} newStep={2} hot="approve" hotA={range(f, ev.approve - 8, ev.approve - 3)} />
                </AttnRow>
              </Collapse>
            </div>
          )}
          <ListRow v="claude" st={st0} title="fix/upload-compress" model="opus" />
          <ListRow v="codex" st="working" title="CONF-360" model="sol" />
        </PanelBox>
      )}}>
      <Cursor x={cur.x} y={cur.y} press={cur.press} opacity={cur.op} size={46} />
      <Ripple x={cur.x} y={cur.y} t={cur.ripple} r={30} />
      <AgentInset f={f} V={V} at={ev.approve + 8} y={V ? 1180 : 420} lines={
        <>
          <div style={{color: '#f2f2f5'}}>⏺ User approved Claude's plan</div>
          <div style={{color: '#9a9aa0'}}>{'  '}⎿  5 steps · rejects files over 200 MB</div>
          <div style={{color: '#e0583a', opacity: range(f, ev.approve + 16, ev.approve + 20)}}>✻ Adding the size check…</div>
        </>
      } />
      <Caption f={f} from={4} to={ev.sendBack + 2} V={V} vy={1560} ly={V ? 0 : 820} lx={1250} size={V ? 80 : 60} sub={V ? 'Approve it, or send it back with a note.' : <>Approve it, or send it<br />back with a note.</>}>Plans come to you.</Caption>
      <Caption f={f} from={ev.sendBack + 4} to={ev.approve} V={V} vy={1560} ly={V ? 0 : 820} lx={1250} size={V ? 80 : 60} sub="The new step is highlighted.">{V ? 'The revised plan returns.' : <>The revised plan<br />returns.</>}</Caption>
      <Caption f={f} from={ev.approve + 2} to={len + 1} V={V} vy={1560} ly={V ? 0 : 820} lx={1250} size={V ? 80 : 60} color={C.green}>{V ? 'Approved. Back to work.' : <>Approved.<br />Back to work.</>}</Caption>
    </Desk>
  );
};

/* ---------- trust: only you approve; after 100 s the question goes back to the agent's own window ---------- */
export const Trust: React.FC = () => {
  const {f, ev, len} = useShot('trust');
  const {W, V} = useV();
  const inP = range(f, 0, 12, expoOut);
  const t = range(f, ev.timer, len - 14, (x) => x);
  const secs = Math.round(t * 100);
  const bar = V ? {x: 120, y: 1100, w: 840} : {x: 300, y: 660, w: 1320};
  const end = range(f, len - 14, len - 6, expoOut);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop f={f} light="rgba(255,255,255,0.05)" at={[50, 30]} />
      <div style={{position: 'absolute', left: 0, right: 0, top: V ? 520 : 200, textAlign: 'center', opacity: inP, transform: `translateY(${(1 - inP) * 24}px)`, filter: inP < 0.98 ? `blur(${(1 - inP) * 10}px)` : undefined}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 650, fontSize: V ? 136 : 150, letterSpacing: -6, color: C.text, lineHeight: 1.02}}>Only you approve.</div>
        <div style={{fontFamily: BODY, fontWeight: 500, fontSize: V ? 42 : 38, color: C.sub, marginTop: 30, opacity: range(f, 8, 18)}}>A click or your hotkey. Nothing answers on its own.</div>
      </div>
      <div style={{position: 'absolute', left: bar.x, top: bar.y, width: bar.w, opacity: range(f, ev.timer - 8, ev.timer)}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: BODY, fontWeight: 600, fontSize: V ? 34 : 30, color: C.sub, marginBottom: 22}}>
          <span style={{display: 'flex', alignItems: 'center', gap: 14}}><Mark vendor="claude" size={V ? 40 : 36} state="waiting" glow={0.5} />request in the notch</span>
          <span style={{fontFamily: CODE, fontSize: V ? 40 : 36, color: C.amber, fontVariantNumeric: 'tabular-nums'}}>{secs} s</span>
        </div>
        <div style={{height: 10, borderRadius: 5, background: '#26262b', overflow: 'hidden'}}>
          <div style={{width: `${t * 100}%`, height: '100%', background: `linear-gradient(90deg, ${C.amber}88, ${C.amber})`}} />
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 26, fontFamily: BODY, fontWeight: 600, fontSize: V ? 36 : 32, color: C.text, opacity: end, transform: `translateY(${(1 - end) * 12}px)`}}>
          → back to the agent's own window
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: V ? 1500 : 900, textAlign: 'center', fontFamily: BODY, fontWeight: 500, fontSize: V ? 38 : 32, color: C.sub, opacity: range(f, ev.timer + 6, ev.timer + 16)}}>
        No answer in 100 seconds? The agent asks you there, as usual.
      </div>
      <Vignette a={0.4} />
      <Grain f={f} />
    </AbsoluteFill>
  );
};

