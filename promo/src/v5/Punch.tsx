/* Beats 8-19 in the owner's chosen direction (decide round 1, 2026-10-14): hybrid, A "Punch" with the surveillance
 * HUD only in the hook and the rm -rf beat; sharper copy. Frames are absolute film frames. */
import React from 'react';
import {AbsoluteFill, Img, random, staticFile} from 'remotion';
import {Combo, Mark} from '../lib';
import {Toast} from '../scenes/Finish';
import {Snap, Terminal} from './Beats';
import {Dramatisation, P, Plate, Pointer, T, clack, clamp01, lerp, span, travel} from './common';
import {Flash, G, glitch, slam} from './Proto';
import {THEMES} from './Orbit';
import {TopList} from './Top';

const Small: React.FC<{children: React.ReactNode; color?: string; size?: number}> = ({children, color = P.text, size = 26}) => (
  <div style={{fontFamily: T.body, fontWeight: 500, fontSize: size, color, whiteSpace: 'pre'}}>{children}</div>
);
const Tag: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = P.text}) => (
  <div style={{fontFamily: T.mono, fontSize: 26, fontWeight: 700, color, letterSpacing: 3}}>{children}</div>
);
/** Shown from `at` until `to`, slammed in. */
const Slam: React.FC<{f: number; at: number; to?: number; style?: React.CSSProperties; origin?: string; children: React.ReactNode}> = ({f, at, to = 1e9, style, origin = '0 50%', children}) =>
  f >= at && f < to ? <div style={{position: 'absolute', transformOrigin: origin, ...slam(f, at), ...style}}>{children}</div> : null;

