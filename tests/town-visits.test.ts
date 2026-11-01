import { describe, expect, it } from 'vitest';
import { getEnemy } from '../src/data';
import { START_TOWN } from '../src/data/towns';
import { createBattle } from '../src/logic/battle';
import {
  applyBattleResult,
  createNewGame,
  grantVictory,
  playerFighter,
  playerStats,
} from '../src/logic/game-state';
import { lastVisitedTown, reviveAtLastTown, visitTown } from '../src/logic/town-visits';

describe('viimeisin paikkakunta', () => {
  it('uusi peli muistaa aloituspaikkakunnan', () => {
    const state = createNewGame();
    expect(state.lastTown).toBe(START_TOWN);
    expect(lastVisitedTown(state).id).toBe('kotiranta');
  });

  it('paikkakuntaan saapuminen muistetaan ja palauttaa elämän', () => {
    const state = createNewGame();
    state.hp = 3;
    visitTown(state, 'kuusela');
    expect(state.lastTown).toBe('kuusela');
    expect(lastVisitedTown(state).name).toBe('Kuusela');
    expect(state.hp).toBe(playerStats(state).maxHp);
  });

  it('tuntematon paikkakunta (esim. vanha tallennus) tarkoittaa aloituspaikkakuntaa', () => {
    const state = createNewGame();
    state.lastTown = 'atlantis';
    expect(lastVisitedTown(state).id).toBe(START_TOWN);
  });
});

describe('kaatuminen taistelussa', () => {
  it('sankari herää viimeisimmässä paikkakunnassa täysin elämin', () => {
    const state = createNewGame();
    visitTown(state, 'kuusela');
    state.position = { x: 500, y: 700 };
    const battle = createBattle(playerFighter(state), { hp: 9, ...getEnemy('wolf').stats }, {});
    battle.player.hp = 0;
    battle.outcome = 'lost';
    applyBattleResult(state, battle, { enemy: getEnemy('wolf'), mapEnemyIndex: 2 });
    expect(state.hp).toBe(0);

    const town = reviveAtLastTown(state);
    expect(town.id).toBe('kuusela');
    expect(town.nameAt).toBe('Kuuselassa');
    expect(state.position).toBeNull();
    expect(state.hp).toBe(playerStats(state).maxHp);
  });

  it('kaatuminen ei vie kokemusta, esineitä eikä voitettuja vihollisia', () => {
    const state = createNewGame();
    grantVictory(state, 4, getEnemy('hiisi'));
    const xp = state.xp;
    const potions = state.inventory['potion'];
    state.hp = 0;
    reviveAtLastTown(state);
    expect(state.xp).toBe(xp);
    expect(state.inventory['potion']).toBe(potions);
    expect(state.defeated).toEqual([4]);
  });

  it('ilman paikkakuntakäyntejä sankari herää aloituspaikkakunnassa', () => {
    const state = createNewGame();
    state.hp = 0;
    expect(reviveAtLastTown(state).id).toBe(START_TOWN);
  });

  it('virheellinen paikkakunta korjautuu aloituspaikkakunnaksi herätessä', () => {
    const state = createNewGame();
    state.lastTown = 'atlantis';
    reviveAtLastTown(state);
    expect(state.lastTown).toBe(START_TOWN);
  });
});
