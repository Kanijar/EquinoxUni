import type { TerrainId } from './types-world';

// Kalastuksen tyypit. Säännöt, onget ja syötit: data/fishing.ts, logiikka: logic/fishing.ts.

/**
 * Yksi mahdollinen saalis. weight kertoo, kuinka usein saalis tulee muihin verrattuna
 * (esim. 50 ja 10: ensimmäinen viisi kertaa useammin). Joko esine tai vihollinen.
 * rare = harvinainen saalis: parempi onki kertoo sen painon (RodDef.rareMultiplier).
 */
export type FishingCatchDef =
  | {
      readonly kind: 'item';
      readonly item: string;
      readonly weight: number;
      readonly rare?: boolean;
    }
  | {
      readonly kind: 'enemy';
      readonly enemy: string;
      readonly weight: number;
      readonly rare?: boolean;
    };

/** Onki: esine (data/fishing-items.ts) ja sen ominaisuudet. Sankari käyttää parasta onkeaan. */
export interface RodDef {
  readonly item: string;
  /** Kuinka kauan (ms) on aikaa nykäistä, kun kala nappaa. */
  readonly biteWindowMs: number;
  /** Odotusaika kerrotaan tällä (0.7 = kala nappaa 30 % nopeammin). */
  readonly biteDelayFactor: number;
  /** Harvinaisten saaliiden (rare) painot kerrotaan tällä. */
  readonly rareMultiplier: number;
}

/** Syötti: esine (data/fishing-items.ts) ja saaliit, joita sillä voi saada. */
export interface BaitDef {
  readonly item: string;
  /** Saaliit tällä syötillä. Varustetta, joka pelaajalla jo on, ei saa toista kertaa. */
  readonly catches: readonly FishingCatchDef[];
}

export interface FishingRules {
  /** Maastot, joissa kalastetaan (meri ja järvet). */
  readonly waterTerrains: readonly TerrainId[];
  /** Kuinka monen ruudun päästä vedestä voi kalastaa (1 = vieressä, myös vinottain). */
  readonly reachTiles: number;
  /** Kala nappaa satunnaisen ajan kuluttua heittämisestä (ms, ennen ongen kerrointa). */
  readonly biteDelayMs: { readonly min: number; readonly max: number };
  /** Onget huonoimmasta parhaaseen. Sankari käyttää parasta, joka hänellä on. */
  readonly rods: readonly RodDef[];
  /**
   * Syötit. Pelaaja valitsee syötin repussa (SYÖTIKSI). Jos valittua ei ole, käytetään
   * ensimmäistä tämän listan syöttiä, jota repussa on.
   */
  readonly baits: readonly BaitDef[];
}
