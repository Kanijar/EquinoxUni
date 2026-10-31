import { MENU_SECRET } from '../data/rules';
import type { MenuSecretRules } from '../data/types';
import { TEXT } from '../i18n/fi';
import { createNewGame, playerLevel, type GameState } from './game-state';

// Alkuruudun salaisuus: jos pelaaja napauttaa sutta ennen PELAA-nappia, uusi peli
// alkaa kokemuspisteillä ja ylimääräisillä esineillä (data/rules.ts MENU_SECRET).
// Koskee vain uutta peliä, ei tallennuksen latausta.

export interface MenuStart {
  readonly state: GameState;
  /** Kartalla näytettävä yllätysviesti, tai undefined tavallisessa pelissä. */
  readonly message?: string;
}

/** Uusi peli alkuruudun PELAA-napista. wolfTapped = sutta napautettiin tällä käynnillä. */
export function createMenuGame(
  wolfTapped: boolean,
  rules: MenuSecretRules = MENU_SECRET,
): GameState {
  if (!wolfTapped) {
    return createNewGame();
  }
  const state = createNewGame(rules.wolfStartXp);
  for (const stack of rules.bonusItems) {
    state.inventory[stack.id] = (state.inventory[stack.id] ?? 0) + stack.count;
  }
  return state;
}

/** Uusi peli ja salaisuuden yllätysviesti kartalle. */
export function startFromMenu(
  wolfTapped: boolean,
  rules: MenuSecretRules = MENU_SECRET,
): MenuStart {
  const state = createMenuGame(wolfTapped, rules);
  return wolfTapped ? { state, message: TEXT.world.wolfBlessing(playerLevel(state)) } : { state };
}
