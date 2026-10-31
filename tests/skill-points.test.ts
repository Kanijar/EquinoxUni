import { describe, expect, it } from 'vitest';
import { getEnemy } from '../src/data';
import { PROGRESSION } from '../src/data/rules';
import { SKILLS } from '../src/data/skills';
import type { CombatStats, SkillDef } from '../src/data/types';
import {
  createNewGame,
  grantVictory,
  playerStats,
  spendSkillPoint,
  unspentSkillPoints,
} from '../src/logic/game-state';
import {
  applySkillPoints,
  getSkill,
  noSkillPoints,
  skillPointsEarned,
  skillPointsLeft,
} from '../src/logic/skill-points';

const base: CombatStats = { maxHp: 20, attack: 5, defense: 1, speed: 50 };
const skills: readonly SkillDef[] = [
  { id: 'attack', stat: 'attack', perPoint: 2 },
  { id: 'defense', stat: 'defense', perPoint: 1 },
  { id: 'vitality', stat: 'maxHp', perPoint: 4 },
];
const perLevel = PROGRESSION.skillPointsPerLevel;

/** Uusi peli, jossa pelaaja on noussut tasolle 2 (KP tason 2 rajalla). */
function gameAtLevel2() {
  const state = createNewGame();
  state.xp = PROGRESSION.xpForLevel[1] ?? 0;
  return state;
}

describe('kykypisteet', () => {
  it('jokaisesta uudesta tasosta saa pisteitä, tasolla 1 ei yhtään', () => {
    expect(perLevel).toBe(3);
    expect(skillPointsEarned(1)).toBe(0);
    expect(skillPointsEarned(2)).toBe(3);
    expect(skillPointsEarned(5)).toBe(12);
  });

  it('käyttämättömät pisteet = saadut - käytetyt, ei koskaan alle nollan', () => {
    expect(skillPointsLeft(3, { attack: 2, defense: 1, vitality: 0 })).toBe(3);
    expect(skillPointsLeft(1, { attack: 2, defense: 0, vitality: 0 })).toBe(0);
  });

  it('pisteet kasvattavat oikeaa arvoa datan mukaan', () => {
    const stats = applySkillPoints(base, { attack: 1, defense: 2, vitality: 3 }, skills);
    expect(stats).toEqual({ maxHp: 32, attack: 7, defense: 3, speed: 50 });
    expect(applySkillPoints(base, noSkillPoints(), skills)).toEqual(base);
  });

  it('kaikilla kolmella kyvyllä on dataa ja positiivinen arvo', () => {
    for (const id of ['attack', 'defense', 'vitality'] as const) {
      expect(getSkill(id).perPoint).toBeGreaterThan(0);
    }
    expect(SKILLS).toHaveLength(3);
    expect(getSkill('vitality').stat).toBe('maxHp');
  });
});

describe('kykypisteiden käyttö pelissä', () => {
  it('uudessa pelissä ei ole kykypisteitä', () => {
    const state = createNewGame();
    expect(unspentSkillPoints(state)).toBe(0);
    expect(spendSkillPoint(state, 'attack')).toBe(false);
    expect(state.skills.attack).toBe(0);
  });

  it('tason nousu antaa 3 pistettä, jotka säilyvät kunnes ne käytetään', () => {
    const state = createNewGame();
    const reward = grantVictory(state, 0, getEnemy('hiisi'));
    expect(reward.leveledUp).toBe(true);
    expect(reward.skillPoints).toBe(perLevel);
    expect(unspentSkillPoints(state)).toBe(perLevel);
    grantVictory(state, 1, getEnemy('slime'));
    expect(unspentSkillPoints(state)).toBe(perLevel);
  });

  it('voitto ilman tason nousua ei anna kykypisteitä', () => {
    const state = createNewGame();
    expect(grantVictory(state, 0, getEnemy('slime')).skillPoints).toBe(0);
  });

  it('hyökkäykseen ja puolustukseen laitettu piste nostaa arvoa', () => {
    const state = gameAtLevel2();
    const before = playerStats(state);
    expect(spendSkillPoint(state, 'attack')).toBe(true);
    expect(spendSkillPoint(state, 'defense')).toBe(true);
    const after = playerStats(state);
    expect(after.attack).toBe(before.attack + getSkill('attack').perPoint);
    expect(after.defense).toBe(before.defense + getSkill('defense').perPoint);
    expect(unspentSkillPoints(state)).toBe(perLevel - 2);
  });

  it('elinvoima nostaa maksimielämää ja nykyistä elämää', () => {
    const state = gameAtLevel2();
    const maxBefore = playerStats(state).maxHp;
    state.hp = 10;
    spendSkillPoint(state, 'vitality');
    const gain = getSkill('vitality').perPoint;
    expect(playerStats(state).maxHp).toBe(maxBefore + gain);
    expect(state.hp).toBe(10 + gain);
  });

  it('pisteitä ei voi käyttää enempää kuin on saanut', () => {
    const state = gameAtLevel2();
    for (let i = 0; i < perLevel; i++) {
      expect(spendSkillPoint(state, 'vitality')).toBe(true);
    }
    expect(spendSkillPoint(state, 'attack')).toBe(false);
    expect(state.skills).toEqual({ attack: 0, defense: 0, vitality: perLevel });
    expect(unspentSkillPoints(state)).toBe(0);
  });
});
