import { describe, expect, it } from 'vitest';
import { getEnemy, getItem, getSprite, WORLD } from '../src/data';
import { FISHING } from '../src/data/fishing';
import { MERCHANT } from '../src/data/merchant';
import type { BaitDef } from '../src/data/types';
import { canDrink, drinkFromBag, selectionAction } from '../src/logic/backpack';
import {
  castPhase,
  castWith,
  finishCast,
  fishingBlock,
  fishingSpot,
  hasRod,
  isFishedEnemy,
  reel,
  rollCatch,
  startCast,
} from '../src/logic/fishing';
import { createNewGame, playerStats, type GameState } from '../src/logic/game-state';
import { decodeSave, encodeSave } from '../src/logic/save-format';
import { buyBlock, buyItem, buyPrice, sellItem, shopEntries } from '../src/logic/shop';
import { buildWorldGrid, terrainAt, type WorldGrid } from '../src/logic/world-grid';

// Kalastus: onki ja madot kauppiaalta, heitto ja nykäisy, saaliit ja kalan syöminen.

const meta = { savedAt: 1_700_000_000_000, place: 'Kotiranta' };

function fisher(worms = 5): GameState {
  const state = createNewGame();
  state.inventory['fishing-rod'] = 1;
  state.inventory['worm'] = worms;
  return state;
}

/** Pieni testikartta: vasemmalla järvi, oikealla pelto. */
const lakeGrid: WorldGrid = {
  width: 4,
  height: 3,
  cells: [
    ['lake', 'field', 'field', 'field'],
    ['lake', 'field', 'field', 'lava'],
    ['lake', 'field', 'field', 'field'],
  ],
};

const WORM = FISHING.baits[0] as BaitDef;
const BASIC_ROD = FISHING.rods[0] as (typeof FISHING.rods)[number];

/** Heitto tavallisella ongella ja madolla: kala nappaa 2 s kohdalla. */
function wormCast(bait: BaitDef = WORM) {
  return { biteAtMs: 2000, windowMs: BASIC_ROD.biteWindowMs, bait, rareMultiplier: 1 };
}

/** Arpa, joka antaa luvut järjestyksessä. */
function sequence(...values: number[]): () => number {
  let index = 0;
  return () => values[Math.min(index++, values.length - 1)] ?? 0;
}

describe('kalastustarvikkeet kauppiaalla', () => {
  it('Kaapo myy ongen ja matoja', () => {
    expect(MERCHANT.stock).toContain('fishing-rod');
    expect(MERCHANT.stock).toContain('worm');
    expect(getItem('fishing-rod').kind).toBe('tool');
    expect(getItem('worm').kind).toBe('bait');
  });

  it('madot ostetaan viiden pussissa yhden madon hinnalla kerrottuna', () => {
    const state = createNewGame();
    state.coins = 100;
    const worm = getItem('worm');
    expect(buyPrice(state, worm)).toBe(10);
    expect(buyItem(state, 'worm')).toBe(true);
    expect(state.inventory['worm']).toBe(5);
    expect(state.coins).toBe(90);
    expect(shopEntries(state, 'buy').find((entry) => entry.item.id === 'worm')?.count).toBe(5);
  });

  it('ongen voi ostaa vain kerran, matoja aina lisää', () => {
    const state = createNewGame();
    state.coins = 500;
    expect(buyItem(state, 'fishing-rod')).toBe(true);
    expect(buyBlock(state, 'fishing-rod')).toBe('owned');
    expect(buyItem(state, 'fishing-rod')).toBe(false);
    expect(buyItem(state, 'worm')).toBe(true);
    expect(buyItem(state, 'worm')).toBe(true);
    expect(state.inventory['worm']).toBe(10);
  });

  it('matoja ei voi myydä voitolla (myynti yksi kerrallaan halvemmalla)', () => {
    const state = fisher(5);
    expect(sellItem(state, 'worm')).toBeLessThan(getItem('worm').price ?? 0);
  });

  it('kalat voi myydä kauppiaalle', () => {
    const state = createNewGame();
    state.inventory['pike'] = 1;
    const coins = state.coins;
    expect(sellItem(state, 'pike')).toBe(7);
    expect(state.coins).toBe(coins + 7);
  });
});

