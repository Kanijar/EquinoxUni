import type { RockRule, TerrainId } from '../data/types';
import { TERRAINS } from '../data/world';
import { tileNoise } from './tile-noise';
import type { Vec2 } from './vector';

// Kivet kartalla (data/world.ts ROCKS). Kivi on este, jonka läpi ei pääse.
// Kivi tulee vain ruutuun, jonka ympärillä on joka suuntaan rule.clearRadius ruutua vapaata
// kävelymaata: ei vettä, toista kiveä, paikkakuntaa eikä vihollisen paikkaa. Silloin kiven voi
// aina kiertää, eikä mikään paikka jää kivien taakse (testi tests/rocks.test.ts).

/** Lisää kivet ruudukkoon. keepClear = ruudut, joiden lähelle ei tule kiveä. */
export function placeRocks(cells: TerrainId[][], rule: RockRule, keepClear: readonly Vec2[]): void {
  const clear = new Set(keepClear.map(tileKey));
  cells.forEach((row, y) => {
    row.forEach((terrain, x) => {
      const tile = { x, y };
      if (terrain === rule.onTerrain && isRockSpot(cells, tile, rule, clear)) {
        row[x] = 'rock';
      }
    });
  });
}

function isRockSpot(
  cells: readonly (readonly TerrainId[])[],
  tile: Vec2,
  rule: RockRule,
  clear: ReadonlySet<string>,
): boolean {
  if (tileNoise(tile.x, tile.y, rule.seed) >= rule.share) {
    return false;
  }
  const r = rule.clearRadius;
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const near = { x: tile.x + dx, y: tile.y + dy };
      if (clear.has(tileKey(near)) || !isOpenGround(cells[near.y]?.[near.x])) {
        return false;
      }
    }
  }
  return true;
}

/** Kävelymaata (ei vettä eikä kiveä). Kartan ulkopuoli ei ole. */
function isOpenGround(terrain: TerrainId | undefined): boolean {
  return TERRAINS.find((t) => t.id === terrain)?.walkable ?? false;
}

function tileKey(tile: Vec2): string {
  return `${tile.x},${tile.y}`;
}
