import type { BattleBackdropId } from './types-battle-look';
import type { SpellId } from './types-magic';
import type { MapPoint, TerrainId } from './types-world';

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

/** Pelaajan arvot: taistelun perusarvojen lisäksi tarkkuus ja taikavoima. */
export interface PlayerStats extends CombatStats {
  /** Kriittisen osuman todennäköisyys prosentteina, esim. 8 = 8 %. */
  readonly critPercent: number;
  /** Tulivoima: kasvattaa tulipallon vahinkoa ja palamisaikaa (data/spells.ts). */
  readonly magic: number;
}

export interface ItemStack {
  readonly id: string;
  readonly count: number;
}

/** Sankarin silmien väri. Uusi väri: lisää tähän ja PLAYER.eyeColors-listaan (data/player.ts). */
export type EyeColor = 'yellow' | 'black';

export interface PlayerDef {
  /** Sankarin nimi, jos pelaaja ei kirjoita omaa nimeä hahmonluonnissa. */
  readonly name: string;
  /** Pelaajan oman nimen enimmäispituus merkkeinä (hahmonluonti). */
  readonly nameMaxLength: number;
  /** Silmien väri pelin alussa. */
  readonly eyeColor: EyeColor;
  /** Kunkin silmien värin väri spritessä (#rrggbb). */
  readonly eyeColors: Readonly<Record<EyeColor, string>>;
  /** Arvot pelin alussa. Kasvavat vain kykypisteillä (data/skills.ts). */
  readonly stats: PlayerStats;
  /** Loitsu, joka on HYÖKKÄÄ-valikon TULIPALLO-napissa (data/spells.ts). */
  readonly spell: SpellId;
  /** Esineet, jotka pelaajalla on pelin alussa. */
  readonly startItems: readonly ItemStack[];
  /** Kolikot pelin alussa (kauppias, data/merchant.ts). */
  readonly startCoins: number;
}

/** Sankarin värit, jotka pelaaja valitsee hahmonluonnissa (data/hero-looks.ts). */
export type LookColorPart = 'skin' | 'hairColor' | 'shirt' | 'pants';
/** Kaikki valittavat ulkonäön osat: värit ja hiustyyli. */
export type LookPart = LookColorPart | 'hairStyle';
/** Valittu ulkonäkö: kunkin osan vaihtoehdon järjestysnumero HERO_LOOKS-listoissa (0 = ensimmäinen). */
export type HeroLook = Readonly<Record<LookPart, number>>;

/** Hiustyyli: sankarin spriten ylimmät rivit korvataan näillä (merkit kuten HERO_LOOKS.baseRows). */
export interface HairStyleDef {
  readonly id: string;
  readonly rows: readonly string[];
}

export interface HeroLookOptions {
  /** Sankarin muoto. h hiukset, c lippis, s iho, e silmät, b paita, l housut, k kengät. */
  readonly baseRows: readonly string[];
  readonly hairStyles: readonly HairStyleDef[];
  /** Valittavat värit (#rrggbb) osittain. Ensimmäinen on oletus. */
  readonly colors: Readonly<Record<LookColorPart, readonly string[]>>;
  readonly bootColor: string;
  /** Osien järjestys hahmonluonnissa ylhäältä alas. */
  readonly parts: readonly LookPart[];
}

export interface EnemyDef {
  readonly id: string;
  /** Suomenkielinen nimi, näytetään pelaajalle. Englanniksi i18n/en-content.ts. */
  readonly name: string;
  readonly sprite: string;
  readonly stats: CombatStats;
  /** Etäisyys pikseleinä, jolta vihollinen huomaa pelaajan kartalla ja lähtee perään. */
  readonly aggroRange: number;
  /** Kokemuspisteet voitosta. */
  readonly xp: number;
  /** Esineet, joita vihollinen voi pudottaa kaatuessaan (valinnainen, ks. DropDef). */
  readonly drops?: readonly DropDef[];
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
  /**
   * Oma palautusaika millisekunteina (valinnainen): kuinka kauan voitettu vihollinen on poissa
   * kartalta. Jos puuttuu, käytetään yhteistä arvoa RESPAWN_RULES.delayMs (data/rules.ts).
   */
  readonly respawnMs?: number;
  /** Erikoisliikkeet (valinnainen, esim. loppuboss). Puuttuu = vihollinen vain lyö. */
  readonly moves?: EnemyMovesDef;
  /** Oma taistelutausta (valinnainen). Puuttuu = tausta maaston mukaan. */
  readonly backdrop?: BattleBackdropId;
}

/**
 * Vihollisen erikoisliikkeet (logic/enemy-turn.ts). Joka vuoro vihollinen arpoo:
 * voimaiskun valmistelu, erikoisliike tai tavallinen lyönti.
 */
