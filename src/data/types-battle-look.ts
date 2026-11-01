// Taistelunäkymän ulkoasun tyypit: taustat ja hiukkasefektit (data/battle-backdrops.ts,
// data/battle-effects.ts). Erotettu tiedostosta types.ts, jotta tiedostot pysyvät pieninä.
// Muut tiedostot tuovat nämä tyypit tiedoston types.ts kautta.

/** Taistelun tausta. Valitaan maaston mukaan tai vihollisen omana taustana (EnemyDef.backdrop). */
export type BattleBackdropId =
  'field' | 'forest' | 'snow' | 'village' | 'summit' | 'beach' | 'swamp' | 'volcano';

/** Taustan sää: hiutaleet putoavat ylhäältä tai hiukkaset leijuvat ilmassa. */
export interface BattleWeatherDef {
  readonly kind: 'fall' | 'float';
  readonly colors: readonly number[];
  /** Kuinka monta hiukkasta on yhtä aikaa ruudulla (pidä pienenä puhelimen takia). */
  readonly count: number;
}

/**
 * Taistelun tausta pikselitaiteena. Värit ovat CSS-värejä ('#rrggbb'). Tausta piirretään
 * puolikkaalla resoluutiolla, joten yksi taustan pikseli on kaksi pelin pikseliä.
 */
export interface BattleBackdropDef {
  readonly id: BattleBackdropId;
  /** Taivaan värit ylhäältä horisonttiin. */
  readonly sky: readonly string[];
  readonly sun: {
    readonly x: number;
    readonly y: number;
    readonly radius: number;
    readonly color: string;
  };
  /** Kaukaiset kukkulat (peaks = terävät tunturit, cap = lumihuippujen väri). */
  readonly hills: {
    readonly color: string;
    readonly height: number;
    readonly peaks: boolean;
    readonly cap?: string;
  };
  /** Puurivi horisontissa: kuuset tai koivut. count = puiden määrä. */
  readonly trees: {
    readonly kind: 'pine' | 'birch';
    readonly color: string;
    readonly shade: string;
    readonly count: number;
  } | null;
  /** Punaiset mökit horisontissa (kylä). */
  readonly houses: number;
  /** Maan raidat horisontista alas. */
  readonly ground: readonly string[];
  /** Ruohotupsujen, kukkien tai kimalluksen värit maassa. */
  readonly speckles: readonly string[];
  /** Hiekkatie keskellä (kylätie), tai null. */
  readonly path: string | null;
  readonly weather: BattleWeatherDef | null;
  /** Revontulet taivaalla: verhojen värit (valinnainen, esim. loppubossin tunturin huippu). */
  readonly aurora?: readonly string[];
}

/** Hiukkasräjähdys (osuma, tulipallo, kuolema). Arvot pelin pikseleinä ja millisekunteina. */
export interface ParticleBurstDef {
  readonly count: number;
  readonly colors: readonly number[];
  readonly speed: { readonly min: number; readonly max: number };
  readonly lifeMs: number;
  /** Hiukkasen koko pikseleinä (neliö). */
  readonly size: number;
  /** Painovoima alaspäin (negatiivinen = hiukkaset nousevat). */
  readonly gravity: number;
  /** Suunta asteina (0 = oikea, -90 = ylös) ja hajonta. Puuttuu = joka suuntaan. */
  readonly angle?: { readonly min: number; readonly max: number };
}
