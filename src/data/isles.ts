import type { IsleDef } from './types';

// Neljä pientä saarta meressä. Niille pääsee vain veneellä, jonka saa Venesataman
// venekaupasta (data/boat-shop.ts). Jokainen saari on edellistä vaarallisempi: saaret ovat
// pelin loppupään seikkailu tasoille 50–100, kun pääsaaren lohikäärmeet on voitettu.
// Saaren muoto on ympyröiden yhdiste (reuna kiemurtelee hieman, logic/world-grid.ts).
// Viholliset: data/map-enemies.ts (listan lopussa), tehtävänantajat: data/npcs.ts,
// kylät: data/towns.ts. Uusi saari: olio tähän listaan, kylä ja vihollisia.

export const ISLES: readonly IsleDef[] = [
  {
    // Lähin saari Venesatamasta etelään: palmuviidakko, merirosvot ja käärmeet.
    id: 'palm',
    name: 'Palmusaari',
    nameTo: 'Palmusaarelle',
    level: 50,
    circles: [
      { x: 66, y: 132, radius: 9 },
      { x: 75, y: 134, radius: 8 },
      { x: 59, y: 137, radius: 6 },
    ],
    terrain: { main: 'jungle', mix: 'sand', mixShare: 0.15 },
  },
  {
    // Lounaan sumuinen saari: kuolleita puita, hautakiviä, luurankoja ja haamuja.
    id: 'mist',
    name: 'Sumusaari',
    nameTo: 'Sumusaarelle',
    level: 62,
    circles: [
      { x: 25, y: 139, radius: 9 },
      { x: 33, y: 142, radius: 7.5 },
      { x: 19, y: 145, radius: 5 },
    ],
    terrain: { main: 'grave', mix: 'swamp', mixShare: 0.15 },
  },
  {
    // Kaakon jäinen saari: ikijäätä ja kristalleja, jäägolemeja ja kristallihämähäkkejä.
    id: 'frost',
    name: 'Pakkassaari',
    nameTo: 'Pakkassaarelle',
    level: 76,
    circles: [
      { x: 141, y: 139, radius: 9 },
      { x: 150, y: 142, radius: 7.5 },
      { x: 134, y: 144, radius: 5 },
    ],
    terrain: { main: 'ice', mix: 'snow', mixShare: 0.25 },
  },
  {
    // Kaukana idässä tulivuoren takana: mustaa basalttia, ukkoslintuja ja merikäärme.
    id: 'storm',
    name: 'Myrskysaari',
    nameTo: 'Myrskysaarelle',
    level: 90,
    circles: [
      { x: 222, y: 42, radius: 10 },
      { x: 229, y: 50, radius: 7 },
      { x: 214, y: 50, radius: 6 },
    ],
    terrain: { main: 'basalt', mix: 'ash', mixShare: 0.15 },
  },
];
