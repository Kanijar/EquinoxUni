import { MENU_SECRET } from '../data/rules';
import type { MenuSecretRules } from '../data/types';
import { createNewGame, type GameState } from './game-state';

// Alkuruudun salaisuus: jos pelaaja napauttaa sutta ennen PELAA-nappia, uusi peli
// alkaa kokemuspisteillä (data/rules.ts). Koskee vain uutta peliä, ei tallennuksen latausta.

/** Uusi peli alkuruudun PELAA-napista. wolfTapped = sutta napautettiin tällä käynnillä. */
export function createMenuGame(
  wolfTapped: boolean,
  rules: MenuSecretRules = MENU_SECRET,
): GameState {
  return createNewGame(wolfTapped ? rules.wolfStartXp : 0);
}
