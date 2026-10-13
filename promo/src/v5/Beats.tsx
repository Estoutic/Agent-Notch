/* Beats 4, 6-15, 17-19 of research/v5/creative-treatment.md section 3. Animatic pass: final timing and captions,
 * real 3x snapshots, Blender preview or v4 plates as blocking. */
import React from 'react';
import {Img, random, staticFile} from 'remotion';
import {Combo, Mark} from '../lib';
import {Toast} from '../scenes/Finish';
import {Dramatisation, P, Plate, Pointer, Reveal, T, clack, lerp, span} from './common';
import {TopList} from './Top';

const Head: React.FC<{size: number; children: React.ReactNode; color?: string; weight?: number}> = ({size, children, color = P.text, weight = 680}) => (
  <div style={{fontFamily: T.display, fontWeight: weight, fontSize: size, letterSpacing: -size * 0.02, lineHeight: 1.05, color, whiteSpace: 'pre'}}>{children}</div>
);
const Label: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 24, color = P.dim}) => (
  <div style={{fontFamily: T.body, fontWeight: 500, fontSize: size, color, whiteSpace: 'pre'}}>{children}</div>
);
const Req: React.FC<{f: number; at: number; n: string}> = ({f, at, n}) => (
  <Reveal f={f} at={at} style={{position: 'absolute', left: 56, top: 34}}>
    <div style={{fontFamily: T.mono, fontSize: 22, fontWeight: 600, color: P.text, letterSpacing: 2}}>REQUEST {n}</div>
  </Reveal>
);

/** A crop of a 3x snapshot (1.5 px per stage px), shown at k film px per stage px. */
export const Snap: React.FC<{src: string; x0: number; y0: number; x1: number; y1: number; k: number; r?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({src, x0, y0, x1, y1, k, r = 24, style, children}) => (
  <div style={{position: 'absolute', width: (x1 - x0) * k, height: (y1 - y0) * k, overflow: 'hidden', borderRadius: r * k, boxShadow: '0 40px 90px rgba(0,0,0,0.65)', ...style}}>
    <Img src={staticFile(`snap3/${src}`)} style={{position: 'absolute', left: -x0 * k, top: -y0 * k, width: 1920 * (k / 1.5)}} />
    {children}
  </div>
);

/* ---------- 4 (150-270): Blender A, the amber period becomes the waiting mark; pull back to the live screen ---------- */
export const Reveal4: React.FC<{f: number}> = ({f}) => {
  const lf = f - 150;
  const labels = ['working', 'waiting for you', 'stuck', 'done'];
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000', overflow: 'hidden'}}>
      <Plate shot="reveal" frame={(lf * 90) / 120} />
      {labels.map((l, i) => (
        <Reveal key={l} f={f} at={156 + i * 12} out={i === 3 ? 206 : 156 + (i + 1) * 12} style={{position: 'absolute', left: 300 + i * 150, top: 640}}>
          <div style={{fontFamily: T.mono, fontSize: 26, fontWeight: 600, color: [P.green, P.amber, P.red, P.dim][i]}}>{l}</div>
        </Reveal>
      ))}
      <Reveal f={f} at={210} style={{position: 'absolute', left: 96, top: 860}}>
        <Head size={56}>Agent Notch</Head>
      </Reveal>
      <Reveal f={f} at={216} style={{position: 'absolute', left: 98, top: 932}}>
        <Label>Every agent, beside the notch.</Label>
      </Reveal>
    </div>
  );
};

