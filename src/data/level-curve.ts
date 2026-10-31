import type { LevelCurve } from './types';

// Tasojen KP-rajat lasketaan kaavasta, jottei 50 rajaa tarvitse kirjoittaa käsin.
// Kaavan kertoimet ovat data/rules.ts:ssä (LEVEL_CURVE).

/** KP-raja tasolle level (taso 1 = 0 KP). */
export function xpForLevel(level: number, curve: LevelCurve): number {
  const n = level - 1;
  return Math.round(curve.cubic * n ** 3 + curve.quadratic * n ** 2 + curve.linear * n);
}

/** Kaikkien tasojen KP-rajat tasosta 1 huipputasoon asti. */
export function buildXpTable(curve: LevelCurve): number[] {
  return Array.from({ length: curve.maxLevel }, (_, i) => xpForLevel(i + 1, curve));
}
