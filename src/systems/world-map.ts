import type Phaser from 'phaser';
import { TILE_SIZE } from '../config/game-config';
import { getSprite, TERRAINS, WORLD } from '../data';
import type { TerrainId } from '../data/types';
import { isSailable } from '../logic/sailing';
import { buildWorldGrid, nearestWalkable, nearestWhere, type WorldGrid } from '../logic/world-grid';
import type { Vec2 } from '../logic/vector';
import { withStairs } from '../logic/volcano-stairs';
import { createStripTexture } from './sprite-textures';

// Piirtää saaren kartan tilemapiksi ja asettaa meren, järvet ja laavan esteiksi. Veneelle
// (logic/sailing.ts) tehdään toinen, näkymätön kerros, jossa kaikki muu kuin meri on estettä.
// Tulivuoren rappusten askelmat (logic/volcano-stairs.ts) lisätään karttaan, kun se avataan.

const TILESET_KEY = 'world-tiles';

let baseGrid: WorldGrid | null = null;
let currentGrid: WorldGrid | null = null;

/** Kartta ilman rappusia. Lasketaan vain kerran, koska saaren muoto ei muutu pelin aikana. */
function getBaseGrid(): WorldGrid {
  baseGrid ??= buildWorldGrid(WORLD);
  return baseGrid;
}

/** Kartan ruudukko sellaisena kuin se on nyt (nousseet askelmat mukana). */
export function getWorldGrid(): WorldGrid {
  return currentGrid ?? getBaseGrid();
}

/**
 * Nostaa kartalle laavasta näin monta askelmaa. Kutsutaan, kun kartta avataan: askelmia tulee
 * lisää vain taistelussa, ja taistelun jälkeen kartta avataan uudelleen.
 */
export function showStairs(steps: number): WorldGrid {
  currentGrid = withStairs(getBaseGrid(), steps);
  return currentGrid;
}

/** Luo karttaruutujen kuvan. Kutsutaan BootScenessä. */
export function createWorldTileset(textures: Phaser.Textures.TextureManager): void {
  createStripTexture(
    textures,
    TILESET_KEY,
    TERRAINS.map((terrain) => getSprite(terrain.sprite)),
  );
}

export interface BuiltWorld {
  /** Näkyvä kartta: kävellessä meri, järvet, laava ja kivet ovat esteitä. */
  readonly layer: Phaser.Tilemaps.TilemapLayer;
  /** Näkymätön kerros veneelle: este on kaikki muu kuin meri. */
  readonly seaLayer: Phaser.Tilemaps.TilemapLayer;
  readonly widthPx: number;
  readonly heightPx: number;
}

export function buildWorldMap(scene: Phaser.Scene, grid: WorldGrid): BuiltWorld {
  const data = grid.cells.map((row) => row.map(terrainIndex));
  const layer = createLayer(scene, data);
  layer.setCollision(TERRAINS.filter((t) => !t.walkable).map((t) => terrainIndex(t.id)));
  const seaLayer = createLayer(scene, data).setVisible(false);
  seaLayer.setCollision(TERRAINS.filter((t) => t.id !== 'sea').map((t) => terrainIndex(t.id)));
  const widthPx = grid.width * TILE_SIZE;
  const heightPx = grid.height * TILE_SIZE;
  scene.physics.world.setBounds(0, 0, widthPx, heightPx);
  return { layer, seaLayer, widthPx, heightPx };
}

/** Tilemap-kerros karttaruuduista (oma tilemap, jotta samasta datasta saa kaksi kerrosta). */
function createLayer(scene: Phaser.Scene, data: number[][]): Phaser.Tilemaps.TilemapLayer {
  const map = scene.make.tilemap({ data, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
  const tileset = map.addTilesetImage(TILESET_KEY, TILESET_KEY, TILE_SIZE, TILE_SIZE, 0, 0);
  if (!tileset) {
    throw new Error('Karttaruutujen kuvaa ei löytynyt');
  }
  return map.createLayer(0, tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;
}

/** Ruutukoordinaatti → pikselikoordinaatti (ruudun keskipiste). */
export function tileToWorld(tile: Vec2): Vec2 {
  return { x: tile.x * TILE_SIZE + TILE_SIZE / 2, y: tile.y * TILE_SIZE + TILE_SIZE / 2 };
}

/**
 * Paikka, jossa sankari voi seistä: sama paikka, tai lähimmän kävelyruudun keskipiste,
 * jos paikassa on este (esim. vanhan tallennuksen paikalle on tullut kivi).
 */
export function walkablePosition(grid: WorldGrid, pos: Vec2): Vec2 {
  const tile = worldToTile(pos);
  const free = nearestWalkable(grid, tile);
  return free && (free.x !== tile.x || free.y !== tile.y) ? tileToWorld(free) : pos;
}

/**
 * Paikka veneelle: sama paikka, tai lähimmän meriruudun keskipiste (esim. vanha tallennus).
 * Palauttaa null, jos merta ei löydy.
 */
export function sailablePosition(grid: WorldGrid, pos: Vec2): Vec2 | null {
  const tile = worldToTile(pos);
  const sea = nearestWhere(grid, tile, (t) => isSailable(grid, t));
  if (!sea) {
    return null;
  }
  return sea.x === tile.x && sea.y === tile.y ? pos : tileToWorld(sea);
}

/** Pikselikoordinaatti → ruutu. */
export function worldToTile(pos: Vec2): Vec2 {
  return { x: Math.floor(pos.x / TILE_SIZE), y: Math.floor(pos.y / TILE_SIZE) };
}

function terrainIndex(id: TerrainId): number {
  return TERRAINS.findIndex((terrain) => terrain.id === id);
}
