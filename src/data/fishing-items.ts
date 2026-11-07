import type { ItemDef } from './types';

// Kalastuksen esineet (data/fishing.ts). Onget ja syötit ostetaan kulkevalta kauppiaalta
// (paremmat vasta korkeammalla tasolla, minLevel), kalat, panssari ja koru saadaan kalastamalla. Kalat syödään repusta (elämä palautuu) tai
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
    id: 'fly',
    name: 'Kärpänen',
    description: 'Taimenet ja lohet rakastavat kärpäsiä!',
    kind: 'bait',
    sprite: 'fly',
    price: 3,
    buyCount: 5,
  },
  {
    id: 'shrimp',
    name: 'Katkarapu',
    description: 'Houkuttelee haita ja kultakaloja.',
    kind: 'bait',
    sprite: 'shrimp',
    price: 5,
    buyCount: 5,
    minLevel: 8,
  },
  {
    id: 'lure',
    name: 'Kiiltävä uistin',
    description: 'Kiiltää! Jättimustekala ja aarteet.',
    kind: 'bait',
    sprite: 'lure',
    price: 10,
    buyCount: 3,
    minLevel: 15,
  },
  // --- Paremmat onget (ominaisuudet data/fishing.ts) ---
  {
    id: 'carbon-rod',
    name: 'Hiilikuituvapa',
    description: 'Kevyt vapa: enemmän aikaa nykäistä.',
    kind: 'tool',
    sprite: 'carbon-rod',
    price: 200,
    minLevel: 8,
  },
  {
    id: 'golden-rod',
    name: 'Kultainen vapa',
    description: 'Harvinaiset saaliit tulevat useammin!',
    kind: 'tool',
    sprite: 'golden-rod',
    price: 700,
    minLevel: 18,
  },
  {
    id: 'sea-king-rod',
    name: 'Merenkuninkaan vapa',
    description: 'Paras vapa. Aarteita ja jättikaloja!',
    kind: 'tool',
    sprite: 'sea-king-rod',
    price: 1600,
    minLevel: 30,
  },
  // --- Saaliit ---
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
    id: 'trout',
    name: 'Taimen',
    description: 'Täplikäs kala. Syö: elämä +35.',
    kind: 'food',
    sprite: 'trout',
    price: 20,
    value: 35,
  },
  {
    // Harvinainen aarre: kannattaa myydä kauppiaalle (75 kolikkoa).
    id: 'golden-fish',
    name: 'Kultakala',
    description: 'Kimaltava aarre! Syö: elämä +80.',
    kind: 'food',
    sprite: 'golden-fish',
    price: 150,
    value: 80,
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
  {
    // Kiiltävän uistimen harvinainen saalis (5 %). Taikaa ja sitkeyttä.
    id: 'pearl-necklace',
    name: 'Helmikoru',
    description: 'Meren helmet. Sitkeyttä ja taikaa!',
    kind: 'gear',
    sprite: 'pearl-necklace',
    price: 600,
    slot: 'neck',
    bonus: { maxHp: 20, defense: 2, magic: 2 },
  },
];
