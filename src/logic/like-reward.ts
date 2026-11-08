import { IDEAS_STORAGE } from '../config/ideas';
import { LIKE_SWORD_ID } from '../data/idea-items';
import { ownsItem } from './equipment';
import type { GameState } from './game-state';
import { safeRead, safeWrite, type KeyValueStore } from './key-value-store';

// Tykkäysmiekka (data/idea-items.ts): palkinto sille, jonka ideaviesti on saanut eniten
// tykkäyksiä. Tekijä pysyy nimettömänä: palvelin tunnistaa hänet vain laitteen salaisesta
// tunnisteesta (logic/ideas.ts). Miekan voi lunastaa kerran laitetta kohden. Lunastus
// tehdään alkuruudun ideanäkymässä, jossa peliä ei ole ladattu, joten miekka odottaa
// selaimen muistissa ja ilmestyy reppuun, kun pelaaja seuraavan kerran aloittaa tai lataa pelin.

/** Miekka tällä laitteella: ei lunastettu, odottaa reppuun pääsyä tai jo annettu. */
export type LocalReward = 'none' | 'pending' | 'given';

export function localReward(store: KeyValueStore): LocalReward {
  const value = safeRead(store, IDEAS_STORAGE.rewardKey);
  return value === 'pending' || value === 'given' ? value : 'none';
}

/** Lunastus onnistui palvelimella: miekka odottaa seuraavaa peliä. */
export function markRewardPending(store: KeyValueStore): void {
  if (localReward(store) === 'none') {
    safeWrite(store, IDEAS_STORAGE.rewardKey, 'pending');
  }
}

/** Antaa odottavan miekan sankarille (uusi tai ladattu peli). Palauttaa true, jos annettiin. */
export function deliverLikeReward(store: KeyValueStore, state: GameState): boolean {
  if (localReward(store) !== 'pending') {
    return false;
  }
  if (!ownsItem(state.inventory, state.equipped, LIKE_SWORD_ID)) {
    state.inventory[LIKE_SWORD_ID] = 1;
  }
  safeWrite(store, IDEAS_STORAGE.rewardKey, 'given');
  return true;
}
