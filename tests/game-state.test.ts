import { describe, expect, it } from 'vitest';
import { getEnemy } from '../src/data';
import { PLAYER } from '../src/data/player';
import { createBattle } from '../src/logic/battle';
import {
  applyBattleResult,
  createNewGame,
  grantVictory,
  playerFighter,
  playerLevel,
  restoreHp,
} from '../src/logic/game-state';
import { levelForXp, statsForLevel, xpToNextLevel } from '../src/logic/progression';
import type { Progression } from '../src/data/types';

const progression: Progression = {
  xpForLevel: [0, 10, 30],
  perLevel: { maxHp: 5, attack: 2, defense: 1 },
};

describe('kokemustasot', () => {
  it('taso nousee kokemuspisteiden mukaan', () => {
    expect(levelForXp(0, progression)).toBe(1);
    expect(levelForXp(9, progression)).toBe(1);
    expect(levelForXp(10, progression)).toBe(2);
    expect(levelForXp(999, progression)).toBe(3);
  });

  it('kertoo, paljonko seuraavaan tasoon puuttuu', () => {
    expect(xpToNextLevel(4, progression)).toBe(6);
    expect(xpToNextLevel(30, progression)).toBeNull();
  });

  it('taso kasvattaa arvoja', () => {
    const base = { maxHp: 20, attack: 5, defense: 1, speed: 50 };
    expect(statsForLevel(3, base, progression)).toEqual({
      maxHp: 30,
      attack: 9,
      defense: 3,
      speed: 50,
    });
  });
});

describe('pelin tila', () => {
  it('uusi peli alkaa täysillä elämillä ja aloitusesineillä', () => {
    const state = createNewGame();
    expect(state.hp).toBe(PLAYER.stats.maxHp);
    expect(state.position).toBeNull();
    expect(state.inventory['potion']).toBe(3);
    expect(playerLevel(state)).toBe(1);
  });

  it('voitto antaa kokemusta, esineen ja merkitsee vihollisen voitetuksi', () => {
    const state = createNewGame();
    const reward = grantVictory(state, 4, getEnemy('hiisi'));
    expect(state.xp).toBe(12);
    expect(state.defeated).toEqual([4]);
    expect(state.inventory['potion']).toBe(4);
    expect(reward).toEqual({ xp: 12, leveledUp: true, level: 2, drop: 'potion' });
  });

  it('tason noustessa elämä palautuu uuteen maksimiin', () => {
    const state = createNewGame();
    state.hp = 5;
    grantVictory(state, 0, getEnemy('hiisi'));
    expect(state.hp).toBe(playerFighter(state).maxHp);
    expect(state.hp).toBeGreaterThan(PLAYER.stats.maxHp);
  });

  it('lepo palauttaa elämän', () => {
    const state = createNewGame();
    state.hp = 1;
    restoreHp(state);
    expect(state.hp).toBe(PLAYER.stats.maxHp);
  });

  it('väijytyksen voitto antaa kokemusta ja varastetut esineet takaisin', () => {
    const state = createNewGame();
    const robber = getEnemy('robber');
    const battle = createBattle(playerFighter(state), { hp: 0, ...robber.stats }, state.inventory);
    state.inventory['potion'] = 1;
    battle.stolen['potion'] = 2;
    battle.outcome = 'won';
    const reward = applyBattleResult(state, battle, null, robber);
    expect(reward?.recovered).toEqual([{ id: 'potion', count: 2 }]);
    expect(state.inventory['potion']).toBe(3);
    expect(state.xp).toBe(robber.xp);
    expect(state.defeated).toEqual([]);
  });

  it('taistelun jälkeen elämä tallentuu, vaikka pelaaja pakeni', () => {
    const state = createNewGame();
    const battle = createBattle(
      playerFighter(state),
      { hp: 1, maxHp: 1, attack: 1, defense: 0 },
      {},
    );
    battle.player.hp = 11;
    battle.outcome = 'fled';
    expect(applyBattleResult(state, battle, 0, getEnemy('slime'))).toBeNull();
    expect(state.hp).toBe(11);
    expect(state.defeated).toEqual([]);
  });
});
