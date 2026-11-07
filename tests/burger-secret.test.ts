import { describe, expect, it } from 'vitest';
import { getItem, ITEMS } from '../src/data';
import { GEAR_SLOTS } from '../src/data/items';
import { BURGER_SECRET } from '../src/data/rules';
import { bestGear, burgerNews, eatBurger, gearScore } from '../src/logic/burger-secret';
import { isGear } from '../src/logic/equipment';
import { createNewGame, playerLevel, playerStats } from '../src/logic/game-state';
import { createMenuGame, NO_MENU_TAPS, startFromMenu } from '../src/logic/menu-secret';
import { minXpForLevel } from '../src/logic/progression';

const BURGER = { ...NO_MENU_TAPS, burger: true };

describe('alkuruudun salainen burgeri', () => {
  it('jokaiseen paikkaan valitaan pisteiltään paras varuste', () => {
    expect(bestGear('hand')?.id).toBe('dragon-sword');
    expect(bestGear('body')?.id).toBe('lizard-armor');
    expect(bestGear('neck')?.id).toBe('dragon-charm');
    for (const slot of GEAR_SLOTS) {
      const best = bestGear(slot);
      expect(best?.slot).toBe(slot);
      const score = best ? gearScore(best) : 0;
      for (const item of ITEMS) {
        if (isGear(item) && item.slot === slot) {
          expect(score).toBeGreaterThanOrEqual(gearScore(item));
        }
      }
    }
  });

  it('burgeri laittaa parhaat varusteet käyttöön ja antaa Bugattin avaimet', () => {
    const state = createNewGame();
    const gained = eatBurger(state);
    expect(state.equipped).toEqual({
      hand: 'dragon-sword',
      body: 'lizard-armor',
      neck: 'dragon-charm',
    });
    expect(state.inventory['bugatti-keys']).toBe(1);
    expect(gained.items).toEqual(['dragon-sword', 'lizard-armor', 'dragon-charm', 'bugatti-keys']);
    expect(gained.coins).toBe(1_000_000 - createNewGame().coins);
    expect(state.coins).toBe(1_000_000);
    expect(getItem('bugatti-keys').kind).toBe('vehicle');
  });

  it('burgeri ei anna tasoja eikä kokemusta', () => {
    const state = createNewGame(minXpForLevel(7));
    eatBurger(state);
    expect(playerLevel(state)).toBe(7);
    expect(state.xp).toBe(minXpForLevel(7));
  });

  it('uudessa pelissä elämä on täynnä myös varusteiden kanssa', () => {
    const state = createMenuGame(BURGER);
    expect(state.hp).toBe(playerStats(state).maxHp);
    expect(state.hp).toBeGreaterThan(createNewGame().hp);
  });

  it('toinen burgeri ei anna samoja esineitä uudestaan', () => {
    const state = createNewGame();
    eatBurger(state);
    const before = structuredClone(state);
    expect(eatBurger(state)).toEqual({ items: [], coins: 0 });
    expect(state).toEqual(before);
    expect(burgerNews(state)).toBe('Nam, burgeri!\nSinulla on jo parhaat varusteet.');
  });

  it('aiemmat varusteet palaavat reppuun ja omistettu paras varuste otetaan käyttöön', () => {
    const state = createNewGame();
    state.equipped.hand = 'club';
    state.inventory['lizard-armor'] = 1;
    state.inventory['bugatti-keys'] = 1;
    const gained = eatBurger(state);
    expect(state.inventory['club']).toBe(1);
    expect(state.inventory['lizard-armor']).toBe(0);
    expect(state.equipped.body).toBe('lizard-armor');
    expect(state.inventory['bugatti-keys']).toBe(1);
    expect(gained.items).toEqual(['dragon-sword', 'dragon-charm']);
  });

  it('ladatun pelin elämä kasvaa yhtä paljon kuin maksimielämä, ei yli', () => {
    const state = createNewGame();
    state.hp = 5;
    const maxBefore = playerStats(state).maxHp;
    eatBurger(state);
    expect(state.hp).toBe(5 + playerStats(state).maxHp - maxBefore);
    expect(state.hp).toBeLessThanOrEqual(playerStats(state).maxHp);
  });

  it('kartalla näkyy yllätysviesti, ja susi ja burgeri toimivat yhtä aikaa', () => {
    expect(startFromMenu(BURGER).message).toBe(
      'Nam, salainen burgeri!\nSait parhaat varusteet, Bugattin avaimet\nja miljoona kultakolikkoa!',
    );
    const both = startFromMenu({ ...BURGER, wolf: true });
    expect(both.message).toContain('Susi siunasi sinut!');
    expect(both.message).toContain('salainen burgeri');
    expect(both.state.equipped.hand).toBe('dragon-sword');
    expect(startFromMenu(NO_MENU_TAPS).state.equipped).toEqual({});
  });

  it('burgerin esineet ovat olemassa', () => {
    for (const id of BURGER_SECRET.extraItems) {
      expect(() => getItem(id)).not.toThrow();
    }
  });

  it('burgeri antaa miljoona kultakolikkoa, mutta toistolla kolikot eivät kasva', () => {
    expect(BURGER_SECRET.coins).toBe(1_000_000);
    const state = createNewGame();
    eatBurger(state);
    expect(state.coins).toBe(1_000_000);
    state.coins = 400;
    expect(eatBurger(state).coins).toBe(999_600);
    expect(state.coins).toBe(1_000_000);
    expect(eatBurger(state).coins).toBe(0);
    state.coins = 2_000_000;
    eatBurger(state);
    expect(state.coins).toBe(2_000_000);
  });

  it('ladattu peli saa kolikot, vaikka varusteet olisivat jo', () => {
    const state = createNewGame();
    eatBurger(state);
    state.coins = 0;
    expect(burgerNews(state)).toContain('miljoona kultakolikkoa');
    expect(state.coins).toBe(1_000_000);
  });
});
