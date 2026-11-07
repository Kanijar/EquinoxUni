import type { ItemDef } from './types';

// Kalastuksen esineet (data/fishing.ts). Onki ja madot ostetaan kulkevalta kauppiaalta,
// kalat ja panssari saadaan kalastamalla. Kalat syödään repusta (elämä palautuu) tai
// myydään kauppiaalle puoleen hintaan. Sprite: data/sprites-fishing.ts.
// Englanninkieliset nimet: i18n/en-content.ts.

export const FISHING_ITEMS: readonly ItemDef[] = [
  {
    id: 'fishing-rod',
    name: 'Onki',
    description: 'Kalasta rannalla. Tarvitset matoja!',
    kind: 'tool',
    sprite: 'fishing-rod',
    price: 40,
  },
  {
    // Ostetaan viiden madon pussissa (buyCount). Hinta on yhden madon hinta.
    id: 'worm',
    name: 'Mato',
    description: 'Syötti ongeen. Kuluu, kun kala nappaa.',
    kind: 'bait',
    sprite: 'worm',
    price: 2,
    buyCount: 5,
  },
  {
    id: 'perch',
    name: 'Ahven',
    description: 'Pieni kala. Syö: elämä +12.',
    kind: 'food',
    sprite: 'perch',
    price: 6,
    value: 12,
  },
  {
    id: 'pike',
    name: 'Hauki',
    description: 'Iso kala. Syö: elämä +25.',
    kind: 'food',
    sprite: 'pike',
    price: 14,
    value: 25,
  },
  {
    id: 'salmon',
    name: 'Lohi',
    description: 'Harvinainen herkku. Syö: elämä +50.',
    kind: 'food',
    sprite: 'salmon',
    price: 30,
    value: 50,
  },
  {
    // Harvinainen saalis (5 %). Vähän parempi kuin Rapupanssari ja Rengaspaita.
    id: 'fish-scale-armor',
    name: 'Kalan suomupanssari',
    description: 'Kiiltävät suomut. Liukas ja kestävä!',
    kind: 'gear',
    sprite: 'fish-scale-armor',
    price: 160,
    slot: 'body',
    bonus: { defense: 4, maxHp: 14 },
  },
];
