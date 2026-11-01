import { describe, expect, it } from 'vitest';
import { MAP_ENEMIES, TOWNS, WORLD, getTown } from '../src/data';
import { FINAL_BOSS } from '../src/data/boss';
import type { TerrainId } from '../src/data/types';
import type { Vec2 } from '../src/logic/vector';
import {
  buildWorldGrid,
  isWalkable,
  pointTile,
  terrainAt,
  townAt,
  townTile,
} from '../src/logic/world-grid';
import { reachableFrom, tileKey } from './walk-reach';

// Saaren kartan testit: paikkakunnat ovat maalla, kaikkialle pääsee kävellen
// Kotirannasta ja viholliset ovat omalla alueellaan paikoissa, joihin pääsee.

const grid = buildWorldGrid(WORLD);
const key = tileKey;

const start = townTile(getTown(WORLD.startTown));
const reachable = reachableFrom(grid, start);

/** Millä alueella kukin hirviö asuu (maasto, jossa se seisoo kartalla). */
const HOME_TERRAIN: Readonly<Record<string, readonly TerrainId[]>> = {
  slime: ['field', 'forest'],
  hiisi: ['field', 'forest'],
  wolf: ['field', 'forest'],
  crab: ['sand'],
  mud: ['swamp', 'forest'],
  wisp: ['swamp', 'forest'],
  troll: ['snow', 'forest'],
  giant: ['snow', 'forest'],
  lizard: ['ash'],
  dragon: ['ash'],
};

const spawns = MAP_ENEMIES.map((spawn, index) => ({ ...spawn, index }));

describe('saaren kartta', () => {
  it('seikkailu alkaa Kotirannasta', () => {
    expect(WORLD.startTown).toBe('kotiranta');
    expect(townAt(WORLD, start)?.name).toBe('Kotiranta');
  });

  it('kartan reunat ovat merta', () => {
    for (let x = 0; x < grid.width; x++) {
      expect(terrainAt(grid, { x, y: 0 })).toBe('sea');
      expect(terrainAt(grid, { x, y: grid.height - 1 })).toBe('sea');
    }
    for (let y = 0; y < grid.height; y++) {
      expect(terrainAt(grid, { x: 0, y })).toBe('sea');
      expect(terrainAt(grid, { x: grid.width - 1, y })).toBe('sea');
    }
  });

  it('saari on iso ja leveämpi kuin korkea (puhelin vaakatasossa)', () => {
    const land = grid.cells.flatMap((row, y) =>
      row.flatMap((cell, x) => (cell === 'sea' ? [] : [{ x, y }])),
    );
    const span = (pick: (t: Vec2) => number) =>
      Math.max(...land.map(pick)) - Math.min(...land.map(pick));
    expect(land.length).toBeGreaterThan(10_000);
    expect(span((t) => t.x)).toBeGreaterThan(span((t) => t.y));
  });

  it.each(['lake', 'field', 'forest', 'snow', 'road', 'sand', 'swamp', 'ash', 'lava'] as const)(
    'kartalla on maastoa %s',
    (terrain) => {
      expect(grid.cells.some((row) => row.includes(terrain))).toBe(true);
    },
  );

  it('laava on este kuten järvi', () => {
    const lava = grid.cells.flatMap((row, y) =>
      row.flatMap((c, x) => (c === 'lava' ? [{ x, y }] : [])),
    );
    expect(lava.every((tile) => !isWalkable(grid, tile))).toBe(true);
  });

  it.each(TOWNS)('$name on maalla omassa ruudussaan ja sinne pääsee', (town) => {
    const tile = townTile(town);
    expect(isWalkable(grid, tile)).toBe(true);
    expect(townAt(WORLD, tile)?.id).toBe(town.id);
    expect(reachable.has(key(tile))).toBe(true);
  });

  it.each(spawns)('vihollinen $index ($enemy) on paikassa, johon pääsee', (spawn) => {
    const tile = pointTile(spawn);
    expect(isWalkable(grid, tile)).toBe(true);
    expect(reachable.has(key(tile))).toBe(true);
    expect(townAt(WORLD, tile)).toBeUndefined();
  });

  it.each(spawns)('vihollinen $index ($enemy) on omalla alueellaan', (spawn) => {
    const home = HOME_TERRAIN[spawn.enemy];
    expect(home, `${spawn.enemy}: lisää HOME_TERRAIN-listaan`).toBeDefined();
    const terrain = terrainAt(grid, pointTile(spawn));
    // Tie kulkee monen alueen läpi, joten tiellä seisova vihollinen kelpaa.
    expect([...(home ?? []), 'road']).toContain(terrain);
  });

  it('loppuboss odottaa tuntureilla paikassa, johon pääsee kävellen', () => {
    const tile = pointTile(FINAL_BOSS);
    expect(isWalkable(grid, tile)).toBe(true);
    expect(reachable.has(key(tile))).toBe(true);
    expect(townAt(WORLD, tile)).toBeUndefined();
    expect(terrainAt(grid, tile)).toBe('snow');
  });

  it('tunturipeikkoja on kartalla tarpeeksi loppubossin herättämiseen', () => {
    const trolls = MAP_ENEMIES.filter((spawn) => spawn.enemy === FINAL_BOSS.unlockEnemy);
    expect(trolls.length).toBeGreaterThanOrEqual(FINAL_BOSS.unlockCount);
  });

  it('kukaan vihollinen ei ole aivan aloituspaikan vieressä', () => {
    for (const spawn of MAP_ENEMIES) {
      const tile = pointTile(spawn);
      const distance = Math.hypot(tile.x - start.x, tile.y - start.y);
      expect(distance, `${spawn.enemy} (${spawn.x}, ${spawn.y})`).toBeGreaterThanOrEqual(4);
    }
  });
});