/* ---------- a scrolling agent terminal, used by 6, 9, 10, 14 ---------- */
const LOG = [
  '$ pnpm test upload',
  '  ✓ compresses 4K input to 720p',
  '  ✓ keeps aspect ratio',
  '  ✓ skips files under 8 MB',
  '  ✓ falls back without WebCodecs',
  '  ✓ reports progress',
  '  ✓ cancels cleanly',
];
export const Terminal: React.FC<{lines: {t: string; c?: string}[]; x: number; y: number; w: number; h: number; title: string; font?: number}> = ({lines, x, y, w, h, title, font = 26}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: '#0E0E11', borderRadius: 18, border: '1px solid #26262B', overflow: 'hidden', boxShadow: '0 40px 90px rgba(0,0,0,0.6)'}}>
    <div style={{height: 46, display: 'flex', alignItems: 'center', gap: 9, padding: '0 18px', background: '#17171A', fontFamily: T.body, fontSize: 18, color: P.dim}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <span key={c} style={{width: 12, height: 12, borderRadius: 6, background: c, opacity: 0.6}} />)}
      <span style={{marginLeft: 12}}>{title}</span>
    </div>
    <div style={{position: 'absolute', left: 26, right: 26, bottom: 22, fontFamily: T.mono, fontSize: font, lineHeight: 1.45, color: P.text, whiteSpace: 'pre'}}>
      {lines.map((l, i) => <div key={i} style={{color: l.c ?? P.text}}>{l.t}</div>)}
    </div>
  </div>
);

/* ---------- 6 (390-420): green flash, tests scroll ---------- */
export const Resume6: React.FC<{f: number}> = ({f}) => {
  const lf = f - 390;
  const n = Math.min(LOG.length, Math.floor(lf / 2.5) + 1);
  const lines = [{t: '● Bash  pnpm test upload', c: P.dim}, ...LOG.slice(0, n).map((t) => ({t, c: t.includes('✓') ? P.text : P.dim})), ...(lf > 18 ? [{t: '✓ 14 passed', c: P.green}] : [])];
  const flash = 1 - span(lf, 0, 8);
  return (
    <div style={{position: 'absolute', inset: 0, background: P.ground, overflow: 'hidden'}}>
      <Terminal lines={lines} x={140} y={150} w={1000} h={640} title="claude · fix/upload-compress" />
      <div style={{position: 'absolute', inset: 0, background: P.green, opacity: flash * 0.5}} />
      <Reveal f={f} at={396} style={{position: 'absolute', left: 1210, top: 380}}>
        <Head size={64}>{'Seen in 2 seconds.\nNot 20 minutes.'}</Head>
      </Reveal>
    </div>
  );
};

/* ---------- 7 (420-510): Blender C stand-in, keys over a defocused screen; inset answers two requests ---------- */
const MiniReq: React.FC<{title: string; cmd: string; ok: number}> = ({title, cmd, ok}) => (
  <div style={{padding: '20px 24px', borderRadius: 18, background: `rgba(${ok ? '48,209,89' : '255,176,31'},${ok ? 0.14 : 0.12})`, borderLeft: `5px solid ${ok ? P.green : P.amber}`, marginBottom: 16}}>
    <div style={{fontFamily: T.body, fontSize: 22, color: P.text, fontWeight: 600}}>{title}</div>
    <div style={{fontFamily: T.mono, fontSize: 22, color: P.dim, marginTop: 6}}>{cmd}</div>
    <div style={{fontFamily: T.mono, fontSize: 20, color: ok ? P.green : P.amber, marginTop: 8}}>{ok ? 'allowed' : 'waiting'}</div>
  </div>
);
export const Keys7: React.FC<{f: number}> = ({f}) => {
  const k1 = 450, k2 = 480;
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000', overflow: 'hidden'}}>
      <Plate shot="dive" frame={44} style={{filter: 'blur(22px) brightness(0.55)', transform: 'scale(1.15)'}} />
      <div style={{position: 'absolute', left: 150, top: 380, transform: `translateX(${lerp(40, -40, span(f, 420, 510, (t) => t))}px)`}}>
        <Combo f={f} at={f < 470 ? k1 : k2} keys={['⌃', '⌥', 'Y']} size={170} tone={P.green} hold={12} />
      </div>
      <div style={{position: 'absolute', left: 1200, top: 300, width: 600}}>
        <MiniReq title="Codex · CONF-360" cmd="pnpm lint --fix" ok={f >= k1 ? 1 : 0} />
        <MiniReq title="Claude · docs/upload" cmd="git add docs/upload.md" ok={f >= k2 ? 1 : 0} />
      </div>
      <Req f={f} at={424} n={f < k1 + 4 ? '2' : '3'} />
      <Reveal f={f} at={428} style={{position: 'absolute', left: 156, top: 640}}>
        <Head size={64}>⌃⌥Y allows. ⌃⌥N denies.</Head>
      </Reveal>
      <Reveal f={f} at={486} style={{position: 'absolute', left: 158, top: 726}}>
        <Label size={28}>Hands stay on the keyboard.</Label>
      </Reveal>
    </div>
  );
};

