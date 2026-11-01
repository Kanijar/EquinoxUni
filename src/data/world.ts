import { FINLAND_BORDER, LAKES, PROJECTION, TERRAIN_BANDS } from './finland';
import { ROADS, START_TOWN, TOWNS } from './towns';
import type { TerrainDef, WorldDef } from './types';

// Koko pelimaailma yhdessä oliossa. Kartta rakennetaan tästä (logic/world-grid.ts).

/**
 * Maastotyypit. Järjestys määrää ruutujen numerot karttakuvassa: lisää uudet loppuun.
 * speedFactor hidastaa sankaria: metsässä kuljet 60 % nopeudella (tiellä taas täysillä).
 * Viholliset kulkevat aina omalla nopeudellaan.
 */
export const TERRAINS: readonly TerrainDef[] = [
  { id: 'sea', sprite: 'tile-sea', walkable: false },
  { id: 'lake', sprite: 'tile-lake', walkable: false },
  { id: 'field', sprite: 'tile-field', walkable: true },
  { id: 'forest', sprite: 'tile-forest', walkable: true, speedFactor: 0.6 },
  { id: 'snow', sprite: 'tile-snow', walkable: true },
  { id: 'road', sprite: 'tile-road', walkable: true },
];

export const WORLD: WorldDef = {
  projection: PROJECTION,
  border: FINLAND_BORDER,
  lakes: LAKES,
  bands: TERRAIN_BANDS,
  towns: TOWNS,
  roads: ROADS,
  startTown: START_TOWN,
};
