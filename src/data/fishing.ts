import type { BaitDef, FishingRules, RodDef } from './types';

// Kalastus. Kulkevalta kauppiaalta Kaapolta ostetaan onki ja syöttejä. Kun sankari seisoo
// meren tai järven rannalla, kartalle tulee KALASTA-nappi (tietokoneella F-näppäin). Koho
// lentää veteen, ja hetken päästä kala nappaa: silloin pitää nykäistä nopeasti (sama nappi).
// Liian aikaisin nykäisty säikäyttää kalan, liian myöhään kala vie syötin.
//
// Onget: parempi onki antaa enemmän aikaa nykäistä, kala nappaa nopeammin ja harvinaiset
// saaliit (rare) tulevat useammin. Sankari käyttää aina parasta onkeaan.
// Syötit: jokaisella syötillä on omat saaliinsa. Syötti valitaan repussa (SYÖTIKSI).
// Painot ovat jokaisella syötillä yhteensä 100, joten ne ovat prosentteja tavallisella ongella.
//
// Säännöt: logic/fishing.ts, kartalla: systems/fishing-control.ts.
// Kalastuksen esineet: data/fishing-items.ts, hai ja jättimustekala: data/enemies.ts.

const RODS: readonly RodDef[] = [
  { item: 'fishing-rod', biteWindowMs: 900, biteDelayFactor: 1, rareMultiplier: 1 },
  { item: 'carbon-rod', biteWindowMs: 1150, biteDelayFactor: 0.85, rareMultiplier: 1.5 },
  { item: 'golden-rod', biteWindowMs: 1400, biteDelayFactor: 0.7, rareMultiplier: 2 },
  { item: 'sea-king-rod', biteWindowMs: 1700, biteDelayFactor: 0.55, rareMultiplier: 3 },
];

const BAITS: readonly BaitDef[] = [
  {
    // Tavallinen syötti: enimmäkseen ahvenia ja haukia.
    item: 'worm',
    catches: [
      { kind: 'item', item: 'perch', weight: 52 },
      { kind: 'item', item: 'pike', weight: 23 },
      { kind: 'item', item: 'salmon', weight: 10, rare: true },
      { kind: 'enemy', enemy: 'shark', weight: 10 },
      { kind: 'item', item: 'fish-scale-armor', weight: 5, rare: true },
    ],
  },
  {
    // Taimenet ja lohet pitävät kärpäsistä, hai harvoin.
    item: 'fly',
    catches: [
      { kind: 'item', item: 'trout', weight: 40 },
      { kind: 'item', item: 'perch', weight: 20 },
      { kind: 'item', item: 'salmon', weight: 20, rare: true },
      { kind: 'item', item: 'pike', weight: 10 },
      { kind: 'enemy', enemy: 'shark', weight: 5 },
      { kind: 'item', item: 'fish-scale-armor', weight: 5, rare: true },
    ],
  },
  {
    // Merenelävä: haita paljon, mutta myös harvinainen kultakala.
    item: 'shrimp',
    catches: [
      { kind: 'enemy', enemy: 'shark', weight: 30 },
      { kind: 'item', item: 'pike', weight: 20 },
      { kind: 'item', item: 'trout', weight: 15 },
      { kind: 'item', item: 'salmon', weight: 15, rare: true },
      { kind: 'item', item: 'perch', weight: 10 },
      { kind: 'item', item: 'golden-fish', weight: 5, rare: true },
      { kind: 'item', item: 'fish-scale-armor', weight: 5, rare: true },
    ],
  },
  {
    // Kiiltävä uistin houkuttelee isoja: jättimustekala, kultakala ja Helmikoru.
    item: 'lure',
    catches: [
      { kind: 'item', item: 'pike', weight: 30 },
      { kind: 'item', item: 'salmon', weight: 20, rare: true },
      { kind: 'enemy', enemy: 'octopus', weight: 20 },
      { kind: 'enemy', enemy: 'shark', weight: 15 },
      { kind: 'item', item: 'golden-fish', weight: 10, rare: true },
      { kind: 'item', item: 'pearl-necklace', weight: 5, rare: true },
    ],
  },
];

export const FISHING: FishingRules = {
  waterTerrains: ['sea', 'lake'],
  reachTiles: 1,
  biteDelayMs: { min: 1500, max: 4500 },
  rods: RODS,
  baits: BAITS,
};
