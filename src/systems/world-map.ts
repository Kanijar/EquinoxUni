import type Phaser from 'phaser';
import { TILE_SIZE } from '../config/game-config';
import { getSprite, TERRAINS, WORLD } from '../data';
import type { TerrainId } from '../data/types';
import { buildWorldGrid, type WorldGrid } from '../logic/world-grid';
import type { Vec2 } from '../logic/vector';
import { createStripTexture } from './sprite-textures';

// Piirtää Suomen kartan tilemapiksi ja asettaa meren ja järvet esteiksi.

const TILESET_KEY = 'world-tiles';

let cachedGrid: WorldGrid | null = null;

/** Kartan ruudukko. Lasketaan vain kerran, koska kartta ei muutu pelin aikana. */
export function getWorldGrid(): WorldGrid {
  cachedGrid ??= buildWorldGrid(WORLD);
  return cachedGrid;
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
  readonly layer: Phaser.Tilemaps.TilemapLayer;
  readonly widthPx: number;
  readonly heightPx: number;
}

export function buildWorldMap(scene: Phaser.Scene, grid: WorldGrid): BuiltWorld {
  const data = grid.cells.map((row) => row.map(terrainIndex));
  const map = scene.make.tilemap({ data, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
  const tileset = map.addTilesetImage(TILESET_KEY, TILESET_KEY, TILE_SIZE, TILE_SIZE, 0, 0);
  if (!tileset) {
    throw new Error('Karttaruutujen kuvaa ei löytynyt');
  }
  const layer = map.createLayer(0, tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;
  const blocked = TERRAINS.filter((t) => !t.walkable).map((t) => terrainIndex(t.id));
  layer.setCollision(blocked);
  const widthPx = grid.width * TILE_SIZE;
  const heightPx = grid.height * TILE_SIZE;
  scene.physics.world.setBounds(0, 0, widthPx, heightPx);
  return { layer, widthPx, heightPx };
}

/** Ruutukoordinaatti → pikselikoordinaatti (ruudun keskipiste). */
export function tileToWorld(tile: Vec2): Vec2 {
  return { x: tile.x * TILE_SIZE + TILE_SIZE / 2, y: tile.y * TILE_SIZE + TILE_SIZE / 2 };
}

/** Pikselikoordinaatti → ruutu. */
export function worldToTile(pos: Vec2): Vec2 {
  return { x: Math.floor(pos.x / TILE_SIZE), y: Math.floor(pos.y / TILE_SIZE) };
}

function terrainIndex(id: TerrainId): number {
  return TERRAINS.findIndex((terrain) => terrain.id === id);
}