/* ---------- 8 (510-630): the dangerous row, the hotkey refused, a deliberate Deny ---------- */
export const Risky8: React.FC<{f: number}> = ({f}) => {
  const key = 540, deny = 627;
  const jolt = f >= key && f < key + 6 ? Math.sin((f - key) * 2.2) * 6 * (1 - (f - key) / 6) : 0;
  const cp = span(f, 590, deny - 4);
  const cur = {x: lerp(1700, 1310, cp), y: lerp(980, 650, cp) - Math.sin(cp * Math.PI) * 50};
  const press = clack(f, deny);
  return (
    <div style={{position: 'absolute', inset: 0, background: P.ground, overflow: 'hidden', transform: `translate(${jolt}px, ${jolt * 0.4}px)`}}>
      <div style={{position: 'absolute', left: 288, top: 380, width: 1344, padding: '34px 44px', boxSizing: 'border-box', borderRadius: 30, background: 'rgba(255,69,59,0.12)', border: `2px solid ${P.red}`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, fontFamily: T.body, fontSize: 30, fontWeight: 600, color: P.text}}>
          Codex · CONF-360 · Bash
          <span style={{fontFamily: T.mono, fontSize: 22, color: P.red, border: `1.5px solid ${P.red}`, borderRadius: 8, padding: '2px 10px'}}>dangerous</span>
        </div>
        <div style={{fontFamily: T.mono, fontSize: 64, fontWeight: 600, color: P.red, marginTop: 18}}>rm -rf dist build</div>
        <div style={{display: 'flex', gap: 20, marginTop: 28}}>
          <div style={{fontFamily: T.body, fontSize: 30, fontWeight: 600, padding: '14px 34px', borderRadius: 14, background: '#2A2A2E', color: P.text}}>Allow</div>
          <div style={{fontFamily: T.body, fontSize: 30, fontWeight: 600, padding: '14px 34px', borderRadius: 14, background: f >= deny ? P.red : '#2A2A2E', color: '#fff', transform: `scale(${press})`}}>Deny</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 288, top: 780, opacity: f >= key - 8 && f < key + 30 ? 1 : 0}}>
        <Combo f={f} at={key} keys={['⌃', '⌥', 'Y']} size={84} hold={18} />
      </div>
      <Req f={f} at={514} n="4" />
      <Reveal f={f} at={549} style={{position: 'absolute', left: 288, top: 200}}>
        <Head size={64}>⌃⌥Y won't approve this.</Head>
      </Reveal>
      <Reveal f={f} at={579} style={{position: 'absolute', left: 288, top: 900}}>
        <Label size={28} color={P.text}>It needs a click.</Label>
      </Reveal>
      {f >= 590 && <Pointer x={cur.x} y={cur.y} press={press} />}
    </div>
  );
};

/* ---------- 9 (630-690): red drains; the terminal line; "Yours." ---------- */
export const Yours9: React.FC<{f: number}> = ({f}) => {
  const d = span(f, 630, 640);
  return (
    <div style={{position: 'absolute', inset: 0, background: P.ground, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, background: P.red, opacity: (1 - d) * 0.25}} />
      <div style={{position: 'absolute', left: 288, top: 300, fontFamily: T.mono, fontSize: 34, color: lerp(0, 1, d) > 0.5 ? P.dim : P.red, whiteSpace: 'pre'}}>
        {'● Bash  rm -rf dist build\n  ⎿ Denied by you in Agent Notch'}
      </div>
      <Reveal f={f} at={642} style={{position: 'absolute', left: 280, top: 470}}>
        <Head size={140}>Yours.</Head>
      </Reveal>
      <Reveal f={f} at={652} style={{position: 'absolute', left: 290, top: 640}}>
        <Label size={22} color={P.text}>Nothing is approved without your click or keypress.</Label>
      </Reveal>
    </div>
  );
};

