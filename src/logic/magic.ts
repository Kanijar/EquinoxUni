import type { BattleRules, SpellDef } from '../data/types';
import type { Battle } from './battle';
import { applyDamage, isDefeated, type Fighter } from './combat';

// Maagia: tulipallo osuu heti ja sytyttää vihollisen palamaan. Palava vihollinen
// menettää elämää kerran sekunnissa (MAGIC_RULES.burnTickMs), kunnes palaminen loppuu.
// Tulivoima (Maagia-kyky) kasvattaa osumaa, palamisaikaa ja polttovoimaa (vahinko sekunnissa).
// Puolustus ei auta loitsua vastaan.
//
// Polttovoima voi olla desimaaliluku (esim. 1,5), mutta elämät ovat kokonaislukuja.
// Siksi murto-osat kertyvät: polttovoimalla 1,5 vihollinen menettää vuorotellen 1 ja 2
// elämää (keskimäärin 1,5 sekunnissa). Palamisen lopussa jäänyt puolikas ei vahingoita.

/** Satunnaislukufunktio 0..1. */
type Rng = () => number;

/** Liukulukujen pyöristysvirheen vara, ettei esim. 0,999999… pyöristy alas nollaan. */
const FRACTION_TOLERANCE = 1e-9;

/** Palaminen: vahinko (polttovoima) joka sekunti, jäljellä olevat sekunnit ja kertynyt murto-osa. */
export interface Burn {
  readonly damage: number;
  secondsLeft: number;
  /** Vahingon murto-osa, jota ei ole vielä vähennetty elämästä (0..1). */
  carry: number;
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

/** Polttovoima: paljonko palava vihollinen menettää elämää sekunnissa (voi olla desimaaliluku). */
export function burnDamage(spell: SpellDef, magic: number): number {
  return spell.burnDamage + Math.max(0, magic) * spell.burnDamagePerMagic;
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
  const burn = {
    damage: burnDamage(spell, magic),
    secondsLeft: burnSeconds(spell, magic),
    carry: 0,
  };
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
  const damage = applyDamage(battle.enemy, wholeBurnDamage(burn));
  if (burn.secondsLeft <= 0) {
    battle.enemyBurn = null;
  }
  if (isDefeated(battle.enemy)) {
    battle.outcome = 'won';
  }
  return { damage, secondsLeft: burn.secondsLeft };
}

/** Tämän sekunnin vahinko kokonaislukuna. Murto-osa jää talteen seuraavaan sekuntiin. */
function wholeBurnDamage(burn: Burn): number {
  const total = burn.damage + burn.carry;
  const whole = Math.floor(total + FRACTION_TOLERANCE);
  burn.carry = Math.max(0, total - whole);
  return whole;
}
