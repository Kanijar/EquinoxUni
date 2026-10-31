import { START_TOWN, TOWNS } from '../data/towns';
import type { TownDef } from '../data/types';
import { restoreHp, type GameState } from './game-state';

// Paikkakunnissa käynti ja kaatuminen: peli muistaa viimeisimmän paikkakunnan,
// jossa pelaaja kävi, ja taistelussa kaatunut sankari herää siellä.

/** Viimeisin paikkakunta. Tuntematon tunniste (esim. vanha tallennus) = aloituspaikkakunta. */
export function lastVisitedTown(state: GameState): TownDef {
  const town = TOWNS.find((entry) => entry.id === state.lastTown);
  return town ?? findStartTown();
}

/** Pelaaja saapui paikkakuntaan: elämä palautuu ja paikkakunta muistetaan. */
export function visitTown(state: GameState, townId: string): void {
  state.lastTown = townId;
  restoreHp(state);
}

/**
 * Taistelussa kaatunut sankari herää viimeisimmässä paikkakunnassa täysin elämin.
 * Kokemus, kykypisteet, esineet ja voitetut viholliset säilyvät.
 * Palauttaa paikkakunnan, jossa sankari heräsi.
 */
export function reviveAtLastTown(state: GameState): TownDef {
  const town = lastVisitedTown(state);
  state.lastTown = town.id;
  state.position = null;
  restoreHp(state);
  return town;
}

function findStartTown(): TownDef {
  const start = TOWNS.find((entry) => entry.id === START_TOWN);
  if (!start) {
    throw new Error(`Tuntematon aloituspaikkakunta: "${START_TOWN}"`);
  }
  return start;
}
