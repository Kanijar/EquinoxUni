import { PROGRESSION } from '../data/rules';
import { SKILLS } from '../data/skills';
import type { CombatStats, Progression, SkillDef, SkillId } from '../data/types';

// Kykypisteet: jokaisesta uudesta tasosta saa pisteitä, jotka pelaaja jakaa
// paikkakunnassa hyökkäykseen, puolustukseen tai elinvoimaan (maksimielämä).
// Pelaajan tilaan tallennetaan vain käytetyt pisteet; käyttämättömät lasketaan tasosta.

/** Kuhunkin kykyyn käytetyt pisteet. */
export type SkillPoints = Record<SkillId, number>;

export function noSkillPoints(): SkillPoints {
  return { attack: 0, defense: 0, vitality: 0 };
}

export function getSkill(id: SkillId, skills: readonly SkillDef[] = SKILLS): SkillDef {
  const found = skills.find((skill) => skill.id === id);
  if (!found) {
    throw new Error(`Tuntematon kyky: "${id}"`);
  }
  return found;
}

/** Kaikki pisteet, jotka pelaaja on saanut tasolle level mennessä. Tasolla 1 ei ole pisteitä. */
export function skillPointsEarned(level: number, progression: Progression = PROGRESSION): number {
  return Math.max(0, level - 1) * progression.skillPointsPerLevel;
}

export function skillPointsSpent(spent: SkillPoints): number {
  return Object.values(spent).reduce((sum, points) => sum + points, 0);
}

/** Käyttämättömät pisteet. Ei koskaan negatiivinen. */
export function skillPointsLeft(level: number, spent: SkillPoints): number {
  return Math.max(0, skillPointsEarned(level) - skillPointsSpent(spent));
}

/** Arvot, joihin on lisätty kykypisteiden tuoma kasvu. */
export function applySkillPoints(
  stats: CombatStats,
  spent: SkillPoints,
  skills: readonly SkillDef[] = SKILLS,
): CombatStats {
  const result = { ...stats };
  for (const skill of skills) {
    result[skill.stat] += spent[skill.id] * skill.perPoint;
  }
  return result;
}
