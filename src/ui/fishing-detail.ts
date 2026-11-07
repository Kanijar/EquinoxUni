import { getItem } from '../data';
import { TEXT } from '../i18n/text';
import { baitInUse, bestRod, findRod } from '../logic/fishing-gear';
import type { GameState } from '../logic/game-state';

// Kalastusvälineen lisätieto repussa ja kaupassa (keltainen rivi): ongen ominaisuudet
// ja syötistä, onko se nyt käytössä. Säännöt: logic/fishing-gear.ts.

/** Lisätieto ongelle tai syötille, tai null, kun esine ei ole kalastusväline. */
export function fishingDetail(state: GameState, itemId: string): string | null {
  const rod = findRod(itemId);
  if (rod) {
    const best = bestRod(state.inventory);
    const owned = (state.inventory[itemId] ?? 0) > 0;
    const worse = owned && best !== null && best.item !== itemId;
    return worse
      ? TEXT.fishing.rodWorse
      : TEXT.fishing.rodStats(rod.biteWindowMs, rod.rareMultiplier);
  }
  if (getItem(itemId).kind !== 'bait') {
    return null;
  }
  return isBaitInUse(state, itemId) ? TEXT.fishing.baitInUse : '';
}

/** Onko syötti se, jolla nyt kalastetaan. */
export function isBaitInUse(state: GameState, itemId: string): boolean {
  return baitInUse(state, state.inventory)?.item === itemId;
}
