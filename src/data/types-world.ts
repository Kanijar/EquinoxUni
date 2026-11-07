// Saaren kartan tyypit (data/island.ts, data/towns.ts, data/map-enemies.ts).
// Erotettu tiedostosta types.ts, jotta tiedostot pysyvät pieninä.
// Muut tiedostot tuovat nämä tyypit tiedoston types.ts kautta.

/**
 * Piste kartalla ruutuina. x kasvaa itään (oikealle) ja y etelään (alas):
 * vasen yläkulma on { x: 0, y: 0 }. Yksi ruutu on 16 × 16 pikseliä.
 */
export interface MapPoint {
  readonly x: number;
  readonly y: number;
}

export interface TownDef extends MapPoint {
  readonly id: string;
  /** Paikkakunnan nimi perusmuodossa, esim. "Kotiranta". */
  readonly name: string;
  /** Nimi sisäpaikallissijassa, esim. "Kotirannassa" tai "Tuhkalassa". */
  readonly nameAt: string;
}

/** Järvi (tai laavajärvi) kuvataan yhtenä tai useampana ympyränä. */
export interface LakeDef {
  readonly name: string;
  /** Mitä järvessä on: vettä (oletus) vai laavaa. Kumpikaan ei ole kävelykelpoinen. */
  readonly terrain?: 'lake' | 'lava';
  /** Ympyrät: keskipiste ja säde ruutuina. */
  readonly circles: readonly CircleDef[];
  /**
   * Saaret järven keskellä (valinnainen): näissä ympyröissä on alueen tavallista maata.
   * Esim. tulivuoren kraatterin keskellä on tuhkasaari, jolla Ossi Ketola odottaa.
   */
  readonly islands?: readonly CircleDef[];
}

/** Ympyrä kartalla: keskipiste ja säde ruutuina. */
export interface CircleDef extends MapPoint {
  readonly radius: number;
}

export type TerrainId =
  | 'sea'
  | 'lake'
  | 'field'
  | 'forest'
  | 'snow'
  | 'road'
  | 'sand'
  | 'swamp'
  | 'ash'
  | 'lava'
  | 'rock'
  | 'stairs'
  | 'jungle'
  | 'grave'
  | 'ice'
  | 'basalt';

export interface TerrainDef {
  readonly id: TerrainId;
  readonly sprite: string;
  /** Voiko ruudulla kävellä. Meri, järvet ja laava estävät liikkumisen. */
  readonly walkable: boolean;
  /** Liikkumisnopeuden kerroin tällä maastolla (1 = normaali, 0,6 = 60 %). Puuttuu = 1. */
  readonly speedFactor?: number;
}

/** Maaston sekoitus: pääasiallinen maasto ja sen seassa toinen (esim. metsää ja peltoa). */
export interface TerrainMix {
  readonly main: TerrainId;
  /** Toinen maasto, jota on sekaisin pääasiallisen kanssa. */
  readonly mix: TerrainId;
  /** Kuinka suuri osa ruuduista on toista maastoa (0..1). */
  readonly mixShare: number;
}

/** Saaren alue (esim. suo tai tunturit): monikulmio, jonka sisällä on oma maastonsa. */
export interface TerrainRegion extends TerrainMix {
  /** Alueen nimi (vain koodin lukijalle, ei näy pelissä). */
  readonly name: string;
  /** Alueen reunat ruutuina myötäpäivään. Alueet saavat mennä meren yli. */
  readonly area: readonly MapPoint[];
}

