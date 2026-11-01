import type { LakeDef, MapPoint, TerrainMix, TerrainRegion } from './types';

// Saaren muoto: rantaviiva, järvet ja alueet. Koordinaatit ovat karttaruutuja:
// x kasvaa itään (oikealle) ja y etelään (alas). Kartta on 198 × 124 ruutua.
// Lounaassa pellot ja aloituskylä, keskellä metsää ja järviä, idässä suo,
// pohjoisessa lumiset tunturit ja koillisessa tulivuori. Meren reunalla on hiekkaranta.

export const ISLAND_SIZE = { width: 198, height: 124 } as const;

/** Saaren rantaviiva myötäpäivään idästä alkaen (itäniemi → etelälahti → länsi → pohjoinen). */
export const ISLAND_COAST: readonly MapPoint[] = [
  { x: 184, y: 64 },
  { x: 182, y: 68 },
  { x: 176, y: 71 },
  { x: 166, y: 73 },
  { x: 159, y: 75 },
  { x: 160, y: 79 },
  { x: 164, y: 83 },
  { x: 165, y: 87 },
  { x: 162, y: 90 },
  { x: 159, y: 92 },
  { x: 156, y: 95 },
  { x: 154, y: 98 },
  { x: 152, y: 102 },
  { x: 150, y: 105 },
  { x: 146, y: 108 },
  { x: 141, y: 109 },
  { x: 135, y: 110 },
  { x: 129, y: 110 },
  { x: 124, y: 110 },
  { x: 119, y: 111 },
  { x: 115, y: 113 },
  { x: 110, y: 115 },
  { x: 105, y: 113 },
  { x: 99, y: 107 },
  { x: 95, y: 98 },
  { x: 92, y: 96 },
  { x: 87, y: 102 },
  { x: 82, y: 108 },
  { x: 76, y: 111 },
  { x: 71, y: 112 },
  { x: 65, y: 112 },
  { x: 60, y: 112 },
  { x: 54, y: 111 },
  { x: 47, y: 111 },
  { x: 41, y: 111 },
  { x: 34, y: 110 },
  { x: 27, y: 109 },
  { x: 21, y: 107 },
  { x: 16, y: 104 },
  { x: 15, y: 99 },
  { x: 16, y: 94 },
  { x: 17, y: 89 },
  { x: 17, y: 85 },
  { x: 16, y: 82 },
  { x: 16, y: 78 },
  { x: 17, y: 74 },
  { x: 19, y: 71 },
  { x: 23, y: 67 },
  { x: 29, y: 64 },
  { x: 35, y: 61 },
  { x: 32, y: 58 },
  { x: 23, y: 54 },
  { x: 16, y: 50 },
  { x: 14, y: 46 },
  { x: 15, y: 42 },
  { x: 18, y: 39 },
  { x: 22, y: 36 },
  { x: 26, y: 33 },
  { x: 29, y: 31 },
  { x: 34, y: 29 },
  { x: 39, y: 27 },
  { x: 44, y: 26 },
  { x: 49, y: 24 },
  { x: 52, y: 22 },
  { x: 57, y: 20 },
  { x: 63, y: 21 },
  { x: 69, y: 22 },
  { x: 72, y: 19 },
  { x: 75, y: 14 },
  { x: 79, y: 12 },
  { x: 84, y: 11 },
  { x: 90, y: 10 },
  { x: 95, y: 9 },
  { x: 101, y: 7 },
  { x: 106, y: 7 },
  { x: 112, y: 7 },
  { x: 117, y: 9 },
  { x: 122, y: 11 },
  { x: 126, y: 14 },
  { x: 130, y: 16 },
  { x: 134, y: 19 },
  { x: 138, y: 22 },
  { x: 142, y: 24 },
  { x: 147, y: 25 },
  { x: 154, y: 25 },
  { x: 162, y: 25 },
  { x: 169, y: 26 },
  { x: 174, y: 29 },
  { x: 175, y: 33 },
  { x: 174, y: 38 },
  { x: 172, y: 43 },
  { x: 171, y: 47 },
  { x: 171, y: 50 },
  { x: 174, y: 54 },
  { x: 178, y: 57 },
  { x: 182, y: 60 },
];

/** Hiekkaranta: maaruudut meren vieressä. */
export const BEACH = { terrain: 'sand', width: 2 } as const;

/** Järvet. Järven päälle ei voi kävellä, paitsi tietä pitkin (silta). Laavan päälle ei koskaan. */
export const LAKES: readonly LakeDef[] = [
  {
    name: 'Kirkasjärvi',
    circles: [
      { x: 58, y: 46, radius: 4.5 },
      { x: 63, y: 49, radius: 3.5 },
    ],
  },
  {
    name: 'Hauenjärvi',
    circles: [
      { x: 100, y: 44, radius: 4 },
      { x: 104, y: 48, radius: 3 },
    ],
  },
  { name: 'Peikkolampi', circles: [{ x: 84, y: 24, radius: 2.5 }] },
  {
    name: 'Suolammet',
    circles: [
      { x: 138, y: 82, radius: 3 },
      { x: 128, y: 94, radius: 2.5 },
      { x: 150, y: 88, radius: 2 },
    ],
  },
  { name: 'Tulivuoren kraatteri', terrain: 'lava', circles: [{ x: 160, y: 42, radius: 4.5 }] },
];

/** Alueet. Ensimmäinen alue, jonka sisällä ruutu on, määrää maaston. */
export const REGIONS: readonly TerrainRegion[] = [
  {
    name: 'Tulivuori',
    main: 'ash',
    mix: 'ash',
    mixShare: 0,
    area: [
      { x: 128, y: 0 },
      { x: 198, y: 0 },
      { x: 198, y: 70 },
      { x: 176, y: 66 },
      { x: 150, y: 52 },
      { x: 134, y: 36 },
      { x: 124, y: 24 },
    ],
  },
  {
    name: 'Tunturit',
    main: 'snow',
    mix: 'forest',
    mixShare: 0.2,
    area: [
      { x: 0, y: 0 },
      { x: 130, y: 0 },
      { x: 124, y: 24 },
      { x: 100, y: 30 },
      { x: 76, y: 30 },
      { x: 50, y: 36 },
      { x: 30, y: 44 },
      { x: 0, y: 44 },
    ],
  },
  {
    name: 'Suo',
    main: 'swamp',
    mix: 'forest',
    mixShare: 0.25,
    area: [
      { x: 118, y: 62 },
      { x: 150, y: 56 },
      { x: 176, y: 66 },
      { x: 198, y: 70 },
      { x: 198, y: 124 },
      { x: 110, y: 124 },
      { x: 108, y: 90 },
    ],
  },
  {
    name: 'Pellot',
    main: 'field',
    mix: 'forest',
    mixShare: 0.2,
    area: [
      { x: 0, y: 62 },
      { x: 40, y: 56 },
      { x: 70, y: 60 },
      { x: 96, y: 66 },
      { x: 108, y: 90 },
      { x: 110, y: 124 },
      { x: 0, y: 124 },
    ],
  },
];

/** Alueiden rajat kiemurtelevat enintään näin monta ruutua (ei suoria viivoja). */
export const REGION_EDGE_WOBBLE = 3;

/** Sisämaa alueiden ulkopuolella: kuusimetsää, jonka seassa aukeita peltoja. */
export const INLAND: TerrainMix = { main: 'forest', mix: 'field', mixShare: 0.25 };
