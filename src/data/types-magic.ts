// Loitsujen tyypit. Loitsut: data/spells.ts, säännöt: logic/magic.ts (tulipallo ja palaminen)
// ja logic/spells.ts (kaikki loitsut taistelussa, odotusvuorot).

/** Loitsun tunniste. Loitsun nimi on i18n/fi.ts:ssä (TEXT.spells). */
export type SpellId = 'fireball' | 'lightning' | 'ice-arrow' | 'healing';

interface SpellBase {
  readonly id: SpellId;
  /** Osuman vahinko ilman tulivoimaa (parannusloitsulla: paljonko elämää palautuu). */
  readonly power: number;
  /** Paljonko osuma (tai parannus) kasvaa jokaisesta tulivoiman pisteestä. */
  readonly powerPerMagic: number;
  /**
   * Montako vuoroa pitää odottaa, ennen kuin loitsua voi käyttää uudelleen (puuttuu = 0,
   * eli joka vuoro). Odotus estää esimerkiksi parantamasta joka vuoro.
   */
  readonly cooldownTurns?: number;
}

/** Tulipallo: osuu ja sytyttää vihollisen palamaan. Puolustus ei auta loitsua vastaan. */
export interface FireSpellDef extends SpellBase {
  readonly effect: 'burn';
  /** Palamisen vahinko (polttovoima) joka sekunti ilman tulivoimaa (MAGIC_RULES.burnTickMs). */
  readonly burnDamage: number;
  /**
   * Paljonko polttovoima kasvaa jokaisesta tulivoiman pisteestä. Saa olla desimaaliluku
   * (esim. 0.5): murto-osat kertyvät ja vähennetään elämästä kokonaisina (logic/magic.ts).
   */
  readonly burnDamagePerMagic: number;
  /** Kuinka monta sekuntia vihollinen palaa ilman tulivoimaa. */
  readonly burnSeconds: number;
  /** Paljonko palamisaika pitenee jokaisesta tulivoiman pisteestä. */
  readonly burnSecondsPerMagic: number;
}

/** Salama: yksi iso osuma, joka ohittaa puolustuksen. */
export interface BoltSpellDef extends SpellBase {
  readonly effect: 'bolt';
}

/** Jäänuoli: osuma, ja vihollinen jäätyy eikä voi vastata tällä vuorolla. */
export interface FreezeSpellDef extends SpellBase {
  readonly effect: 'freeze';
}

/** Parannus: sankari saa elämää (power = parannuksen määrä). */
export interface HealSpellDef extends SpellBase {
  readonly effect: 'heal';
}

export type SpellDef = FireSpellDef | BoltSpellDef | FreezeSpellDef | HealSpellDef;
