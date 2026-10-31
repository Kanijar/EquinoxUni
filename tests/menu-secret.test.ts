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
import { levelForXp } from '../src/logic/progression';

const rules: MenuSecretRules = {
  wolfStartXp: 12,
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

  it('suden napautuksen jälkeen peli alkaa salaisuuden KP:llä', () => {
    expect(createMenuGame(WOLF).xp).toBe(MENU_SECRET.wolfStartXp);
    expect(createMenuGame(WOLF, rules).xp).toBe(12);
  });

  it('salaisuus nostaa useamman tason ja antaa niiden kykypisteet heti', () => {
    const state = createMenuGame(WOLF);
    const level = levelForXp(MENU_SECRET.wolfStartXp);
    expect(level).toBeGreaterThanOrEqual(4);
    expect(playerLevel(state)).toBe(level);
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

  it('500 KP vie tasolle 10 ja antaa 27 kykypistettä, mutta ei enää huipputasolle', () => {
    const state = createMenuGame(WOLF, { ...rules, wolfStartXp: 500 });
    expect(playerLevel(state)).toBe(10);
    expect(playerLevel(state)).toBeLessThan(PROGRESSION.xpForLevel.length);
    expect(unspentSkillPoints(state)).toBe(27);
    expect(startFromMenu(WOLF, { ...rules, wolfStartXp: 500 }).message).toContain('Taso 10!');
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
    expect(start.state.xp).toBe(MENU_SECRET.wolfStartXp);
    expect(start.message).toContain('Susi siunasi sinut!');
  });

  it('sankarilla on sprite jokaiselle silmien värille', () => {
    for (const sprite of Object.values(PLAYER.eyeSprites)) {
      expect(() => getSprite(sprite)).not.toThrow();
    }
  });
});
