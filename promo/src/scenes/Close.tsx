/* Close: where it works, what it reads, how to get it. */
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import icon from '../../../assets/icon-1024.png';
import {BODY, CODE, DISPLAY} from '../fonts';
import {Backdrop, C, Grain, Vignette, camAt, easeIO, expoOut, range, useShot, useV} from '../lib';
import {UI, UI_MONO} from '../lib';
import {NOTCH_CX, World, Laptop, WingItem} from '../world';
import {BlenderDevice, hasBlender} from '../device';
import {Blur, J_WING} from './Open';
import {Caption} from './common';
import {Term, TitleBar} from './terminals';

/* ---------- hosts: Terminal, VS Code, the desktop app; the notch stays ---------- */
const WIN = {x: NOTCH_CX - 1250, y: 170, w: 2500, h: 1640};
const VSCode: React.FC<{f: number}> = ({f}) => {
  const code = [
    ['export async function compress(file: File) {', '#9cdcfe'],
    ['  if (file.size > MAX_BYTES) throw new TooLarge(file.size);', '#d4d4d4'],
    ['  const track = await demux(file);', '#d4d4d4'],
    ['  const encoder = new VideoEncoder({ output, error });', '#d4d4d4'],
    ['  encoder.configure({ codec: "avc1.42001f", width: 1280, height: 720 });', '#ce9178'],
    ['  for await (const frame of track) encoder.encode(frame);', '#d4d4d4'],
    ['  await encoder.flush();', '#d4d4d4'],
    ['  return mux(chunks);', '#d4d4d4'],
    ['}', '#9cdcfe'],
  ];
  const n = 30 + Math.floor(f / 3);
  return (
    <div style={{position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 22, overflow: 'hidden', background: '#1e1e1e', boxShadow: '0 60px 160px rgba(0,0,0,0.8), 0 0 0 2px rgba(255,255,255,0.14)', display: 'flex', flexDirection: 'column'}}>
      <TitleBar title="compress.ts — wedding-app" h={70} font={30} />
      <div style={{flex: 1, display: 'flex'}}>
        <div style={{width: 90, background: '#333333'}} />
        <div style={{width: 520, background: '#252526', padding: 30, fontFamily: UI, fontSize: 30, color: '#cccccc', lineHeight: '52px'}}>
          {['apps', '  app', '    features', '      upload', '        compress.ts', '        UploadForm.tsx', '  api', '    src'].map((t, i) => (
            <div key={i} style={{whiteSpace: 'pre', background: i === 4 ? '#37373d' : undefined}}>{t}</div>
          ))}
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
          <div style={{flex: 1, padding: '30px 40px', fontFamily: UI_MONO, fontSize: 32, lineHeight: '52px', whiteSpace: 'pre'}}>
            {code.map(([t, c], i) => <div key={i} style={{color: c}}><span style={{color: '#6e7681', marginRight: 40}}>{String(i + 1).padStart(2, ' ')}</span>{t}</div>)}
          </div>
          <div style={{height: 560, borderTop: '2px solid #3c3c3c', padding: '20px 40px', fontFamily: UI_MONO, fontSize: 30, lineHeight: '46px', whiteSpace: 'pre', color: '#cccccc'}}>
            <div style={{color: '#e7e7e7', fontFamily: UI, fontSize: 26, marginBottom: 12, letterSpacing: 1}}>TERMINAL</div>
            <div style={{color: '#e8e8ea'}}>⏺ Edit(apps/app/features/upload/compress.ts)</div>
            <div style={{color: '#8a8a90'}}>{'  '}⎿  Updated with 9 additions</div>
            <div style={{color: '#e8e8ea'}}>⏺ Bash(pnpm --filter app test)</div>
            <div style={{color: '#4cd964'}}>{'  '}⎿  PASS features/upload/compress.test.ts</div>
            <div style={{color: '#e0583a'}}>{n % 2 ? '✻' : '✢'} Checking edge sizes…</div>
          </div>
        </div>
      </div>
    </div>
  );
};
const DesktopApp: React.FC = () => (
  <div style={{position: 'absolute', left: WIN.x + 150, top: WIN.y, width: WIN.w - 300, height: WIN.h, borderRadius: 26, overflow: 'hidden', background: '#262624', boxShadow: '0 60px 160px rgba(0,0,0,0.8), 0 0 0 2px rgba(255,255,255,0.14)', display: 'flex', flexDirection: 'column', fontFamily: UI}}>
    <TitleBar title="Compress video uploads" h={70} font={30} />
    <div style={{flex: 1, display: 'flex'}}>
      <div style={{width: 520, background: '#1f1f1d', padding: 34, color: '#a8a8a2', fontSize: 30, lineHeight: '64px'}}>
        {['Compress video uploads', 'Guest Telegram link', 'Upload docs', 'Release notes'].map((t, i) => (
          <div key={t} style={{color: i === 0 ? '#f0efe9' : undefined, background: i === 0 ? '#34332f' : undefined, borderRadius: 12, padding: '0 18px'}}>{t}</div>
        ))}
      </div>
      <div style={{flex: 1, padding: '60px 120px', color: '#e8e6dc', fontSize: 36, lineHeight: '58px'}}>
        <div style={{marginLeft: 'auto', width: 'fit-content', maxWidth: 1100, background: '#3a3935', borderRadius: 26, padding: '22px 34px'}}>Compress uploads to 720p in the browser before they leave the phone.</div>
        <div style={{marginTop: 50}}>I'll read the upload flow first, then add WebCodecs compression.</div>
        <div style={{marginTop: 30, border: '2px solid #4a4944', borderRadius: 18, padding: '18px 30px', fontFamily: UI_MONO, fontSize: 30, color: '#c9c7bd'}}>Bash · pnpm --filter api test</div>
        <div style={{marginTop: 30, color: '#4cd964', fontFamily: UI_MONO, fontSize: 30}}>PASS src/services/media.test.ts (38)</div>
      </div>
    </div>
  </div>
);
export const Hosts: React.FC = () => {
  const {f, ev, len} = useShot('hosts');
  const {W, H, V} = useV();
  const cam = V ? camAt(f, [{f: 0, s: 0.345, fx: NOTCH_CX, fy: 980, ax: W / 2, ay: 620}, {f: len, s: 0.355, fx: NOTCH_CX, fy: 980, ax: W / 2, ay: 620}])
    : camAt(f, [{f: 0, s: 0.41, fx: NOTCH_CX, fy: 980, ax: W / 2, ay: 450}, {f: len, s: 0.42, fx: NOTCH_CX, fy: 980, ax: W / 2, ay: 450}]);
  const which = f >= ev.desktop ? 2 : f >= ev.vscode ? 1 : 0;
  const at = [0, ev.vscode, ev.desktop][which];
  const slide = which === 0 ? 1 : range(f, at, at + 6, easeIO);
  const win = (k: number) =>
    k === 0 ? <Term x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h} kind="claude" title="claude — wedding-app — fix/upload-compress" f={f} seed={1} speed={3} font={40} style={{boxShadow: '0 60px 160px rgba(0,0,0,0.8), 0 0 0 2px rgba(255,255,255,0.14)'}} />
      : k === 1 ? <VSCode f={f} /> : <DesktopApp />;
  const names = ['Terminal.', 'VS Code.', 'The desktop app.'];
  const wing: WingItem[] = J_WING.map((w) => ({...w, st: 'working'}));
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Blur on={slide > 0 && slide < 1} samples={6}>
        <World cam={cam} bg={<Backdrop f={f} light="rgba(255,255,255,0.06)" at={[50, 20]} />}>
          <Laptop clock="Tue 14:52" tone={0.5} app={['Terminal', 'Code', 'Claude'][which]} menus={['File', 'Edit', 'View', 'Window', 'Help']}
            wing={{items: wing}}
            under={
              <>
                {which > 0 && slide < 1 && <div style={{transform: `translateX(${-slide * 3200}px)`}}>{win(which - 1)}</div>}
                <div style={{transform: `translateX(${(1 - slide) * 3200}px)`}}>{win(which)}</div>
              </>
            } />
        </World>
      </Blur>
      {names.map((n, i) => (
        <Caption key={n} f={f} from={i === 0 ? 0 : [0, ev.vscode, ev.desktop][i] + 2} to={[ev.vscode, ev.desktop, len + 1][i]} V={V} vy={1300} ly={918} size={V ? 96 : 72} align="center" lx={0}>{n}</Caption>
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: V ? 1460 : 1010, textAlign: 'center', fontFamily: BODY, fontWeight: 500, fontSize: V ? 40 : 30, color: C.sub, opacity: range(f, 4, 12)}}>
        Claude Code and Codex, wherever they run. The notch stays.
      </div>
      <Vignette a={0.4} />
      <Grain f={f} />
    </AbsoluteFill>
  );
};

