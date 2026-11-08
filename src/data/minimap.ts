import type { TerrainId } from './types';

// Minikartan värit (ui/minimap.ts ja scenes/map-scene.ts). Jokaisella maastolla on yksi väri,
// joka on lähellä karttaruudun pääväriä (data/sprites-tiles.ts). Uusi maasto tarvitsee
// tänne värin (TypeScript huomauttaa, jos se puuttuu).

export const MINIMAP_TERRAIN_COLORS: Readonly<Record<TerrainId, number>> = {
  sea: 0x1f4e8c,
  lake: 0x2f78c0,
  field: 0x6aa84f,
  // Metsän kivet piirretään metsän värillä, jotta minikartta ei näytä pilkulliselta.
  forest: 0x3f7f3f,
  rock: 0x3f7f3f,
  snow: 0xe8eef5,
  road: 0xc9a46c,
  sand: 0xe6d08c,
  swamp: 0x5b6e45,
  ash: 0x4a4140,
  lava: 0xe8501e,
  stairs: 0x8a7a70,
  jungle: 0x2f8f3a,
  grave: 0x6b6b5e,
  ice: 0xa8dcf0,
  basalt: 0x2b2b33,
};

/** Merkit minikartalla: mitä ne ovat (ui/minimap-markers.ts piirtää, logic/minimap.ts valitsee). */
export type MinimapMarkerKind = 'town' | 'ossi' | 'cave' | 'merchant' | 'boss' | 'hero';

/** Merkkien värit. Merkin ympärillä on aina musta reunus, jotta se erottuu maastosta. */
export const MINIMAP_MARKER_COLORS: Readonly<Record<MinimapMarkerKind, number>> = {
  town: 0xffffff,
  ossi: 0x40e0ff,
  cave: 0x8a5a2b,
  merchant: 0xffd23f,
  boss: 0xb04cff,
  hero: 0xff3030,
};

/** Merkkien järjestys selitteessä ja piirrossa: viimeinen piirretään päällimmäiseksi. */
export const MINIMAP_MARKER_ORDER: readonly MinimapMarkerKind[] = [
  'town',
  'ossi',
  'cave',
  'merchant',
  'boss',
  'hero',
];
