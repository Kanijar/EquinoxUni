import { describe, expect, it } from 'vitest';
import { getItem, getSprite } from '../src/data';
import { PLAYER } from '../src/data/player';
import { MENU_SECRET, PROGRESSION } from '../src/data/rules';
import type { MenuSecretRules } from '../src/data/types';
import {
  createNewGame,
  playerLevel,
  playerSprite,
  playerStats,
  unspentSkillPoints,
} from '../src/logic/game-state';
import { createMenuGame, NO_MENU_TAPS, startFromMenu } from '../src/logic/menu-secret';
import { minXpForLevel, xpProgress } from '../src/logic/progression';

const rules: MenuSecretRules = {
  wolfStartLevel: 2,
  bonusItems: [{ id: 'potion', count: 2 }],
  spiritSprite: 'wolf-spirit',
  slimeEyeColor: 'black',
};

const WOLF = { wolf: true, slime: false };
const SLIME = { wolf: false, slime: true };
const BOTH = { wolf: true, slime: true };

describe('alkuruudun suden salaisuus', () => {
  it('ilman suden napautusta peli alkaa nollasta ilman viestiä', () => {
    const start = startFromMenu(NO_MENU_TAPS);
    expect(start.state).toEqual(createNewGame());
    expect(playerLevel(start.state)).toBe(1);
    expect(start.message).toBeUndefined();
  });

  it('suden napautuksen jälkeen peli alkaa salaisuuden tasolta, KP tason rajassa', () => {
    const state = createMenuGame(WOLF);
    expect(playerLevel(state)).toBe(MENU_SECRET.wolfStartLevel);
    expect(state.xp).toBe(minXpForLevel(MENU_SECRET.wolfStartLevel));
    const small = createMenuGame(WOLF, rules);
    expect(playerLevel(small)).toBe(2);
    expect(small.xp).toBe(PROGRESSION.xpForLevel[1]);
  });

  it('salaisuus antaa tasojen kykypisteet heti', () => {
    const state = createMenuGame(WOLF);
    const level = MENU_SECRET.wolfStartLevel;
    expect(unspentSkillPoints(state)).toBe((level - 1) * PROGRESSION.skillPointsPerLevel);
  });

  it('salaisuus antaa lisäesineet aloitusesineiden päälle', () => {
    const normal = createNewGame().inventory['potion'] ?? 0;
    expect(createMenuGame(WOLF, rules).inventory['potion']).toBe(normal + 2);
  });

  it('elämä on täynnä ja muu aloitustila on sama kuin tavallisessa pelissä', () => {
    const secret = createMenuGame(WOLF, { ...rules, bonusItems: [] });
    expect({ ...secret, xp: 0 }).toEqual(createNewGame());
    expect(secret.hp).toBe(playerStats(secret).maxHp);
    expect(secret.hp).toBe(PLAYER.stats.maxHp);
  });

  it('susi vie huipputasolle 50: 147 kykypistettä ja KP-palkki täynnä', () => {
    expect(MENU_SECRET.wolfStartLevel).toBe(50);
    expect(PROGRESSION.xpForLevel.length).toBe(50);
    const start = startFromMenu(WOLF);
    expect(playerLevel(start.state)).toBe(50);
    expect(unspentSkillPoints(start.state)).toBe(147);
    expect(xpProgress(start.state.xp).nextLevelXp).toBeNull();
    expect(start.message).toContain('Taso 50!');
  });

  it('liian suuri tai pieni salaisuuden taso rajataan tasotaulukkoon', () => {
    expect(playerLevel(createMenuGame(WOLF, { ...rules, wolfStartLevel: 999 }))).toBe(50);
    expect(createMenuGame(WOLF, { ...rules, wolfStartLevel: 0 }).xp).toBe(0);
  });

  it('kartalla näkyy yllätysviesti, jossa on uusi taso', () => {
    const start = startFromMenu(WOLF);
    expect(start.message).toContain('Susi siunasi sinut!');
    expect(start.message).toContain(String(playerLevel(start.state)));
  });

  it('salaisuuden esineet ja henkisuden sprite ovat olemassa', () => {
    for (const stack of MENU_SECRET.bonusItems) {
      expect(() => getItem(stack.id)).not.toThrow();
      expect(stack.count).toBeGreaterThan(0);
    }
    expect(() => getSprite(MENU_SECRET.spiritSprite)).not.toThrow();
  });

  it('uusi peli ei hyväksy negatiivisia tai murto-KP:itä', () => {
    expect(createNewGame(-5).xp).toBe(0);
    expect(createNewGame(30.7).xp).toBe(30);
  });

  it('liman napautus muuttaa sankarin silmät mustiksi', () => {
    expect(createNewGame().eyeColor).toBe(PLAYER.eyeColor);
    const state = createMenuGame(SLIME);
    expect(state.eyeColor).toBe(MENU_SECRET.slimeEyeColor);
    expect(state.eyeColor).toBe('black');
    expect(playerSprite(state)).toBe(PLAYER.eyeSprites.black);
    expect(state.xp).toBe(0);
  });

  it('liman salaisuus ei tuo viestiä eikä muuta muuta aloitustilaa', () => {
    const start = startFromMenu(SLIME);
    expect(start.message).toBeUndefined();
    expect({ ...start.state, eyeColor: PLAYER.eyeColor }).toEqual(createNewGame());
  });

  it('suden ja liman salaisuudet toimivat yhtä aikaa', () => {
    const start = startFromMenu(BOTH);
    expect(start.state.eyeColor).toBe('black');
    expect(playerLevel(start.state)).toBe(MENU_SECRET.wolfStartLevel);
    expect(start.message).toContain('Susi siunasi sinut!');
  });

  it('sankarilla on sprite jokaiselle silmien värille', () => {
    for (const sprite of Object.values(PLAYER.eyeSprites)) {
      expect(() => getSprite(sprite)).not.toThrow();
    }
  });
});
