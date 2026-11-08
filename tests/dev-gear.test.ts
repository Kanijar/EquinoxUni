import { describe, expect, it } from 'vitest';
import { ITEMS } from '../src/data';
import { DEV_GEAR_IDS, DEV_ITEMS } from '../src/data/dev-items';
import { GEAR_LOOKS } from '../src/data/gear-looks';
import { GEAR_SLOTS } from '../src/data/items';
import type { GearStat } from '../src/data/types';
import { bestGear, eatBurger } from '../src/logic/burger-secret';
import { isGear, unequipSlot } from '../src/logic/equipment';
import { createNewGame, playerStats } from '../src/logic/game-state';
import { canSell } from '../src/logic/shop';

// Data-tiedostojen lähdekoodi tekstinä: näin nähdään, ettei dev-varusteita mainita
// kaupoissa, pudotuksissa, kalastuksessa tai tehtävissä.
const DATA_SOURCES = import.meta.glob<string>('../src/data/*.ts', {
  eager: true,
  query: '?raw',
  import: 'default',
});

/** Tiedostot, joissa dev-varusteet saa mainita: itse esineet, kuvat ja ulkonäkö. */
const ALLOWED_FILES = ['dev-items.ts', 'sprites-dev-items.ts', 'gear-looks.ts'];

const otherGear = ITEMS.filter(isGear).filter((item) => !DEV_GEAR_IDS.includes(item.id));

/** Omistettujen kappaleiden määrä: repussa ja käytössä yhteensä. */
function ownedCount(state: ReturnType<typeof createNewGame>, id: string): number {
  const worn = Object.values(state.equipped).filter((worn) => worn === id).length;
  return (state.inventory[id] ?? 0) + worn;
}

describe('dev-varusteet', () => {
  it('jokaiseen varustepaikkaan on yksi dev-varuste', () => {
    expect(DEV_ITEMS.map((item) => item.slot).sort()).toEqual([...GEAR_SLOTS].sort());
    for (const item of DEV_ITEMS) {
      expect(ITEMS, item.id).toContain(item);
    }
  });

  it('dev-varusteen jokainen arvo ylittää kaikki muut saman paikan varusteet', () => {
    for (const dev of DEV_ITEMS) {
      for (const other of otherGear.filter((item) => item.slot === dev.slot)) {
        for (const [stat, value] of Object.entries(other.bonus)) {
          const devValue = dev.bonus[stat as GearStat] ?? 0;
          expect(devValue, `${dev.id} ${stat} vs ${other.id}`).toBeGreaterThan(value ?? 0);
        }
      }
      expect(bestGear(dev.slot)?.id).toBe(dev.id);
    }
  });

  it('dev-varusteita ei voi myydä eikä niillä ole tasovaatimusta', () => {
    const state = createNewGame();
    for (const item of DEV_ITEMS) {
      state.inventory[item.id] = 1;
      expect(item.price, item.id).toBeUndefined();
      expect(item.minLevel, item.id).toBeUndefined();
      expect(canSell(state, item.id), item.id).toBe(false);
    }
  });

  it('dev-varusteita ei mainita kaupoissa, pudotuksissa, kalastuksessa eikä tehtävissä', () => {
    const files = Object.entries(DATA_SOURCES);
    expect(files.length).toBeGreaterThan(10);
    for (const [path, source] of files) {
      if (ALLOWED_FILES.some((name) => path.endsWith(`/${name}`))) {
        continue;
      }
      for (const id of DEV_GEAR_IDS) {
        expect(source.includes(`'${id}'`), `${id} tiedostossa ${path}`).toBe(false);
      }
    }
  });

  it('burgeri antaa dev-varusteet, ja sankari vahvistuu selvästi', () => {
    const state = createNewGame();
    const before = playerStats(state);
    eatBurger(state);
    const after = playerStats(state);
    for (const item of DEV_ITEMS) {
      expect(state.equipped[item.slot]).toBe(item.id);
    }
    expect(after.attack).toBeGreaterThan(before.attack);
    expect(after.defense).toBeGreaterThan(before.defense);
    expect(after.maxHp).toBeGreaterThan(before.maxHp);
  });

  it('monta burgeria ei tuplaa dev-varusteita, vaikka ne olisi otettu pois käytöstä', () => {
    const state = createNewGame();
    eatBurger(state);
    eatBurger(state);
    unequipSlot(state.inventory, state.equipped, 'hand');
    eatBurger(state);
    eatBurger(state);
    for (const id of DEV_GEAR_IDS) {
      expect(ownedCount(state, id), id).toBe(1);
    }
    expect(state.equipped.hand).toBe('dev-sword');
  });

  it('dev-varusteilla on oma hieno ulkonäkö sankarin päällä', () => {
    expect(GEAR_LOOKS['dev-sword']).toMatchObject({ slot: 'hand', shape: 'greatsword' });
    expect(GEAR_LOOKS['dev-armor']).toMatchObject({ slot: 'body', shape: 'pauldrons' });
    expect(GEAR_LOOKS['dev-amulet']).toMatchObject({ slot: 'neck', shape: 'star' });
  });
});