/* ---------- local ---------- */
export const Local: React.FC = () => {
  const {f, ev, len} = useShot('local');
  const {V} = useV();
  const a = range(f, 0, 10, expoOut), b = range(f, ev.line2, ev.line2 + 10, expoOut);
  const out = range(f, len - 5, len);
  const sz = V ? 150 : 150;
  return (
    <AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: 1 - out}}>
      <div style={{fontFamily: DISPLAY, fontWeight: 650, fontSize: sz, letterSpacing: -6, color: C.text, opacity: a, transform: `translateY(${(1 - a) * 20}px)`, lineHeight: 1.05, textAlign: 'center'}}>Local logs.</div>
      <div style={{fontFamily: DISPLAY, fontWeight: 650, fontSize: sz, letterSpacing: -6, color: C.text, opacity: b, transform: `translateY(${(1 - b) * 20}px)`, lineHeight: 1.05, textAlign: 'center'}}>No network.</div>
      <div style={{fontFamily: CODE, fontSize: V ? 38 : 34, color: C.sub, marginTop: 50, opacity: range(f, ev.line2 + 4, ev.line2 + 14)}}>reads ~/.claude and ~/.codex on your Mac</div>
      <Grain f={f} amount={0.06} />
    </AbsoluteFill>
  );
};

