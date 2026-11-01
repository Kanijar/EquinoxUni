import { PROGRESSION } from '../data/rules';
import type { Progression } from '../data/types';

// Kokemustasot: kokemuspisteistä (KP) lasketaan taso. Taso ei itse nosta arvoja,
// vaan jokaisesta uudesta tasosta saa kykypisteitä (skill-points.ts).

/** Taso (1, 2, 3...) annetuilla kokemuspisteillä. */
export function levelForXp(xp: number, progression: Progression = PROGRESSION): number {
  let level = 0;
  for (const needed of progression.xpForLevel) {
    if (xp >= needed) {
      level++;
    }
  }
  return Math.max(1, level);
}

/** Kokemuspisteet, jotka tarvitaan tasolle (taso rajataan välille 1 – suurin taso). */
export function minXpForLevel(level: number, progression: Progression = PROGRESSION): number {
  const table = progression.xpForLevel;
  const index = Math.min(Math.max(Math.floor(level), 1), table.length) - 1;
  return table[index] ?? 0;
}

/** Kuinka monta KP:tä puuttuu seuraavasta tasosta, tai null jos taso on jo suurin. */
export function xpToNextLevel(xp: number, progression: Progression = PROGRESSION): number | null {
  const next = progression.xpForLevel[levelForXp(xp, progression)];
  return next === undefined ? null : next - xp;
}

export interface XpProgress {
  readonly level: number;
  readonly xp: number;
  /** Seuraavan tason KP-raja, tai null jos taso on jo suurin. */
  readonly nextLevelXp: number | null;
  /** Kuinka pitkällä nykyinen taso on: 0 = juuri noustu, 1 = seuraava taso heti. */
  readonly fraction: number;
}

/** Edistyminen kohti seuraavaa tasoa, esim. KP-palkkia varten. */
export function xpProgress(xp: number, progression: Progression = PROGRESSION): XpProgress {
  const level = levelForXp(xp, progression);
  const start = progression.xpForLevel[level - 1] ?? 0;
  const next = progression.xpForLevel[level];
  if (next === undefined) {
    return { level, xp, nextLevelXp: null, fraction: 1 };
  }
  return { level, xp, nextLevelXp: next, fraction: (xp - start) / (next - start) };
}
