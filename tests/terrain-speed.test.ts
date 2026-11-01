import { describe, expect, it } from 'vitest';
import { TERRAINS, WORLD } from '../src/data';
import { PLAYER } from '../src/data/player';
import type { TerrainDef, TerrainId } from '../src/data/types';
import { isSlowTerrain, speedFactorAt, terrainSpeedFactor } from '../src/logic/terrain-speed';
import { buildWorldGrid } from '../src/logic/world-grid';
import type { Vec2 } from '../src/logic/vector';

// Metsässä sankari kulkee hitaammin. Kerroin tulee maastotyypistä, ei kartan paikasta.

describe('maaston hidastus', () => {
  it('metsässä kuljet selvästi hitaammin', () => {
    const forest = terrainSpeedFactor('forest');
    expect(forest).toBeGreaterThanOrEqual(0.5);
    expect(forest).toBeLessThanOrEqual(0.7);
    expect(isSlowTerrain(forest)).toBe(true);
  });

  it('pellolla, tiellä ja lumella kuljet täyttä vauhtia', () => {
    for (const id of ['field', 'road', 'snow'] as const) {
      expect(terrainSpeedFactor(id)).toBe(1);
      expect(isSlowTerrain(terrainSpeedFactor(id))).toBe(false);
    }
  });

  it('kerroin luetaan maastotyypin tiedoista', () => {
    const terrains: TerrainDef[] = [
      { id: 'field', sprite: 'x', walkable: true, speedFactor: 0.25 },
    ];
    expect(terrainSpeedFactor('field', terrains)).toBe(0.25);
    expect(terrainSpeedFactor('forest', terrains)).toBe(1);
  });

  it('kaikki kertoimet ovat järkeviä (0 < kerroin ≤ 1)', () => {
    for (const terrain of TERRAINS) {
      const factor = terrainSpeedFactor(terrain.id);
      expect(factor).toBeGreaterThan(0);
      expect(factor).toBeLessThanOrEqual(1);
    }
  });

  it('kartan metsäruudussa nopeus putoaa ja tiellä ei', () => {
    const grid = buildWorldGrid(WORLD);
    const find = (id: TerrainId): Vec2 => {
      const y = grid.cells.findIndex((row) => row.includes(id));
      return { x: grid.cells[y]?.indexOf(id) ?? -1, y };
    };
    const forest = find('forest');
    const road = find('road');
    expect(forest.y).toBeGreaterThanOrEqual(0);
    expect(PLAYER.stats.speed * speedFactorAt(grid, forest)).toBeLessThan(PLAYER.stats.speed);
    expect(speedFactorAt(grid, road)).toBe(1);
  });
});
