import { describe, expect, it } from 'vitest';
import { getEnemy } from '../src/data';
import { COIN_RULES } from '../src/data/merchant';
import { readCount, victoryCoins } from '../src/logic/coins';
import { createNewGame, grantVictory } from '../src/logic/game-state';
import { bestHealItem } from '../src/logic/heal-choice';

// Kolikot voitoista ja taistelun juoman valinta, kun juomia on kahta kokoa.

describe('kolikot', () => {
  it('kolikoita tulee vihollisen KP:n mukaan satunnaisvaihtelun rajoissa', () => {
    const xp = 100;
    const base = xp * COIN_RULES.perXp;
    expect(victoryCoins(xp, () => 0.5)).toBe(base);
    expect(victoryCoins(xp, () => 0)).toBe(Math.round(base * (1 - COIN_RULES.variance)));
    expect(victoryCoins(xp, () => 1)).toBe(Math.round(base * (1 + COIN_RULES.variance)));
  });

  it('heikoistakin vihollisista saa vähintään yhden kolikon', () => {
    expect(victoryCoins(1, () => 0)).toBe(1);
  });

  it('vahvempi vihollinen antaa enemmän kolikoita', () => {
    const coins = (id: string): number => {
      const state = createNewGame();
      return grantVictory(state, null, getEnemy(id), () => 0.5).coins;
    };
    expect(coins('slime')).toBeLessThan(coins('troll'));
    expect(coins('troll')).toBeLessThan(coins('dragon'));
  });

  it('voitto lisää kolikot peliin', () => {
    const state = createNewGame();
    const before = state.coins;
    const reward = grantVictory(state, null, getEnemy('wolf'), () => 0.5);
    expect(state.coins).toBe(before + reward.coins);
  });

  it('tallennuksen virheellinen tai puuttuva laskuri on 0', () => {
    expect(readCount(12)).toBe(12);
    expect(readCount(undefined)).toBe(0);
    expect(readCount(-3)).toBe(0);
    expect(readCount(1.5)).toBe(0);
    expect(readCount('99')).toBe(0);
  });
});

describe('juoman valinta taistelussa', () => {
  it('juodaan pienin juoma, joka riittää', () => {
    expect(bestHealItem({ potion: 2, 'big-potion': 1 }, 8)).toBe('potion');
    expect(bestHealItem({ potion: 2, 'big-potion': 1 }, 25)).toBe('big-potion');
  });

  it('jos mikään ei riitä, juodaan isoin', () => {
    expect(bestHealItem({ potion: 1, 'big-potion': 1 }, 90)).toBe('big-potion');
    expect(bestHealItem({ potion: 1, 'big-potion': 0 }, 90)).toBe('potion');
  });

  it('ilman juomia ei juoda mitään, varusteet eivät ole juomia', () => {
    expect(bestHealItem({ club: 1 }, 10)).toBeNull();
    expect(bestHealItem({}, 10)).toBeNull();
  });
});
