import type { MapEnemyDef } from './types';

// Viholliset Suomen kartalla. Sijainti oikeina koordinaatteina (pituusaste, leveysaste).
// Etelässä on helpompia vihollisia, pohjoisessa vaikeampia.
// Kun kaikki on voitettu, peli on läpäisty.

export const MAP_ENEMIES: readonly MapEnemyDef[] = [
  // Etelä-Suomi
  { enemy: 'slime', lon: 24.8, lat: 61.22 },
  { enemy: 'slime', lon: 23.4, lat: 61.36 },
  { enemy: 'slime', lon: 24.7, lat: 60.6 },
  { enemy: 'slime', lon: 25.3, lat: 61.12 },
  { enemy: 'hiisi', lon: 23.2, lat: 60.7 },
  { enemy: 'hiisi', lon: 22.4, lat: 61.5 },
  { enemy: 'hiisi', lon: 24.8, lat: 61.95 },
  { enemy: 'hiisi', lon: 27.0, lat: 61.0 },
  // Keski-Suomi ja Pohjanmaa
  { enemy: 'hiisi', lon: 22.3, lat: 62.95 },
  { enemy: 'wolf', lon: 26.8, lat: 62.5 },
  { enemy: 'wolf', lon: 28.8, lat: 62.9 },
  { enemy: 'wolf', lon: 24.2, lat: 64.2 },
  { enemy: 'wolf', lon: 27.0, lat: 65.0 },
  // Lappi
  { enemy: 'troll', lon: 26.0, lat: 66.0 },
  { enemy: 'troll', lon: 25.5, lat: 67.2 },
  { enemy: 'troll', lon: 22.5, lat: 68.65 },
  { enemy: 'troll', lon: 27.2, lat: 69.45 },
];
