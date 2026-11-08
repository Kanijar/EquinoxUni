import { TILE_SIZE } from '../config/game-config';
import { FINAL_BOSS } from '../data/boss';
import { CAVE } from '../data/cave';
import type { MinimapMarkerKind } from '../data/minimap';
import { START_TOWN } from '../data/towns';
import type { TerrainId, WorldDef } from '../data/types';
import { VOLCANO_STAIRS } from '../data/volcano-stairs';
import { isBossOnMap } from './boss';
import { isCaveOpen } from './cave';
import type { GameState } from './game-state';
import { merchantPlan, merchantSpot } from './merchant-route';
import type { Vec2 } from './vector';
import { isleAt, pointTile, terrainAt, townTile, type WorldGrid } from './world-grid';

// Minikartta: koko kartta pienennettynä ja merkit tärkeistä paikoista. Pienet saaret
// (data/isles.ts) näkyvät vasta, kun sankari on rantautunut niille (GameState.isles):
// sitä ennen niiden kohdalla on merta, eikä niiden kyliä näytetä. Piirto: ui/minimap.ts.

export interface MinimapSize {
  readonly width: number;
  readonly height: number;
}

export interface MinimapMarker {
  readonly kind: MinimapMarkerKind;
  /** Paikka kartalla ruutuina. */
  readonly tile: Vec2;
}

/** Tiedot, joista merkit valitaan (osa pelin tilasta). */
export type MinimapState = Pick<
  GameState,
  'position' | 'isles' | 'merchantMs' | 'bossProgress' | 'bossDefeated'
>;

/** Onko ruutu pienellä saarella, jota sankari ei ole vielä löytänyt. */
export function isHiddenIsle(world: WorldDef, found: readonly string[], tile: Vec2): boolean {
  const isle = isleAt(world, tile);
  return isle !== undefined && !found.includes(isle.id);
}

/**
 * Minikartan maasto: jokaiselle minikartan pikselille sen keskikohdan ruudun maasto.
 * cells[y][x]. Löytämättömät saaret näkyvät merenä.
 */
export function minimapTerrain(
  grid: WorldGrid,
  size: MinimapSize,
  hidden: (tile: Vec2) => boolean,
): TerrainId[][] {
  const cells: TerrainId[][] = [];
  for (let y = 0; y < size.height; y++) {
    const row: TerrainId[] = [];
    for (let x = 0; x < size.width; x++) {
      const tile = {
        x: Math.floor(((x + 0.5) * grid.width) / size.width),
        y: Math.floor(((y + 0.5) * grid.height) / size.height),
      };
      const terrain = terrainAt(grid, tile);
      // Merellä ei tarvitse tarkistaa saaria (nopeampi).
      row.push(terrain !== 'sea' && hidden(tile) ? 'sea' : terrain);
    }
    cells.push(row);
  }
  return cells;
}

/** Ruudun keskikohta minikartan pikseleinä (vasen yläkulma = 0, 0). */
export function toMinimap(tile: Vec2, world: MinimapSize, size: MinimapSize): Vec2 {
  return {
    x: ((tile.x + 0.5) * size.width) / world.width,
    y: ((tile.y + 0.5) * size.height) / world.height,
  };
}

/** Sankarin ruutu. Uudessa pelissä, ennen ensimmäistä askelta, aloituspaikkakunta. */
export function heroTile(state: Pick<GameState, 'position'>, world: WorldDef): Vec2 {
  if (state.position) {
    return pointTile({ x: state.position.x / TILE_SIZE, y: state.position.y / TILE_SIZE });
  }
  const start = world.towns.find((town) => town.id === START_TOWN);
  return start ? townTile(start) : { x: 0, y: 0 };
}

/**
 * Minikartan merkit piirtojärjestyksessä: kylät, Ossi Ketola kraatterissa, avattu luola,
 * kulkeva kauppias, herännyt loppuboss ja viimeisenä (päällimmäisenä) sankari.
 */
export function minimapMarkers(state: MinimapState, world: WorldDef): MinimapMarker[] {
  const towns = world.towns
    .map(townTile)
    .filter((tile) => !isHiddenIsle(world, state.isles, tile))
    .map((tile): MinimapMarker => ({ kind: 'town', tile }));
  const markers: MinimapMarker[] = [...towns, { kind: 'ossi', tile: VOLCANO_STAIRS.goal }];
  if (isCaveOpen(state)) {
    markers.push({ kind: 'cave', tile: pointTile(CAVE) });
  }
  markers.push({ kind: 'merchant', tile: merchantSpot(merchantPlan(), state.merchantMs).tile });
  if (isBossOnMap(state)) {
    markers.push({ kind: 'boss', tile: pointTile(FINAL_BOSS) });
  }
  markers.push({ kind: 'hero', tile: heroTile(state, world) });
  return markers;
}
