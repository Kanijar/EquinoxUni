import { TERRAINS } from '../data/world';
import type { MapPoint, TerrainId, TerrainMix, TownDef, WorldDef } from '../data/types';
import { gridLine } from './grid-line';
import { isInsideCircle, isInsidePolygon } from './polygon';
import type { Vec2 } from './vector';

// Rakentaa saaren kartan ruudukoksi data/world.ts:n tiedoista: meri rantaviivan
// ulkopuolelle, järvet, alueiden maastot, hiekkaranta meren reunalle ja tiet paikkakuntien välille.

export interface WorldGrid {
  readonly width: number;
  readonly height: number;
  /** cells[y][x] = maastotyyppi. */
  readonly cells: readonly (readonly TerrainId[])[];
}

export function buildWorldGrid(world: WorldDef): WorldGrid {
  const { width, height } = world;
  const cells: TerrainId[][] = [];
  for (let y = 0; y < height; y++) {
    const row: TerrainId[] = [];
    for (let x = 0; x < width; x++) {
      row.push(baseTerrain(world, { x, y }));
    }
    cells.push(row);
  }
  paintBeach(world, cells);
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

/** Ruutu, jossa kartan piste on (desimaalit pyöristetään alaspäin). */
export function pointTile(point: MapPoint): Vec2 {
  return { x: Math.floor(point.x), y: Math.floor(point.y) };
}

export function townTile(town: TownDef): Vec2 {
  return pointTile(town);
}

/** Paikkakunta annetussa ruudussa, tai undefined. */
export function townAt(world: WorldDef, tile: Vec2): TownDef | undefined {
  return world.towns.find((town) => {
    const t = townTile(town);
    return t.x === tile.x && t.y === tile.y;
  });
}

/** Tasainen "satunnaisluku" 0..1 ruudulle. Sama ruutu antaa aina saman luvun. */
export function tileNoise(x: number, y: number): number {
  const hash = Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(x + y, 83492791);
  return ((hash >>> 0) % 1000) / 1000;
}

function baseTerrain(world: WorldDef, tile: Vec2): TerrainId {
  const center = { x: tile.x + 0.5, y: tile.y + 0.5 };
  if (!isInsidePolygon(center, world.coast)) {
    return 'sea';
  }
  const lake = world.lakes.find((l) => l.circles.some((c) => isInsideCircle(center, c)));
  if (lake) {
    return lake.terrain ?? 'lake';
  }
  const wobbled = wobble(center, world.regionEdgeWobble);
  const region = world.regions.find((r) => isInsidePolygon(wobbled, r.area));
  return mixTerrain(region ?? world.inland, tile);
}

/** Aaltojen tiheys: alueiden rajat kiemurtelevat eivätkä ole suoria viivoja. */
const WOBBLE_WAVES = { x: [0.37, 0.11], y: [0.29, -0.13] } as const;

/** Siirtää pistettä aaltomaisesti enintään amount ruutua. Sama ruutu siirtyy aina samoin. */
function wobble(point: MapPoint, amount: number): MapPoint {
  const [xy, xx] = WOBBLE_WAVES.x;
  const [yx, yy] = WOBBLE_WAVES.y;
  return {
    x: point.x + amount * Math.sin(point.y * xy + point.x * xx),
    y: point.y + amount * Math.sin(point.x * yx + point.y * yy),
  };
}

function mixTerrain(mix: TerrainMix, tile: Vec2): TerrainId {
  return tileNoise(tile.x, tile.y) < mix.mixShare ? mix.mix : mix.main;
}

/** Maaruudut, jotka ovat enintään beach.width ruudun päässä merestä, muuttuvat rannaksi. */
function paintBeach(world: WorldDef, cells: TerrainId[][]): void {
  const reach = world.beach.width;
  const shore: Vec2[] = [];
  cells.forEach((row, y) =>
    row.forEach((cell, x) => {
      if (isDryLand(cell) && isNearSea(cells, { x, y }, reach)) {
        shore.push({ x, y });
      }
    }),
  );
  for (const tile of shore) {
    const row = cells[tile.y];
    if (row) {
      row[tile.x] = world.beach.terrain;
    }
  }
}

function isDryLand(cell: TerrainId): boolean {
  return cell !== 'sea' && cell !== 'lake' && cell !== 'lava';
}

function isNearSea(cells: readonly (readonly TerrainId[])[], tile: Vec2, reach: number): boolean {
  for (let dy = -reach; dy <= reach; dy++) {
    for (let dx = -reach; dx <= reach; dx++) {
      if ((cells[tile.y + dy]?.[tile.x + dx] ?? 'sea') === 'sea') {
        return true;
      }
    }
  }
  return false;
}

function drawRoads(world: WorldDef, cells: TerrainId[][]): void {
  for (const [fromId, toId] of world.roads) {
    const from = world.towns.find((town) => town.id === fromId);
    const to = world.towns.find((town) => town.id === toId);
    if (!from || !to) {
      continue;
    }
    for (const p of gridLine(townTile(from), townTile(to))) {
      const row = cells[p.y];
      if (row && row[p.x] !== 'sea') {
        row[p.x] = 'road';
      }
    }
  }
}