/* ---------- 10 (690-780): the question, answered from the notch ---------- */
export const Question10: React.FC<{f: number}> = ({f}) => {
  const pick = 750;
  const k = 1.15;
  const opt = {x: 120 + (480 - 401) * k, y: 190 + (268 - 77) * k};
  const cp = span(f, 716, pick - 4);
  const cur = {x: lerp(900, opt.x + 60, cp), y: lerp(900, opt.y + 14, cp)};
  const press = clack(f, pick);
  const sent = f >= pick + 6;
  return (
    <div style={{position: 'absolute', inset: 0, background: P.ground, overflow: 'hidden', perspective: 1600}}>
      <div style={{position: 'absolute', left: 120, top: 190, transform: `rotateY(5deg) translateY(${(1 - span(f, 690, 704)) * -40}px)`, opacity: span(f, 690, 698), transformOrigin: '0 50%'}}>
        <Snap src="question.png" x0={401} y0={77} x1={1159} y1={663} k={k} style={{position: 'relative'}}>
          {f >= pick && <div style={{position: 'absolute', left: (472 - 401) * k, top: (258 - 77) * k, width: 22 * k, height: 22 * k, borderRadius: '50%', background: P.amber, transform: `scale(${press})`}} />}
        </Snap>
      </div>
      <Terminal x={1100} y={250} w={700} h={480} title="claude · fix/upload-compress" font={24}
        lines={[{t: '? How should video be', c: P.dim}, {t: '  compressed?', c: P.dim}, ...(sent ? [{t: '› On the client', c: P.amber}, {t: '● Writing compress.ts …', c: P.text}] : [{t: '  waiting for answer', c: P.faint}])]} />
      <Req f={f} at={694} n="5" />
      <Reveal f={f} at={700} style={{position: 'absolute', left: 120, top: 920}}>
        <Head size={64}>It asks. You answer here.</Head>
      </Reveal>
      {f >= 716 && f < pick + 20 && <Pointer x={cur.x} y={cur.y} press={press} />}
    </div>
  );
};

/* ---------- 11 (780-870): whip-pan right; the plan, approved ---------- */
export const Plan11: React.FC<{f: number}> = ({f}) => {
  const ok = 840;
  const k = 1.15;
  const pan = 1 - span(f, 780, 792);
  const x = 1000 - 120 + 120;
  const appr = {x: x + (517 - 401) * k, y: 190 + (386 - 77) * k};
  const cp = span(f, 812, ok - 4);
  const cur = {x: lerp(appr.x - 300, appr.x + 10, cp), y: lerp(950, appr.y + 14, cp)};
  const press = clack(f, ok);
  // steps reveal top to bottom: a ground-coloured mask slides down the step lines (stage y 248..360)
  const steps = span(f, 788, 818, (t) => t);
  return (
    <div style={{position: 'absolute', inset: 0, background: P.ground, overflow: 'hidden', filter: pan > 0.05 ? `blur(${pan * 10}px)` : undefined}}>
      <div style={{position: 'absolute', left: 0, top: 0, transform: `translateX(${pan * 1400}px)`}}>
        <div style={{position: 'absolute', left: x, top: 190}}>
          <Snap src="plan.png" x0={401} y0={77} x1={1159} y1={603} k={k} style={{position: 'relative'}}>
            <div style={{position: 'absolute', left: (440 - 401) * k, right: 20, top: (248 + steps * 112 - 77) * k, height: (360 - 248) * (1 - steps) * k, background: '#2D2A1B'}} />
            {f >= ok && <div style={{position: 'absolute', left: (456 - 401) * k, top: (368 - 77) * k, width: 122 * k, height: 36 * k, borderRadius: 8 * k, background: P.green, mixBlendMode: 'screen', opacity: 0.45 * (1 - span(f, ok, ok + 20))}} />}
          </Snap>
        </div>
      </div>
      <Req f={f} at={790} n="6" />
      <Reveal f={f} at={796} style={{position: 'absolute', left: 120, top: 400}}>
        <Head size={64}>{'Plans too.\nRead it, approve it.'}</Head>
      </Reveal>
      {f >= 812 && f < ok + 20 && <Pointer x={cur.x} y={cur.y} press={press} />}
    </div>
  );
};