describe('kalastuspaikka', () => {
  it('veden vieressä löytyy lähin vesiruutu, kauempana ei', () => {
    expect(fishingSpot(lakeGrid, { x: 1, y: 1 })).toEqual({ x: 0, y: 1 });
    expect(fishingSpot(lakeGrid, { x: 2, y: 1 })).toBeNull();
  });

  it('laavassa ei kalasteta', () => {
    expect(fishingSpot(lakeGrid, { x: 2, y: 0 })).toBeNull();
  });

  it('saaren hiekkarannalla voi kalastaa', () => {
    const grid = buildWorldGrid(WORLD);
    let found = false;
    for (let y = 0; y < grid.height && !found; y++) {
      for (let x = 0; x < grid.width && !found; x++) {
        found = terrainAt(grid, { x, y }) === 'sand' && fishingSpot(grid, { x, y }) !== null;
      }
    }
    expect(found).toBe(true);
  });
});

describe('heitto ja nykäisy', () => {
  it('ilman onkea tai matoja ei voi kalastaa', () => {
    const state = createNewGame();
    expect(hasRod(state)).toBe(false);
    expect(fishingBlock(state)).toBe('noRod');
    state.inventory['fishing-rod'] = 1;
    expect(fishingBlock(state)).toBe('noBait');
    state.inventory['worm'] = 1;
    expect(fishingBlock(state)).toBeNull();
  });

  it('kala nappaa sääntöjen aikavälillä', () => {
    const { min, max } = FISHING.biteDelayMs;
    expect(startCast(fisher(), () => 0)?.biteAtMs).toBe(min);
    expect(startCast(fisher(), () => 0.999)?.biteAtMs).toBeLessThanOrEqual(max);
    expect(startCast(createNewGame(), () => 0)).toBeNull();
    expect(castWith(BASIC_ROD, WORM, () => 0).bait.item).toBe('worm');
  });

  it('nykäisy: liian aikaisin, ajoissa tai liian myöhään', () => {
    const cast = wormCast();
    expect(castPhase(cast, 1999)).toBe('waiting');
    expect(reel(cast, 1000)).toBe('early');
    expect(castPhase(cast, 2000)).toBe('bite');
    expect(reel(cast, 2000 + cast.windowMs - 1)).toBe('caught');
    expect(castPhase(cast, 2000 + cast.windowMs)).toBe('escaped');
    expect(reel(cast, 9999)).toBe('escaped');
  });

  it('liian aikainen nykäisy ei vie matoa, myöhäinen vie', () => {
    const state = fisher(3);
    expect(finishCast(state, wormCast(), 'early', () => 0)).toBeNull();
    expect(state.inventory['worm']).toBe(3);
    expect(finishCast(state, wormCast(), 'escaped', () => 0)).toBeNull();
    expect(state.inventory['worm']).toBe(2);
  });

  it('saalis menee reppuun ja mato kuluu', () => {
    const state = fisher(1);
    const caught = finishCast(state, wormCast(), 'caught', () => 0);
    expect(caught).toEqual({ kind: 'item', item: 'perch' });
    expect(state.inventory['perch']).toBe(1);
    expect(state.inventory['worm']).toBe(0);
  });
});

