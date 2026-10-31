import { describe, expect, it } from 'vitest';
import { PLAYER } from '../src/data/player';
import { MENU_SECRET, PROGRESSION } from '../src/data/rules';
import {
  createNewGame,
  playerLevel,
  playerStats,
  unspentSkillPoints,
} from '../src/logic/game-state';
import { createMenuGame } from '../src/logic/menu-secret';
import { levelForXp } from '../src/logic/progression';

describe('alkuruudun suden salaisuus', () => {
  it('ilman suden napautusta peli alkaa nollasta', () => {
    const state = createMenuGame(false);
    expect(state).toEqual(createNewGame());
    expect(state.xp).toBe(0);
    expect(playerLevel(state)).toBe(1);
  });

  it('suden napautuksen jälkeen peli alkaa 30 KP:llä', () => {
    expect(MENU_SECRET.wolfStartXp).toBe(30);
    expect(createMenuGame(true).xp).toBe(30);
  });

  it('30 KP nostaa tason ja antaa tasojen kykypisteet heti', () => {
    const state = createMenuGame(true);
    const level = levelForXp(MENU_SECRET.wolfStartXp);
    expect(level).toBeGreaterThan(1);
    expect(playerLevel(state)).toBe(level);
    expect(unspentSkillPoints(state)).toBe((level - 1) * PROGRESSION.skillPointsPerLevel);
  });

  it('muu aloitustila on sama kuin tavallisessa uudessa pelissä', () => {
    const secret = createMenuGame(true);
    expect({ ...secret, xp: 0 }).toEqual(createNewGame());
    expect(secret.hp).toBe(playerStats(secret).maxHp);
    expect(secret.hp).toBe(PLAYER.stats.maxHp);
  });

  it('salaisuuden KP-määrä tulee säännöistä', () => {
    expect(createMenuGame(true, { wolfStartXp: 12 }).xp).toBe(12);
  });

  it('uusi peli ei hyväksy negatiivisia tai murto-KP:itä', () => {
    expect(createNewGame(-5).xp).toBe(0);
    expect(createNewGame(30.7).xp).toBe(30);
  });
});