/* ---------- 12 (870-990): the heavy list as a tower, tilted down ---------- */
export const Tower12: React.FC<{f: number}> = ({f}) => {
  const k = 1.5;
  const h = (1084 - 77) * k;
  const t = span(f, 876, 966, (x) => x * x * (3 - 2 * x));
  const fold = span(f, 960, 975);
  return (
    <div style={{position: 'absolute', inset: 0, background: P.ground, overflow: 'hidden', perspective: 2000}}>
      <div style={{position: 'absolute', left: 1000, top: lerp(120, 1080 - h - 120, t), transform: 'rotateX(8deg)', transformOrigin: '50% 0'}}>
        <Snap src="heavy.png" x0={401} y0={77} x1={1159} y1={1084} k={k} style={{position: 'relative'}} />
      </div>
      <div style={{position: 'absolute', left: 1000 - 60, top: 0, height: 64, width: 400, display: 'flex', alignItems: 'center', gap: 10, opacity: fold}}>
        {Array.from({length: 6}, (_, i) => (
          <div key={i} style={{transform: `translateX(${fold * -i * 26}px)`, opacity: i === 0 ? 1 : 1 - fold}}>
            <Mark vendor={i % 2 ? 'codex' : 'claude'} size={28} state="working" />
          </div>
        ))}
        <span style={{fontFamily: T.mono, fontSize: 26, color: P.text, marginLeft: -100 * fold}}>{fold > 0.6 ? '+6' : ''}</span>
      </div>
      <Req f={f} at={874} n="7" />
      <Reveal f={f} at={880} style={{position: 'absolute', left: 120, top: 420}}>
        <Head size={72}>{'Every project.\nEvery subagent.'}</Head>
      </Reveal>
    </div>
  );
};

/* ---------- 13 (990-1080): usage macro ---------- */
export const Usage13: React.FC<{f: number}> = ({f}) => {
  const push = lerp(1.6, 1.85, span(f, 990, 1080, (t) => t));
  const glow = span(f, 1002, 1012);
  const cost = (3.42 * span(f, 1020, 1060)).toFixed(2);
  // image is 760x600; the panel's right half sits on the right of the frame
  const ox = 1000, oy = 120;
  return (
    <div style={{position: 'absolute', inset: 0, background: P.ground, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: ox, top: oy, transformOrigin: '0 0', transform: `scale(${push})`}}>
        <Img src={staticFile('usage.png')} style={{position: 'absolute', width: 760, height: 600}} />
        <div style={{position: 'absolute', left: 25, top: 86, width: 158, height: 35, borderRadius: 10, boxShadow: `0 0 ${24 * glow}px ${P.amber}`, border: `2px solid rgba(255,176,31,${glow})`}} />
        <div style={{position: 'absolute', left: 560, top: 276, width: 156, height: 32, background: '#252525', textAlign: 'right', fontFamily: T.body, fontSize: 20, color: '#c8c8c8', lineHeight: '32px'}}>${cost}</div>
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(11,11,13,1) 0%, rgba(11,11,13,1) 46%, rgba(11,11,13,0) 56%)'}} />
      <Req f={f} at={994} n="8" />
      <Reveal f={f} at={1000} style={{position: 'absolute', left: 120, top: 400}}>
        <Head size={72}>{'Limits, context, cost.'}</Head>
      </Reveal>
      <Reveal f={f} at={1030} style={{position: 'absolute', left: 124, top: 500}}>
        <Label size={28} color={P.text}>See the wall before you hit it.</Label>
      </Reveal>
    </div>
  );
};

