import { describe, expect, it } from 'vitest';
import { getItem } from '../src/data';
import { PLAYER } from '../src/data/player';
import {
  canDrink,
  drinkFromBag,
  equipFromBag,
  selectedItemId,
  selectionAction,
  unequipToBag,
} from '../src/logic/backpack';
import {
  applyGear,
  bagItems,
  equipItem,
  gearBonus,
  ownsItem,
  unequipSlot,
  type Equipped,
} from '../src/logic/equipment';
import {
  canSpendSkillPoint,
  createNewGame,
  playerFighter,
  playerStats,
  skillStats,
} from '../src/logic/game-state';

// Reppu ja varusteet: varusteen voi laittaa käyttöön ja ottaa pois, yksi per paikka,
// ja käytössä olevien varusteiden lisäykset näkyvät pelaajan arvoissa ja taistelussa.

const bonusOf = (id: string) => {
  const item = getItem(id);
  return item.kind === 'gear' ? item.bonus : {};
};

describe('varusteet', () => {
  it('varuste siirtyy repusta käyttöön ja takaisin', () => {
    const inventory: Record<string, number> = { club: 1, potion: 2 };
    const equipped: Equipped = {};
    expect(equipItem(inventory, equipped, 'club')).toBe(true);
    expect(equipped).toEqual({ hand: 'club' });
    expect(inventory).toEqual({ club: 0, potion: 2 });
    expect(unequipSlot(inventory, equipped, 'hand')).toBe(true);
    expect(equipped.hand).toBeUndefined();
    expect(inventory).toEqual({ potion: 2, club: 1 });
  });

  it('samaan paikkaan mahtuu yksi: vanha varuste palaa reppuun', () => {
    const inventory: Record<string, number> = { club: 1, knife: 1 };
    const equipped: Equipped = {};
    equipItem(inventory, equipped, 'club');
    equipItem(inventory, equipped, 'knife');
    expect(equipped).toEqual({ hand: 'knife' });
    expect(inventory).toEqual({ club: 1, knife: 0 });
  });

  it('eri paikkoihin voi laittaa varusteet yhtä aikaa', () => {
    const inventory: Record<string, number> = { club: 1, 'robber-clothes': 1, 'tooth-necklace': 1 };
    const equipped: Equipped = {};
    for (const id of ['club', 'robber-clothes', 'tooth-necklace']) {
      expect(equipItem(inventory, equipped, id)).toBe(true);
    }
    expect(equipped).toEqual({ hand: 'club', body: 'robber-clothes', neck: 'tooth-necklace' });
    expect(bagItems(inventory)).toEqual([]);
  });

  it('juomaa tai puuttuvaa varustetta ei voi laittaa käyttöön, tyhjää paikkaa ei voi riisua', () => {
    const inventory: Record<string, number> = { potion: 1 };
    const equipped: Equipped = {};
    expect(equipItem(inventory, equipped, 'potion')).toBe(false);
    expect(equipItem(inventory, equipped, 'club')).toBe(false);
    expect(unequipSlot(inventory, equipped, 'neck')).toBe(false);
    expect(inventory).toEqual({ potion: 1 });
  });

  it('lisäykset lasketaan yhteen ja lisätään arvoihin', () => {
    const equipped: Equipped = { hand: 'knife', body: 'robber-clothes' };
    const knife = bonusOf('knife').critPercent ?? 0;
    const clothes = bonusOf('robber-clothes').critPercent ?? 0;
    expect(gearBonus(equipped, 'critPercent')).toBe(knife + clothes);
    const stats = applyGear(PLAYER.stats, equipped);
    expect(stats.critPercent).toBe(PLAYER.stats.critPercent + knife + clothes);
    expect(stats.speed).toBe(PLAYER.stats.speed);
    expect(applyGear(PLAYER.stats, {})).toEqual(PLAYER.stats);
  });

  it('pelaaja omistaa esineen, joka on repussa tai käytössä', () => {
    expect(ownsItem({ club: 1 }, {}, 'club')).toBe(true);
    expect(ownsItem({}, { hand: 'club' }, 'club')).toBe(true);
    expect(ownsItem({ club: 0 }, {}, 'club')).toBe(false);
  });
});

