import { FINAL_BOSS } from './boss';
import { FINLAND_BORDER, LAKES, PROJECTION, TERRAIN_BANDS } from './finland';
import { MAP_ENEMIES } from './map-enemies';
import { ROADS, START_TOWN, TOWNS } from './towns';
import type { RockRule, TerrainDef, WorldDef } from './types';

// Koko pelimaailma yhdessä oliossa. Kartta rakennetaan tästä (logic/world-grid.ts).

/**
 * Maastotyypit. Järjestys määrää ruutujen numerot karttakuvassa: lisää uudet loppuun.
 * speedFactor hidastaa sankaria: metsässä kuljet 60 % nopeudella (tiellä taas täysillä).
 * Viholliset kulkevat aina omalla nopeudellaan. Kivi on este kuten vesi.
 */
export const TERRAINS: readonly TerrainDef[] = [
  { id: 'sea', sprite: 'tile-sea', walkable: false },
  { id: 'lake', sprite: 'tile-lake', walkable: false },
  { id: 'field', sprite: 'tile-field', walkable: true },
  { id: 'forest', sprite: 'tile-forest', walkable: true, speedFactor: 0.6 },
  { id: 'snow', sprite: 'tile-snow', walkable: true },
  { id: 'road', sprite: 'tile-road', walkable: true },
  { id: 'rock', sprite: 'tile-rock', walkable: false },
];

/**
 * Metsän kivet: noin joka 12. metsäruutu on ehdokas, ja kiven ympärille jää aina kahden
 * ruudun vapaa kaista, joten kiven voi kiertää eikä mikään paikka jää kivien taakse.
 */
export const ROCKS: RockRule = { onTerrain: 'forest', share: 0.08, clearRadius: 2, seed: 7 };

export const WORLD: WorldDef = {
  projection: PROJECTION,
  border: FINLAND_BORDER,
  lakes: LAKES,
  bands: TERRAIN_BANDS,
  towns: TOWNS,
  roads: ROADS,
  startTown: START_TOWN,
  rocks: ROCKS,
  keepClear: [...MAP_ENEMIES, FINAL_BOSS],
};
