import { VOLCANO_STAIRS } from '../data/volcano-stairs';
import type { MapPoint, StairsDef, TerrainId } from '../data/types';
import type { WorldGrid } from './world-grid';

// Rappuset tulivuoren kraatteriin Ossi Ketolan luo (data/volcano-stairs.ts). Jokainen voitettu
// lohikäärme nostaa laavasta yhden askelman lisää. Askelmat ovat pelin tilassa laskurina
// (GameState.stairSteps), ja kartta piirretään niiden mukaan (withStairs).

/** Rappusiin liittyvä osa pelin tilasta (GameState, logic/game-state.ts). */
export interface StairsProgress {
  /** Montako askelmaa on noussut laavasta (0..askelmien määrä). */
  stairSteps: number;
}

/** Mitä voitto kertoo rappusista: uusi askelma nousi, tai rappuset valmistuivat. */
export type StairsNews =
  | { readonly kind: 'step'; readonly count: number; readonly needed: number }
  | { readonly kind: 'complete' };

/** Ovatko rappuset valmiit (kaikki askelmat noussut). */
export function areStairsComplete(state: StairsProgress, def: StairsDef = VOLCANO_STAIRS): boolean {
  return state.stairSteps >= def.steps.length;
}

/**
 * Kirjaa voiton rappusten kannalta. Palauttaa uutisen, tai null, jos voitto ei tuonut askelmaa
 * (muu vihollinen, tai rappuset ovat jo valmiit).
 */
export function recordStairsVictory(
  state: StairsProgress,
  enemyId: string,
  def: StairsDef = VOLCANO_STAIRS,
): StairsNews | null {
  if (enemyId !== def.enemy || areStairsComplete(state, def)) {
    return null;
  }
  state.stairSteps += 1;
  if (areStairsComplete(state, def)) {
    return { kind: 'complete' };
  }
  return { kind: 'step', count: state.stairSteps, needed: def.steps.length };
}

/** Askelmat, jotka ovat jo nousseet laavasta (ensimmäiset `steps` kappaletta). */
export function risenSteps(steps: number, def: StairsDef = VOLCANO_STAIRS): readonly MapPoint[] {
  return def.steps.slice(0, Math.max(0, steps));
}

/**
 * Kartta, jossa nousseet askelmat ovat kävelykelpoista maastoa. Alkuperäinen kartta ei muutu:
 * vain askelmien rivit kopioidaan.
 */
export function withStairs(
  grid: WorldGrid,
  steps: number,
  def: StairsDef = VOLCANO_STAIRS,
): WorldGrid {
  const cells: (readonly TerrainId[])[] = [...grid.cells];
  for (const tile of risenSteps(steps, def)) {
    const row = cells[tile.y];
    if (row && tile.x >= 0 && tile.x < row.length) {
      const copy = [...row];
      copy[tile.x] = def.terrain;
      cells[tile.y] = copy;
    }
  }
  return { ...grid, cells };
}

/** Tallennuksesta luettu askelmien määrä. Puuttuva tai virheellinen = 0, enintään kaikki. */
export function readStairSteps(value: unknown, def: StairsDef = VOLCANO_STAIRS): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    return 0;
  }
  return Math.min(value, def.steps.length);
}