/* ---------- 8 (510-630): the dangerous row; the hotkey does nothing; a deliberate Deny ---------- */
export const Risky: React.FC<{f: number}> = ({f}) => {
  const key = 540, deny = 627;
  const beat = (f - 510) % 30;
  const heart = Math.exp(-beat / 5) * 0.5 + Math.exp(-Math.max(0, beat - 8) / 5) * (beat >= 8 ? 0.3 : 0);
  const cp = span(f, 598, deny - 4);
  const cur = {x: lerp(1750, 1015, cp), y: lerp(1000, 640, cp) - Math.sin(cp * Math.PI) * 60};
  const press = clack(f, deny);
  return (
    <AbsoluteFill style={{background: '#0D0505', overflow: 'hidden'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at center, rgba(255,69,59,0) 35%, rgba(255,69,59,${0.1 + heart * 0.25}) 100%)`}} />
      <div style={{position: 'absolute', left: 150, top: 330, width: 1620, padding: '44px 56px', boxSizing: 'border-box', borderRadius: 36, background: 'rgba(255,69,59,0.10)', border: `3px solid ${P.red}`,
        filter: glitch(f, key + 1, 4)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, fontFamily: T.body, fontSize: 36, fontWeight: 600, color: P.text}}>
          Codex · CONF-360 · Bash
          <span style={{fontFamily: T.mono, fontSize: 26, color: P.red, border: `2px solid ${P.red}`, borderRadius: 10, padding: '2px 12px'}}>dangerous</span>
        </div>
        <div style={{fontFamily: T.mono, fontSize: 130, fontWeight: 700, color: P.red, marginTop: 16, letterSpacing: -2}}>rm -rf dist build</div>
        <div style={{display: 'flex', gap: 24, marginTop: 26}}>
          <div style={{fontFamily: T.body, fontSize: 36, fontWeight: 600, padding: '16px 40px', borderRadius: 16, background: '#2A2A2E', color: P.text}}>Allow</div>
          <div style={{fontFamily: T.body, fontSize: 36, fontWeight: 600, padding: '16px 40px', borderRadius: 16, background: f >= deny ? P.red : '#2A2A2E', color: '#fff', transform: `scale(${press})`}}>Deny</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 150, top: 800}}><Tag color={P.red}>REQUEST 4 · DANGEROUS</Tag></div>
      {f >= key - 8 && f < key + 9 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: 'rgba(13,5,5,0.7)'}}>
          <Combo f={f} at={key} keys={['⌃', '⌥', 'Y']} size={260} hold={6} gap={36} />
        </AbsoluteFill>
      )}
      <Slam f={f} at={549} to={579} style={{left: 150, top: 160}}><G size={120}>rm -rf on a hotkey?</G></Slam>
      <Slam f={f} at={579} to={598} style={{left: 150, top: 70}}><G size={220} color={P.red}>No.</G></Slam>
      <Slam f={f} at={598} style={{left: 150, top: 160}}><G size={120}>It needs your click.</G></Slam>
      {f >= 598 && <Pointer x={cur.x} y={cur.y} press={press} size={64} />}
      <Flash f={f} at={deny} color={P.red} len={5} peak={0.5} />
    </AbsoluteFill>
  );
};

/* ---------- 9 (630-690): Yours. ---------- */
export const Yours: React.FC<{f: number}> = ({f}) => {
  const d = span(f, 630, 640);
  return (
    <AbsoluteFill style={{background: P.ground, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: P.red, opacity: (1 - d) * 0.3}} />
      <div style={{position: 'absolute', left: 150, top: 150, fontFamily: T.mono, fontSize: 34, color: d > 0.5 ? P.dim : P.red, whiteSpace: 'pre'}}>{'● Bash  rm -rf dist build\n  ⎿ Denied by you in Agent Notch'}</div>
      <Slam f={f} at={640} style={{left: 130, top: 340}}><G size={420}>Yours.</G></Slam>
      {f >= 652 && <div style={{position: 'absolute', left: 150, top: 790}}><Small size={28}>Nothing is approved without your click or keypress.</Small></div>}
    </AbsoluteFill>
  );
};

/* ---------- 10 (690-780): it asks, you answer ---------- */
export const Ask2: React.FC<{f: number}> = ({f}) => {
  const pick = 750, k = 1.5, x = 80, y = 300;
  const opt = {x: x + (480 - 401) * k, y: y + (268 - 77) * k};
  const cp = span(f, 722, pick - 4);
  const cur = {x: lerp(1200, opt.x + 80, cp), y: lerp(1000, opt.y + 18, cp)};
  const press = clack(f, pick);
  const sent = f >= pick + 5;
  const drop = span(f, 690, 700);
  return (
    <AbsoluteFill style={{background: P.ground, overflow: 'hidden', perspective: 1800}}>
      <div style={{position: 'absolute', left: x, top: y, transform: `rotateY(6deg) translateY(${(1 - drop) * -70}px)`, opacity: drop, transformOrigin: '0 50%'}}>
        <Snap src="question.png" x0={401} y0={77} x1={1159} y1={480} k={k} style={{position: 'relative'}}>
          {f >= pick && <div style={{position: 'absolute', left: (472 - 401) * k, top: (258 - 77) * k, width: 22 * k, height: 22 * k, borderRadius: '50%', background: P.amber, transform: `scale(${press})`}} />}
        </Snap>
      </div>
      <div style={{position: 'absolute', left: 1300, top: 600, transform: `translateX(${sent ? 0 : 40}px)`, opacity: sent ? 1 : 0.35}}>
        <Terminal x={0} y={0} w={560} h={300} title="claude · fix/upload-compress" font={24}
          lines={sent ? [{t: '› On the client', c: P.amber}, {t: '● Writing compress.ts', c: P.text}] : [{t: '? How should video be', c: P.dim}, {t: '  compressed?', c: P.dim}]} />
      </div>
      <div style={{position: 'absolute', left: 80, top: 70}}><Tag color={P.amber}>REQUEST 5 · QUESTION</Tag></div>
      <Slam f={f} at={694} style={{left: 1300, top: 300}}><G size={96}>It asks.</G></Slam>
      <Slam f={f} at={pick} style={{left: 1300, top: 420}}><G size={96} color={P.amber}>You answer.</G></Slam>
      {f >= 722 && f < pick + 16 && <Pointer x={cur.x} y={cur.y} press={press} size={64} />}
      <Flash f={f} at={pick} color={P.amber} len={4} peak={0.3} />
    </AbsoluteFill>
  );
};

/* ---------- 11 (780-870): plans ---------- */
export const Plan2: React.FC<{f: number}> = ({f}) => {
  const ok = 840, k = 1.75, x = 560, y = 330;
  const pan = 1 - travel(clamp01((f - 780) / 10));
  const appr = {x: x + (517 - 401) * k, y: y + (386 - 77) * k};
  const cp = span(f, 814, ok - 4);
  const cur = {x: lerp(appr.x + 500, appr.x + 10, cp), y: lerp(1050, appr.y + 18, cp)};
  const press = clack(f, ok);
  const steps = span(f, 788, 816, (t) => t);
  return (
    <AbsoluteFill style={{background: P.ground, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: x, top: y, transform: `translateX(${pan * 1500}px)`, filter: pan > 0.05 ? `blur(${pan * 16}px)` : undefined}}>
        <Snap src="plan.png" x0={401} y0={77} x1={1159} y1={410} k={k} style={{position: 'relative'}}>
          <div style={{position: 'absolute', left: (440 - 401) * k, right: 20, top: (248 + steps * 112 - 77) * k, height: (360 - 248) * (1 - steps) * k, background: '#2D2A1B'}} />
          {f >= ok && <div style={{position: 'absolute', inset: 0, background: P.green, mixBlendMode: 'screen', opacity: 0.35 * (1 - span(f, ok, ok + 16))}} />}
        </Snap>
      </div>
      <div style={{position: 'absolute', left: x, top: 230}}><Tag color={P.amber}>REQUEST 6 · PLAN</Tag></div>
      <Slam f={f} at={792} style={{left: 80, top: 60}}><G size={150}>Plans too.</G></Slam>
      <Slam f={f} at={ok} style={{left: 80, top: 950}}><G size={90} color={P.green}>Read. Approve. Back to work.</G></Slam>
      {f >= 814 && f < ok + 14 && <Pointer x={cur.x} y={cur.y} press={press} size={64} />}
      <Flash f={f} at={ok} color={P.green} len={5} peak={0.4} />
    </AbsoluteFill>
  );
};

/* ---------- 12 (870-990): the swarm, 55 agents in 11 projects, one panel ---------- */
export const Swarm: React.FC<{f: number}> = ({f}) => {
  const k = 1.12, x0 = 395, y0 = 0, x1 = 1160, y1 = 1350, h = (y1 - y0) * k;
  const rise = 1 - travel(clamp01((f - 870) / 8));
  const t = span(f, 880, 978, (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2));
  const n = Math.round(55 * span(f, 878, 892, (x) => 1 - Math.pow(1 - x, 3)));
  return (
    <AbsoluteFill style={{background: P.ground, overflow: 'hidden', perspective: 2200}}>
      <div style={{position: 'absolute', left: 1000, top: lerp(40, 1080 - h - 40, t) + rise * 1100, transform: 'rotateX(8deg) rotateY(-7deg)', transformOrigin: '50% 0'}}>
        <Snap dir="snap4" src="swarm.png" x0={x0} y0={y0} x1={x1} y1={y1} k={k} r={0} style={{position: 'relative'}} />
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(11,11,13,1) 0%, rgba(11,11,13,0.95) 46%, rgba(11,11,13,0) 56%)'}} />
      <div style={{position: 'absolute', left: 80, top: 70}}><Tag color={P.amber}>EVERY AGENT · EVERY PROJECT</Tag></div>
      <Slam f={f} at={878} style={{left: 80, top: 220}}><G size={150}>{`${n} agents.`}</G></Slam>
      <Slam f={f} at={902} style={{left: 80, top: 420}}><G size={150}>11 projects.</G></Slam>
      <Slam f={f} at={930} style={{left: 80, top: 620}}><G size={150} color={P.amber}>One glance.</G></Slam>
      {f >= 958 && <div style={{position: 'absolute', left: 84, top: 840}}><Small size={30}>39 Claude · 16 Codex · 1 waiting for you</Small></div>}
    </AbsoluteFill>
  );
};

/* ---------- 13 (990-1080): the wall ---------- */
export const Wall: React.FC<{f: number}> = ({f}) => {
  const push = lerp(2.0, 2.45, span(f, 990, 1080, (t) => t));
  const glow = span(f, 1002, 1008);
  const cost = (3.42 * span(f, 1030, 1066)).toFixed(2);
  return (
    <AbsoluteFill style={{background: P.ground, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 900, top: 60, transformOrigin: '0 0', transform: `scale(${push})`}}>
        <Img src={staticFile('usage.png')} style={{position: 'absolute', width: 760, height: 600}} />
        <div style={{position: 'absolute', left: 25, top: 86, width: 158, height: 35, borderRadius: 10, boxShadow: `0 0 ${30 * glow}px ${P.amber}`, border: `2px solid rgba(255,176,31,${glow})`}} />
        <div style={{position: 'absolute', left: 560, top: 276, width: 156, height: 32, background: '#252525', textAlign: 'right', fontFamily: T.body, fontSize: 20, color: '#c8c8c8', lineHeight: '32px'}}>${cost}</div>
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(11,11,13,1) 0%, rgba(11,11,13,1) 44%, rgba(11,11,13,0) 54%)'}} />
      <div style={{position: 'absolute', left: 80, top: 70}}><Tag color={P.amber}>LIMITS · CONTEXT · COST</Tag></div>
      <Slam f={f} at={1000} style={{left: 80, top: 330}}><G size={140}>{'Know the wall'}</G></Slam>
      <Slam f={f} at={1030} style={{left: 80, top: 480}}><G size={140} color={P.amber}>{'before you\nhit it.'}</G></Slam>
    </AbsoluteFill>
  );
};

/* ---------- 14 (1080-1230): Keep awake, close the lid, the night runs, morning is done ---------- */
const DONE = [['agents-village', 'v6/notch'], ['billing-api', 'invoice-retry'], ['docs-site', 'search-index']];
export const Night: React.FC<{f: number}> = ({f}) => {
  const on = 1088, lid = 1100, shut = 1106, dawn = 1128, at = 1128, click = 1170;
  // A: the header switch, big
  const hk = 2.6, hx = 232, hy = 380, sx0 = 600, sy0 = 78;
  const knob = {x: hx + (1105 - sx0) * hk, y: hy + (122 - sy0) * hk};
  const cp = span(f, 1080, on - 3);
  const hcur = {x: lerp(1650, knob.x, cp), y: lerp(980, knob.y + 10, cp)};
  const hpress = clack(f, on);
  const close = span(f, lid, shut, (t) => t * t);
  // C: the night, 23:40 to 07:12
  const mins = 23 * 60 + 40 + Math.round(452 * span(f, shut, dawn - 2, (t) => t * t * (3 - 2 * t)));
  const clock = `${String(Math.floor(mins / 60) % 24).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  const doneN = Math.floor(11 * span(f, shut + 4, dawn - 2));
  // D: morning, as before
  const zoom = span(f, click + 2, click + 22, (t) => t * t * t);
  const k = 1920 / 3024;
  const dp = span(f, 1146, click - 4);
  const cur = {x: lerp(1500, 1050, dp), y: lerp(800, 200, dp)};
  const press = clack(f, click);
  const win = span(f, click + 14, click + 24);
  const push = lerp(1.25, 1.4, span(f, dawn, click, (t) => t));
  if (f < shut) {
    return (
      <AbsoluteFill style={{background: P.ground, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: hx, top: hy}}>
          <Snap dir={f >= on ? 'snap4/awake' : 'snap4'} src="one.png" x0={sx0} y0={sy0} x1={1160} y1={200} k={hk} r={0} style={{position: 'relative'}} />
        </div>
        <div style={{position: 'absolute', left: hx, top: 70}}><Tag color={P.amber}>NEW · KEEP AWAKE</Tag></div>
        <Slam f={f} at={on + 1} style={{left: hx, top: 130}}><G size={170} color={P.amber}>Keep awake.</G></Slam>
        {f >= on + 4 && f < lid && <div style={{position: 'absolute', left: hx + 4, top: hy + 360}}><Small size={30}>The Mac stays on with the lid closed. Until you switch it off.</Small></div>}
        {f < on + 8 && <Pointer x={hcur.x} y={hcur.y} press={hpress} size={64} />}
        <Flash f={f} at={on} color={P.amber} len={4} peak={0.35} />
        {f >= lid && (
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 1080 * close, background: '#000', boxShadow: '0 30px 60px rgba(0,0,0,0.9)'}}>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 6, background: '#2a2a2e'}} />
          </div>
        )}
        <Slam f={f} at={lid + 1} style={{left: hx, top: 760}}><G size={130}>Close the lid.</G></Slam>
      </AbsoluteFill>
    );
  }
  if (f < dawn) {
    return (
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 40%, #0E1530 0%, #04060D 70%)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 96, top: 230}}>
          <G size={300} mono>{clock}</G>
        </div>
        <div style={{position: 'absolute', left: 104, top: 600, display: 'flex', gap: 26}}>
          {Array.from({length: 11}, (_, i) => <Mark key={i} vendor={i % 3 === 2 ? 'codex' : 'claude'} size={54} state={i < doneN ? 'done' : 'working'} />)}
        </div>
        <Slam f={f} at={shut + 2} style={{left: 96, top: 720}}><G size={120}>They keep working.</G></Slam>
        <Dramatisation />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '960px 130px', transform: `scale(${push * (1 + zoom * 6)})`, opacity: 1 - win}}>
        <Img src={staticFile('blender/desktop.png')} style={{position: 'absolute', width: 3024 * k, height: 1964 * k, top: -60}} />
        <AbsoluteFill style={{background: 'rgba(0,0,0,0.45)'}} />
        {DONE.map(([p, b], i) => {
          const t = span(f, at + 4 + i * 4, at + 12 + i * 4, (x) => 1 - Math.pow(1 - x, 3));
          return (
            <div key={p} style={{position: 'absolute', left: 960 - 364, top: 196 + i * 72, width: 728, boxSizing: 'border-box', padding: '12px 24px', borderRadius: 18, background: '#1c1c1c', border: '2px solid #3b3b3b',
              display: 'flex', alignItems: 'center', gap: 12, opacity: t * (1 - zoom), transform: `translateY(${(1 - t) * -30}px)`, fontFamily: T.body, fontSize: 22, color: P.text}}>
              <Mark vendor={i === 2 ? 'codex' : 'claude'} size={16} state="done" />
              <span style={{fontWeight: 600}}>{p}</span><span style={{color: P.dim}}>{b} · done</span>
            </div>
          );
        })}
        <div style={{position: 'absolute', inset: 0, transform: `scale(${press})`, transformOrigin: '960px 110px'}}>
          <Toast f={f} at={at} x={960} y={30} />
        </div>
      </div>
      {win > 0 && (
        <div style={{opacity: win, transform: `scale(${lerp(1.08, 1, win)})`, position: 'absolute', inset: 0}}>
          <Terminal x={120} y={300} w={1680} h={700} title="claude · fix/upload-compress" font={36}
            lines={[{t: '✓ 14 passed', c: P.green}, {t: '● git commit -m "Compress video uploads to 720p"', c: P.dim}, {t: '[fix/upload-compress 4f9c2e1]', c: P.text}, {t: ' 4 files changed, 212 insertions(+), 31 deletions(-)', c: P.dim}, {t: '> ', c: P.text}]} />
        </div>
      )}
      {f >= 1146 && f < click + 6 && <Pointer x={cur.x} y={cur.y} press={press} size={64} />}
      <AbsoluteFill style={{background: 'linear-gradient(20deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0) 55%)', opacity: 1 - win}} />
      <Slam f={f} at={dawn} to={click + 14} style={{left: 80, top: 620}}><G size={170} color={P.green}>{'07:12.\nWake up to done.'}</G></Slam>
      {f >= dawn + 10 && f < click + 14 && <div style={{position: 'absolute', left: 84, top: 990}}><Small size={28}>Anything that needs your answer waits for you.</Small></div>}
      <Slam f={f} at={click + 18} style={{left: 120, top: 90}}><G size={110}>One click to its window.</G></Slam>
      <Flash f={f} at={dawn} color="#FFE6B0" len={6} peak={0.7} />
      <Flash f={f} at={click + 14} len={4} peak={0.5} />
    </AbsoluteFill>
  );
};

