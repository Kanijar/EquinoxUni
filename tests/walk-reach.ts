import type { Vec2 } from '../src/logic/vector';
import { isWalkable, type WorldGrid } from '../src/logic/world-grid';

// Testien apu: mihin ruutuihin pääsee kävellen.

export const tileKey = (t: Vec2): string => `${t.x},${t.y}`;

const STEPS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

/** Kaikki ruudut, joihin pääsee kävellen annetusta ruudusta (vain sivu- ja pystysuunnassa). */
export function reachableFrom(world: WorldGrid, start: Vec2): Set<string> {
  const seen = new Set([tileKey(start)]);
  const queue = [start];
  for (let next = queue.shift(); next; next = queue.shift()) {
    for (const [dx, dy] of STEPS) {
      const tile = { x: next.x + dx, y: next.y + dy };
      if (!seen.has(tileKey(tile)) && isWalkable(world, tile)) {
        seen.add(tileKey(tile));
        queue.push(tile);
      }
    }
  }
  return seen;
}
