import type { GearItemDef } from './types';

// Dev-varusteet: pelin voimakkaimmat varusteet, yksi jokaiseen varustepaikkaan. Jokainen arvo
// on suurempi kuin millään muulla saman paikan varusteella (testi tests/dev-gear.test.ts).
// Niitä saa AINOASTAAN alkuruudun salaisesta burgerista (logic/burger-secret.ts antaa
// jokaiseen paikkaan pisteiltään parhaan varusteen). Siksi niitä ei saa myydä (ei hintaa),
// eikä niitä saa lisätä kauppoihin, pudotuksiin, kalastukseen eikä tehtävien palkintoihin.
// Tasovaatimusta ei ole: salaisuuden löytäjä saa käyttää niitä heti.
// Ulkonäkö sankarin päällä: data/gear-looks.ts, kuvat: data/sprites-dev-items.ts.
// Englanniksi: i18n/en-content.ts.

export const DEV_ITEMS: readonly GearItemDef[] = [
  {
    // Hehkuva neonmiekka: parempi kuin Excalibur (hyökkäys 40, tarkkuus 12, maagia 3).
    id: 'dev-sword',
    name: 'Dev-miekka',
    description: 'Pelin tekijöiden miekka. Voimakkain ase!',
    kind: 'gear',
    sprite: 'dev-sword',
    slot: 'hand',
    bonus: { attack: 60, critPercent: 20, magic: 6 },
  },
  {
    // Musta neonhaarniska: parempi kuin Ukkosviitta ja Kristallihaarniska.
    id: 'dev-armor',
    name: 'Dev-haarniska',
    description: 'Pelin tekijöiden haarniska. Kestää kaiken!',
    kind: 'gear',
    sprite: 'dev-armor',
    slot: 'body',
    bonus: { defense: 30, maxHp: 150, critPercent: 8, magic: 6 },
  },
  {
    // Neontähti kultaketjussa: parempi kuin Myrskysydän.
    id: 'dev-amulet',
    name: 'Dev-amuletti',
    description: 'Pelin tekijöiden tähti. Voimakkain koru!',
    kind: 'gear',
    sprite: 'dev-amulet',
    slot: 'neck',
    bonus: { defense: 12, maxHp: 150, magic: 10, critPercent: 12 },
  },
];

/** Dev-varusteiden tunnisteet (vain burgerista). */
export const DEV_GEAR_IDS: readonly string[] = DEV_ITEMS.map((item) => item.id);
