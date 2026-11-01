import { BATTLE_RULES } from '../data/rules';
import type { BattleRules } from '../data/types';
import { calculateDamage, type Fighter } from './combat';

// Iskun vahingon arvonta: satunnaisvaihtelu ja kriittinen osuma.
// Erillään tiedostosta battle.ts, jotta sekä pelaajan että vihollisen vuoro voivat käyttää sitä.

/** Satunnaislukufunktio 0..1. Peli käyttää Math.random, testit omaa. */
export type Rng = () => number;

/** Vahinko satunnaisvaihtelun ja kriittisen osuman kanssa. Aina vähintään 1. */
export function rollDamage(
  attacker: Fighter,
  target: Fighter,
  rng: Rng,
  rules: BattleRules = BATTLE_RULES,
): { readonly damage: number; readonly crit: boolean } {
  const base = calculateDamage(attacker.attack, target.defense);
  const variance = 1 + (rng() * 2 - 1) * rules.damageVariance;
  const crit = rng() < (attacker.critChance ?? rules.critChance);
  const damage = Math.max(1, Math.round(base * variance * (crit ? rules.critMultiplier : 1)));
  return { damage, crit };
}
