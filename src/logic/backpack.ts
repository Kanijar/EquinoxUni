import { getItem } from '../data';
import type { GearSlot } from '../data/types';
import { equipItem, unequipSlot } from './equipment';
import { playerStats, type GameState } from './game-state';

// Reppu: pelaaja avaa repun kartalla, laittaa varusteita käyttöön, ottaa niitä pois
// ja juo parannusjuomia. Varusteiden säännöt ovat logic/equipment.ts:ssä; tämä tiedosto
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

/** Voiko esineen juoda nyt: se on parannusjuoma, sitä on repussa ja elämä ei ole täynnä. */
export function canDrink(state: GameState, itemId: string): boolean {
  const item = getItem(itemId);
  const inBag = (state.inventory[itemId] ?? 0) > 0;
  return item.kind === 'heal' && inBag && state.hp < playerStats(state).maxHp;
}

/** Juo parannusjuoman repusta. Palauttaa, paljonko elämää palautui (0, jos ei voinut juoda). */
export function drinkFromBag(state: GameState, itemId: string): number {
  const item = getItem(itemId);
  if (item.kind !== 'heal' || !canDrink(state, itemId)) {
    return 0;
  }
  state.inventory[itemId] = (state.inventory[itemId] ?? 0) - 1;
  const before = state.hp;
  state.hp = Math.min(playerStats(state).maxHp, state.hp + item.value);
  return state.hp - before;
}

/** Repussa valittu esine: repun esine tai käytössä olevan varusteen paikka. */
export type BackpackSelection =
  | { readonly kind: 'bag'; readonly itemId: string }
  | { readonly kind: 'slot'; readonly slot: GearSlot };

/** Mitä valitulle esineelle voi tehdä: laittaa käyttöön, ottaa pois tai juoda. */
export type BackpackAction = 'equip' | 'unequip' | 'drink';

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
  const kind = getItem(id).kind;
  if (kind === 'gear') {
    return 'equip';
  }
  return kind === 'heal' ? 'drink' : null;
}
