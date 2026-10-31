import type { GeoPoint, LakeDef, MapProjection, TerrainBand } from './types';

// Suomen muoto kartalle. Koordinaatit ovat oikeita (pituusaste, leveysaste),
// joten uuden paikan sijainnin voi katsoa esimerkiksi Wikipediasta.

export const PROJECTION: MapProjection = {
  west: 20.0,
  east: 32.2,
  north: 70.4,
  south: 59.5,
  kmPerTile: 8,
  referenceLat: 64.5,
};

/** Suomen rajat myötäpäivään Hangosta alkaen (etelärannikko → itäraja → Lappi → länsirannikko). */
export const FINLAND_BORDER: readonly GeoPoint[] = [
  // Etelärannikko
  { lon: 22.9, lat: 59.8 },
  { lon: 23.4, lat: 59.92 },
  { lon: 24.0, lat: 59.98 },
  { lon: 24.5, lat: 60.05 },
  { lon: 25.0, lat: 60.06 },
  { lon: 25.6, lat: 60.2 },
  { lon: 26.3, lat: 60.3 },
  { lon: 27.0, lat: 60.36 },
  { lon: 27.75, lat: 60.48 },
  // Itäraja
  { lon: 28.55, lat: 60.92 },
  { lon: 28.9, lat: 61.2 },
  { lon: 29.5, lat: 61.48 },
  { lon: 29.75, lat: 61.7 },
  { lon: 30.65, lat: 62.2 },
  { lon: 31.2, lat: 62.5 },
  { lon: 31.58, lat: 62.9 },
  { lon: 31.3, lat: 63.1 },
  { lon: 30.5, lat: 63.8 },
  { lon: 30.55, lat: 64.25 },
  { lon: 30.0, lat: 64.5 },
  { lon: 29.9, lat: 65.3 },
  { lon: 29.65, lat: 65.7 },
  { lon: 30.0, lat: 66.1 },
  { lon: 29.55, lat: 66.6 },
  { lon: 29.15, lat: 67.0 },
  { lon: 29.05, lat: 67.5 },
  { lon: 29.35, lat: 68.05 },
  { lon: 28.7, lat: 68.25 },
  { lon: 28.4, lat: 68.55 },
  { lon: 28.8, lat: 68.85 },
  { lon: 28.93, lat: 69.05 },
  // Pohjoisraja (Norja)
  { lon: 28.35, lat: 69.75 },
  { lon: 27.95, lat: 70.09 },
  { lon: 27.3, lat: 70.0 },
  { lon: 26.6, lat: 69.85 },
  { lon: 26.1, lat: 69.6 },
  { lon: 25.75, lat: 69.3 },
  { lon: 25.05, lat: 68.8 },
  { lon: 24.25, lat: 68.75 },
  { lon: 23.4, lat: 68.7 },
  { lon: 22.4, lat: 68.85 },
  { lon: 21.6, lat: 69.2 },
  { lon: 21.2, lat: 69.32 },
  { lon: 20.55, lat: 69.1 },
  // Länsiraja (Ruotsi)
  { lon: 21.1, lat: 68.85 },
  { lon: 21.7, lat: 68.55 },
  { lon: 22.5, lat: 68.44 },
  { lon: 23.2, lat: 68.15 },
  { lon: 23.6, lat: 67.9 },
  { lon: 23.75, lat: 67.4 },
  { lon: 23.85, lat: 66.8 },
  { lon: 23.9, lat: 66.3 },
  { lon: 24.15, lat: 65.82 },
  // Länsirannikko
  { lon: 24.55, lat: 65.7 },
  { lon: 25.3, lat: 65.2 },
  { lon: 25.3, lat: 65.05 },
  { lon: 24.7, lat: 64.85 },
  { lon: 24.4, lat: 64.68 },
  { lon: 24.0, lat: 64.3 },
  { lon: 23.0, lat: 63.88 },
  { lon: 22.6, lat: 63.65 },
  { lon: 21.9, lat: 63.4 },
  { lon: 21.3, lat: 63.2 },
  { lon: 21.4, lat: 62.6 },
  { lon: 21.25, lat: 62.25 },
  { lon: 21.4, lat: 61.85 },
  { lon: 21.4, lat: 61.55 },
  { lon: 21.4, lat: 61.12 },
  { lon: 21.25, lat: 60.8 },
  { lon: 21.5, lat: 60.5 },
  { lon: 21.9, lat: 60.25 },
  { lon: 22.4, lat: 60.02 },
];

/** Suurimmat järvet. Järven päälle ei voi kävellä, paitsi tietä pitkin (silta). */
export const LAKES: readonly LakeDef[] = [
  { name: 'Näsijärvi', circles: [{ lon: 23.75, lat: 61.66, radiusKm: 7 }] },
  {
    name: 'Päijänne',
    circles: [
      { lon: 25.45, lat: 61.3, radiusKm: 7 },
      { lon: 25.5, lat: 61.5, radiusKm: 8 },
      { lon: 25.6, lat: 61.75, radiusKm: 7 },
    ],
  },
  {
    name: 'Saimaa',
    circles: [
      { lon: 28.4, lat: 61.35, radiusKm: 14 },
      { lon: 28.7, lat: 61.65, radiusKm: 12 },
      { lon: 28.1, lat: 61.85, radiusKm: 10 },
    ],
  },
  { name: 'Pielinen', circles: [{ lon: 29.6, lat: 63.3, radiusKm: 10 }] },
  { name: 'Oulujärvi', circles: [{ lon: 27.2, lat: 64.32, radiusKm: 13 }] },
  { name: 'Inarijärvi', circles: [{ lon: 27.9, lat: 69.0, radiusKm: 17 }] },
];

/** Maastovyöhykkeet etelästä pohjoiseen. */
export const TERRAIN_BANDS: readonly TerrainBand[] = [
  { untilLat: 61.4, main: 'field', mix: 'forest', mixShare: 0.35 },
  { untilLat: 66.3, main: 'forest', mix: 'field', mixShare: 0.2 },
  { untilLat: 90, main: 'snow', mix: 'forest', mixShare: 0.3 },
];
