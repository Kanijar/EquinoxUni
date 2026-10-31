import type { BattleRules, MagicRules, Progression } from './types';

// Taistelun ja kokemustasojen säännöt. Muuta näitä, kun haluat pelistä
// helpomman tai vaikeamman.

export const BATTLE_RULES: BattleRules = {
  damageVariance: 0.2,
  critChance: 0.08,
  critMultiplier: 2,
  defendMultiplier: 0.5,
  fleeChance: 0.6,
};

/** Palava vihollinen menettää elämää kerran sekunnissa (data/spells.ts). */
export const MAGIC_RULES: MagicRules = {
  burnTickMs: 1000,
};

export const PROGRESSION: Progression = {
  xpForLevel: [0, 12, 30, 55, 90, 140, 200, 280, 380, 500],
  skillPointsPerLevel: 3,
};