/* ---------- 14 (1080-1230): the toast drops; clicked; zoom through into the agent's window ---------- */
export const Toast14: React.FC<{f: number}> = ({f}) => {
  const at = 1110, click = 1155;
  const zoom = span(f, click + 2, click + 24, (t) => t * t);
  const k = 1920 / 3024;
  const cp = span(f, 1130, click - 4);
  const cur = {x: lerp(1300, 1010, cp), y: lerp(700, 150, cp)};
  const press = clack(f, click);
  const win = span(f, click + 14, click + 26);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '960px 140px', transform: `scale(${1 + zoom * 5})`, opacity: 1 - win}}>
        <Img src={staticFile('blender/desktop.png')} style={{position: 'absolute', width: 3024 * k, height: 1964 * k, top: -60}} />
        <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)'}} />
        <div style={{position: 'absolute', left: 0, top: 0, transform: `scale(${press})`, transformOrigin: '960px 120px'}}>
          <Toast f={f} at={at} x={960} y={40} />
        </div>
      </div>
      {win > 0 && (
        <div style={{opacity: win}}>
          <Terminal x={160} y={130} w={1600} h={760} title="claude · fix/upload-compress" font={30}
            lines={[{t: '✓ 14 passed', c: P.green}, {t: '● git commit -m "Compress video uploads to 720p"', c: P.dim}, {t: '[fix/upload-compress 4f9c2e1] Compress video uploads to 720p', c: P.text}, {t: ' 4 files changed, 212 insertions(+), 31 deletions(-)', c: P.dim}, {t: '> ', c: P.text}]} />
        </div>
      )}
      {f >= 1130 && f < click + 6 && <Pointer x={cur.x} y={cur.y} press={press} />}
      <Req f={f} at={1112} n="9" />
      <Reveal f={f} at={1118} style={{position: 'absolute', left: 120, top: 900}}>
        <Head size={64}>Done. One click puts you in its window.</Head>
      </Reveal>
    </div>
  );
};

