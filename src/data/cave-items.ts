import type { ItemDef } from './types';

// Peikkokuninkaan luolan esineet (data/cave.ts). Excalibur vedetään kivestä luolassa, ja se on
// pelin paras ase. Loitsukirjoja myy Noita: kun kirja on repussa, sankari osaa loitsun
// (logic/spells.ts, loitsut data/spells.ts). Kauppiaat eivät osta loitsuja takaisin.
// Spritet: data/sprites-cave.ts. Englanniksi: i18n/en-cave.ts.

export const CAVE_ITEMS: readonly ItemDef[] = [
  {
    // Paras ase: parempi kuin Myrskysaaren paras miekka (hyökkäys 36, tarkkuus 10).
    id: 'excalibur',
    name: 'Excalibur',
    description: 'Legendaarinen miekka kivestä. Paras ase!',
    kind: 'gear',
    sprite: 'excalibur',
    price: 5000,
    slot: 'hand',
    bonus: { attack: 40, critPercent: 12, magic: 3 },
  },
  {
    id: 'spell-lightning',
    name: 'Salamaloitsu',
    description: 'Iske salamalla! Suoja ei auta.',
    kind: 'spell',
    sprite: 'spell-lightning',
    price: 400,
    spell: 'lightning',
  },
  {
    id: 'spell-ice',
    name: 'Jäänuolen loitsu',
    description: 'Jäädyttää vihollisen yhdeksi vuoroksi.',
    kind: 'spell',
    sprite: 'spell-ice',
    price: 800,
    minLevel: 20,
    spell: 'ice-arrow',
  },
  {
    id: 'spell-healing',
    name: 'Parannusloitsu',
    description: 'Palauttaa elämää kesken taistelun.',
    kind: 'spell',
    sprite: 'spell-healing',
    price: 1200,
    minLevel: 25,
    spell: 'healing',
  },
];
