import type { BattleRules, SpellDef } from '../data/types';
import type { Battle } from './battle';
import { applyDamage, isDefeated, type Fighter } from './combat';

// Maagia: tulipallo osuu heti ja sytyttää vihollisen palamaan. Palava vihollinen
// menettää elämää kerran sekunnissa (MAGIC_RULES.burnTickMs), kunnes palaminen loppuu.
// Tulivoima (Maagia-kyky) kasvattaa osumaa ja palamisaikaa. Puolustus ei auta loitsua vastaan.

/** Satunnaislukufunktio 0..1. */
type Rng = () => number;

/** Palaminen: vahinko joka sekunti ja jäljellä olevat sekunnit. */
export interface Burn {
  readonly damage: number;
  secondsLeft: number;
}

/** Yksi sekunti palamista: tehty vahinko ja jäljellä olevat sekunnit. */
export interface BurnTick {
  readonly damage: number;
  readonly secondsLeft: number;
}

/** Loitsun osuman vahinko ilman satunnaisuutta. */
export function spellPower(spell: SpellDef, magic: number): number {
  return spell.power + Math.max(0, magic) * spell.powerPerMagic;
}

/** Kuinka monta sekuntia loitsu polttaa. */
export function burnSeconds(spell: SpellDef, magic: number): number {
  return spell.burnSeconds + Math.max(0, magic) * spell.burnSecondsPerMagic;
}

/**
 * Loitsun osuma ja sen sytyttämä palaminen. Osuma voi olla kriittinen loitsijan
 * tarkkuuden mukaan. Osuman vahinko on aina vähintään 1.
 */
export function castSpell(
  caster: Fighter,
  spell: SpellDef,
  rng: Rng,
  rules: BattleRules,
): { readonly damage: number; readonly crit: boolean; readonly burn: Burn } {
  const magic = caster.magic ?? 0;
  const variance = 1 + (rng() * 2 - 1) * rules.damageVariance;
  const crit = rng() < (caster.critChance ?? rules.critChance);
  const base = spellPower(spell, magic);
  const damage = Math.max(1, Math.round(base * variance * (crit ? rules.critMultiplier : 1)));
  const burn = { damage: spell.burnDamage, secondsLeft: burnSeconds(spell, magic) };
  return { damage, crit, burn };
}

/**
 * Yksi sekunti palamista: vihollinen menettää elämää. Taistelun näkymä kutsuu tätä
 * kerran sekunnissa. Palauttaa null, jos vihollinen ei pala tai taistelu on ohi.
 * Jos vihollinen kaatuu palamiseen, pelaaja voittaa.
 */
export function burnTick(battle: Battle): BurnTick | null {
  const burn = battle.enemyBurn;
  if (battle.outcome !== 'ongoing' || !burn || burn.secondsLeft <= 0) {
    return null;
  }
  burn.secondsLeft -= 1;
  const damage = applyDamage(battle.enemy, burn.damage);
  if (burn.secondsLeft <= 0) {
    battle.enemyBurn = null;
  }
  if (isDefeated(battle.enemy)) {
    battle.outcome = 'won';
  }
  return { damage, secondsLeft: burn.secondsLeft };
}
