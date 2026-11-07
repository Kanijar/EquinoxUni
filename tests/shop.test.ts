import { describe, expect, it } from 'vitest';
import { getItem, getSprite, ITEMS } from '../src/data';
import { MERCHANT, SHOP_RULES } from '../src/data/merchant';
import { PLAYER } from '../src/data/player';
import { equipFromBag } from '../src/logic/backpack';
import { decodeSave, encodeSave } from '../src/logic/save-format';
import { createNewGame, unspentSkillPoints, type GameState } from '../src/logic/game-state';
import {
  buyBlock,
  buyItem,
  buyPrice,
  canSell,
  sellItem,
  sellPrice,
  shopEntries,
  shopOffer,
  shopStock,
} from '../src/logic/shop';

// Kulkevan kauppiaan kauppa: ostaminen kolikoilla, myyminen ja voimakristallit.

function richGame(coins = 5000): GameState {
  const state = createNewGame();
  state.coins = coins;
  return state;
}

describe('kulkevan kauppiaan kauppa', () => {
  it('uusi peli alkaa muutamalla kolikolla', () => {
    expect(createNewGame().coins).toBe(PLAYER.startCoins);
  });

  it('ostaminen vähentää kolikoita ja laittaa tavaran reppuun', () => {
    const state = richGame(100);
    expect(buyItem(state, 'iron-sword')).toBe(true);
    expect(state.coins).toBe(100 - 80);
    expect(state.inventory['iron-sword']).toBe(1);
  });

  it('jos kolikot eivät riitä, mitään ei tapahdu', () => {
    const state = richGame(79);
    expect(buyBlock(state, 'iron-sword')).toBe('noMoney');
    expect(buyItem(state, 'iron-sword')).toBe(false);
    expect(state.coins).toBe(79);
    expect(state.inventory['iron-sword']).toBeUndefined();
  });

  it('samaa varustetta ei osteta toista kertaa, juomia saa ostaa monta', () => {
    const state = richGame();
    buyItem(state, 'iron-sword');
    expect(buyBlock(state, 'iron-sword')).toBe('owned');
    equipFromBag(state, 'iron-sword');
    expect(buyBlock(state, 'iron-sword')).toBe('owned');
    expect(buyItem(state, 'potion')).toBe(true);
    expect(buyItem(state, 'potion')).toBe(true);
    expect(state.inventory['potion']).toBe((PLAYER.startItems[0]?.count ?? 0) + 2);
  });

  it('voimakristalli antaa heti kykypisteen eikä mene reppuun', () => {
    const state = richGame();
    expect(unspentSkillPoints(state)).toBe(0);
    expect(buyItem(state, 'power-crystal')).toBe(true);
    expect(unspentSkillPoints(state)).toBe(1);
    expect(state.bonusSkillPoints).toBe(1);
    expect(state.inventory['power-crystal']).toBeUndefined();
  });

  it('voimakristallin hinta nousee joka ostolla', () => {
    const state = richGame();
    const crystal = getItem('power-crystal');
    if (crystal.kind !== 'power') throw new Error('kristalli ei ole voima');
    expect(buyPrice(state, crystal)).toBe(crystal.price);
    buyItem(state, 'power-crystal');
    buyItem(state, 'power-crystal');
    expect(buyPrice(state, crystal)).toBe(crystal.price + 2 * crystal.priceStep);
    expect(state.coins).toBe(5000 - crystal.price - (crystal.price + crystal.priceStep));
  });

  it('ostetun kykypisteen voi käyttää, vaikka tasoja ei ole', () => {
    const state = richGame();
    buyItem(state, 'power-crystal');
    state.skills.attack += 1;
    expect(unspentSkillPoints(state)).toBe(0);
  });

  it('myyminen antaa puolet hinnasta ja vie tavaran repusta', () => {
    const state = createNewGame();
    state.inventory['club'] = 1;
    const coins = sellItem(state, 'club');
    expect(coins).toBe(Math.floor(60 * SHOP_RULES.sellFactor));
    expect(state.coins).toBe(PLAYER.startCoins + coins);
    expect(state.inventory['club']).toBe(0);
    expect(canSell(state, 'club')).toBe(false);
  });

  it('käytössä olevaa varustetta ei voi myydä', () => {
    const state = createNewGame();
    state.inventory['club'] = 1;
    equipFromBag(state, 'club');
    expect(canSell(state, 'club')).toBe(false);
    expect(sellItem(state, 'club')).toBe(0);
    expect(state.equipped.hand).toBe('club');
  });

  it('tehtäväesinettä ja Bugattin avaimia ei voi myydä', () => {
    const state = createNewGame();
    state.inventory['wolf-tuft'] = 1;
    state.inventory['bugatti-keys'] = 1;
    expect(sellPrice(getItem('wolf-tuft'))).toBeNull();
    expect(sellItem(state, 'bugatti-keys')).toBe(0);
    expect(shopOffer(state, 'sell', 'wolf-tuft').block).toBe('notBought');
    expect(state.inventory['bugatti-keys']).toBe(1);
  });

  it('ostopuolella näkyvät kauppiaan tavarat, myyntipuolella repun tavarat', () => {
    const state = createNewGame();
    expect(shopEntries(state, 'buy').map((entry) => entry.item.id)).toEqual(MERCHANT.stock);
    expect(shopEntries(state, 'sell')).toEqual([{ item: getItem('potion'), count: 3 }]);
    expect(shopOffer(state, 'buy', 'rune-axe')).toEqual({ price: 900, block: 'noMoney' });
    expect(shopOffer(state, 'buy', 'potion')).toEqual({ price: 15, block: null });
  });
});

