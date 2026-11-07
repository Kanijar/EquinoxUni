import { isSailable } from '../src/logic/sailing';
import type { Vec2 } from '../src/logic/vector';
import { isWalkable, type WorldGrid } from '../src/logic/world-grid';

// Testien apu: mihin ruutuihin pääsee kävellen (ja veneellä).

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

const AROUND = [...STEPS, [1, 1], [-1, 1], [1, -1], [-1, -1]] as const;

/**
 * Kaikki kävelyruudut, joihin pääsee kävellen ja veneellä (logic/sailing.ts): rannalta
 * noustaan viereiseen meriruutuun, merellä purjehditaan ja maihin noustaan viereiseen
 * kävelyruutuun. Palauttaa vain maaruudut.
 */
export function reachableWithBoat(world: WorldGrid, start: Vec2): Set<string> {
  const land = new Set([tileKey(start)]);
  const sea = new Set<string>();
  const queue: { tile: Vec2; sailing: boolean }[] = [{ tile: start, sailing: false }];
  const visit = (tile: Vec2, sailing: boolean): void => {
    const seen = sailing ? sea : land;
    if (!seen.has(tileKey(tile))) {
      seen.add(tileKey(tile));
      queue.push({ tile, sailing });
    }
  };
  for (let next = queue.shift(); next; next = queue.shift()) {
    const { tile, sailing } = next;
    for (const [dx, dy] of STEPS) {
      const step = { x: tile.x + dx, y: tile.y + dy };
      const ok = sailing ? isSailable(world, step) : isWalkable(world, step);
      if (ok) visit(step, sailing);
    }
    for (const [dx, dy] of AROUND) {
      const near = { x: tile.x + dx, y: tile.y + dy };
      if (!sailing && isSailable(world, near)) visit(near, true);
      if (sailing && isWalkable(world, near)) visit(near, false);
    }
  }
  return land;
}
