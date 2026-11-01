import { TERRAINS } from '../data/world';
import type { GeoPoint, TerrainBand, TerrainId, TownDef, WorldDef } from '../data/types';
import { distanceKm, geoToTile, gridSize, isInsidePolygon, tileToGeo } from './geo';
import { gridLine } from './grid-line';
import { placeRocks } from './rocks';
import { tileNoise } from './tile-noise';
import type { Vec2 } from './vector';

// Rakentaa Suomen kartan ruudukoksi data/world.ts:n tiedoista:
// meri rajojen ulkopuolelle, järvet, maastovyöhykkeet, tiet paikkakuntien välille ja
// lopuksi kivet metsään (logic/rocks.ts).

export { tileNoise } from './tile-noise';

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
  const keepClear = [
    ...world.towns.map((town) => townTile(world, town)),
    ...world.keepClear.map((point) => geoToTile(point, world.projection)),
  ];
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