describe('kolikoiden tallennus', () => {
  const meta = { savedAt: 1_700_000_000_000, place: 'Kotiranta' };

  it('kolikot ja ostetut kykypisteet tallentuvat', () => {
    const state = richGame(321);
    buyItem(state, 'power-crystal');
    const loaded = decodeSave(encodeSave(state, meta))?.state;
    expect(loaded?.coins).toBe(state.coins);
    expect(loaded?.bonusSkillPoints).toBe(1);
  });

  it('vanha tallennus ilman kolikoita latautuu: kolikoita ja ostettuja pisteitä on 0', () => {
    const raw = JSON.parse(encodeSave(createNewGame(), meta)) as { state: Record<string, unknown> };
    delete raw.state['coins'];
    delete raw.state['bonusSkillPoints'];
    delete raw.state['merchantMs'];
    const loaded = decodeSave(JSON.stringify(raw))?.state;
    expect(loaded?.coins).toBe(0);
    expect(loaded?.bonusSkillPoints).toBe(0);
    expect(loaded?.merchantMs).toBe(0);
  });
});

describe('kaupan sisältö', () => {
  it('kauppiaan jokaisella tavaralla on hinta ja kuva', () => {
    for (const item of shopStock()) {
      expect(buyPrice(createNewGame(), item), item.id).toBeGreaterThan(0);
      expect(getSprite(item.sprite).id).toBe(item.sprite);
    }
  });

  it('jokaisen varusteen voi myydä, ja myyntihinta on pienempi kuin ostohinta', () => {
    for (const item of ITEMS.filter((entry) => entry.kind === 'gear')) {
      const sell = sellPrice(item);
      expect(sell, item.id).not.toBeNull();
      expect(sell ?? 0, item.id).toBeLessThan(item.price ?? 0);
    }
  });

  it('kauppias myy aseita, varusteita, juomia ja voimia', () => {
    const kinds = new Set(shopStock().map((item) => item.kind));
    expect([...kinds].sort()).toEqual(['gear', 'heal', 'power']);
    const slots = new Set(shopStock().flatMap((item) => (item.kind === 'gear' ? [item.slot] : [])));
    expect([...slots].sort()).toEqual(['body', 'hand', 'neck']);
  });
});