/* ---------- 15 (1230-1290): fixed ---------- */
export const Fixed: React.FC<{f: number}> = ({f}) => {
  const sh = span(f, 1230, 1242);
  const dim = span(f, 1246, 1254);
  return (
    <AbsoluteFill style={{background: P.ground, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${lerp(1.5, 1, sh)})`, opacity: lerp(1, 0.22, dim)}}>
        <TopList f={f} done />
      </div>
      <Slam f={f} at={1248} style={{left: 110, top: 300}}><G size={170}>Slowest process?</G></Slam>
      <Slam f={f} at={1268} style={{left: 100, top: 500}}><G size={330} color={P.green}>Fixed.</G></Slam>
      <Dramatisation />
    </AbsoluteFill>
  );
};

/* ---------- 16 (1290-1485): 13 themes, a slam per beat ---------- */
export const Themes: React.FC<{f: number}> = ({f}) => {
  const lf = f - 1290;
  const i = Math.min(THEMES.length - 1, Math.floor(lf / 15));
  const at = 1290 + i * 15;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '40% 0%', transform: `translateY(-10px) scale(${0.8 * (1 + 0.012 * Math.exp(-(f - at) / 4))})`}}>
        <Plate shot="themes" frame={lf} />
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(0,0,0,0.75), rgba(0,0,0,0) 40%)'}} />
      <Slam f={f} at={1290} to={1440} origin="100% 50%" style={{right: 80, bottom: 64, textAlign: 'right'}}><G size={120}>13 themes.</G></Slam>
      <Slam f={f} at={1470} origin="100% 50%" style={{right: 80, bottom: 64, textAlign: 'right'}}><G size={120}>Yes, Rubber Ducks.</G></Slam>
      <div style={{position: 'absolute', left: 80, bottom: 70, display: f >= 1470 ? 'none' : 'flex', alignItems: 'baseline', gap: 26}}>
        <span style={{fontFamily: T.mono, fontSize: 40, fontWeight: 600, color: P.dim}}>{String(i + 1).padStart(2, '0')}/13</span>
        <span style={{display: 'inline-block', transformOrigin: '0 100%', ...slam(f, at)}}><G size={90} mono>{THEMES[i]}</G></span>
      </div>
      <Flash f={f} at={1290} len={5} peak={0.6} />
    </AbsoluteFill>
  );
};

/* ---------- 17 (1485-1575): listen ---------- */
const EVENTS = [
  {at: 1500, w: 'permission', c: P.amber},
  {at: 1515, w: 'question', c: P.amber},
  {at: 1530, w: 'plan', c: P.amber},
  {at: 1545, w: 'finished', c: P.green},
];
export const Listen: React.FC<{f: number}> = ({f}) => {
  const e = [...EVENTS].reverse().find((x) => f >= x.at && f < 1560);
  const sheet = span(f, 1560, 1568);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      {f < 1500 && (
        <>
          <Slam f={f} at={1486} style={{left: 110, top: 300}}><G size={200}>Don't look.</G></Slam>
          <Slam f={f} at={1493} style={{left: 110, top: 520}}><G size={200} color={P.amber}>Listen.</G></Slam>
        </>
      )}
      {e && (
        <>
          <div style={{position: 'absolute', left: 1450 - 70, top: 540 - 70, width: 140, height: 140, borderRadius: 70, background: e.c, boxShadow: `0 0 ${80 + 160 * Math.exp(-(f - e.at) / 6)}px ${e.c}`, transform: `scale(${1 + 0.5 * Math.exp(-(f - e.at) / 4)})`}} />
          <Slam f={f} at={e.at} style={{left: 110, top: 430}}><G size={200} color={e.c}>{e.w}</G></Slam>
        </>
      )}
      {f >= 1560 && (
        <>
          <Img src={staticFile('sounds.jpg')} style={{position: 'absolute', left: 1220, top: lerp(1080, 120, sheet), width: 600, borderRadius: 18, boxShadow: '0 40px 90px rgba(0,0,0,0.7)'}} />
          <Slam f={f} at={1560} style={{left: 110, top: 380}}><G size={110}>{'A sound for each event.\nOr none.'}</G></Slam>
        </>
      )}
    </AbsoluteFill>
  );
};

/* ---------- 18 (1575-1650): zero bytes out ---------- */
export const Zero: React.FC<{f: number}> = ({f}) => {
  const t = Math.floor((f - 1575) / 3);
  const others = ['Safari', 'Music', 'Mail', 'cloudd'];
  return (
    <AbsoluteFill style={{background: P.ground, overflow: 'hidden', fontFamily: T.mono, fontSize: 34, color: P.text, whiteSpace: 'pre'}}>
      <div style={{position: 'absolute', left: 120, top: 120, opacity: lerp(1, 0.4, span(f, 1586, 1594))}}>
        <div style={{color: P.dim}}>{`nettop — interval 1s · ${String(14 + Math.floor(t / 10)).padStart(2, '0')}.${t % 10}s`}</div>
        <div style={{marginTop: 30, color: P.dim, fontWeight: 600}}>{'PROCESS'.padEnd(20) + 'BYTES OUT'.padEnd(14) + 'BYTES IN'}</div>
        <div style={{marginTop: 16, padding: '6px 0', background: 'rgba(48,209,89,0.12)', borderLeft: `4px solid ${P.green}`, paddingLeft: 12, marginLeft: -16}}>{'Agent Notch'.padEnd(20) + '↑ 0 B'.padEnd(14) + '↓ 0 B'}</div>
        {others.map((o) => (
          <div key={o} style={{marginTop: 14, color: P.faint}}>{o.padEnd(20) + `↑ ${Math.floor(random(`${o}${t}`) * 90 + 4)} KB`.padEnd(14) + `↓ ${Math.floor(random(`i${o}${t}`) * 900 + 40)} KB`}</div>
        ))}
      </div>
      <Slam f={f} at={1590} style={{left: 110, top: 560}}><G size={220} color={P.green}>Zero bytes out.</G></Slam>
      {f >= 1606 && <div style={{position: 'absolute', left: 120, top: 820}}><Small size={28}>Reads local logs. Sends nothing.</Small></div>}
      <Dramatisation />
    </AbsoluteFill>
  );
};

/* ---------- 19 (1650-1770): end card ---------- */
export const End: React.FC<{f: number}> = ({f}) => {
  const lf = f - 1650;
  const push = lerp(1, 1.05, span(lf, 0, 120, (t) => t));
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${push * 1.25})`, transformOrigin: '50% 100%'}}>
        <Plate shot="endcard" frame={lf} style={{top: 160}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <div style={slam(f, 1650)}><G size={170}>Agent Notch</G></div>
        <div style={{opacity: f >= 1658 ? 1 : 0, fontFamily: T.mono, fontSize: 40, fontWeight: 600, color: P.text, background: P.graphite, border: '1px solid #34343A', borderRadius: 999, padding: '16px 40px'}}>brew install --cask forichok/tap/agent-notch</div>
        <div style={{opacity: f >= 1664 ? 1 : 0}}><Small size={26}>Free · open source · MIT · macOS 14+  ·  github.com/Forichok/Agent-Notch</Small></div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 28, textAlign: 'center'}}>
        <Small size={16} color={P.dim}>Independent project. Not affiliated with Anthropic or OpenAI.</Small>
      </div>
      <Flash f={f} at={1650} len={6} peak={0.8} />
    </AbsoluteFill>
  );
};
