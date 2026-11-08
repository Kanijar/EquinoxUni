import { MENU_SECRET } from '../data/rules';
import type { MenuSecretRules } from '../data/types';
import { TEXT } from '../i18n/text';
import { burgerNews, eatBurger } from './burger-secret';
import { createNewGame, playerLevel, type GameState } from './game-state';
import { minXpForLevel } from './progression';

// Alkuruudun salaisuudet (data/rules.ts MENU_SECRET). Koskevat vain uutta peliä
// PELAA-napista, eivät tallennuksen latausta. Kaikki voivat olla päällä yhtä aikaa.
// - Susi: uusi peli alkaa korkeammalta tasolta ja ylimääräisillä esineillä.
// - Lima: sankarin silmät vaihtavat väriä.
// - Burgeri: dev-varusteet ja Bugattin avaimet, tasot ennallaan (logic/burger-secret.ts).
//   Burgeri koskee myös LATAA-napista ladattua tallennusta (scenes/saves-scene.ts).

/** Mitä alkuruudulla napautettiin tällä käynnillä. */
export interface MenuTaps {
  readonly wolf: boolean;
  readonly slime: boolean;
  readonly burger: boolean;
}

export const NO_MENU_TAPS: MenuTaps = { wolf: false, slime: false, burger: false };

export interface MenuStart {
  readonly state: GameState;
  /** Kartalla näytettävä yllätysviesti, tai undefined tavallisessa pelissä. */
  readonly message?: string;
}

/** Uusi peli alkuruudun PELAA-napista alkuruudun napautusten mukaan. */
export function createMenuGame(taps: MenuTaps, rules: MenuSecretRules = MENU_SECRET): GameState {
  const state = createNewGame(taps.wolf ? minXpForLevel(rules.wolfStartLevel) : 0);
  if (taps.wolf) {
    for (const stack of rules.bonusItems) {
      state.inventory[stack.id] = (state.inventory[stack.id] ?? 0) + stack.count;
    }
  }
  if (taps.slime) {
    state.eyeColor = rules.slimeEyeColor;
  }
  if (taps.burger) {
    eatBurger(state);
  }
  return state;
}

/** Uusi peli ja salaisuuksien (susi, burgeri) yllätysviestit kartalle. */
export function startFromMenu(taps: MenuTaps, rules: MenuSecretRules = MENU_SECRET): MenuStart {
  const state = createMenuGame({ ...taps, burger: false }, rules);
  const lines: string[] = [];
  if (taps.wolf) {
    lines.push(TEXT.world.wolfBlessing(playerLevel(state)));
  }
  if (taps.burger) {
    lines.push(burgerNews(state));
  }
  return lines.length > 0 ? { state, message: lines.join('\n') } : { state };
}
