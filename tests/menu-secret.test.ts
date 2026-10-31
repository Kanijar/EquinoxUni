import { describe, expect, it } from 'vitest';
import { getItem, getSprite } from '../src/data';
import { PLAYER } from '../src/data/player';
import { MENU_SECRET, PROGRESSION } from '../src/data/rules';
import type { MenuSecretRules } from '../src/data/types';
import {
  createNewGame,
  playerLevel,
  playerStats,
  unspentSkillPoints,
} from '../src/logic/game-state';
import { createMenuGame, startFromMenu } from '../src/logic/menu-secret';
import { levelForXp } from '../src/logic/progression';

const rules: MenuSecretRules = {
  wolfStartXp: 12,
  bonusItems: [{ id: 'potion', count: 2 }],
  spiritSprite: 'wolf-spirit',
};

describe('alkuruudun suden salaisuus', () => {
  it('ilman suden napautusta peli alkaa nollasta ilman viestiä', () => {
    const start = startFromMenu(false);
    expect(start.state).toEqual(createNewGame());
    expect(playerLevel(start.state)).toBe(1);
    expect(start.message).toBeUndefined();
  });

  it('suden napautuksen jälkeen peli alkaa salaisuuden KP:llä', () => {
    expect(createMenuGame(true).xp).toBe(MENU_SECRET.wolfStartXp);
    expect(createMenuGame(true, rules).xp).toBe(12);
  });

  it('salaisuus nostaa useamman tason ja antaa niiden kykypisteet heti', () => {
    const state = createMenuGame(true);
    const level = levelForXp(MENU_SECRET.wolfStartXp);
    expect(level).toBeGreaterThanOrEqual(4);
    expect(playerLevel(state)).toBe(level);
    expect(unspentSkillPoints(state)).toBe((level - 1) * PROGRESSION.skillPointsPerLevel);
  });

  it('salaisuus antaa lisäesineet aloitusesineiden päälle', () => {
    const normal = createNewGame().inventory['potion'] ?? 0;
    expect(createMenuGame(true, rules).inventory['potion']).toBe(normal + 2);
  });

  it('elämä on täynnä ja muu aloitustila on sama kuin tavallisessa pelissä', () => {
    const secret = createMenuGame(true, { ...rules, bonusItems: [] });
    expect({ ...secret, xp: 0 }).toEqual(createNewGame());
    expect(secret.hp).toBe(playerStats(secret).maxHp);
    expect(secret.hp).toBe(PLAYER.stats.maxHp);
  });

  it('kartalla näkyy yllätysviesti, jossa on uusi taso', () => {
    const start = startFromMenu(true);
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
});
