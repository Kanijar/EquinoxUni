import { describe, expect, it } from 'vitest';
import { TILE_SIZE } from '../src/config/game-config';
import { MAP_VIEW, MINIMAP_VIEW } from '../src/config/minimap-config';
import { getTown, TERRAINS, TOWNS, WORLD } from '../src/data';
import { FINAL_BOSS } from '../src/data/boss';
import { CAVE } from '../src/data/cave';
import { ISLES } from '../src/data/isles';
import {
  MINIMAP_MARKER_COLORS,
  MINIMAP_MARKER_ORDER,
  MINIMAP_TERRAIN_COLORS,
} from '../src/data/minimap';
import { START_TOWN } from '../src/data/towns';
import { createNewGame } from '../src/logic/game-state';
import {
  heroTile,
  isHiddenIsle,
  minimapMarkers,
  minimapTerrain,
  toMinimap,
} from '../src/logic/minimap';
import { buildWorldGrid, townTile } from '../src/logic/world-grid';

// Minikartta: koko saari pienennettynä, tärkeät paikat merkkeinä ja saaret vasta löydettyinä.

const grid = buildWorldGrid(WORLD);

/** Minikartan maasto annetun ruudun kohdalla. */
function cellAt(cells: readonly (readonly string[])[], spot: { x: number; y: number }) {
  return cells[Math.floor(spot.y)]?.[Math.floor(spot.x)];
}

function kinds(markers: readonly { kind: string }[]): string[] {
  return markers.map((marker) => marker.kind);
}

describe('minikartan maasto', () => {
  it('jokaisella maastolla ja merkillä on väri', () => {
    for (const terrain of TERRAINS) {
      expect(MINIMAP_TERRAIN_COLORS[terrain.id], terrain.id).toBeTypeOf('number');
    }
    for (const kind of MINIMAP_MARKER_ORDER) {
      expect(MINIMAP_MARKER_COLORS[kind], kind).toBeTypeOf('number');
    }
  });

  it('minikartta ja iso kartta ovat saman muotoisia kuin koko kartta', () => {
    for (const view of [MINIMAP_VIEW, MAP_VIEW]) {
      expect(view.width / view.height).toBeCloseTo(WORLD.width / WORLD.height, 2);
    }
  });

  it('minikartassa on pyydetty määrä pikseleitä, ja aloituskylän kohdalla on maata', () => {
    const cells = minimapTerrain(grid, MINIMAP_VIEW, () => false);
    expect(cells).toHaveLength(MINIMAP_VIEW.height);
    expect(cells[0]).toHaveLength(MINIMAP_VIEW.width);
    const spot = toMinimap(townTile(getTown(START_TOWN)), WORLD, MINIMAP_VIEW);
    expect(cellAt(cells, spot)).toBeDefined();
    expect(cellAt(cells, spot)).not.toBe('sea');
    // Vasen yläkulma on merta.
    expect(cellAt(cells, { x: 0, y: 0 })).toBe('sea');
  });

  it('löytämätön saari näkyy merenä, löydetty saari maana', () => {
    const palm = ISLES.find((isle) => isle.id === 'palm');
    const center = palm?.circles[0];
    if (!palm || !center) throw new Error('Palmusaari puuttuu');
    const spot = toMinimap(center, WORLD, MAP_VIEW);
    const at = (found: string[]) =>
      cellAt(
        minimapTerrain(grid, MAP_VIEW, (tile) => isHiddenIsle(WORLD, found, tile)),
        spot,
      );
    expect(at([])).toBe('sea');
    expect(at([palm.id])).not.toBe('sea');
  });

  it('ruudun paikka minikartalla: kulmat ja keskikohta', () => {
    expect(toMinimap({ x: 0, y: 0 }, WORLD, MINIMAP_VIEW).x).toBeGreaterThanOrEqual(0);
    const last = toMinimap({ x: WORLD.width - 1, y: WORLD.height - 1 }, WORLD, MINIMAP_VIEW);
    expect(last.x).toBeLessThan(MINIMAP_VIEW.width);
    expect(last.y).toBeLessThan(MINIMAP_VIEW.height);
  });
});

describe('minikartan merkit', () => {
  it('uudessa pelissä: kylät, Ossi, kauppias ja sankari aloituskylässä, ei luolaa eikä bossia', () => {
    const state = createNewGame();
    const markers = minimapMarkers(state, WORLD);
    const list = kinds(markers);
    expect(list).toContain('town');
    expect(list).toContain('ossi');
    expect(list).toContain('merchant');
    expect(list).not.toContain('cave');
    expect(list).not.toContain('boss');
    // Sankari piirretään viimeisenä, päällimmäiseksi.
    expect(list.at(-1)).toBe('hero');
    expect(markers.at(-1)?.tile).toEqual(townTile(getTown(START_TOWN)));
  });

  it('pienten saarten kylät näkyvät vasta, kun saari on löydetty', () => {
    const state = createNewGame();
    const hiddenTowns = kinds(minimapMarkers(state, WORLD)).filter((k) => k === 'town').length;
    expect(hiddenTowns).toBe(TOWNS.length - ISLES.length);
    state.isles.push(...ISLES.map((isle) => isle.id));
    const allTowns = kinds(minimapMarkers(state, WORLD)).filter((k) => k === 'town').length;
    expect(allTowns).toBe(TOWNS.length);
  });

  it('herännyt loppuboss ja avattu luola näkyvät kartalla', () => {
    const state = createNewGame();
    state.bossProgress = FINAL_BOSS.unlockCount;
    const awake = minimapMarkers(state, WORLD);
    expect(awake.find((m) => m.kind === 'boss')?.tile).toEqual({
      x: FINAL_BOSS.x,
      y: FINAL_BOSS.y,
    });
    state.bossDefeated = true;
    const beaten = minimapMarkers(state, WORLD);
    expect(kinds(beaten)).not.toContain('boss');
    expect(beaten.find((m) => m.kind === 'cave')?.tile).toEqual({ x: CAVE.x, y: CAVE.y });
  });

  it('sankarin ruutu lasketaan pikselipaikasta', () => {
    const state = createNewGame();
    state.position = { x: 10 * TILE_SIZE + 3, y: 20 * TILE_SIZE + 15 };
    expect(heroTile(state, WORLD)).toEqual({ x: 10, y: 20 });
  });
});