export interface EnemyMovesDef {
  /**
   * Todennäköisyys (0..1), jolla vihollinen alkaa valmistella voimaiskua. Valmisteluvuorolla
   * se ei lyö, mutta seuraavalla vuorolla isku on kova. PUOLUSTA puolittaa sen.
   */
  readonly chargeChance: number;
  /** Voimaiskun vahinko kerrotaan tällä (tavalliseen lyöntiin verrattuna). */
  readonly chargeMultiplier: number;
  /** Todennäköisyys (0..1) erikoisliikkeelle (lumimyrsky). */
  readonly specialChance: number;
  /**
   * Lumimyrskyn vahinko. Puolustus-arvo ei auta (PUOLUSTA puolittaa), ja myrsky
   * sammuttaa tulipallon liekit.
   */
  readonly specialPower: number;
}

/**
 * Loppuboss (data/boss.ts). Boss herää kartalle, kun pelaaja on voittanut tarpeeksi
 * monta kertaa tietyn vihollisen. Voitettu boss ei palaa.
 */
export interface BossDef extends MapPoint {
  /** Bossin vihollistunniste (data/enemies.ts). Boss ei ole MAP_ENEMIES-listassa. */
  readonly enemy: string;
  /** Vihollinen, jonka voittaminen herättää bossin (esim. tunturipeikko). */
  readonly unlockEnemy: string;
  /** Kuinka monta voittoa unlockEnemystä tarvitaan. */
  readonly unlockCount: number;
}

/** Pudotus: esine, jonka vihollinen voi jättää jälkeensä kaatuessaan. */
export interface DropDef {
  /** Esineen tunniste (data/items.ts). */
  readonly item: string;
  /** Todennäköisyys 0..1, esim. 0.4 = 40 %. 1 = putoaa aina. */
  readonly chance: number;
  /**
   * Tehtävä (data/quests.ts), jota varten esine putoaa (valinnainen). Silloin esine putoaa
   * vain, kun tehtävä on kesken ja esineitä tarvitaan vielä lisää.
   */
  readonly quest?: string;
}

/**
 * Esineen tyyppi: parannusjuoma (juodaan taistelussa tai repusta), varuste (laitetaan
 * käyttöön repussa, logic/equipment.ts), avain/tehtäväesine (tallessa repussa, esim. tuodaan
 * tehtävänantajalle, data/quests.ts), kulkuneuvo (kytketään päälle kartalla, logic/vehicle.ts)
 * tai voima (ostetaan kauppiaalta ja otetaan heti käyttöön, esim. kykypiste, logic/shop.ts).
 * Kalastus (data/fishing.ts): työkalu (onki, yksi riittää), syötti (madot, kuluvat) ja
 * ruoka (kala, syödään repusta elämän palauttamiseksi). Vene (logic/sailing.ts) vie merelle.
 * Loitsukirja (Noidan kauppa, data/cave.ts): opettaa loitsun, joka näkyy taistelussa.
 */
export type ItemKind =
  'heal' | 'gear' | 'key' | 'vehicle' | 'power' | 'tool' | 'bait' | 'food' | 'boat' | 'spell';

/** Varustepaikka: jokaisessa paikassa voi olla yksi varuste kerrallaan. */
export type GearSlot = 'hand' | 'body' | 'neck';

/**
 * Arvo, jota varuste kasvattaa. Samat arvot kuin kykypisteillä (SkillStat):
 * hyökkäys, puolustus, maksimielämä, tarkkuus (kriittinen osuma %) ja tulivoima.
 */
export type GearStat = SkillStat;

/** Varusteen tuomat lisäykset arvoihin, esim. { attack: 6 }. */
export type StatBonus = Partial<Record<GearStat, number>>;

interface ItemBase {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly sprite: string;
  /**
   * Hinta kolikkoina kulkevalla kauppiaalla (data/merchant.ts). Kauppias ostaa esineen
   * pienemmällä hinnalla (SHOP_RULES.sellFactor). Puuttuu = esinettä ei voi myydä.
   * Kun buyCount on annettu, price on yhden kappaleen hinta.
   */
  readonly price?: number;
  /** Montako kappaletta tulee yhdellä ostolla kauppiaalta (valinnainen, esim. 5 matoa). */
  readonly buyCount?: number;
  /** Kauppias myy esineen vasta tältä tasolta (valinnainen, esim. parempi onki). */
  readonly minLevel?: number;
}

export interface HealItemDef extends ItemBase {
  readonly kind: 'heal';
  /** Paljonko elämää juoma palauttaa. */
  readonly value: number;
}

