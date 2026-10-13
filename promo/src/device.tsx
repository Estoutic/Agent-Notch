/*
 * Photoreal MacBook shots rendered in Blender (promo/blender/, by a separate job) with the live UI laid over the
 * 3D screen. Each shot is an image sequence public/blender/<shot>/NNNN.png plus public/blender/<shot>.json with the
 * screen corners per frame. Missing renders => the caller's 2D fallback is used (checked at bundle time with
 * getStaticFiles, so dropping renders in and re-rendering is enough).
 *
 * Accepted corner JSON shapes (pixels of the render, or 0..1 normalised):
 *   {"width":1920,"height":1080,"frames":[{"tl":[x,y],"tr":[x,y],"br":[x,y],"bl":[x,y]}, ...]}
 *   {"frames":[[[x,y],[x,y],[x,y],[x,y]], ...]}   (tl, tr, br, bl)   or a bare array of either
 */
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, getStaticFiles, staticFile, useVideoConfig} from 'remotion';
import {SCREEN_H, SCREEN_W, SX0, ScreenContent, ScreenProps} from './world';

export type BlenderShot = 'reveal' | 'orbit' | 'push' | 'endcard' | 'reveal-v' | 'endcard-v';
type Quad = [number, number][];
type Corners = {w?: number; h?: number; frames: Quad[]};

const files = () => {
  try {
    return getStaticFiles().map((f) => f.name);
  } catch {
    return [];
  }
};
export const blenderFrames = (shot: BlenderShot) =>
  files().filter((n) => n.startsWith(`blender/${shot}/`) && /\.(png|jpe?g)$/.test(n)).sort();
export const hasBlender = (shot: BlenderShot) => blenderFrames(shot).length > 0 && files().includes(`blender/${shot}.json`);

const cache: Record<string, Corners | null> = {};
const parse = (j: unknown): Corners => {
  const o = j as Record<string, unknown>;
  const arr = (Array.isArray(j) ? j : (o.frames ?? o.corners ?? [])) as unknown[];
  const w = !Array.isArray(j) ? ((o.width ?? o.w ?? (o.resolution as number[] | undefined)?.[0]) as number | undefined) : undefined;
  const h = !Array.isArray(j) ? ((o.height ?? o.h ?? (o.resolution as number[] | undefined)?.[1]) as number | undefined) : undefined;
  const frames = arr.map((fr) => {
    if (Array.isArray(fr)) return fr as Quad;
    const q = fr as Record<string, [number, number]>;
    const c = (q.corners ?? q) as unknown as Record<string, [number, number]>;
    return [c.tl ?? c.top_left, c.tr ?? c.top_right, c.br ?? c.bottom_right, c.bl ?? c.bottom_left] as Quad;
  });
  return {w, h, frames};
};
const useCorners = (shot: BlenderShot) => {
  const [c, setC] = useState<Corners | null>(cache[shot] ?? null);
  const [handle] = useState(() => (cache[shot] === undefined ? delayRender(`corners ${shot}`) : null));
  useEffect(() => {
    if (cache[shot] !== undefined) return;
    fetch(staticFile(`blender/${shot}.json`))
      .then((r) => r.json())
      .then((j) => {
        cache[shot] = parse(j);
        setC(cache[shot]);
      })
      .catch(() => {
        cache[shot] = null;
      })
      .finally(() => handle !== null && continueRender(handle));
  }, [shot, handle]);
  return c;
};

/** CSS matrix3d that maps the rectangle (0,0)-(w,h) onto the quad (tl, tr, br, bl). */
export const quadMatrix = (w: number, h: number, q: Quad) => {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2;
  const sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (sx * dy2 - dx2 * sy) / den;
  const hh = (dx1 * sy - sx * dy1) / den;
  const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, c = x0;
  const d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3, f = y0;
  // unit square -> quad, then scale the w x h rect into the unit square
  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, c, f, 0, 1];
  return `matrix3d(${m.map((v) => v.toFixed(10)).join(',')})`;
};

/** Plays a Blender shot and lays the live screen over it. `frame` is the sequence frame to show. */
export const BlenderDevice: React.FC<{shot: BlenderShot; frame: number; screen: ScreenProps; dim?: number}> = ({shot, frame, screen, dim = 0}) => {
  const {width, height} = useVideoConfig();
  const list = blenderFrames(shot);
  const corners = useCorners(shot);
  const i = Math.max(0, Math.min(list.length - 1, Math.floor(frame)));
  const q = corners?.frames[Math.min(corners.frames.length - 1, i)];
  const rw = corners?.w ?? width, rh = corners?.h ?? height;
  const norm = q ? q.every(([x, y]) => x <= 1.5 && y <= 1.5) : false;
  const quad: Quad | undefined = q?.map(([x, y]) => (norm ? [x * width, y * height] : [(x * width) / rw, (y * height) / rh]) as [number, number]);
  return (
    <AbsoluteFill>
      <Img src={staticFile(list[i])} style={{width, height, objectFit: 'cover'}} />
      {quad && (
        <div style={{position: 'absolute', left: 0, top: 0, width: SCREEN_W, height: SCREEN_H, transformOrigin: '0 0', transform: quadMatrix(SCREEN_W, SCREEN_H, quad), overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: -SX0, top: 0}}>
            <ScreenContent {...screen} />
          </div>
          {dim > 0 && <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${dim})`}} />}
        </div>
      )}
    </AbsoluteFill>
  );
};
