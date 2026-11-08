import type { FireSpellDef, SpellDef } from './types';

// Loitsut, joita pelaaja voi käyttää taistelussa. Tulipallo osataan alusta asti
// (HYÖKKÄÄ → TULIPALLO). Muut loitsut ostetaan loitsukirjoina Noidalta luolasta (data/cave.ts),
// ja ne näkyvät HYÖKKÄÄ → LOITSUT -valikossa. Loitsujen nimet ovat i18n/fi-magic.ts:ssä.
// Puolustus ei auta loitsuja vastaan. Palamisen tahti on data/rules.ts:ssä.

// Tulipallo: osuma 1 ja vihollinen palaa 3 sekuntia, -1 elämä joka sekunti.
// Jokainen Maagia-kyvyn piste: osuma +1, palaminen +1 sekunti ja polttovoima +0,5
// (esim. 1 piste: 1,5 elämää sekunnissa, 2 pistettä: 2 elämää sekunnissa).
export const FIREBALL: FireSpellDef = {
  id: 'fireball',
  effect: 'burn',
  power: 1,
  powerPerMagic: 1,
  burnDamage: 1,
  burnDamagePerMagic: 0.5,
  burnSeconds: 3,
  burnSecondsPerMagic: 1,
};

export const SPELLS: readonly SpellDef[] = [
  FIREBALL,
  // Salama: iso osuma (12 + 3 jokaisesta tulivoiman pisteestä). Sitten odotetaan 2 vuoroa.
  { id: 'lightning', effect: 'bolt', power: 12, powerPerMagic: 3, cooldownTurns: 2 },
  // Jäänuoli: pienempi osuma, mutta vihollinen jäätyy eikä lyö tällä vuorolla. Odotus 3 vuoroa.
  { id: 'ice-arrow', effect: 'freeze', power: 6, powerPerMagic: 2, cooldownTurns: 3 },
  // Parannus: 25 elämää + 4 jokaisesta tulivoiman pisteestä. Odotus 3 vuoroa.
  { id: 'healing', effect: 'heal', power: 25, powerPerMagic: 4, cooldownTurns: 3 },
];
