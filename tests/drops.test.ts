import { describe, expect, it } from 'vitest';
import { getEnemy } from '../src/data';
import { rollDrops } from '../src/logic/drops';
import {
  applyBattleResult,
  createNewGame,
  grantVictory,
  playerFighter,
} from '../src/logic/game-state';
import { createBattle } from '../src/logic/battle';

// Pudotukset: vihollinen voi pudottaa kaatuessaan esineitä omalla todennäköisyydellään.
// Varustetta, joka pelaajalla jo on, ei pudoteta toista kertaa.

const always = (): number => 0;
const never = (): number => 0.999;
const nobodyOwns = (): boolean => false;

const dropChance = (enemyId: string, itemId: string): number =>
  getEnemy(enemyId).drops?.find((drop) => drop.item === itemId)?.chance ?? 0;

describe('pudotukset', () => {
  it('tunturipeikko pudottaa nuijan, ryöstäjä vaatteet ja puukon, susi hammaskorun', () => {
    expect(rollDrops(getEnemy('troll').drops ?? [], nobodyOwns, always)).toContain('club');
    expect(rollDrops(getEnemy('robber').drops ?? [], nobodyOwns, always)).toEqual([
      'robber-clothes',
      'knife',
    ]);
    expect(rollDrops(getEnemy('wolf').drops ?? [], nobodyOwns, always)).toEqual(['tooth-necklace']);
  });

  it('pudotus ei ole varma: arpa ratkaisee', () => {
    for (const [enemy, item] of [
      ['troll', 'club'],
      ['robber', 'knife'],
      ['robber', 'robber-clothes'],
      ['wolf', 'tooth-necklace'],
    ] as const) {
      expect(dropChance(enemy, item), item).toBeGreaterThanOrEqual(0.25);
      expect(dropChance(enemy, item), item).toBeLessThanOrEqual(0.5);
    }
    expect(rollDrops(getEnemy('wolf').drops ?? [], nobodyOwns, never)).toEqual([]);
    const chance = dropChance('wolf', 'tooth-necklace');
    expect(rollDrops([{ item: 'tooth-necklace', chance }], nobodyOwns, () => chance)).toEqual([]);
  });

  it('peikon nuija putoaa useammin kuin muut varusteet', () => {
    expect(dropChance('troll', 'club')).toBeGreaterThan(dropChance('wolf', 'tooth-necklace'));
    expect(dropChance('troll', 'club')).toBeGreaterThan(dropChance('robber', 'knife'));
  });

  it('omistettua varustetta ei pudoteta uudelleen, juomia voi saada aina', () => {
    const owns = (id: string): boolean => id === 'club' || id === 'potion';
    expect(rollDrops(getEnemy('troll').drops ?? [], owns, always)).toEqual(['potion']);
  });

  it('voitto laittaa pudotukset reppuun ja kertoo ne', () => {
    const state = createNewGame();
    const reward = grantVictory(state, null, getEnemy('wolf'), always);
    expect(reward.drops).toEqual(['tooth-necklace']);
    expect(state.inventory['tooth-necklace']).toBe(1);
    const second = grantVictory(state, null, getEnemy('wolf'), always);
    expect(second.drops).toBeUndefined();
    expect(state.inventory['tooth-necklace']).toBe(1);
  });

  it('käytössä olevaa varustetta ei saa toista kertaa', () => {
    const state = createNewGame();
    state.equipped.hand = 'knife';
    const robber = getEnemy('robber');
    const battle = createBattle(playerFighter(state), { hp: 0, ...robber.stats }, state.inventory);
    battle.outcome = 'won';
    const reward = applyBattleResult(state, battle, { enemy: robber, mapEnemyIndex: null }, always);
    expect(reward?.drops).toEqual(['robber-clothes']);
  });
});
