import type { AmbushRule } from './types';

// Väijytykset: kun pelaaja kulkee tietyssä maastossa, vihollinen voi hyökätä
// yllättäen. Uusi väijytys = uusi rivi listaan. Testit tarkistavat viittaukset.

export const AMBUSHES: readonly AmbushRule[] = [
  // Metsässä ryöstäjä voi hypätä puiden takaa kimppuun.
  { terrain: 'forest', enemies: ['robber'], chancePerTile: 0.02 },
];

/** Näin monta ruutua pelaaja saa kulkea rauhassa pelin alussa ja jokaisen taistelun jälkeen. */
export const AMBUSH_SAFE_TILES = 20;
