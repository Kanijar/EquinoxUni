// Pelisisällön tyypit. Kaikki sisältö (viholliset, esineet, paikkakunnat, spritet)
// kuvataan näillä tyypeillä data/-kansiossa. Lisää uusi kenttä ensin tänne.

/** Yksinkertainen pikseligrafiikka: jokainen merkki on yksi pikseli, '.' = läpinäkyvä. */
export interface SpriteDef {
  readonly id: string;
  readonly palette: Readonly<Record<string, string>>;
  readonly rows: readonly string[];
}

export interface CombatStats {
  readonly maxHp: number;
  readonly attack: number;
  readonly defense: number;
  /** Liikkumisnopeus kartalla pikseleinä sekunnissa. */
  readonly speed: number;
}

export interface ItemStack {
  readonly id: string;
  readonly count: number;
}

export interface PlayerDef {
  readonly name: string;
  readonly sprite: string;
  /** Arvot pelin alussa. Kasvavat vain kykypisteillä (data/skills.ts). */
  readonly stats: CombatStats;
  /** Esineet, jotka pelaajalla on pelin alussa. */
  readonly startItems: readonly ItemStack[];
}

export interface EnemyDef {
  readonly id: string;
  /** Suomenkielinen nimi, näytetään pelaajalle. */
  readonly name: string;
  readonly sprite: string;
  readonly stats: CombatStats;
  /** Etäisyys pikseleinä, jolta vihollinen huomaa pelaajan kartalla ja lähtee perään. */
  readonly aggroRange: number;
  /** Kokemuspisteet voitosta. */
  readonly xp: number;
  /** Esine, jonka pelaaja saa voitosta (valinnainen). */
  readonly drop?: string;
  /**
   * Todennäköisyys (0..1), jolla vihollinen varastaa esineen lyönnin sijaan (valinnainen).
   * Varastetut esineet saa takaisin, kun vihollinen voitetaan.
   */
  readonly stealChance?: number;
  /**
   * Oma todennäköisyys (0..1) kriittiselle osumalle (valinnainen).
   * Jos puuttuu, käytetään yhteistä arvoa BATTLE_RULES.critChance (data/rules.ts).
   */
  readonly critChance?: number;
}

export type ItemKind = 'heal' | 'weapon' | 'key';

export interface ItemDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly kind: ItemKind;
  readonly sprite: string;
  /** Tyypistä riippuva arvo: parannuksen määrä, aseen hyökkäysbonus jne. */
  readonly value: number;
}

// --- Suomen kartta ---

/** Maantieteellinen piste: pituusaste (itä) ja leveysaste (pohjoinen) asteina. */
export interface GeoPoint {
  readonly lon: number;
  readonly lat: number;
}

export interface TownDef extends GeoPoint {
  readonly id: string;
  /** Paikkakunnan nimi perusmuodossa, esim. "Tampere". */
  readonly name: string;
  /** Nimi sisäpaikallissijassa, esim. "Tampereella" tai "Helsingissä". */
  readonly nameAt: string;
}

/** Järvi kuvataan yhtenä tai useampana ympyränä. */
export interface LakeDef {
  readonly name: string;
  readonly circles: readonly (GeoPoint & { readonly radiusKm: number })[];
}

export type TerrainId = 'sea' | 'lake' | 'field' | 'forest' | 'snow' | 'road';

export interface TerrainDef {
  readonly id: TerrainId;
  readonly sprite: string;
  /** Voiko ruudulla kävellä. Meri ja järvet estävät liikkumisen. */
  readonly walkable: boolean;
}

/** Leveysastevyöhyke, joka määrää maaston: etelässä peltoa, pohjoisessa lunta. */
export interface TerrainBand {
  /** Vyöhyke on voimassa tätä leveysastetta etelämpänä. */
  readonly untilLat: number;
  readonly main: TerrainId;
  /** Toinen maasto, jota on sekaisin pääasiallisen kanssa. */
  readonly mix: TerrainId;
  /** Kuinka suuri osa ruuduista on toista maastoa (0..1). */
  readonly mixShare: number;
}

