import { describe, expect, it } from 'vitest';
import { MAP_ENEMIES, TOWNS, WORLD, getTown } from '../src/data';
import { FINAL_BOSS } from '../src/data/boss';
import { geoToTile } from '../src/logic/geo';
import type { Vec2 } from '../src/logic/vector';
import { buildWorldGrid, isWalkable, terrainAt, townAt, townTile } from '../src/logic/world-grid';
import { reachableFrom, tileKey } from './walk-reach';

// Suomen kartan testit: paikkakunnat ovat maalla, kaikkialle pääsee kävellen
// Valkeakoskelta ja viholliset ovat paikoissa, joihin pääsee.

const grid = buildWorldGrid(WORLD);
const key = tileKey;

const start = townTile(WORLD, getTown(WORLD.startTown));
const reachable = reachableFrom(grid, start);

describe('Suomen kartta', () => {
  it('seikkailu alkaa Valkeakoskelta', () => {
    expect(WORLD.startTown).toBe('valkeakoski');
    expect(townAt(WORLD, start)?.name).toBe('Valkeakoski');
  });

  it('kartan reunat ovat merta', () => {
    expect(terrainAt(grid, { x: 0, y: 0 })).toBe('sea');
    expect(terrainAt(grid, { x: grid.width - 1, y: grid.height - 1 })).toBe('sea');
  });

  it('Suomi on pohjoisesta etelään pidempi kuin idästä länteen', () => {
    const land = grid.cells.flatMap((row, y) =>
      row.flatMap((cell, x) => (cell === 'sea' ? [] : [{ x, y }])),
    );
    const span = (pick: (t: Vec2) => number) =>
      Math.max(...land.map(pick)) - Math.min(...land.map(pick));
    expect(span((t) => t.y)).toBeGreaterThan(span((t) => t.x) * 1.5);
  });

  it('järviä on kartalla', () => {
    expect(grid.cells.some((row) => row.includes('lake'))).toBe(true);
  });

  it.each(TOWNS)('$name on maalla omassa ruudussaan ja sinne pääsee', (town) => {
    const tile = townTile(WORLD, town);
    expect(isWalkable(grid, tile)).toBe(true);
    expect(townAt(WORLD, tile)?.id).toBe(town.id);
    expect(reachable.has(key(tile))).toBe(true);
  });

  it.each(MAP_ENEMIES.map((spawn, index) => ({ ...spawn, index })))(
    'vihollinen $index ($enemy) on paikassa, johon pääsee',
    (spawn) => {
      const tile = geoToTile(spawn, WORLD.projection);
      expect(isWalkable(grid, tile)).toBe(true);
      expect(reachable.has(key(tile))).toBe(true);
      expect(townAt(WORLD, tile)).toBeUndefined();
    },
  );

  it('loppuboss odottaa Lapissa paikassa, johon pääsee kävellen', () => {
    const tile = geoToTile(FINAL_BOSS, WORLD.projection);
    expect(isWalkable(grid, tile)).toBe(true);
    expect(reachable.has(key(tile))).toBe(true);
    expect(townAt(WORLD, tile)).toBeUndefined();
    expect(terrainAt(grid, tile)).toBe('snow');
  });

  it('kukaan vihollinen ei ole aivan aloituspaikan vieressä', () => {
    for (const spawn of MAP_ENEMIES) {
      const tile = geoToTile(spawn, WORLD.projection);
      const distance = Math.hypot(tile.x - start.x, tile.y - start.y);
      expect(distance, `${spawn.enemy} (${spawn.lon}, ${spawn.lat})`).toBeGreaterThanOrEqual(4);
    }
  });
});
