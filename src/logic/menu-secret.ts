import { MENU_SECRET } from '../data/rules';
import type { MenuSecretRules } from '../data/types';
import { TEXT } from '../i18n/fi';
import { createNewGame, playerLevel, type GameState } from './game-state';

// Alkuruudun salaisuudet (data/rules.ts MENU_SECRET). Koskevat vain uutta peliä
// PELAA-napista, eivät tallennuksen latausta. Molemmat voivat olla päällä yhtä aikaa.
// - Susi: uusi peli alkaa kokemuspisteillä ja ylimääräisillä esineillä.
// - Lima: sankarin silmät vaihtavat väriä.

/** Mitä alkuruudulla napautettiin tällä käynnillä. */
export interface MenuTaps {
  readonly wolf: boolean;
  readonly slime: boolean;
}

export const NO_MENU_TAPS: MenuTaps = { wolf: false, slime: false };

export interface MenuStart {
  readonly state: GameState;
  /** Kartalla näytettävä yllätysviesti, tai undefined tavallisessa pelissä. */
  readonly message?: string;
}

/** Uusi peli alkuruudun PELAA-napista alkuruudun napautusten mukaan. */
export function createMenuGame(taps: MenuTaps, rules: MenuSecretRules = MENU_SECRET): GameState {
  const state = createNewGame(taps.wolf ? rules.wolfStartXp : 0);
  if (taps.wolf) {
    for (const stack of rules.bonusItems) {
      state.inventory[stack.id] = (state.inventory[stack.id] ?? 0) + stack.count;
    }
  }
  if (taps.slime) {
    state.eyeColor = rules.slimeEyeColor;
  }
  return state;
}

/** Uusi peli ja suden salaisuuden yllätysviesti kartalle. */
export function startFromMenu(taps: MenuTaps, rules: MenuSecretRules = MENU_SECRET): MenuStart {
  const state = createMenuGame(taps, rules);
  return taps.wolf ? { state, message: TEXT.world.wolfBlessing(playerLevel(state)) } : { state };
}
