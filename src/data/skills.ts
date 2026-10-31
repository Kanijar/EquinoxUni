import type { SkillDef } from './types';

// Kyvyt, joihin pelaaja laittaa tasojen nousuista saamansa kykypisteet paikkakunnassa.
// Kykyjen nimet ovat i18n/fi.ts:ssä (TEXT.skills.names). Pisteiden määrä tasoa kohti
// on data/rules.ts:ssä (PROGRESSION.skillPointsPerLevel).
// Kykypistenäkymässä rivit ovat tässä järjestyksessä.

export const SKILLS: readonly SkillDef[] = [
  { id: 'attack', stat: 'attack', perPoint: 1 },
  { id: 'defense', stat: 'defense', perPoint: 1 },
  { id: 'vitality', stat: 'maxHp', perPoint: 5 },
  // Tarkkuus: +2 prosenttiyksikköä kriittiseen osumaan, enintään 40 %.
  { id: 'precision', stat: 'critPercent', perPoint: 2, max: 40 },
  // Maagia: tulivoima kasvattaa tulipallon osumaa, palamisaikaa ja polttovoimaa
  // (paljonko kasvaa, on data/spells.ts:ssä).
  { id: 'magic', stat: 'magic', perPoint: 1 },
];
