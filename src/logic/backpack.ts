import { getItem } from '../data';
import type { GearSlot, ItemKind } from '../data/types';
import { equipItem, unequipSlot } from './equipment';
import { playerStats, type GameState } from './game-state';

// Reppu: pelaaja avaa repun kartalla, laittaa varusteita käyttöön, ottaa niitä pois
// juo parannusjuomia ja syö ruokaa (kalat). Varusteiden säännöt ovat logic/equipment.ts:ssä; tämä tiedosto
// pitää lisäksi elämän rajoissa, kun maksimielämä muuttuu (esim. hammaskoru).

/** Elämä ei saa olla yli maksimin, kun elämää antava varuste otetaan pois. */
function clampHp(state: GameState): void {
  state.hp = Math.min(state.hp, playerStats(state).maxHp);
}

/**
 * Laittaa repun varusteen käyttöön (paikan vanha varuste palaa reppuun).
 * Elämää antava varuste nostaa maksimielämää, mutta ei paranna: lepää paikkakunnassa.
 */
export function equipFromBag(state: GameState, itemId: string): boolean {
  const done = equipItem(state.inventory, state.equipped, itemId);
  clampHp(state);
  return done;
}

/** Ottaa varusteen pois paikasta ja laittaa sen reppuun. */
export function unequipToBag(state: GameState, slot: GearSlot): boolean {
  const done = unequipSlot(state.inventory, state.equipped, slot);
  clampHp(state);
  return done;
}

/** Paljonko esine parantaa, kun sen juo tai syö, tai null, jos se ei paranna. */
function healValue(itemId: string): number | null {
  const item = getItem(itemId);
  return item.kind === 'heal' || item.kind === 'food' ? item.value : null;
}

/**
 * Voiko esineen juoda tai syödä nyt: se on parannusjuoma tai ruoka, sitä on repussa ja
 * elämä ei ole täynnä.
 */
export function canDrink(state: GameState, itemId: string): boolean {
  const inBag = (state.inventory[itemId] ?? 0) > 0;
  return healValue(itemId) !== null && inBag && state.hp < playerStats(state).maxHp;
}

/**
 * Juo parannusjuoman tai syö ruoan (kala) repusta. Palauttaa, paljonko elämää palautui
 * (0, jos ei voinut).
 */
export function drinkFromBag(state: GameState, itemId: string): number {
  const value = healValue(itemId);
  if (value === null || !canDrink(state, itemId)) {
    return 0;
  }
  state.inventory[itemId] = (state.inventory[itemId] ?? 0) - 1;
  const before = state.hp;
  state.hp = Math.min(playerStats(state).maxHp, state.hp + value);
  return state.hp - before;
}

/** Repussa valittu esine: repun esine tai käytössä olevan varusteen paikka. */
export type BackpackSelection =
  | { readonly kind: 'bag'; readonly itemId: string }
  | { readonly kind: 'slot'; readonly slot: GearSlot };

/**
 * Mitä valitulle esineelle voi tehdä: laittaa käyttöön, ottaa pois, juoda, syödä tai
 * valita syötiksi (kalastus, logic/fishing-gear.ts).
 */
export type BackpackAction = 'equip' | 'unequip' | 'drink' | 'eat' | 'bait';

/** Esinetyypin toiminto repussa (ei toimintoa: avain, onki, kulkuneuvo). */
const KIND_ACTIONS: Partial<Record<ItemKind, BackpackAction>> = {
  gear: 'equip',
  heal: 'drink',
  food: 'eat',
  bait: 'bait',
};

/** Valitun esineen tunniste, tai null, jos valittu paikka on tyhjä tai esine loppui repusta. */
export function selectedItemId(state: GameState, selection: BackpackSelection): string | null {
  if (selection.kind === 'slot') {
    return state.equipped[selection.slot] ?? null;
  }
  return (state.inventory[selection.itemId] ?? 0) > 0 ? selection.itemId : null;
}

/** Toiminto valitulle esineelle, tai null, jos sille ei voi tehdä mitään (esim. avain). */
export function selectionAction(
  state: GameState,
  selection: BackpackSelection,
): BackpackAction | null {
  const id = selectedItemId(state, selection);
  if (id === null) {
    return null;
  }
  if (selection.kind === 'slot') {
    return 'unequip';
  }
  return KIND_ACTIONS[getItem(id).kind] ?? null;
}
