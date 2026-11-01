import { FINAL_BOSS } from './boss';
import {
  BEACH,
  INLAND,
  ISLAND_COAST,
  ISLAND_SIZE,
  LAKES,
  REGION_EDGE_WOBBLE,
  REGIONS,
} from './island';
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
  { id: 'sand', sprite: 'tile-sand', walkable: true },
  { id: 'swamp', sprite: 'tile-swamp', walkable: true },
  { id: 'ash', sprite: 'tile-ash', walkable: true },
  { id: 'lava', sprite: 'tile-lava', walkable: false },
  { id: 'rock', sprite: 'tile-rock', walkable: false },
];

/**
 * Metsän kivet: noin joka 12. metsäruutu on ehdokas, ja kiven ympärille jää aina kahden
 * ruudun vapaa kaista, joten kiven voi kiertää eikä mikään paikka jää kivien taakse.
 * Kiviä tulee vain metsään (ei hiekalle, suolle eikä tulivuorelle).
 */
export const ROCKS: RockRule = { onTerrain: 'forest', share: 0.08, clearRadius: 2, seed: 7 };

export const WORLD: WorldDef = {
  width: ISLAND_SIZE.width,
  height: ISLAND_SIZE.height,
  coast: ISLAND_COAST,
  beach: BEACH,
  lakes: LAKES,
  regions: REGIONS,
  regionEdgeWobble: REGION_EDGE_WOBBLE,
  inland: INLAND,
  towns: TOWNS,
  roads: ROADS,
  startTown: START_TOWN,
  rocks: ROCKS,
  keepClear: [...MAP_ENEMIES, FINAL_BOSS],
};
