import {
  BEACH,
  INLAND,
  ISLAND_COAST,
  ISLAND_SIZE,
  LAKES,
  REGION_EDGE_WOBBLE,
  REGIONS,
} from './island';
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
  { id: 'sand', sprite: 'tile-sand', walkable: true },
  { id: 'swamp', sprite: 'tile-swamp', walkable: true },
  { id: 'ash', sprite: 'tile-ash', walkable: true },
  { id: 'lava', sprite: 'tile-lava', walkable: false },
];

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
};