/* ---------- 15 (1230-1290): back to the `top` list, all green ---------- */
export const Bookend15: React.FC<{f: number}> = ({f}) => {
  const sh = span(f, 1230, 1244);
  const dim = span(f, 1252, 1262);
  return (
    <div style={{position: 'absolute', inset: 0, background: P.ground, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${lerp(1.25, 1, sh)})`, opacity: lerp(1, 0.28, dim)}}>
        <TopList f={f} done />
      </div>
      <Reveal f={f} at={1254} style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center'}}>
        <Head size={96}>Slowest process? Not anymore.</Head>
      </Reveal>
      <Dramatisation />
    </div>
  );
};

/* ---------- 17 (1485-1575): marks in the dark, a sound each ---------- */
export const Sounds17: React.FC<{f: number}> = ({f}) => {
  const ev = [
    {at: 1500, l: 'permission', c: P.amber},
    {at: 1515, l: 'question', c: P.amber},
    {at: 1530, l: 'plan', c: P.amber},
    {at: 1545, l: 'finished', c: P.green},
  ];
  const sheet = span(f, 1560, 1570) * (1 - span(f, 1572, 1575, (t) => t));
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000', overflow: 'hidden'}}>
      {ev.map((e, i) => {
        const fl = f >= e.at ? Math.exp(-(f - e.at) / 8) : 0;
        const x = 600 + i * 240;
        return (
          <div key={e.l}>
            <div style={{position: 'absolute', left: x - 12, top: 528, width: 24, height: 24, borderRadius: 12, background: e.c, opacity: 0.35 + 0.65 * (f >= e.at ? 1 : 0), boxShadow: `0 0 ${20 + fl * 80}px ${e.c}`, transform: `scale(${1 + fl * 0.8})`}} />
            <Reveal f={f} at={e.at} style={{position: 'absolute', left: x - 120, width: 240, top: 590, textAlign: 'center'}}>
              <div style={{fontFamily: T.mono, fontSize: 24, color: P.text}}>{e.l}</div>
            </Reveal>
          </div>
        );
      })}
      <Reveal f={f} at={1488} out={1560} style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center'}}>
        <Head size={72}>Don't look. Listen.</Head>
      </Reveal>
      {sheet > 0 && <Img src={staticFile('sounds.jpg')} style={{position: 'absolute', left: 1240, top: lerp(1080, 160, sheet), width: 560, borderRadius: 18, boxShadow: '0 40px 90px rgba(0,0,0,0.7)'}} />}
      <Reveal f={f} at={1560} style={{position: 'absolute', left: 120, top: 760}}>
        <Head size={56}>A sound for each event. Or none.</Head>
      </Reveal>
    </div>
  );
};

/* ---------- 18 (1575-1650): nettop, nothing sent ---------- */
export const Net18: React.FC<{f: number}> = ({f}) => {
  const t = Math.floor((f - 1575) / 3);
  const others = ['Safari', 'Music', 'Mail', 'cloudd'];
  return (
    <div style={{position: 'absolute', inset: 0, background: P.ground, overflow: 'hidden', fontFamily: T.mono, fontSize: 34, color: P.text, whiteSpace: 'pre'}}>
      <div style={{position: 'absolute', left: 300, top: 150, color: P.dim}}>{`nettop — interval 1s · ${String(14 + Math.floor(t / 10)).padStart(2, '0')}.${t % 10}s`}</div>
      <div style={{position: 'absolute', left: 286, top: 220, width: 1348, height: 52, background: P.graphite}} />
      <div style={{position: 'absolute', left: 300, top: 226, color: P.dim, fontWeight: 600}}>{'PROCESS'.padEnd(20) + 'BYTES OUT'.padEnd(14) + 'BYTES IN'}</div>
      <div style={{position: 'absolute', left: 286, top: 290, width: 1348, height: 56, background: 'rgba(48,209,89,0.10)', borderLeft: `4px solid ${P.green}`}} />
      <div style={{position: 'absolute', left: 300, top: 296}}>{'Agent Notch'.padEnd(20) + '↑ 0 B'.padEnd(14) + '↓ 0 B'}</div>
      {others.map((o, i) => (
        <div key={o} style={{position: 'absolute', left: 300, top: 370 + i * 52, color: P.faint}}>
          {o.padEnd(20) + `↑ ${Math.floor(random(`${o}${t}`) * 90 + 4)} KB`.padEnd(14) + `↓ ${Math.floor(random(`i${o}${t}`) * 900 + 40)} KB`}
        </div>
      ))}
      <Reveal f={f} at={1584} style={{position: 'absolute', left: 300, top: 680}}>
        <Head size={64}>Reads local logs. Sends nothing.</Head>
      </Reveal>
      <Dramatisation />
    </div>
  );
};

/* ---------- 19 (1650-1770): end card ---------- */
export const End19: React.FC<{f: number}> = ({f}) => {
  const lf = f - 1650;
  const push = lerp(1, 1.04, span(lf, 0, 120, (t) => t));
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '50% 80%'}}>
        <Plate shot="endcard" frame={lf} style={{top: 140}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 84, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
        <Reveal f={f} at={1650}><Head size={96}>Agent Notch</Head></Reveal>
        <Reveal f={f} at={1656}>
          <div style={{fontFamily: T.mono, fontSize: 36, fontWeight: 500, color: P.text, background: P.graphite, border: '1px solid #2E2E33', borderRadius: 999, padding: '14px 34px'}}>brew install --cask forichok/tap/agent-notch</div>
        </Reveal>
        <Reveal f={f} at={1662}><Label size={24} color={P.text}>Free · open source · MIT · macOS 14+</Label></Reveal>
        <Reveal f={f} at={1666}><Label size={24}>github.com/Forichok/Agent-Notch</Label></Reveal>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center'}}>
        <Label size={16}>Independent project. Not affiliated with Anthropic or OpenAI.</Label>
      </div>
    </div>
  );
};

