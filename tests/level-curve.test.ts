import { describe, expect, it } from 'vitest';
import { getEnemy } from '../src/data';
import { buildXpTable, xpForLevel } from '../src/data/level-curve';
import { LEVEL_CURVE, MENU_SECRET, PROGRESSION } from '../src/data/rules';
import type { EnemyDef, LevelCurve } from '../src/data/types';
import { TEXT } from '../src/i18n/text';
import {
  createNewGame,
  grantVictory,
  playerLevel,
  unspentSkillPoints,
} from '../src/logic/game-state';
import { levelForXp, xpProgress, xpToNextLevel } from '../src/logic/progression';
import { skillPointsEarned } from '../src/logic/skill-points';

// Tasot 1–50: KP-rajat lasketaan kaavasta (data/level-curve.ts, data/rules.ts LEVEL_CURVE).

/** Rajat ennen tasojen laajennusta (taso 10 oli huipputaso). Vanhat tallennukset käyttävät näitä. */
const OLD_XP_FOR_LEVEL = [0, 12, 30, 55, 90, 140, 200, 280, 380, 500];
const MAX_LEVEL = 50;
const TABLE = PROGRESSION.xpForLevel;
const MAX_XP = TABLE.at(-1) ?? 0;

/** Vihollinen, joka antaa juuri halutun määrän KP:tä. */
function enemyWithXp(xp: number): EnemyDef {
  return { ...getEnemy('troll'), xp };
}

describe('tasokaava', () => {
  it('kaava laskee rajat kertoimista', () => {
    const curve: LevelCurve = { maxLevel: 3, cubic: 1, quadratic: 2, linear: 3 };
    expect(xpForLevel(1, curve)).toBe(0);
    expect(xpForLevel(2, curve)).toBe(6);
    expect(buildXpTable(curve)).toEqual([0, 6, 22]);
  });

  it('tasoja on 50 ja jokainen raja on edellistä suurempi', () => {
    expect(LEVEL_CURVE.maxLevel).toBe(MAX_LEVEL);
    expect(TABLE).toHaveLength(MAX_LEVEL);
    expect(TABLE[0]).toBe(0);
    TABLE.forEach((xp, i) => {
      expect(Number.isInteger(xp)).toBe(true);
      if (i > 0) {
        expect(xp).toBeGreaterThan(TABLE[i - 1] ?? 0);
      }
    });
  });

  it('tasojen väli kasvaa, joten korkeat tasot ovat työläämpiä', () => {
    for (let i = 2; i < TABLE.length; i++) {
      const gap = (TABLE[i] ?? 0) - (TABLE[i - 1] ?? 0);
      const previousGap = (TABLE[i - 1] ?? 0) - (TABLE[i - 2] ?? 0);
      expect(gap).toBeGreaterThan(previousGap);
    }
    expect(MAX_XP).toBeGreaterThan(50 * (TABLE[9] ?? 0));
  });

  it('vanhan tallennuksen taso ei laske: tasot 1–10 eivät vaadi enempää kuin ennen', () => {
    OLD_XP_FOR_LEVEL.forEach((oldXp, i) => {
      expect(TABLE[i]).toBeLessThanOrEqual(oldXp);
      expect(levelForXp(oldXp)).toBeGreaterThanOrEqual(i + 1);
    });
  });

  it('suden salaisuus vie huipputasolle', () => {
    expect(MENU_SECRET.wolfStartLevel).toBe(MAX_LEVEL);
  });
});

describe('huipputaso 50', () => {
  it('huipputasolla seuraavaa rajaa ei ole ja KP-palkki on täynnä', () => {
    expect(levelForXp(MAX_XP)).toBe(MAX_LEVEL);
    expect(levelForXp(MAX_XP * 10)).toBe(MAX_LEVEL);
    expect(xpToNextLevel(MAX_XP)).toBeNull();
    expect(xpProgress(MAX_XP + 5)).toEqual({
      level: MAX_LEVEL,
      xp: MAX_XP + 5,
      nextLevelXp: null,
      fraction: 1,
    });
    expect(TEXT.hud.xp(MAX_XP, null)).toContain('huipputaso');
    expect(TEXT.hud.levelAndXp(MAX_LEVEL, MAX_XP, null)).toBe(`Huipputaso 50  KP ${MAX_XP}`);
    expect(TEXT.hud.levelAndXp(49, 100, MAX_XP)).toBe(`Taso 49  KP 100/${MAX_XP}`);
  });

  it('juuri ennen huipputasoa KP-palkki näyttää rajan', () => {
    expect(levelForXp(MAX_XP - 1)).toBe(MAX_LEVEL - 1);
    expect(xpToNextLevel(MAX_XP - 1)).toBe(1);
  });

  it('tasolla 50 on saatu 147 kykypistettä', () => {
    expect(skillPointsEarned(MAX_LEVEL)).toBe((MAX_LEVEL - 1) * PROGRESSION.skillPointsPerLevel);
    expect(skillPointsEarned(MAX_LEVEL)).toBe(147);
  });
});

describe('usean tason nousu kerralla', () => {
  it('iso KP-palkinto nostaa monta tasoa ja antaa kaikkien tasojen kykypisteet', () => {
    const state = createNewGame();
    const reward = grantVictory(state, null, enemyWithXp(TABLE[14] ?? 0));
    expect(reward.leveledUp).toBe(true);
    expect(reward.level).toBe(15);
    expect(reward.skillPoints).toBe(14 * PROGRESSION.skillPointsPerLevel);
    expect(playerLevel(state)).toBe(15);
    expect(unspentSkillPoints(state)).toBe(reward.skillPoints);
  });

  it('kykypisteet kertyvät oikein, kun tasoja noustaan useassa osassa', () => {
    const state = createNewGame(TABLE[9] ?? 0);
    const reward = grantVictory(state, null, enemyWithXp((TABLE[29] ?? 0) - state.xp));
    expect(reward.level).toBe(30);
    expect(reward.skillPoints).toBe(20 * PROGRESSION.skillPointsPerLevel);
    expect(unspentSkillPoints(state)).toBe(29 * PROGRESSION.skillPointsPerLevel);
  });

  it('taso ei nouse huipputason yli, vaikka KP:tä tulisi paljon', () => {
    const state = createNewGame(TABLE[MAX_LEVEL - 2] ?? 0);
    const reward = grantVictory(state, null, enemyWithXp(MAX_XP * 2));
    expect(reward.level).toBe(MAX_LEVEL);
    expect(reward.skillPoints).toBe(PROGRESSION.skillPointsPerLevel);
    expect(unspentSkillPoints(state)).toBe(147);
  });
});