export interface GearItemDef extends ItemBase {
  readonly kind: 'gear';
  readonly slot: GearSlot;
  readonly bonus: StatBonus;
}

export interface KeyItemDef extends ItemBase {
  readonly kind: 'key';
}

/** Kulkuneuvo (esim. Bugattin avaimet): kartalla päälle ja pois E-näppäimestä tai napista. */
export interface VehicleItemDef extends ItemBase {
  readonly kind: 'vehicle';
  /** Kävelynopeus kerrotaan tällä, kun kulkuneuvo on päällä (1.8 = 80 % nopeammin). */
  readonly speedMultiplier: number;
  /** Sankarin kuva kartalla, kun kulkuneuvo on päällä (data/sprites-characters.ts). */
  readonly mapSprite: string;
}

/**
 * Vene (esim. Purjevene, Venesataman venekaupasta): rannalla VENEESEEN-napista (tai V) vesille,
 * ja merellä MAIHIN-napista rantaan (logic/sailing.ts). Veneellä pääsee pienille saarille.
 */
export interface BoatItemDef extends ItemBase {
  readonly kind: 'boat';
  /** Nopeus merellä kerrotaan tällä (1.6 = 60 % nopeammin kuin kävellen). */
  readonly speedMultiplier: number;
  /** Sankari veneessä kartalla (data/sprites-isles.ts). */
  readonly mapSprite: string;
}

/**
 * Voima (esim. Voimakristalli): ostetaan kauppiaalta, ja se otetaan käyttöön heti
 * ostaessa. Se ei mene reppuun, joten sitä ei voi myydä.
 */
export interface PowerItemDef extends ItemBase {
  readonly kind: 'power';
  readonly price: number;
  /** Montako kykypistettä voima antaa (data/skills.ts). */
  readonly skillPoints: number;
  /** Paljonko hinta nousee jokaisesta jo ostetusta voimasta, ettei pisteitä saa loputtomasti. */
  readonly priceStep: number;
}

/** Työkalu (esim. onki, ominaisuudet data/fishing.ts): yksi riittää, kauppias ei myy toista. */
export interface ToolItemDef extends ItemBase {
  readonly kind: 'tool';
}

/** Syötti (esim. madot): valitaan repussa, ja yksi kuluu, kun kala nappaa (logic/fishing.ts). */
export interface BaitItemDef extends ItemBase {
  readonly kind: 'bait';
}

/** Ruoka (esim. kala): syödään repusta, palauttaa elämää. Ei käy taistelun JUOMA-nappiin. */
export interface FoodItemDef extends ItemBase {
  readonly kind: 'food';
  /** Paljonko elämää ruoka palauttaa. */
  readonly value: number;
}

/**
 * Loitsukirja (Noidan kaupasta, data/cave.ts): kun kirja on repussa, sankari osaa loitsun ja
 * voi käyttää sitä taistelussa (HYÖKKÄÄ → LOITSUT). Kauppiaat eivät osta loitsuja takaisin.
 */
export interface SpellItemDef extends ItemBase {
  readonly kind: 'spell';
  readonly price: number;
  /** Loitsu, jonka kirja opettaa (data/spells.ts). */
  readonly spell: SpellId;
}

export type ItemDef =
  | SpellItemDef
  | HealItemDef
  | GearItemDef
  | KeyItemDef
  | VehicleItemDef
  | BoatItemDef
  | PowerItemDef
  | ToolItemDef
  | BaitItemDef
  | FoodItemDef;

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

/** Alkuruudun salaisuus (pääsiäismuna), data/rules.ts. */
export interface MenuSecretRules {
  /**
   * Taso, jolta uusi peli alkaa, kun alkuruudun sutta on napautettu ennen PELAA-nappia.
   * Kokemuspisteet asetetaan tason rajaan, ja tasojen kykypisteet saa heti.
   */
  readonly wolfStartLevel: number;
  /** Esineet, jotka saa aloitusesineiden lisäksi (data/items.ts). */
  readonly bonusItems: readonly ItemStack[];
  /** Sprite, joksi alkuruudun susi muuttuu napautuksesta (hehkuvat silmät). */
  readonly spiritSprite: string;
  /** Silmien väri, joksi sankarin silmät muuttuvat, kun alkuruudun limaa napautetaan. */
  readonly slimeEyeColor: EyeColor;
}

