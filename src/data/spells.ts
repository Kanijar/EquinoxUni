import type { SpellDef } from './types';

// Loitsut, joita pelaaja voi käyttää taistelussa (HYÖKKÄÄ → TULIPALLO).
// Loitsujen nimet ovat i18n/fi.ts:ssä (TEXT.spells). Palamisen tahti on data/rules.ts:ssä.

export const SPELLS: readonly SpellDef[] = [
  // Tulipallo: osuma 1 ja vihollinen palaa 3 sekuntia, -1 elämä joka sekunti.
  // Jokainen Maagia-kyvyn piste: osuma +1 ja palaminen +1 sekunti.
  {
    id: 'fireball',
    power: 1,
    powerPerMagic: 1,
    burnDamage: 1,
    burnSeconds: 3,
    burnSecondsPerMagic: 1,
  },
];
