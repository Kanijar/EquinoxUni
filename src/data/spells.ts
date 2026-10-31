import type { SpellDef } from './types';

// Loitsut, joita pelaaja voi käyttää taistelussa (HYÖKKÄÄ → TULIPALLO).
// Loitsujen nimet ovat i18n/fi.ts:ssä (TEXT.spells). Palamisen tahti on data/rules.ts:ssä.

export const SPELLS: readonly SpellDef[] = [
  // Tulipallo: osuma 1 ja vihollinen palaa 3 sekuntia, -1 elämä joka sekunti.
  // Jokainen Maagia-kyvyn piste: osuma +1, palaminen +1 sekunti ja polttovoima +0,5
  // (esim. 1 piste: 1,5 elämää sekunnissa, 2 pistettä: 2 elämää sekunnissa).
  {
    id: 'fireball',
    power: 1,
    powerPerMagic: 1,
    burnDamage: 1,
    burnDamagePerMagic: 0.5,
    burnSeconds: 3,
    burnSecondsPerMagic: 1,
  },
];
