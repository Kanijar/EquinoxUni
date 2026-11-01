import { TERRAINS } from '../data/world';
import type { TerrainDef, TerrainId } from '../data/types';
import type { Vec2 } from './vector';
import { terrainAt, type WorldGrid } from './world-grid';

// Maaston vaikutus sankarin kävelynopeuteen (esim. metsässä kuljet hitaammin).
// Kerroin on maastotyypin tiedoissa (data/world.ts: speedFactor), ei kartan koordinaateissa,
// joten se toimii myös, jos karttaa muutetaan.

/** Nopeuskerroin maastotyypille. Tuntematon maasto tai puuttuva kerroin = 1. */
export function terrainSpeedFactor(
  id: TerrainId,
  terrains: readonly TerrainDef[] = TERRAINS,
): number {
  return terrains.find((terrain) => terrain.id === id)?.speedFactor ?? 1;
}

/** Nopeuskerroin ruudulle, jossa sankari seisoo. */
export function speedFactorAt(grid: WorldGrid, tile: Vec2): number {
  return terrainSpeedFactor(terrainAt(grid, tile));
}

/** true, jos maasto hidastaa kulkua (silloin kartalla näkyy pieni efekti). */
export function isSlowTerrain(factor: number): boolean {
  return factor < 1;
}
