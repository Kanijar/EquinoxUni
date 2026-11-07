import { describe, expect, it } from 'vitest';
import { MAP_ENEMIES, TOWNS, WORLD, getTown } from '../src/data';
import { FINAL_BOSS } from '../src/data/boss';
import type { TerrainId } from '../src/data/types';
import type { Vec2 } from '../src/logic/vector';
import {
  buildWorldGrid,
  isleAt,
  isWalkable,
  pointTile,
  terrainAt,
  townAt,
  townTile,
} from '../src/logic/world-grid';
import { reachableFrom, reachableWithBoat, tileKey } from './walk-reach';

// Saaren kartan testit: paikkakunnat ovat maalla, kaikkialle pääsee kävellen
// Kotirannasta (pienille saarille veneellä) ja viholliset ovat omalla alueellaan paikoissa, joihin pääsee.

const grid = buildWorldGrid(WORLD);
const key = tileKey;

const start = townTile(getTown(WORLD.startTown));
const onFoot = reachableFrom(grid, start);
/** Pienille saarille (data/isles.ts) pääsee vain veneellä. */
const reachable = reachableWithBoat(grid, start);
const onIsle = (tile: Vec2): boolean => isleAt(WORLD, tile) !== undefined;

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
  // Pienet saaret (data/isles.ts): saaren maasto tai hiekkaranta.
  pirate: ['jungle', 'sand'],
  'jungle-snake': ['jungle', 'sand'],
  skeleton: ['grave', 'swamp', 'sand'],
  ghost: ['grave', 'swamp', 'sand'],
  'ice-golem': ['ice', 'snow', 'sand'],
  'crystal-spider': ['ice', 'snow', 'sand'],
  thunderbird: ['basalt', 'ash', 'sand'],
  'sea-serpent': ['basalt', 'ash', 'sand'],
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
    // Pääsaaren paikkakuntiin pääsee kävellen, pienten saarten kyliin vain veneellä.
    expect(onFoot.has(key(tile))).toBe(!onIsle(tile));
  });

  it.each(spawns)('vihollinen $index ($enemy) on paikassa, johon pääsee', (spawn) => {
    const tile = pointTile(spawn);
    expect(isWalkable(grid, tile)).toBe(true);
    expect(reachable.has(key(tile))).toBe(true);
    expect(onFoot.has(key(tile))).toBe(!onIsle(tile));
    expect(townAt(WORLD, tile)).toBeUndefined();
  });

  it.each(WORLD.isles)('pienellä saarella $name on kylä ja vihollisia', (isle) => {
    const here = (point: { x: number; y: number }): boolean =>
      isleAt(WORLD, pointTile(point))?.id === isle.id;
    expect(TOWNS.filter(here).length).toBe(1);
    expect(MAP_ENEMIES.filter(here).length).toBeGreaterThanOrEqual(4);
  });

  it('saaret ovat sitä vaarallisempia, mitä myöhempänä ne ovat listassa', () => {
    const levels = WORLD.isles.map((isle) => isle.level);
    expect([...levels].sort((a, b) => a - b)).toEqual(levels);
    expect(new Set(levels).size).toBe(levels.length);
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
    expect(onFoot.has(key(tile))).toBe(true);
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
