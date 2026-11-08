import type { BoatItemDef } from './types';

// Venesataman venekaupan (data/boat-shop.ts) neljä venettä hitaimmasta nopeimpaan. Veneellä
// pääsee pienille saarille (data/isles.ts). Kun repussa on monta venettä, käytössä on aina
// nopein (logic/sailing.ts ownedBoat). Kalliimmat veneet myydään vasta tietyltä tasolta
// (minLevel), ja vain Luksusveneestä voi kalastaa merellä (canFish). Spritet: sprites-boats.ts.
// Vanhoissa tallennuksissa oleva entinen Purjevene ('sailboat') on nyt uusi Purjevene.

export const BOAT_ITEMS: readonly BoatItemDef[] = [
  {
    // Halvin ja hitain: merellä hitaampi kuin kävellen.
    id: 'rowboat',
    name: 'Soutuvene',
    description: 'Todella hidas, mutta halpa. Vie saarille!',
    kind: 'boat',
    sprite: 'rowboat',
    price: 300,
    speedMultiplier: 0.8,
    mapSprite: 'rowboat-hero',
  },
  {
    id: 'sailboat',
    name: 'Purjevene',
    description: 'Tuuli vie hieman soutuvenettä nopeammin.',
    kind: 'boat',
    sprite: 'sailboat',
    price: 1500,
    minLevel: 30,
    speedMultiplier: 1.1,
    mapSprite: 'sailboat-hero',
  },
  {
    id: 'motorboat',
    name: 'Moottorivene',
    description: 'Brrrm! Toiseksi nopein vene.',
    kind: 'boat',
    sprite: 'motorboat',
    price: 6000,
    minLevel: 55,
    speedMultiplier: 2,
    mapSprite: 'motorboat-hero',
  },
  {
    // Nopein vene, ja ainoa, josta voi kalastaa merellä (onki ja syötti tarvitaan).
    id: 'luxury-boat',
    name: 'Luksusvene',
    description: 'Todella nopea. Merellä voit kalastaa!',
    kind: 'boat',
    sprite: 'luxury-boat',
    price: 20000,
    minLevel: 70,
    speedMultiplier: 2.8,
    mapSprite: 'luxury-boat-hero',
    canFish: true,
  },
];
