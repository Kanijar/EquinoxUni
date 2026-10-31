import { BACKDROP_BY_TERRAIN, BATTLE_BACKDROPS, DEFAULT_BACKDROP } from '../data/battle-backdrops';
import type { BattleBackdropDef, EnemyDef, TerrainId } from '../data/types';
import { tileNoise } from './world-grid';

// Taistelunäkymän ulkoasun säännöt, jotka voi testata ilman Phaseria:
// mikä tausta valitaan, minkä värinen elämäpalkki on ja missä järjestyksessä
// siirtymäefektin pikseliruudut ilmestyvät.

/** Taistelun tausta maaston mukaan. Tuntematon maasto → oletustausta. */
export function backdropForTerrain(terrain: TerrainId | undefined): BattleBackdropDef {
  const id = terrain === undefined ? DEFAULT_BACKDROP : BACKDROP_BY_TERRAIN[terrain];
  return BATTLE_BACKDROPS[id] ?? BATTLE_BACKDROPS[DEFAULT_BACKDROP];
}

/** Taistelun tausta: vihollisen oma tausta (esim. loppuboss), muuten maaston mukaan. */
export function backdropForBattle(
  terrain: TerrainId | undefined,
  enemy: Pick<EnemyDef, 'backdrop'>,
): BattleBackdropDef {
  return enemy.backdrop ? BATTLE_BACKDROPS[enemy.backdrop] : backdropForTerrain(terrain);
}

export type HpTier = 'high' | 'mid' | 'low';

/** Rajat elämän osuudelle: yli high = vihreä, yli mid = keltainen, muuten punainen. */
export interface HpTierLimits {
  readonly high: number;
  readonly mid: number;
}

/** Elämäpalkin värikategoria elämän osuudesta (0..1). */
export function hpTier(fraction: number, limits: HpTierLimits): HpTier {
  if (fraction > limits.high) {
    return 'high';
  }
  return fraction > limits.mid ? 'mid' : 'low';
}

/** Kuinka paljon satunnaisuutta siirtymän vinoon pyyhkäisyyn sekoitetaan (0..1). */
const WIPE_JITTER = 0.25;
/** Pyyhkäisy etenee vasemmalta oikealle enemmän kuin ylhäältä alas. */
const WIPE_X_WEIGHT = 0.65;

/**
 * Siirtymäefektin ruutujen järjestys: jokaiselle ruudulle (rivi kerrallaan) luku 0..1,
 * joka kertoo, missä vaiheessa ruutu ilmestyy. Pyyhkäisy kulkee vinosti vasemmasta
 * yläkulmasta oikeaan alakulmaan, ja reunat ovat rosoiset kuin pikseleissä.
 */
export function wipeOrder(cols: number, rows: number): number[] {
  const order: number[] = [];
  const spanX = Math.max(1, cols - 1);
  const spanY = Math.max(1, rows - 1);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const sweep = (x / spanX) * WIPE_X_WEIGHT + (y / spanY) * (1 - WIPE_X_WEIGHT);
      order.push(sweep * (1 - WIPE_JITTER) + tileNoise(x, y) * WIPE_JITTER);
    }
  }
  return order;
}
