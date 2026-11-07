import { ITEMS } from '../data';
import type { BoatItemDef, IsleDef, ItemDef, WorldDef } from '../data/types';
import type { Vec2 } from './vector';
import { isleAt, isWalkable, terrainAt, type WorldGrid } from './world-grid';

// Vene (esim. Purjevene, Venesataman venekaupasta) ja pienet saaret (data/isles.ts).
// Kun vene on repussa ja sankari seisoo meren vieressä, hän voi nousta veneeseen: sankari
// siirtyy viereiseen meriruutuun ja kulkee sen jälkeen vain merellä. Merellä rannan vieressä
// hän voi nousta maihin viereiseen kävelyruutuun. Merellä ei taistella eikä kalasteta,
// eikä Bugatti ole käytössä. Ensimmäinen rantautuminen saarelle tallentuu (isles).

/** Tämän verran tilaa vene tarvitsee: reppu, onko sankari veneessä ja löydetyt saaret. */
export interface SailorState {
  readonly inventory: Readonly<Record<string, number>>;
  /** Onko sankari veneessä merellä. */
  sailing: boolean;
  /** Onko Bugatti päällä (sammuu, kun sankari nousee veneeseen). */
  driving: boolean;
  /** Saaret (IsleDef.id), joille sankari on rantautunut, löytöjärjestyksessä. */
  readonly isles: string[];
}

/** Mitä nappi tekee nyt: nousee veneeseen rannalta tai maihin mereltä. */
export type SailAction = 'board' | 'land';

/** Rantautuminen saarelle: mikä saari, oliko ensimmäinen kerta ja montako on löydetty. */
export interface IsleLanding {
  readonly isle: IsleDef;
  readonly first: boolean;
  readonly found: number;
  readonly total: number;
}

/** Viereiset ruudut: ensin sivu- ja pystysuunnat, sitten kulmat. */
const NEIGHBORS: readonly Vec2[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: 1, y: 1 },
  { x: -1, y: 1 },
  { x: 1, y: -1 },
  { x: -1, y: -1 },
];

export function isBoat(item: ItemDef): item is BoatItemDef {
  return item.kind === 'boat';
}

/** Repussa oleva vene, tai null. */
export function ownedBoat(state: Pick<SailorState, 'inventory'>): BoatItemDef | null {
  return ITEMS.filter(isBoat).find((item) => (state.inventory[item.id] ?? 0) > 0) ?? null;
}

/** Onko sankari veneessä (ja vene on yhä repussa). */
export function isSailing(state: Pick<SailorState, 'inventory' | 'sailing'>): boolean {
  return state.sailing && ownedBoat(state) !== null;
}

/** Voiko ruudulla purjehtia: vain meri kartan sisällä (ei järvi eikä laava). */
export function isSailable(grid: WorldGrid, tile: Vec2): boolean {
  const inside = tile.x >= 0 && tile.y >= 0 && tile.x < grid.width && tile.y < grid.height;
  return inside && terrainAt(grid, tile) === 'sea';
}

function firstNeighbor(tile: Vec2, test: (t: Vec2) => boolean): Vec2 | null {
  const tiles = NEIGHBORS.map((d) => ({ x: tile.x + d.x, y: tile.y + d.y }));
  return tiles.find(test) ?? null;
}

/** Viereinen meriruutu, johon veneellä voi lähteä, tai null. */
export function boardingTile(grid: WorldGrid, tile: Vec2): Vec2 | null {
  return firstNeighbor(tile, (t) => isSailable(grid, t));
}

/** Viereinen kävelyruutu, johon voi nousta maihin, tai null. */
export function landingTile(grid: WorldGrid, tile: Vec2): Vec2 | null {
  return firstNeighbor(tile, (t) => isWalkable(grid, t));
}

/** Mitä VENEESEEN/MAIHIN-nappi tekisi tässä ruudussa, tai null (nappi piiloon). */
export function sailAction(state: SailorState, grid: WorldGrid, tile: Vec2): SailAction | null {
  if (ownedBoat(state) === null) {
    return null;
  }
  if (isSailing(state)) {
    return landingTile(grid, tile) ? 'land' : null;
  }
  return isWalkable(grid, tile) && boardingTile(grid, tile) ? 'board' : null;
}

/**
 * Nousee veneeseen tai maihin. Palauttaa ruudun, johon sankari siirtyy, tai null, jos
 * mitään ei voi tehdä (ei venettä tai ei rantaa vieressä). Veneeseen noustessa Bugatti sammuu.
 */
export function toggleSailing(state: SailorState, grid: WorldGrid, tile: Vec2): Vec2 | null {
  const action = sailAction(state, grid, tile);
  if (action === 'board') {
    state.sailing = true;
    state.driving = false;
    return boardingTile(grid, tile);
  }
  if (action === 'land') {
    state.sailing = false;
    return landingTile(grid, tile);
  }
  return null;
}

/** Nopeuskerroin veneestä: merellä esim. 1,6, muuten 1. */
export function boatSpeedFactor(state: SailorState): number {
  const boat = ownedBoat(state);
  return boat && state.sailing ? boat.speedMultiplier : 1;
}

/**
 * Rantautuminen: jos ruutu on pienellä saarella, saari merkitään löydetyksi (ensimmäisellä
 * kerralla). Palauttaa saaren tiedot, tai null, kun ranta on pääsaarella.
 */
export function recordLanding(state: SailorState, world: WorldDef, tile: Vec2): IsleLanding | null {
  const isle = isleAt(world, tile);
  if (!isle) {
    return null;
  }
  const first = !state.isles.includes(isle.id);
  if (first) {
    state.isles.push(isle.id);
  }
  return { isle, first, found: state.isles.length, total: world.isles.length };
}

/** Löydetyt saaret tallennuksesta. Puuttuva (vanha tallennus) = ei yhtään, tuntemattomat pois. */
export function readIsles(value: unknown, world: WorldDef): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const known = value.filter(
    (id): id is string => typeof id === 'string' && world.isles.some((isle) => isle.id === id),
  );
  return [...new Set(known)];
}
