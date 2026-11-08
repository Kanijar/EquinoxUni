import { describe, expect, it } from 'vitest';
import { getItem, ITEMS } from '../src/data';
import { LIKE_SWORD_ID } from '../src/data/idea-items';
import { BOAT_SHOP } from '../src/data/boat-shop';
import { WITCH } from '../src/data/cave';
import { MERCHANT } from '../src/data/merchant';
import { MERCHANT_ITEMS } from '../src/data/merchant-items';
import { bestGear, gearScore } from '../src/logic/burger-secret';
import { isGear } from '../src/logic/equipment';
import { createNewGame } from '../src/logic/game-state';
import { MemoryStore } from '../src/logic/key-value-store';
import { rewardStateFor } from '../src/logic/ideas';
import { deliverLikeReward, localReward, markRewardPending } from '../src/logic/like-reward';

// Tykkäysmiekka: palkinto eniten tykätyn ideaviestin tekijälle.

const ME = 'abcdefghij0123456789';
const OTHER = 'zzzzzzzzzz0123456789';

describe('Tykkäysmiekka', () => {
  it('on ase, jossa on 50 hyökkäystä', () => {
    const sword = getItem(LIKE_SWORD_ID);
    expect(isGear(sword)).toBe(true);
    expect(isGear(sword) && sword.slot).toBe('hand');
    expect(isGear(sword) && sword.bonus.attack).toBe(50);
  });

  it('on heikompi kuin pelin paras ase, joten burgeri ei anna sitä', () => {
    const sword = getItem(LIKE_SWORD_ID);
    const best = bestGear('hand');
    expect(best?.id).not.toBe(LIKE_SWORD_ID);
    expect(isGear(sword) && best && gearScore(sword) < gearScore(best)).toBe(true);
  });

  it('ei ole myynnissä kaupoissa', () => {
    for (const stock of [MERCHANT.stock, BOAT_SHOP.stock, WITCH.stock]) {
      expect(stock).not.toContain(LIKE_SWORD_ID);
    }
    expect(MERCHANT_ITEMS.some((item) => item.id === LIKE_SWORD_ID)).toBe(false);
    expect(ITEMS.filter((item) => item.id === LIKE_SWORD_ID)).toHaveLength(1);
  });
});

describe('miekan tila palvelimella', () => {
  it('vain parhaan idean kirjoittaja voi lunastaa, ja vain kerran', () => {
    expect(rewardStateFor({ device: ME, bestAuthor: ME, claimed: false })).toBe('claimable');
    expect(rewardStateFor({ device: ME, bestAuthor: OTHER, claimed: false })).toBe('none');
    expect(rewardStateFor({ device: ME, bestAuthor: null, claimed: false })).toBe('none');
    expect(rewardStateFor({ device: ME, bestAuthor: ME, claimed: true })).toBe('claimed');
    expect(rewardStateFor({ device: null, bestAuthor: ME, claimed: false })).toBe('none');
  });
});

describe('miekka reppuun', () => {
  it('lunastettu miekka ilmestyy seuraavaan peliin kerran', () => {
    const store = new MemoryStore();
    const state = createNewGame();
    expect(deliverLikeReward(store, state)).toBe(false);
    markRewardPending(store);
    expect(localReward(store)).toBe('pending');
    expect(deliverLikeReward(store, state)).toBe(true);
    expect(state.inventory[LIKE_SWORD_ID]).toBe(1);
    expect(localReward(store)).toBe('given');
    const next = createNewGame();
    expect(deliverLikeReward(store, next)).toBe(false);
    expect(next.inventory[LIKE_SWORD_ID]).toBeUndefined();
  });

  it('annettua miekkaa ei voi lunastaa uudelleen samalle laitteelle', () => {
    const store = new MemoryStore();
    markRewardPending(store);
    deliverLikeReward(store, createNewGame());
    markRewardPending(store);
    expect(localReward(store)).toBe('given');
  });

  it('miekkaa ei anneta toista kertaa, jos se on jo käytössä', () => {
    const store = new MemoryStore();
    const state = createNewGame();
    state.equipped.hand = LIKE_SWORD_ID;
    markRewardPending(store);
    expect(deliverLikeReward(store, state)).toBe(true);
    expect(state.inventory[LIKE_SWORD_ID]).toBeUndefined();
  });
});
