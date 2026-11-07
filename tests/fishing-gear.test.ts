import { describe, expect, it } from 'vitest';
import { getItem, getSprite } from '../src/data';
import { FISHING } from '../src/data/fishing';
import { MERCHANT } from '../src/data/merchant';
import { selectionAction } from '../src/logic/backpack';
import { catchWeight, finishCast, startCast } from '../src/logic/fishing';
import { baitInUse, bestRod, chooseBait, findBait, findRod } from '../src/logic/fishing-gear';
import { createNewGame, type GameState } from '../src/logic/game-state';
import { levelForXp } from '../src/logic/progression';
import { xpForLevel } from '../src/data/level-curve';
import { LEVEL_CURVE } from '../src/data/rules';
import { decodeSave, encodeSave } from '../src/logic/save-format';
import { buyBlock, buyItem } from '../src/logic/shop';

// Kalastusvälineet: onkien tasot, syöttien valinta ja tasovaatimukset kaupassa.

const meta = { savedAt: 1_700_000_000_000, place: 'Kotiranta' };

function gameAtLevel(level: number): GameState {
  const state = createNewGame(xpForLevel(level, LEVEL_CURVE));
  state.coins = 10_000;
  return state;
}

describe('onget', () => {
  it('jokainen onki on olemassa, myytävänä ja parempi kuin edellinen', () => {
    FISHING.rods.forEach((rod, index) => {
      expect(getItem(rod.item).kind).toBe('tool');
      expect(MERCHANT.stock).toContain(rod.item);
      expect(() => getSprite(getItem(rod.item).sprite)).not.toThrow();
      const previous = FISHING.rods[index - 1];
      if (previous) {
        expect(rod.biteWindowMs).toBeGreaterThan(previous.biteWindowMs);
        expect(rod.biteDelayFactor).toBeLessThan(previous.biteDelayFactor);
        expect(rod.rareMultiplier).toBeGreaterThan(previous.rareMultiplier);
        expect(getItem(rod.item).price ?? 0).toBeGreaterThan(getItem(previous.item).price ?? 0);
      }
    });
  });

  it('sankari käyttää parasta onkeaan', () => {
    const state = createNewGame();
    expect(bestRod(state.inventory)).toBeNull();
    state.inventory['fishing-rod'] = 1;
    state.inventory['golden-rod'] = 1;
    expect(bestRod(state.inventory)?.item).toBe('golden-rod');
  });

  it('parempi onki: kala nappaa nopeammin ja nykäisyyn on enemmän aikaa', () => {
    const state = createNewGame();
    state.inventory['worm'] = 2;
    state.inventory['fishing-rod'] = 1;
    const basic = startCast(state, () => 0.5);
    state.inventory['sea-king-rod'] = 1;
    const best = startCast(state, () => 0.5);
    expect(best?.biteAtMs).toBeLessThan(basic?.biteAtMs ?? 0);
    expect(best?.windowMs).toBeGreaterThan(basic?.windowMs ?? 0);
  });

  it('parempi onki kertoo vain harvinaisten saaliiden painot', () => {
    expect(catchWeight({ kind: 'item', item: 'perch', weight: 50 }, 3)).toBe(50);
    expect(catchWeight({ kind: 'item', item: 'salmon', weight: 10, rare: true }, 3)).toBe(30);
  });

  it('kultaisella vavalla harvinainen saalis tulee useammin', () => {
    const state = createNewGame();
    state.inventory['golden-rod'] = 1;
    state.inventory['worm'] = 1;
    const cast = startCast(state, () => 0);
    expect(cast?.rareMultiplier).toBe(2);
    // Madolla: ahven 52 + hauki 23 = 75. Kertoimella 2 lohi on 75–95 eli arpa 0,8 × 120 = 96 → lohi.
    expect(cast && finishCast(state, cast, 'caught', () => 0.79)).toEqual({
      kind: 'item',
      item: 'salmon',
    });
  });
});

