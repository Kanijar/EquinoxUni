import { PLAYER } from '../data/player';
import { PROGRESSION } from '../data/rules';
import type { CombatStats, Progression } from '../data/types';

// Kokemustasot: kokemuspisteistä (KP) lasketaan taso ja tasosta pelaajan arvot.

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

/** Kuinka monta KP:tä puuttuu seuraavasta tasosta, tai null jos taso on jo suurin. */
export function xpToNextLevel(xp: number, progression: Progression = PROGRESSION): number | null {
  const next = progression.xpForLevel[levelForXp(xp, progression)];
  return next === undefined ? null : next - xp;
}

/** Pelaajan arvot annetulla tasolla. */
export function statsForLevel(
  level: number,
  base: CombatStats = PLAYER.stats,
  progression: Progression = PROGRESSION,
): CombatStats {
  const ups = Math.max(0, level - 1);
  return {
    ...base,
    maxHp: base.maxHp + ups * progression.perLevel.maxHp,
    attack: base.attack + ups * progression.perLevel.attack,
    defense: base.defense + ups * progression.perLevel.defense,
  };
}
