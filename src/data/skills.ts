import type { SkillDef } from './types';

// Kyvyt, joihin pelaaja laittaa tasojen nousuista saamansa kykypisteet paikkakunnassa.
// Kykyjen nimet ovat i18n/fi.ts:ssä (TEXT.skills.names). Pisteiden määrä tasoa kohti
// on data/rules.ts:ssä (PROGRESSION.skillPointsPerLevel).

export const SKILLS: readonly SkillDef[] = [
  { id: 'attack', stat: 'attack', perPoint: 1 },
  { id: 'defense', stat: 'defense', perPoint: 1 },
  { id: 'vitality', stat: 'maxHp', perPoint: 5 },
];