export interface WorldDef {
  /** Kartan koko ruutuina. */
  readonly width: number;
  readonly height: number;
  /** Saaren rantaviiva myötäpäivään. Rantaviivan ulkopuolella on merta. */
  readonly coast: readonly MapPoint[];
  /** Hiekkaranta meren reunalla: maasto ja leveys ruutuina. */
  readonly beach: { readonly terrain: TerrainId; readonly width: number };
  readonly lakes: readonly LakeDef[];
  /** Pienet saaret meressä (data/isles.ts). Niille pääsee vain veneellä. */
  readonly isles: readonly IsleDef[];
  /** Alueet. Jos alueet menevät päällekkäin, listassa ensimmäinen voittaa. */
  readonly regions: readonly TerrainRegion[];
  /** Kuinka monta ruutua alueiden rajat kiemurtelevat, jotta ne eivät ole suoria viivoja. */
  readonly regionEdgeWobble: number;
  /** Maasto alueiden ulkopuolella (saaren sisämaa). */
  readonly inland: TerrainMix;
  readonly towns: readonly TownDef[];
  /** Tiet paikkakuntien välillä tunnistepareina. */
  readonly roads: readonly (readonly [string, string])[];
  /** Paikkakunta, josta seikkailu alkaa. */
  readonly startTown: string;
  /** Kivet, joiden läpi ei pääse (logic/rocks.ts). */
  readonly rocks: RockRule;
  /** Paikat, joiden ympärille ei tule kiviä: vihollisten ja loppubossin paikat. */
  readonly keepClear: readonly MapPoint[];
}

/**
 * Kivet kartalla. Ne arvotaan kartan ruuduista aina samalla tavalla (seed), joten ne
 * ovat joka pelissä samoissa paikoissa ja toimivat millä tahansa kartalla.
 */
export interface RockRule {
  /** Maasto, johon kiviä tulee (metsä). */
  readonly onTerrain: TerrainId;
  /** Kuinka suuri osa maaston ruuduista on kiviehdokkaita (0..1). */
  readonly share: number;
  /**
   * Kuinka monen ruudun säteellä kiven ympärillä pitää olla vapaata kävelymaata
   * (ei vettä, kiveä, paikkakuntaa tai vihollisen paikkaa). Näin kiven voi aina kiertää.
   */
  readonly clearRadius: number;
  /** Arvonnan siemen: eri luku = kivet eri paikoissa. */
  readonly seed: number;
}

/**
 * Pieni saari meressä (data/isles.ts). Saaren muoto on yhden tai useamman ympyrän yhdiste,
 * jonka reuna kiemurtelee (ei täydellisiä ympyröitä). Saarelle pääsee vain veneellä.
 */
export interface IsleDef {
  readonly id: string;
  /** Saaren nimi perusmuodossa, esim. "Palmusaari". Englanniksi i18n/en-content.ts. */
  readonly name: string;
  /** Nimi ulkopaikallissijassa (allatiivi): "Rantauduit Palmusaarelle". */
  readonly nameTo: string;
  /** Suositeltu taso: saaren viholliset ovat reilu vastus tällä tasolla. */
  readonly level: number;
  /** Ympyrät: keskipiste ja säde ruutuina. */
  readonly circles: readonly CircleDef[];
  /** Saaren maasto (meren reunalle tulee silti hiekkaranta). */
  readonly terrain: TerrainMix;
}

/** Kartalla kulkeva vihollinen. Sijainti ruutuina. */
export interface MapEnemyDef extends MapPoint {
  readonly enemy: string;
}

/**
 * Rappuset laavan yli (data/volcano-stairs.ts). Jokainen voitto vihollisesta (lohikäärme)
 * nostaa laavasta yhden askelman lisää, kunnes rappuset vievät kraatterin saarelle.
 */
export interface StairsDef {
  /** Vihollinen, jonka voittaminen tuo uuden askelman (data/enemies.ts). */
  readonly enemy: string;
  /** Askelmat ilmestymisjärjestyksessä ruutuina: ensimmäinen kraatterin reunalla. */
  readonly steps: readonly MapPoint[];
  /** Maasto, joksi askelman ruutu muuttuu (kävelykelpoinen). */
  readonly terrain: TerrainId;
  /** Rappusten päässä oleva ruutu (saari), jonne pääsee vasta valmiita rappusia pitkin. */
  readonly goal: MapPoint;
}