/** Kartan mittakaava ja rajat. Kartta piirretään tasakulmaisella projektiolla. */
export interface MapProjection {
  readonly west: number;
  readonly east: number;
  readonly north: number;
  readonly south: number;
  /** Kuinka monta kilometriä yksi ruutu on. */
  readonly kmPerTile: number;
  /** Leveysaste, jonka mukaan pituusasteet muutetaan kilometreiksi. */
  readonly referenceLat: number;
}

export interface WorldDef {
  readonly projection: MapProjection;
  readonly border: readonly GeoPoint[];
  readonly lakes: readonly LakeDef[];
  readonly bands: readonly TerrainBand[];
  readonly towns: readonly TownDef[];
  /** Tiet paikkakuntien välillä tunnistepareina. */
  readonly roads: readonly (readonly [string, string])[];
  /** Paikkakunta, josta seikkailu alkaa. */
  readonly startTown: string;
}

/** Kartalla kulkeva vihollinen. */
export interface MapEnemyDef extends GeoPoint {
  readonly enemy: string;
}

/** Väijytys: tietyssä maastossa kulkiessa vihollinen voi hyökätä yllättäen. */
export interface AmbushRule {
  readonly terrain: TerrainId;
  /** Viholliset, joista hyökkääjä arvotaan. */
  readonly enemies: readonly string[];
  /** Todennäköisyys (0..1) jokaista uutta ruutua kohti, jolle pelaaja astuu. */
  readonly chancePerTile: number;
}

// --- Säännöt ---

export interface BattleRules {
  /** Satunnaisvaihtelu vahingossa, esim. 0.2 = ±20 %. */
  readonly damageVariance: number;
  /** Todennäköisyys (0..1), jolla isku on kriittinen osuma. Vihollinen voi ylikirjoittaa. */
  readonly critChance: number;
  /** Kriittisen osuman vahinko kerrotaan tällä, esim. 2 = tuplavahinko. */
  readonly critMultiplier: number;
  /** Puolustaessa saatu vahinko kerrotaan tällä. */
  readonly defendMultiplier: number;
  readonly fleeChance: number;
}

export interface Progression {
  /** Kokemuspisteet, jotka tarvitaan kullekin tasolle. Ensimmäinen on taso 1 (0 KP). */
  readonly xpForLevel: readonly number[];
  /**
   * Kykypisteet, jotka pelaaja saa jokaisesta uudesta tasosta. Tämä on tason nousun
   * ainoa palkinto: arvot kasvavat vain, kun pelaaja jakaa pisteet (data/skills.ts).
   */
  readonly skillPointsPerLevel: number;
}

// --- Kykypisteet ---

/** Kyky, johon pelaaja voi laittaa kykypisteitä paikkakunnassa. */
export type SkillId = 'attack' | 'defense' | 'vitality';

/** Arvo, jota kyky kasvattaa. Elinvoima kasvattaa maksimielämää. */
export type SkillStat = 'attack' | 'defense' | 'maxHp';

export interface SkillDef {
  readonly id: SkillId;
  readonly stat: SkillStat;
  /** Paljonko arvo kasvaa jokaisesta kykyyn laitetusta pisteestä. */
  readonly perPoint: number;
}

/** Aaltomuoto koodilla tehdylle äänelle (pixelart-pelin "piippaukset"). */
export type SoundWave = 'square' | 'triangle' | 'sawtooth' | 'sine';

/** Yksi sävel: taajuus (Hz), kesto ja valinnainen liuku toiseen taajuuteen. */
export interface SoundNote {
  readonly freq: number;
  readonly ms: number;
  readonly slideTo?: number;
}

/** Koodilla tehty ääniefekti: sävelet soitetaan peräkkäin. */
export interface SoundDef {
  readonly wave: SoundWave;
  /** Äänen voimakkuus 0..1 ennen pelaajan äänenvoimakkuusasetusta. */
  readonly gain: number;
  readonly notes: readonly SoundNote[];
}