describe('saaliit', () => {
  it('saaliit ovat olemassa: kaloja, panssari ja hai', () => {
    for (const entry of FISHING.baits.flatMap((bait) => bait.catches)) {
      if (entry.kind === 'item') {
        expect(() => getItem(entry.item), entry.item).not.toThrow();
      } else {
        expect(getEnemy(entry.enemy).backdrop).toBe('beach');
      }
      expect(entry.weight).toBeGreaterThan(0);
    }
    expect(getItem('fish-scale-armor').kind).toBe('gear');
    expect(getSprite('bobber').rows.length).toBe(6);
  });

  it.each(FISHING.baits)('syötillä $item tulee yleensä kalaa', (bait) => {
    const fish = bait.catches.filter(
      (entry) => entry.kind === 'item' && getItem(entry.item).kind === 'food',
    );
    const total = bait.catches.reduce((sum, entry) => sum + entry.weight, 0);
    const fishWeight = fish.reduce((sum, entry) => sum + entry.weight, 0);
    expect(fishWeight / total).toBeGreaterThan(0.5);
    expect(total).toBe(100);
  });

  it('painot valitsevat saaliin järjestyksessä', () => {
    const bait: BaitDef = {
      item: 'worm',
      catches: [
        { kind: 'item', item: 'perch', weight: 1 },
        { kind: 'enemy', enemy: 'shark', weight: 1 },
      ],
    };
    const state = fisher();
    expect(rollCatch(state, bait, 1, () => 0.2)).toEqual({ kind: 'item', item: 'perch' });
    expect(rollCatch(state, bait, 1, () => 0.7)).toEqual({ kind: 'enemy', enemy: 'shark' });
  });

  it('hai ei mene reppuun vaan aloittaa taistelun', () => {
    const bait: BaitDef = { item: 'worm', catches: [{ kind: 'enemy', enemy: 'shark', weight: 1 }] };
    const state = fisher(2);
    expect(finishCast(state, wormCast(bait), 'caught', () => 0)).toEqual({
      kind: 'enemy',
      enemy: 'shark',
    });
    expect(state.inventory['shark']).toBeUndefined();
    expect(state.inventory['worm']).toBe(1);
  });

  it('Kalan suomupanssaria ei saa toista kertaa', () => {
    const bait: BaitDef = {
      item: 'worm',
      catches: [
        { kind: 'item', item: 'fish-scale-armor', weight: 100 },
        { kind: 'item', item: 'perch', weight: 1 },
      ],
    };
    const state = fisher();
    expect(rollCatch(state, bait, 1, sequence(0))).toEqual({
      kind: 'item',
      item: 'fish-scale-armor',
    });
    state.equipped.body = 'fish-scale-armor';
    expect(rollCatch(state, bait, 1, sequence(0))).toEqual({ kind: 'item', item: 'perch' });
  });
});

describe('kalan syöminen', () => {
  it('kala syödään repusta ja elämä palautuu', () => {
    const state = createNewGame();
    state.inventory['pike'] = 1;
    state.hp = 1;
    expect(selectionAction(state, { kind: 'bag', itemId: 'pike' })).toBe('eat');
    expect(canDrink(state, 'pike')).toBe(true);
    const healed = drinkFromBag(state, 'pike');
    expect(healed).toBe(Math.min(25, playerStats(state).maxHp - 1));
    expect(state.inventory['pike']).toBe(0);
  });

  it('täysillä elämillä kalaa ei syödä', () => {
    const state = createNewGame();
    state.inventory['perch'] = 1;
    expect(canDrink(state, 'perch')).toBe(false);
  });

  it('onki ja madot säilyvät tallennuksessa', () => {
    const state = fisher(7);
    state.inventory['salmon'] = 2;
    const loaded = decodeSave(encodeSave(state, meta));
    expect(loaded?.state.inventory['fishing-rod']).toBe(1);
    expect(loaded?.state.inventory['worm']).toBe(7);
    expect(loaded?.state.inventory['salmon']).toBe(2);
  });
});

describe('hai taistelussa', () => {
  it('hai tunnistetaan onkeen tarttuneeksi viholliseksi, susi ei', () => {
    expect(isFishedEnemy('shark')).toBe(true);
    expect(isFishedEnemy('octopus')).toBe(true);
    expect(isFishedEnemy('wolf')).toBe(false);
  });
});