describe('varusteet pelaajan arvoissa', () => {
  it('peikon nuija kädessä antaa paljon hyökkäystä, myös taistelussa', () => {
    const state = createNewGame();
    state.inventory['club'] = 1;
    equipFromBag(state, 'club');
    const extra = bonusOf('club').attack ?? 0;
    expect(extra).toBeGreaterThanOrEqual(5);
    expect(playerStats(state).attack).toBe(PLAYER.stats.attack + extra);
    expect(playerFighter(state).attack).toBe(PLAYER.stats.attack + extra);
    unequipToBag(state, 'hand');
    expect(playerStats(state).attack).toBe(PLAYER.stats.attack);
  });

  it('puukko ja ryöstäjän vaatteet nostavat tarkkuutta (kriittinen osuma)', () => {
    const state = createNewGame();
    state.inventory['knife'] = 1;
    state.inventory['robber-clothes'] = 1;
    equipFromBag(state, 'knife');
    equipFromBag(state, 'robber-clothes');
    expect(playerStats(state).critPercent).toBeGreaterThan(PLAYER.stats.critPercent);
    expect(playerFighter(state).critChance).toBe(playerStats(state).critPercent / 100);
  });

  it('hammaskoru nostaa maksimielämää, ja pois otettaessa elämä pysyy rajoissa', () => {
    const state = createNewGame();
    state.inventory['tooth-necklace'] = 1;
    equipFromBag(state, 'tooth-necklace');
    const maxHp = playerStats(state).maxHp;
    expect(maxHp).toBeGreaterThan(PLAYER.stats.maxHp);
    // Koru ei paranna itsestään: elämä on sama kuin ennen.
    expect(state.hp).toBe(PLAYER.stats.maxHp);
    state.hp = maxHp;
    unequipToBag(state, 'neck');
    expect(state.hp).toBe(PLAYER.stats.maxHp);
  });

  it('varusteet eivät vie kyvyn ylärajaa: tarkkuuteen voi yhä laittaa pisteitä', () => {
    const state = createNewGame();
    state.xp = 10_000;
    state.skills.precision = 15;
    state.equipped.hand = 'knife';
    state.equipped.body = 'robber-clothes';
    expect(skillStats(state).critPercent).toBeLessThan(40);
    expect(playerStats(state).critPercent).toBeGreaterThanOrEqual(40);
    expect(canSpendSkillPoint(state, 'precision')).toBe(true);
  });
});

describe('juoma repusta', () => {
  it('juoma palauttaa elämää ja kuluu', () => {
    const state = createNewGame();
    const potions = state.inventory['potion'] ?? 0;
    state.hp = 5;
    expect(canDrink(state, 'potion')).toBe(true);
    expect(drinkFromBag(state, 'potion')).toBe(10);
    expect(state.hp).toBe(15);
    expect(state.inventory['potion']).toBe(potions - 1);
  });

  it('täysillä elämillä tai ilman juomaa ei voi juoda, eikä elämä nouse yli maksimin', () => {
    const state = createNewGame();
    expect(canDrink(state, 'potion')).toBe(false);
    expect(drinkFromBag(state, 'potion')).toBe(0);
    state.hp = PLAYER.stats.maxHp - 3;
    expect(drinkFromBag(state, 'potion')).toBe(3);
    state.hp = 1;
    state.inventory['potion'] = 0;
    expect(canDrink(state, 'potion')).toBe(false);
    state.inventory['club'] = 1;
    expect(canDrink(state, 'club')).toBe(false);
  });
});

describe('repun valinta', () => {
  it('valitulle esineelle tarjotaan oikea toiminto', () => {
    const state = createNewGame();
    state.inventory['club'] = 1;
    state.equipped.neck = 'tooth-necklace';
    expect(selectionAction(state, { kind: 'bag', itemId: 'club' })).toBe('equip');
    expect(selectionAction(state, { kind: 'bag', itemId: 'potion' })).toBe('drink');
    expect(selectionAction(state, { kind: 'slot', slot: 'neck' })).toBe('unequip');
    expect(selectionAction(state, { kind: 'slot', slot: 'hand' })).toBeNull();
    expect(selectionAction(state, { kind: 'bag', itemId: 'knife' })).toBeNull();
    expect(selectedItemId(state, { kind: 'slot', slot: 'neck' })).toBe('tooth-necklace');
  });
});
