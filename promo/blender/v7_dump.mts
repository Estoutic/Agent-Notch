/* Writes blender/cache/v7/plates.json: every 3D shot of the v7 animatic with its length and events in frames, so
 * v7_plates.py animates on the film's beat grid.   node blender/v7_dump.mts */
import {writeFileSync, mkdirSync} from 'node:fs';
import {place7, local7, EV7, HANDLE, LEN7} from '../src/v7/timeline7.ts';
import {THEME_BEATS, THEME_ORDER} from '../src/timeline.ts';

const out: Record<string, unknown> = {};
for (const p of place7()) {
  if (p.kind !== '3d') continue;
  const ev = Object.fromEntries(Object.entries((EV7 as Record<string, Record<string, number>>)[p.id] ?? {}).map(([k, b]) => [k, local7(p, b)]));
  if (p.id === 'themes') Object.assign(ev, {starts: THEME_BEATS.map((b) => local7(p, b)), order: THEME_ORDER});
  out[p.id] = {len: p.to - p.from, from: p.from, beats: p.beats, fpb: 1800 / 123.05, ev};
}
const dir = new URL('./cache/v7/', import.meta.url).pathname;
mkdirSync(dir, {recursive: true});
writeFileSync(dir + 'plates.json', JSON.stringify({handle: HANDLE, film: LEN7, shots: out}, null, 1));
console.log(Object.entries(out).map(([k, v]) => `${k} ${(v as {len: number}).len}`).join(' · '));
