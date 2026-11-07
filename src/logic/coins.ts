import { COIN_RULES } from '../data/merchant';
import type { Rng } from './damage-roll';

// Kolikot: pelin raha, jolla ostetaan kulkevalta kauppiaalta (logic/shop.ts). Kolikoita saa
// jokaisesta voitetusta vihollisesta: mitä enemmän vihollisesta saa KP:tä, sitä enemmän
// kolikoita (COIN_RULES, data/merchant.ts). Lisää kolikoita saa myymällä tavaroita.

/** Kolikot voitosta: vihollisen KP × perXp ± satunnaisvaihtelu, vähintään yksi kolikko. */
export function victoryCoins(enemyXp: number, rng: Rng): number {
  const { perXp, variance } = COIN_RULES;
  const spread = 1 + (rng() * 2 - 1) * variance;
  return Math.max(1, Math.round(enemyXp * perXp * spread));
}

/**
 * Tallennuksesta luettu laskuri (esim. kolikot). Puuttuva (vanha tallennus) tai
 * virheellinen arvo = 0, joten tallennusversiota ei tarvinnut nostaa.
 */
export function readCount(value: unknown): number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : 0;
}
