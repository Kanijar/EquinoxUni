import type { TerrainId } from './types-world';

// Kalastuksen tyypit. Säännöt ja saaliit: data/fishing.ts, logiikka: logic/fishing.ts.

/**
 * Yksi mahdollinen saalis. weight kertoo, kuinka usein saalis tulee muihin verrattuna
 * (esim. 50 ja 10: ensimmäinen viisi kertaa useammin). Joko esine tai vihollinen.
 */
export type FishingCatchDef =
  | { readonly kind: 'item'; readonly item: string; readonly weight: number }
  | { readonly kind: 'enemy'; readonly enemy: string; readonly weight: number };

export interface FishingRules {
  /** Onki (esine, data/items.ts): ilman sitä ei voi kalastaa. */
  readonly rodItem: string;
  /** Syötti (madot): yksi kuluu joka kerta, kun kala nappaa. */
  readonly baitItem: string;
  /** Maastot, joissa kalastetaan (meri ja järvet). */
  readonly waterTerrains: readonly TerrainId[];
  /** Kuinka monen ruudun päästä vedestä voi kalastaa (1 = vieressä, myös vinottain). */
  readonly reachTiles: number;
  /** Kala nappaa satunnaisen ajan kuluttua heittämisestä (ms). */
  readonly biteDelayMs: { readonly min: number; readonly max: number };
  /** Kuinka kauan (ms) pelaajalla on aikaa nykäistä, kun kala nappaa. */
  readonly biteWindowMs: number;
  /** Saaliit. Varustetta, joka pelaajalla jo on, ei saa toista kertaa. */
  readonly catches: readonly FishingCatchDef[];
}
