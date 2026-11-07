import { FISHING } from '../data/fishing';
import type { BaitDef, FishingRules, RodDef } from '../data/types';
import type { Inventory } from './equipment';

// Kalastusvälineet (data/fishing.ts): mikä onki ja mikä syötti on käytössä.
// Sankari käyttää aina parasta onkeaan. Syötin pelaaja valitsee repussa (SYÖTIKSI); jos
// valittu syötti on lopussa, käytetään ensimmäistä syöttiä FISHING.baits-listasta, jota on.

/** Valittu syötti, joka säilyy tallennuksessa (GameState.bait). */
export interface FishingProgress {
  /** Repussa valittu syötti (esineen tunniste), tai null = ei valittu (madot ensin). */
  bait: string | null;
}

/** Paras onki, joka repussa on, tai null, jos onkea ei ole. */
export function bestRod(inventory: Inventory, rules: FishingRules = FISHING): RodDef | null {
  const owned = rules.rods.filter((rod) => (inventory[rod.item] ?? 0) > 0);
  return owned.at(-1) ?? null;
}

/** Onko esine syötti (data/fishing.ts). */
export function findBait(itemId: string, rules: FishingRules = FISHING): BaitDef | null {
  return rules.baits.find((bait) => bait.item === itemId) ?? null;
}

/** Onko esine onki (data/fishing.ts). */
export function findRod(itemId: string, rules: FishingRules = FISHING): RodDef | null {
  return rules.rods.find((rod) => rod.item === itemId) ?? null;
}

/** Syötti, jolla kalastetaan: valittu, jos sitä on, muuten ensimmäinen repussa oleva. */
export function baitInUse(
  progress: FishingProgress,
  inventory: Inventory,
  rules: FishingRules = FISHING,
): BaitDef | null {
  const has = (bait: BaitDef): boolean => (inventory[bait.item] ?? 0) > 0;
  const chosen = progress.bait === null ? null : findBait(progress.bait, rules);
  if (chosen && has(chosen)) {
    return chosen;
  }
  return rules.baits.find(has) ?? null;
}

/** Valitsee syötin repussa. Palauttaa false, jos esine ei ole syötti tai sitä ei ole. */
export function chooseBait(
  progress: FishingProgress,
  inventory: Inventory,
  itemId: string,
): boolean {
  if (!findBait(itemId) || (inventory[itemId] ?? 0) <= 0) {
    return false;
  }
  progress.bait = itemId;
  return true;
}
