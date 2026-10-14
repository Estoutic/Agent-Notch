/* v7 hosts: Terminal, VS Code, the desktop app (stand-in windows, not the app's UI); the notch is the app's real wing marks. */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BODY} from '../../fonts';
import {Backdrop, C, Grain, UI, UI_MONO, Vignette, camAt, easeIO, range, useShot, useV} from '../../lib';
import {NOTCH_CX, World, WingItem} from '../../world';
import {Blur, J_WING} from '../../scenes/Open';
import {Caption} from '../../scenes/common';
import {Term, TitleBar} from '../../scenes/terminals';
import {Laptop7} from './world7';

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
export const Hosts7: React.FC = () => {
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
          <Laptop7 clock="Tue 14:52" tone={0.5} app={['Terminal', 'Code', 'Claude'][which]} menus={['File', 'Edit', 'View', 'Window', 'Help']}
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

