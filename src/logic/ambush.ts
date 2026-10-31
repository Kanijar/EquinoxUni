import { AMBUSHES, AMBUSH_SAFE_TILES } from '../data/ambushes';
import type { AmbushRule, TerrainId } from '../data/types';
import type { Rng } from './battle';
import type { Vec2 } from './vector';

// Väijytykset kartalla: aina kun pelaaja astuu uuteen ruutuun, arvotaan,
// hyökkääkö maaston vihollinen (esim. ryöstäjä metsässä). Puhdasta logiikkaa.

export interface AmbushTracker {
  /** Ruutu, jolla pelaaja oli viimeksi. Samalla ruudulla ei arvota uudelleen. */
  lastTile: Vec2 | null;
  /** Kuinka monta uutta ruutua vielä ennen kuin väijytys on mahdollinen. */
  safeTilesLeft: number;
}

/** Ruutu, jolle pelaaja astui. */
export interface SteppedTile {
  readonly tile: Vec2;
  readonly terrain: TerrainId;
  /** Paikkakunnissa ei väijytetä. */
  readonly inTown: boolean;
}

export function createAmbushTracker(safeTiles: number = AMBUSH_SAFE_TILES): AmbushTracker {
  return { lastTile: null, safeTilesLeft: safeTiles };
}

/**
 * Kutsutaan joka ruudunpäivityksellä. Palauttaa hyökkäävän vihollisen tunnisteen,
 * kun väijytys osuu, muuten null.
 */
export function checkAmbush(
  tracker: AmbushTracker,
  step: SteppedTile,
  rng: Rng,
  rules: readonly AmbushRule[] = AMBUSHES,
): string | null {
  const last = tracker.lastTile;
  if (last && last.x === step.tile.x && last.y === step.tile.y) {
    return null;
  }
  tracker.lastTile = step.tile;
  if (tracker.safeTilesLeft > 0) {
    tracker.safeTilesLeft--;
    return null;
  }
  const rule = rules.find((r) => r.terrain === step.terrain);
  if (step.inTown || !rule || rng() >= rule.chancePerTile) {
    return null;
  }
  const index = Math.min(rule.enemies.length - 1, Math.floor(rng() * rule.enemies.length));
  return rule.enemies[index] ?? null;
}
