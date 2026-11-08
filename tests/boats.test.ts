import { describe, expect, it } from 'vitest';
import { getItem, getSprite, WORLD } from '../src/data';
import { ISLES } from '../src/data/isles';
import { BOAT_ITEMS } from '../src/data/boat-items';
import { BOAT_SHOP } from '../src/data/boat-shop';
import { xpForLevel } from '../src/data/level-curve';
import { LEVEL_CURVE } from '../src/data/rules';
import { fishingSpot } from '../src/logic/fishing';
import { createNewGame, type GameState } from '../src/logic/game-state';
import { decodeSave, encodeSave } from '../src/logic/save-format';
import {
  boatSpeedFactor,
  canFishHere,
  hasFasterBoat,
  isBoat,
  nextBoat,
  ownedBoat,
} from '../src/logic/sailing';
import { buyBlock, buyItem } from '../src/logic/shop';
import { buildWorldGrid, terrainAt } from '../src/logic/world-grid';

// Venekaupan neljä venettä (data/boat-items.ts): soutuvene, purjevene, moottorivene ja
// luksusvene. Säännöt: logic/sailing.ts ja logic/shop.ts.

const meta = { savedAt: 1_700_000_000_000, place: 'Venesatama' };

function gameAtLevel(level: number, coins = 100_000): GameState {
  const state = createNewGame(xpForLevel(level, LEVEL_CURVE));
  state.coins = coins;
  return state;
}

describe('veneet', () => {
  it('veneitä on neljä hitaimmasta nopeimpaan, ja ne ovat venekaupassa', () => {
    expect(BOAT_ITEMS.map((boat) => boat.id)).toEqual([
      'rowboat',
      'sailboat',
      'motorboat',
      'luxury-boat',
    ]);
    expect(BOAT_ITEMS.map((boat) => boat.name)).toEqual([
      'Soutuvene',
      'Purjevene',
      'Moottorivene',
      'Luksusvene',
    ]);
    BOAT_ITEMS.forEach((boat) => {
      expect(BOAT_SHOP.stock).toContain(boat.id);
      expect(getItem(boat.id)).toBe(boat);
      expect(getSprite(boat.sprite).id).toBe(boat.id);
      expect(getSprite(boat.mapSprite).id).toBe(`${boat.id}-hero`);
    });
  });

  it('jokainen vene on edellistä nopeampi, kalliimpi ja vaatii vähintään saman tason', () => {
    BOAT_ITEMS.slice(1).forEach((boat, index) => {
      const prev = BOAT_ITEMS[index];
      if (!prev) throw new Error('edellinen vene puuttuu');
      expect(boat.speedMultiplier).toBeGreaterThan(prev.speedMultiplier);
      expect(boat.price ?? 0).toBeGreaterThan(prev.price ?? 0);
      expect(boat.minLevel ?? 1).toBeGreaterThanOrEqual(prev.minLevel ?? 1);
    });
  });

  it('soutuvene on todella hidas ja luksusvene todella nopea', () => {
    const rowboat = getItem('rowboat');
    const luxury = getItem('luxury-boat');
    expect(isBoat(rowboat) && rowboat.speedMultiplier).toBeLessThan(1);
    expect(isBoat(luxury) && luxury.speedMultiplier).toBeGreaterThanOrEqual(2.5);
  });

  it('vain luksusveneestä voi kalastaa', () => {
    expect(BOAT_ITEMS.filter((boat) => boat.canFish).map((boat) => boat.id)).toEqual([
      'luxury-boat',
    ]);
  });

  it('ensimmäiselle saarelle pääsee jo halvimmalla veneellä', () => {
    const first = Math.min(...ISLES.map((isle) => isle.level));
    expect(getItem('rowboat').minLevel ?? 1).toBeLessThanOrEqual(first);
    expect(getItem('rowboat').price ?? 0).toBeLessThan(1000);
  });
});

describe('monta venettä', () => {
  it('käytössä on aina nopein vene', () => {
    const state = createNewGame();
    state.inventory['rowboat'] = 1;
    state.inventory['motorboat'] = 1;
    state.inventory['sailboat'] = 1;
    expect(ownedBoat(state)?.id).toBe('motorboat');
    state.sailing = true;
    expect(boatSpeedFactor(state)).toBe(2);
  });

  it('hitaampaa venettä kuin oma ei voi ostaa', () => {
    const state = gameAtLevel(80);
    state.inventory['motorboat'] = 1;
    expect(BOAT_ITEMS.map((boat) => hasFasterBoat(state, boat))).toEqual([true, true, true, false]);
    expect(buyBlock(state, 'rowboat')).toBe('slowerBoat');
    expect(buyBlock(state, 'sailboat')).toBe('slowerBoat');
    expect(buyBlock(state, 'motorboat')).toBe('owned');
    expect(buyBlock(state, 'luxury-boat')).toBeNull();
    expect(buyItem(state, 'luxury-boat')).toBe(true);
    expect(ownedBoat(state)?.id).toBe('luxury-boat');
  });

  it('kalliimpia veneitä myydään vasta tietyltä tasolta', () => {
    const low = gameAtLevel(1);
    expect(buyBlock(low, 'rowboat')).toBeNull();
    expect(buyBlock(low, 'sailboat')).toBe('level');
    expect(buyBlock(low, 'motorboat')).toBe('level');
    expect(buyBlock(low, 'luxury-boat')).toBe('level');
    const high = gameAtLevel(100);
    BOAT_ITEMS.forEach((boat) => expect(buyBlock(high, boat.id)).toBeNull());
  });

  it('laiturissa keinuu seuraava vene, jonka voi ostaa', () => {
    const state = createNewGame();
    expect(nextBoat(state)?.id).toBe('rowboat');
    state.inventory['sailboat'] = 1;
    expect(nextBoat(state)?.id).toBe('motorboat');
    state.inventory['luxury-boat'] = 1;
    expect(nextBoat(state)).toBeNull();
  });
});

describe('kalastus luksusveneestä', () => {
  const grid = buildWorldGrid(WORLD);
  const openSea = { x: 100, y: 120 };

  it('maalla saa kalastaa, merellä vain luksusveneestä', () => {
    const state = createNewGame();
    state.inventory['sailboat'] = 1;
    expect(canFishHere(state)).toBe(true);
    state.sailing = true;
    expect(canFishHere(state)).toBe(false);
    state.inventory['luxury-boat'] = 1;
    expect(canFishHere(state)).toBe(true);
  });

  it('aavalla merellä koho heitetään viereiseen meriruutuun, ei sankarin omaan', () => {
    expect(terrainAt(grid, openSea)).toBe('sea');
    const spot = fishingSpot(grid, openSea);
    expect(spot).not.toBeNull();
    expect(spot).not.toEqual(openSea);
    expect(spot && terrainAt(grid, spot)).toBe('sea');
  });
});

describe('vanhat tallennukset', () => {
  it('entinen purjevene latautuu uutena purjeveneenä', () => {
    const state = createNewGame();
    state.inventory['sailboat'] = 1;
    const loaded = decodeSave(encodeSave(state, meta));
    expect(loaded?.state.inventory['sailboat']).toBe(1);
    expect(loaded && ownedBoat(loaded.state)?.name).toBe('Purjevene');
  });
});
