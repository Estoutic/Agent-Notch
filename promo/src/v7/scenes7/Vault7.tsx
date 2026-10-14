/*
 * Prompt vault (owner, round 6: PR #13), drawn from the app's own pixels: still in Claude's terminal after keys, ⌃⌥P
 * drops the picker under the notch (public/snap-vault, crops of a master build's --snapshot-prompts on fixture
 * prompts and skills; AGENT_NOTCH_SNAPSHOT_SELECTED=0 so row 1 is selected, as when the picker opens). ⇥ shows the
 * skills and comes back (the app resets the selection to row 1), ⌘2 pastes row 2, "Plan first", into Claude's input line.
 */
import React, {useContext} from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, Combo, ShotCtx, UI_MONO, camAt, clamp01, expoOut, range, useV} from '../../lib';
import {BAR, NOTCH_CX} from '../../world';
import {Caption} from '../../scenes/common';
import {Term} from '../../scenes/terminals';
import {EV7, local7, type Placed7} from '../timeline7';
import {Desk7, RealWing7, type SnapRef} from './world7';

const ASK_CODEX: SnapRef = {src: 'snap5/ask-codex.png', h: 558, wing: 695, panel: {top: 77, bottom: 536}};
/** The picker panel at 2x: 920 x 614 px = 460 x 307 pt = 920 x 614 stage px, hung under the notch. */
const PW = 920, PH = 614, PX = NOTCH_CX - PW / 2, PY = BAR + 16; // the app: 8 pt under the menu bar
/** fixture prompt "Plan first" (Sources/NotchCore/PromptVault.swift) */
const PLAN_FIRST = 'Before writing code, read the relevant files and lay out a step-by-step plan. Wait for my OK, then do it.';
const TERM = {x: NOTCH_CX - 1300, y: 200, w: 2600, h: 1560};
const INPUT = {x: -40, y: 690, w: 1520};
/** Keys7's terminal clock at its last frame (keys is 87 frames), so the scrollback carries on over the cut. */
const TERM_CLOCK = 400 + 87;

export const Vault7: React.FC = () => {
  const p = useContext(ShotCtx) as unknown as Placed7;
  const f = useCurrentFrame();
  const {V} = useV();
  const len = p.to - p.from;
  const open = local7(p, EV7.vault.open), tab = local7(p, EV7.vault.tab), back = local7(p, EV7.vault.back), paste = local7(p, EV7.vault.paste);
  const cam = camAt(f, [
    {f: 0, s: 1.47, fx: 780, fy: 405, ax: 1300, ay: 540}, // where keys ends
    {f: open + 4, s: 1.2, fx: 976, fy: 420, ax: 1250, ay: 540},
    {f: len, s: 1.24, fx: 976, fy: 430, ax: 1250, ay: 540, e: (t) => t},
  ]);
  const shown = range(f, open, open + 8, expoOut) * (1 - range(f, paste + 1, paste + 9, expoOut));
  const skills = range(f, tab, tab + 3) * (1 - range(f, back, back + 3));
  const pasted = f >= paste + 3;
  const flash = pasted ? 1 - range(f, paste + 3, paste + 18) : 0;
  const line = range(f, 2, 12); // the input line settles in before ⌃⌥P, not on the cut
  const shadeW = 900 - 220 * range(f, 0, open + 4); // Keys7's shade, narrowed with the camera move
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Desk7 f={f} cam={cam} screen={{wing: {items: []},
        under: (
          <>
            <Term x={TERM.x} y={TERM.y} w={TERM.w} h={TERM.h} kind="claude" title="claude — wedding-app — fix/upload-compress" f={f + TERM_CLOCK} seed={1} speed={4} font={40}
              style={{boxShadow: '0 60px 160px rgba(0,0,0,0.8), 0 0 0 2px rgba(255,255,255,0.18)', filter: 'brightness(0.55)'}} />
            {/* the input line is the terminal's last row: nothing scrolls below it (terminal bg after its 0.55 dim) */}
            <div style={{position: 'absolute', opacity: line, left: TERM.x + 2, top: INPUT.y - 16, width: TERM.w - 4, height: TERM.y + TERM.h - INPUT.y + 14, background: 'rgb(12,12,14)', borderRadius: '0 0 18px 18px'}} />
            <div style={{position: 'absolute', opacity: line, left: INPUT.x, top: INPUT.y, width: INPUT.w, padding: '18px 26px', borderRadius: 14, border: '2px solid #55555c',
              background: 'rgba(22,22,25,0.98)', fontFamily: UI_MONO, fontSize: 34, lineHeight: '48px', color: C.text}}>
              <span style={{color: '#8a8a93'}}>&gt; </span>
              {pasted && <span style={{background: `rgba(255,179,26,${0.35 * flash})`}}>{PLAN_FIRST}</span>}
              <span style={{display: 'inline-block', width: 3, height: 38, background: Math.floor(f / 8) % 2 ? C.text : 'transparent', marginLeft: 4, verticalAlign: 'middle'}} />
            </div>
          </>
        ),
        over: (
          <>
            <RealWing7 s={ASK_CODEX} />
            {shown > 0.001 && (
              <div style={{position: 'absolute', left: PX, top: PY, width: PW, height: PH, opacity: clamp01(shown * 1.8), transformOrigin: `${PW / 2}px 0`,
                transform: `translateY(${(1 - shown) * -24}px) scale(${0.94 + 0.06 * shown})`, filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.6))'}}>
                <Img src={staticFile('snap-vault/picker-prompts.png')} style={{position: 'absolute', inset: 0, width: PW, height: PH}} />
                <Img src={staticFile('snap-vault/picker-skills.png')} style={{position: 'absolute', inset: 0, width: PW, height: PH, opacity: skills}} />
              </div>
            )}
          </>
        )}} />
      {/* stops above the input line, so the pasted text is not shaded */}
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: shadeW, background: 'linear-gradient(90deg, rgba(0,0,0,0.82) 40%, transparent)',
        WebkitMaskImage: 'linear-gradient(rgba(0,0,0,1) 72%, transparent 82%)', maskImage: 'linear-gradient(rgba(0,0,0,1) 72%, transparent 82%)'}} />
      <Caption f={f} from={open + 2} to={len + 1} V={V} ly={150} lx={120} size={64} sub="⇥ switches to skills.">⌃⌥P pastes<br />a saved prompt.</Caption>
      {[{at: open, keys: ['⌃', '⌥', 'P'], tone: C.amber}, {at: tab, keys: ['⇥'], tone: undefined}, {at: back, keys: ['⇥'], tone: undefined}, {at: paste, keys: ['⌘', '2'], tone: C.green}].map(({at, keys, tone}, i) => {
        const a = range(f, at - 6, at - 2, expoOut) * (1 - range(f, at + 8, at + 12)); // never two key overlays at once
        return a > 0 ? (
          <div key={i} style={{position: 'absolute', left: 120, top: 600, opacity: a, transform: `translateY(${(1 - a) * 16}px)`}}>
            <Combo f={f} at={at} keys={keys} size={120} tone={tone} hold={7} />
          </div>
        ) : null;
      })}
    </AbsoluteFill>
  );
};
