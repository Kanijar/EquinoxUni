import { describe, expect, it } from 'vitest';
import { MAP_ENEMIES, TERRAINS, WORLD, getTown } from '../src/data';
import { FINAL_BOSS } from '../src/data/boss';
import type { RockRule, TerrainId, WorldDef } from '../src/data/types';
import { placeRocks } from '../src/logic/rocks';
import type { Vec2 } from '../src/logic/vector';
import {
  buildWorldGrid,
  isWalkable,
  nearestWalkable,
  pointTile,
  terrainAt,
  townTile,
  type WorldGrid,
} from '../src/logic/world-grid';
import { reachableFrom, tileKey } from './walk-reach';

// Metsän kivet: niiden läpi ei pääse, mutta ne eivät koskaan estä pääsyä mihinkään.
// Testit eivät riipu kartan muodosta: ne vertaavat karttaa ilman kiviä ja kivien kanssa.

const withRocks = (rocks: Partial<RockRule>): WorldDef => ({
  ...WORLD,
  rocks: { ...WORLD.rocks, ...rocks },
});
const noRocks = buildWorldGrid(withRocks({ share: 0 }));
const grid = buildWorldGrid(WORLD);
const start = townTile(getTown(WORLD.startTown));

function rockTiles(world: WorldGrid): Vec2[] {
  return world.cells.flatMap((row, y) =>
    row.flatMap((cell, x) => (cell === 'rock' ? [{ x, y }] : [])),
  );
}

/** Ruudut enintään r ruudun päässä, ilman keskimmäistä. */
function tilesAround(center: Vec2, r: number): Vec2[] {
  const tiles: Vec2[] = [];
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx !== 0 || dy !== 0) {
        tiles.push({ x: center.x + dx, y: center.y + dy });
      }
    }
  }
  return tiles;
}

/** Tärkeät paikat: paikkakunnat, viholliset ja loppuboss. */
const importantPlaces: readonly { readonly name: string; readonly tile: Vec2 }[] = [
  ...WORLD.towns.map((town) => ({ name: town.name, tile: townTile(town) })),
  ...MAP_ENEMIES.map((spawn, i) => ({
    name: `${spawn.enemy} ${i}`,
    tile: pointTile(spawn),
  })),
  { name: 'loppuboss', tile: pointTile(FINAL_BOSS) },
];

/** Jokainen ruutu, johon pääsi ilman kiviä, on yhä saavutettavissa (paitsi itse kivet). */
function expectNothingCutOff(rocky: WorldGrid): void {
  const before = reachableFrom(noRocks, start);
  const after = reachableFrom(rocky, start);
  const rocks = new Set(rockTiles(rocky).map(tileKey));
  const lost = [...before].filter((t) => !after.has(t) && !rocks.has(t));
  expect(lost).toEqual([]);
}

describe('metsän kivet', () => {
  it('metsässä on kiviä, ja ne ovat esteitä', () => {
    const rocks = rockTiles(grid);
    expect(rocks.length).toBeGreaterThan(30);
    expect(TERRAINS.find((t) => t.id === 'rock')?.walkable).toBe(false);
    for (const rock of rocks) {
      expect(isWalkable(grid, rock)).toBe(false);
    }
  });

  it('kiviä tulee vain metsään', () => {
    for (const rock of rockTiles(grid)) {
      expect(terrainAt(noRocks, rock)).toBe(WORLD.rocks.onTerrain);
    }
  });

  it('kivet eivät estä pääsyä mihinkään, minne pääsi ennen kiviä', () => {
    expectNothingCutOff(grid);
  });

  it.each(importantPlaces)('$name: sinne pääsee, eikä lähellä ole kiveä', ({ tile }) => {
    expect(reachableFrom(grid, start).has(tileKey(tile))).toBe(true);
    const r = WORLD.rocks.clearRadius;
    for (const rock of rockTiles(grid)) {
      const distance = Math.max(Math.abs(rock.x - tile.x), Math.abs(rock.y - tile.y));
      expect(distance).toBeGreaterThan(r);
    }
  });

  it('kiven ympärillä on aina vapaa kaista, jota pitkin sen voi kiertää', () => {
    const r = WORLD.rocks.clearRadius;
    expect(r).toBeGreaterThanOrEqual(1);
    for (const rock of rockTiles(grid)) {
      for (const near of tilesAround(rock, r)) {
        expect(isWalkable(grid, near)).toBe(true);
      }
    }
  });

  it.each([1, 2, 3, 42, 99])('tiheäkään kivikko siemenellä %i ei katkaise reittejä', (seed) => {
    expectNothingCutOff(buildWorldGrid(withRocks({ seed, share: 0.5 })));
  });
});

describe('kivien sijoittelu pienellä kartalla', () => {
  const rule: RockRule = { onTerrain: 'forest', share: 1, clearRadius: 1, seed: 0 };
  const forest = (w: number, h: number): TerrainId[][] =>
    Array.from({ length: h }, () => Array.from({ length: w }, (): TerrainId => 'forest'));

  it('kapeaan metsäkäytävään järvien välissä ei tule kiveä', () => {
    const cells = forest(7, 3).map((row, y) => row.map((c): TerrainId => (y === 1 ? c : 'lake')));
    placeRocks(cells, rule, []);
    expect(cells.flat()).not.toContain('rock');
  });

  it('kivet eivät tule toistensa viereen eivätkä varattujen paikkojen lähelle', () => {
    const cells = forest(9, 9);
    placeRocks(cells, rule, [{ x: 6, y: 6 }]);
    const rocks = cells.flatMap((row, y) =>
      row.flatMap((c, x) => (c === 'rock' ? [{ x, y }] : [])),
    );
    expect(rocks.length).toBeGreaterThan(0);
    for (const a of rocks) {
      expect(Math.max(Math.abs(a.x - 6), Math.abs(a.y - 6))).toBeGreaterThan(1);
      for (const b of rocks.filter((other) => other !== a)) {
        expect(Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))).toBeGreaterThan(1);
      }
    }
  });
});

describe('vanha tallennus kiven paikalla', () => {
  it('sankari siirtyy kiveltä viereiseen ruutuun, jolla voi kävellä', () => {
    const rock = rockTiles(grid)[0];
    expect(rock).toBeDefined();
    if (!rock) return;
    const free = nearestWalkable(grid, rock);
    expect(free && isWalkable(grid, free)).toBe(true);
    expect(free && Math.max(Math.abs(free.x - rock.x), Math.abs(free.y - rock.y))).toBe(1);
  });

  it('kävelyruudulla seisova sankari pysyy paikallaan', () => {
    expect(nearestWalkable(grid, start)).toEqual(start);
  });
});
