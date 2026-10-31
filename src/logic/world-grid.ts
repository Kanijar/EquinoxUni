import { TERRAINS } from '../data/world';
import type { GeoPoint, TerrainBand, TerrainId, TownDef, WorldDef } from '../data/types';
import { distanceKm, geoToTile, gridSize, isInsidePolygon, tileToGeo } from './geo';
import { gridLine } from './grid-line';
import type { Vec2 } from './vector';

// Rakentaa Suomen kartan ruudukoksi data/world.ts:n tiedoista:
// meri rajojen ulkopuolelle, järvet, maastovyöhykkeet ja tiet paikkakuntien välille.

export interface WorldGrid {
  readonly width: number;
  readonly height: number;
  /** cells[y][x] = maastotyyppi. */
  readonly cells: readonly (readonly TerrainId[])[];
}

export function buildWorldGrid(world: WorldDef): WorldGrid {
  const { width, height } = gridSize(world.projection);
  const cells: TerrainId[][] = [];
  for (let y = 0; y < height; y++) {
    const row: TerrainId[] = [];
    for (let x = 0; x < width; x++) {
      row.push(baseTerrain(world, { x, y }));
    }
    cells.push(row);
  }
  drawRoads(world, cells);
  return { width, height, cells };
}

export function terrainAt(grid: WorldGrid, tile: Vec2): TerrainId {
  return grid.cells[tile.y]?.[tile.x] ?? 'sea';
}

export function isWalkable(grid: WorldGrid, tile: Vec2): boolean {
  const id = terrainAt(grid, tile);
  return TERRAINS.find((terrain) => terrain.id === id)?.walkable ?? false;
}

export function townTile(world: WorldDef, town: TownDef): Vec2 {
  return geoToTile(town, world.projection);
}

/** Paikkakunta annetussa ruudussa, tai undefined. */
export function townAt(world: WorldDef, tile: Vec2): TownDef | undefined {
  return world.towns.find((town) => {
    const t = townTile(world, town);
    return t.x === tile.x && t.y === tile.y;
  });
}

/** Tasainen "satunnaisluku" 0..1 ruudulle. Sama ruutu antaa aina saman luvun. */
export function tileNoise(x: number, y: number): number {
  const hash = Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(x + y, 83492791);
  return ((hash >>> 0) % 1000) / 1000;
}

function baseTerrain(world: WorldDef, tile: Vec2): TerrainId {
  const geo = tileToGeo(tile, world.projection);
  if (!isInsidePolygon(geo, world.border)) {
    return 'sea';
  }
  if (isInLake(world, geo)) {
    return 'lake';
  }
  return bandTerrain(world.bands, geo.lat, tile);
}

function isInLake(world: WorldDef, geo: GeoPoint): boolean {
  return world.lakes.some((lake) =>
    lake.circles.some((c) => distanceKm(geo, c, world.projection) <= c.radiusKm),
  );
}

function bandTerrain(bands: readonly TerrainBand[], lat: number, tile: Vec2): TerrainId {
  const band = bands.find((b) => lat < b.untilLat) ?? bands[bands.length - 1];
  if (!band) {
    return 'field';
  }
  return tileNoise(tile.x, tile.y) < band.mixShare ? band.mix : band.main;
}

function drawRoads(world: WorldDef, cells: TerrainId[][]): void {
  for (const [fromId, toId] of world.roads) {
    const from = world.towns.find((town) => town.id === fromId);
    const to = world.towns.find((town) => town.id === toId);
    if (!from || !to) {
      continue;
    }
    for (const p of gridLine(townTile(world, from), townTile(world, to))) {
      const row = cells[p.y];
      if (row && row[p.x] !== 'sea') {
        row[p.x] = 'road';
      }
    }
  }
}