/** Alkuruudun salainen burgeri (data/rules.ts BURGER_SECRET, logic/burger-secret.ts). */
export interface BurgerSecretRules {
  /** Paras varuste valitaan pisteillä: kunkin arvon lisäys kerrotaan tällä ja lasketaan yhteen. */
  readonly gearWeights: Readonly<Record<GearStat, number>>;
  /** Muut esineet, jotka burgeri antaa (yksi kutakin, ei toista kertaa). */
  readonly extraItems: readonly string[];
  /** Kultakolikot: jos kolikoita on vähemmän, määrä nostetaan tähän (ei kasva toistolla). */
  readonly coins: number;
}

export interface MagicRules {
  /**
   * Palamisen tahti millisekunteina: palava vihollinen menettää elämää näin usein.
   * Palaminen kulkee oikeassa ajassa, myös silloin kun pelaaja miettii seuraavaa siirtoa.
   */
  readonly burnTickMs: number;
}

/** Voitettujen karttavihollisten palaaminen kartalle. */
export interface RespawnRules {
  /** Kuinka kauan (ms karttapeliaikaa) voitettu vihollinen on poissa ennen kuin se palaa. */
  readonly delayMs: number;
  /**
   * Vihollinen palaa paikalleen vasta, kun pelaaja on vähintään näin kaukana (pikseleinä),
   * jottei se ilmesty suoraan pelaajan viereen.
   */
  readonly minPlayerDistancePx: number;
}

/**
 * Kaava, jolla tasojen KP-rajat lasketaan (data/level-curve.ts). Kun n = taso − 1:
 * KP-raja = cubic × n³ + quadratic × n² + linear × n, pyöristettynä kokonaisluvuksi.
 * Kuutiollinen osa tekee korkeista tasoista selvästi työläämpiä kuin alkupään tasoista.
 */
export interface LevelCurve {
  /** Suurin taso (huipputaso). */
  readonly maxLevel: number;
  readonly cubic: number;
  readonly quadratic: number;
  readonly linear: number;
}

export interface Progression {
  /**
   * Kokemuspisteet, jotka tarvitaan kullekin tasolle. Ensimmäinen on taso 1 (0 KP).
   * Pelissä tämä lasketaan kaavasta (LevelCurve), testeissä voi antaa oman listan.
   */
  readonly xpForLevel: readonly number[];
  /**
   * Kykypisteet, jotka pelaaja saa jokaisesta uudesta tasosta. Tämä on tason nousun
   * ainoa palkinto: arvot kasvavat vain, kun pelaaja jakaa pisteet (data/skills.ts).
   */
  readonly skillPointsPerLevel: number;
}

// --- Kykypisteet ---

/** Kyky, johon pelaaja voi laittaa kykypisteitä paikkakunnassa. */
export type SkillId = 'attack' | 'defense' | 'vitality' | 'precision' | 'magic';

/**
 * Arvo, jota kyky kasvattaa. Elinvoima kasvattaa maksimielämää, tarkkuus kriittisen
 * osuman todennäköisyyttä ja maagia tulivoimaa (tulipallo).
 */
export type SkillStat = 'attack' | 'defense' | 'maxHp' | 'critPercent' | 'magic';

export interface SkillDef {
  readonly id: SkillId;
  readonly stat: SkillStat;
  /** Paljonko arvo kasvaa jokaisesta kykyyn laitetusta pisteestä. */
  readonly perPoint: number;
  /** Arvon yläraja (valinnainen). Kun se on saavutettu, kykyyn ei voi laittaa pisteitä. */
  readonly max?: number;
}

// --- Maagia (data/types-magic.ts) ---

export type {
  BoltSpellDef,
  FireSpellDef,
  FreezeSpellDef,
  HealSpellDef,
  SpellDef,
  SpellId,
} from './types-magic';

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

// --- Taistelun ulkoasu (data/types-battle-look.ts) ---

export type {
  BattleBackdropDef,
  BattleBackdropId,
  BattleWeatherDef,
  ParticleBurstDef,
} from './types-battle-look';

// --- Saaren kartta (data/types-world.ts) ---

export type {
  CircleDef,
  HouseDef,
  IsleDef,
  LakeDef,
  MapEnemyDef,
  MapPoint,
  RockRule,
  StairsDef,
  TerrainDef,
  TerrainId,
  TerrainRegion,
  TerrainMix,
  TownDef,
  WorldDef,
} from './types-world';

// --- Tehtävät (data/types-quests.ts) ---

export type { NpcDef, QuestDef, QuestGoal, QuestRewardDef } from './types-quests';

// --- Kulkeva kauppias ja kolikot (data/types-shop.ts) ---

export type {
  CaveDef,
  CoinRules,
  MerchantDef,
  ShopKeeperDef,
  ShopRules,
  TownShopDef,
} from './types-shop';

// --- Kalastus (data/types-fishing.ts) ---

export type { BaitDef, FishingCatchDef, FishingRules, RodDef } from './types-fishing';