/* ---------- end: the agent we followed, working; name, install, free ---------- */
export const INSTALL = 'brew install --cask forichok/tap/agent-notch';
export const End: React.FC = () => {
  const {f, ev, len} = useShot('end');
  const {W, H, V} = useV();
  const shot = V ? 'endcard-v' : 'endcard';
  const blender = hasBlender(shot);
  const wide = V ? {s: 0.27, fx: NOTCH_CX, fy: 982, ax: W / 2, ay: 520} : {s: 0.24, fx: NOTCH_CX, fy: 982, ax: W / 2, ay: 300};
  const cam = camAt(f, [
    {f: 0, s: V ? 3.2 : 4.2, fx: 730, fy: 32, ax: W / 2, ay: V ? 520 : 300},
    {f: 6, s: V ? 3.1 : 4.0, fx: 730, fy: 32, ax: W / 2, ay: V ? 520 : 300},
    {f: 20, ...wide, e: expoOut},
    {f: len, ...wide, s: wide.s * 1.02},
  ]);
  const wing: WingItem[] = J_WING.map((w) => ({...w, st: 'working'}));
  const typed = INSTALL.slice(0, Math.floor(range(f, ev.install, ev.install + 14, (t) => t) * INSTALL.length));
  const nameIn = range(f, 16, 28, expoOut);
  const inst = range(f, ev.install - 4, ev.install + 4, expoOut);
  const url = range(f, ev.url, ev.url + 10, expoOut);
  const out = range(f, len - 8, len);
  const hit = f >= ev.hit ? Math.exp(-(f - ev.hit) / 5) : 0;
  const textTop = blender ? (V ? 300 : 80) : V ? 1000 : 610;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {blender ? (
        <AbsoluteFill style={{opacity: 0.9}}>
          <BlenderDevice shot={shot} frame={(f / len) * 120} screen={{clock: 'Tue 15:04', wing: {items: wing}}} />
        </AbsoluteFill>
      ) : (
        <Blur on={f > 6 && f < 18}>
          <World cam={cam} bg={<Backdrop f={f} light="rgba(255,255,255,0.07)" at={[50, 15]} />}>
            <Laptop clock="Tue 15:04" wing={{items: wing, glow: (i) => (i === 0 ? 0.4 : 0)}} />
          </World>
        </Blur>
      )}
      <AbsoluteFill style={{background: blender ? 'linear-gradient(rgba(0,0,0,0.75), transparent 55%)' : undefined}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: textTop, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 1 - out, transform: blender && !V ? 'scale(0.82)' : undefined, transformOrigin: '50% 0'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 34, opacity: nameIn, transform: `translateY(${(1 - nameIn) * 24}px) scale(${1 + 0.035 * hit})`, filter: hit > 0.02 ? `drop-shadow(0 0 ${40 * hit}px rgba(255,255,255,${0.5 * hit}))` : undefined}}>
          <Img src={icon} style={{width: V ? 150 : 128, height: V ? 150 : 128, borderRadius: V ? 34 : 29}} />
          <div style={{fontFamily: DISPLAY, fontWeight: 650, fontSize: V ? 130 : 124, letterSpacing: -5, color: C.text, lineHeight: 1}}>Agent Notch</div>
        </div>
        <div style={{marginTop: V ? 70 : 46, padding: V ? '24px 34px' : '20px 34px', borderRadius: 18, background: '#141416', border: '1px solid #2c2c31', fontFamily: CODE, fontSize: V ? 30 : 44, color: C.text,
          opacity: inst, transform: `translateY(${(1 - inst) * 14}px)`, whiteSpace: 'nowrap', minWidth: V ? 0 : 1080}}>
          <span style={{color: C.green}}>$ </span>{typed}<span style={{display: 'inline-block', width: 3, height: V ? 30 : 44, background: Math.floor(f / 8) % 2 ? C.text : 'transparent', marginLeft: 3, verticalAlign: 'middle'}} />
        </div>
        <div style={{marginTop: V ? 56 : 40, fontFamily: BODY, fontWeight: 600, fontSize: V ? 46 : 42, color: C.text, opacity: url, transform: `translateY(${(1 - url) * 12}px)`}}>github.com/Forichok/Agent-Notch</div>
        <div style={{marginTop: 16, fontFamily: BODY, fontWeight: 500, fontSize: V ? 38 : 34, color: C.sub, opacity: range(f, ev.url + 6, ev.url + 16)}}>Free and open source · MIT</div>
      </div>
      <Vignette a={0.45} />
      <Grain f={f} />
    </AbsoluteFill>
  );
};

