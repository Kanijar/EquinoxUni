import { describe, expect, it } from 'vitest';
import { getEnemy } from '../src/data';
import { PROGRESSION } from '../src/data/rules';
import { SKILLS } from '../src/data/skills';
import type { PlayerStats, SkillDef } from '../src/data/types';
import {
  canSpendSkillPoint,
  createNewGame,
  grantVictory,
  playerFighter,
  playerStats,
  spendSkillPoint,
  unspentSkillPoints,
} from '../src/logic/game-state';
import {
  applySkillPoints,
  getSkill,
  isSkillMaxed,
  noSkillPoints,
  skillPointsEarned,
  skillPointsLeft,
} from '../src/logic/skill-points';

const base: PlayerStats = {
  maxHp: 20,
  attack: 5,
  defense: 1,
  speed: 50,
  critPercent: 8,
  magic: 0,
};
const skills: readonly SkillDef[] = [
  { id: 'attack', stat: 'attack', perPoint: 2 },
  { id: 'defense', stat: 'defense', perPoint: 1 },
  { id: 'vitality', stat: 'maxHp', perPoint: 4 },
  { id: 'precision', stat: 'critPercent', perPoint: 5, max: 20 },
  { id: 'magic', stat: 'magic', perPoint: 1 },
];
const points = (spent: Partial<ReturnType<typeof noSkillPoints>>) => ({
  ...noSkillPoints(),
  ...spent,
});
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
    expect(skillPointsLeft(3, points({ attack: 2, defense: 1 }))).toBe(3);
    expect(skillPointsLeft(1, points({ attack: 2 }))).toBe(0);
    expect(skillPointsLeft(3, points({ precision: 2, magic: 3 }))).toBe(1);
  });

  it('pisteet kasvattavat oikeaa arvoa datan mukaan', () => {
    const spent = points({ attack: 1, defense: 2, vitality: 3, precision: 1, magic: 2 });
    const stats = applySkillPoints(base, spent, skills);
    expect(stats).toEqual({
      maxHp: 32,
      attack: 7,
      defense: 3,
      speed: 50,
      critPercent: 13,
      magic: 2,
    });
    expect(applySkillPoints(base, noSkillPoints(), skills)).toEqual(base);
  });

  it('arvo ei nouse ylärajan yli, ja ylärajalla kyky on täynnä', () => {
    const stats = applySkillPoints(base, points({ precision: 5 }), skills);
    expect(stats.critPercent).toBe(20);
    expect(isSkillMaxed(getSkill('precision', skills), stats)).toBe(true);
    expect(isSkillMaxed(getSkill('precision', skills), base)).toBe(false);
    expect(isSkillMaxed(getSkill('magic', skills), { ...base, magic: 99 })).toBe(false);
  });

  it('kaikilla viidellä kyvyllä on dataa ja positiivinen arvo', () => {
    for (const id of ['attack', 'defense', 'vitality', 'precision', 'magic'] as const) {
      expect(getSkill(id).perPoint).toBeGreaterThan(0);
    }
    expect(SKILLS).toHaveLength(5);
    expect(getSkill('vitality').stat).toBe('maxHp');
    expect(getSkill('precision').stat).toBe('critPercent');
    expect(getSkill('magic').stat).toBe('magic');
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
    expect(state.skills).toEqual(points({ vitality: perLevel }));
    expect(unspentSkillPoints(state)).toBe(0);
  });

  it('tarkkuus nostaa kriittisen osuman mahdollisuutta taistelussa', () => {
    const state = gameAtLevel2();
    const before = playerFighter(state).critChance ?? 0;
    expect(spendSkillPoint(state, 'precision')).toBe(true);
    const gain = getSkill('precision').perPoint / 100;
    expect(playerFighter(state).critChance).toBeCloseTo(before + gain);
  });

  it('maagia nostaa tulivoimaa taistelussa', () => {
    const state = gameAtLevel2();
    expect(playerFighter(state).magic).toBe(0);
    spendSkillPoint(state, 'magic');
    spendSkillPoint(state, 'magic');
    expect(playerFighter(state).magic).toBe(2 * getSkill('magic').perPoint);
  });

  it('tarkkuuteen ei voi laittaa pisteitä ylärajan yli', () => {
    const state = createNewGame();
    state.xp = PROGRESSION.xpForLevel.at(-1) ?? 0;
    const max = getSkill('precision').max ?? 0;
    while (canSpendSkillPoint(state, 'precision')) {
      spendSkillPoint(state, 'precision');
    }
    expect(playerStats(state).critPercent).toBe(max);
    expect(unspentSkillPoints(state)).toBeGreaterThan(0);
    expect(spendSkillPoint(state, 'precision')).toBe(false);
    expect(canSpendSkillPoint(state, 'magic')).toBe(true);
  });
});
