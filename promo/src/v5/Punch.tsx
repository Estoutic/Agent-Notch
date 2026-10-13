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

/* ---------- 12 (870-990): the tower ---------- */
export const Tower: React.FC<{f: number}> = ({f}) => {
  const k = 1.9, h = (1084 - 77) * k;
  const t = span(f, 872, 960, (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2));
  const fold = span(f, 960, 972);
  return (
    <AbsoluteFill style={{background: P.ground, overflow: 'hidden', perspective: 2200}}>
      <div style={{position: 'absolute', left: 860, top: lerp(160, 1080 - h - 80, t), transform: 'rotateX(10deg) rotateY(-8deg)', transformOrigin: '50% 0'}}>
        <Snap src="heavy.png" x0={401} y0={77} x1={1159} y1={1084} k={k} style={{position: 'relative'}} />
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(11,11,13,1) 0%, rgba(11,11,13,0.95) 38%, rgba(11,11,13,0) 50%)'}} />
      <div style={{position: 'absolute', left: 80, top: 70}}><Tag color={P.amber}>REQUEST 7 · EVERYTHING ELSE</Tag></div>
      <Slam f={f} at={878} style={{left: 80, top: 330}}><G size={150}>{'Twelve\nagents.'}</G></Slam>
      <Slam f={f} at={930} style={{left: 80, top: 650}}><G size={150} color={P.amber}>One glance.</G></Slam>
      <div style={{position: 'absolute', left: 1100, top: 40, display: 'flex', gap: 12, alignItems: 'center', opacity: span(f, 950, 956)}}>
        {Array.from({length: 7}, (_, i) => (
          <div key={i} style={{transform: `translateX(${fold * -i * 46}px)`, opacity: i === 0 ? 1 : 1 - fold}}>
            <Mark vendor={i % 2 ? 'codex' : 'claude'} size={40} state={i === 2 ? 'waiting' : 'working'} />
          </div>
        ))}
        <span style={{fontFamily: T.mono, fontSize: 40, fontWeight: 700, color: P.text, marginLeft: -270 * fold, opacity: fold}}>+6</span>
      </div>
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

/* ---------- 14 (1080-1230): done, one click to its window ---------- */
export const Done: React.FC<{f: number}> = ({f}) => {
  const at = 1110, click = 1155;
  const zoom = span(f, click + 2, click + 22, (t) => t * t * t);
  const k = 1920 / 3024;
  const cp = span(f, 1128, click - 4);
  const cur = {x: lerp(1500, 1050, cp), y: lerp(800, 200, cp)};
  const press = clack(f, click);
  const win = span(f, click + 14, click + 24);
  const push = lerp(1.25, 1.4, span(f, 1080, click, (t) => t));
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '960px 130px', transform: `scale(${push * (1 + zoom * 6)})`, opacity: 1 - win}}>
        <Img src={staticFile('blender/desktop.png')} style={{position: 'absolute', width: 3024 * k, height: 1964 * k, top: -60}} />
        <AbsoluteFill style={{background: 'rgba(0,0,0,0.45)'}} />
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
      {f >= 1128 && f < click + 6 && <Pointer x={cur.x} y={cur.y} press={press} size={64} />}
      <Slam f={f} at={at} to={click + 14} style={{left: 80, top: 700}}><G size={300} color={P.green}>Done.</G></Slam>
      <Slam f={f} at={click + 18} style={{left: 120, top: 90}}><G size={110}>One click to its window.</G></Slam>
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