describe('syötit', () => {
  it('jokainen syötti on olemassa, myytävänä ja sillä on saaliita', () => {
    for (const bait of FISHING.baits) {
      expect(getItem(bait.item).kind).toBe('bait');
      expect(MERCHANT.stock).toContain(bait.item);
      expect(bait.catches.length).toBeGreaterThan(0);
    }
    expect(findBait('club')).toBeNull();
    expect(findRod('worm')).toBeNull();
  });

  it('syötit houkuttelevat eri saaliita: katkarapu haita, uistin jättimustekalan', () => {
    const weightOf = (bait: string, id: string): number =>
      findBait(bait)?.catches.find((c) => (c.kind === 'item' ? c.item : c.enemy) === id)?.weight ??
      0;
    expect(weightOf('shrimp', 'shark')).toBeGreaterThan(weightOf('worm', 'shark'));
    expect(weightOf('fly', 'trout')).toBeGreaterThan(weightOf('worm', 'trout'));
    expect(weightOf('lure', 'octopus')).toBeGreaterThan(0);
    expect(weightOf('worm', 'octopus')).toBe(0);
    expect(weightOf('lure', 'pearl-necklace')).toBeGreaterThan(0);
  });

  it('ilman valintaa kalastetaan madoilla, valittu syötti menee edelle', () => {
    const state = createNewGame();
    state.inventory['worm'] = 3;
    state.inventory['shrimp'] = 2;
    expect(baitInUse(state, state.inventory)?.item).toBe('worm');
    expect(selectionAction(state, { kind: 'bag', itemId: 'shrimp' })).toBe('bait');
    expect(chooseBait(state, state.inventory, 'shrimp')).toBe(true);
    expect(baitInUse(state, state.inventory)?.item).toBe('shrimp');
  });

  it('kun valittu syötti loppuu, kalastetaan seuraavalla', () => {
    const state = createNewGame();
    state.inventory['fishing-rod'] = 1;
    state.inventory['worm'] = 1;
    state.inventory['lure'] = 1;
    chooseBait(state, state.inventory, 'lure');
    const cast = startCast(state, () => 0);
    expect(cast?.bait.item).toBe('lure');
    if (cast) finishCast(state, cast, 'escaped', () => 0);
    expect(state.inventory['lure']).toBe(0);
    expect(baitInUse(state, state.inventory)?.item).toBe('worm');
  });

  it('syötiksi ei voi valita muuta kuin syöttiä, jota on repussa', () => {
    const state = createNewGame();
    expect(chooseBait(state, state.inventory, 'fly')).toBe(false);
    state.inventory['club'] = 1;
    expect(chooseBait(state, state.inventory, 'club')).toBe(false);
    expect(state.bait).toBeNull();
  });

  it('valittu syötti säilyy tallennuksessa, vanhassa tallennuksessa ei valintaa', () => {
    const state = createNewGame();
    state.inventory['fly'] = 5;
    chooseBait(state, state.inventory, 'fly');
    expect(decodeSave(encodeSave(state, meta))?.state.bait).toBe('fly');
    const old = JSON.parse(encodeSave(createNewGame(), meta)) as { state: Record<string, unknown> };
    delete old.state['bait'];
    expect(decodeSave(JSON.stringify(old))?.state.bait).toBeNull();
  });
});

describe('tasovaatimukset kaupassa', () => {
  it('parempia onkia ja syöttejä myydään vasta tietyltä tasolta', () => {
    const low = gameAtLevel(1);
    expect(levelForXp(low.xp)).toBe(1);
    expect(buyBlock(low, 'carbon-rod')).toBe('level');
    expect(buyBlock(low, 'lure')).toBe('level');
    expect(buyItem(low, 'shrimp')).toBe(false);
    expect(buyItem(low, 'fly')).toBe(true);
    const high = gameAtLevel(30);
    expect(buyItem(high, 'sea-king-rod')).toBe(true);
    expect(buyBlock(high, 'sea-king-rod')).toBe('owned');
    expect(buyItem(high, 'lure')).toBe(true);
    expect(high.inventory['lure']).toBe(3);
  });
});
