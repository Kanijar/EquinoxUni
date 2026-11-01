import { TERRAINS } from '../data/world';
import type { MapPoint, TerrainId, TerrainMix, TownDef, WorldDef } from '../data/types';
import { gridLine } from './grid-line';
import { isInsideCircle, isInsidePolygon } from './polygon';
import { placeRocks } from './rocks';
import { tileNoise } from './tile-noise';
import type { Vec2 } from './vector';

// Rakentaa saaren kartan ruudukoksi data/world.ts:n tiedoista: meri rantaviivan
// ulkopuolelle, järvet, alueiden maastot, hiekkaranta meren reunalle, tiet paikkakuntien välille
// ja lopuksi kivet metsään (logic/rocks.ts).

export { tileNoise } from './tile-noise';

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
  const keepClear = [...world.towns, ...world.keepClear].map(pointTile);
  placeRocks(cells, world.rocks, keepClear);
  return { width, height, cells };
}

export function terrainAt(grid: WorldGrid, tile: Vec2): TerrainId {
  return grid.cells[tile.y]?.[tile.x] ?? 'sea';
}

export function isWalkable(grid: WorldGrid, tile: Vec2): boolean {
  const id = terrainAt(grid, tile);
  return TERRAINS.find((terrain) => terrain.id === id)?.walkable ?? false;
}

/**
 * Lähin ruutu, jolla voi kävellä (sama ruutu, jos sillä voi). Vanhassa tallennuksessa sankari
 * voi seistä kohdassa, johon on myöhemmin tullut kivi: hänet siirretään viereen.
 */
export function nearestWalkable(grid: WorldGrid, tile: Vec2): Vec2 | undefined {
  const maxRadius = Math.max(grid.width, grid.height);
  for (let r = 0; r <= maxRadius; r++) {
    const found = ringTiles(tile, r).find((t) => isWalkable(grid, t));
    if (found) {
      return found;
    }
  }
  return undefined;
}

/** Ruudut, jotka ovat tasan r ruudun päässä (neliön reuna). */
function ringTiles(center: Vec2, r: number): Vec2[] {
  const tiles: Vec2[] = [];
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) === r) {
        tiles.push({ x: center.x + dx, y: center.y + dy });
      }
    }
  }
  return tiles;
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
