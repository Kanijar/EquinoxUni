import { describe, expect, it } from 'vitest';
import { getItem, getSprite, WORLD } from '../src/data';
import { BACKPACK_VIEW } from '../src/config/game-config';
import { CAVE, WITCH } from '../src/data/cave';
import { bestGear, eatBurger } from '../src/logic/burger-secret';
import { atCaveMouth, isCaveOpen, pullSword, swordStatus } from '../src/logic/cave';
import { createNewGame, playerStats } from '../src/logic/game-state';
import { minXpForLevel } from '../src/logic/progression';
import { decodeSave, encodeSave } from '../src/logic/save-format';
import { buyBlock, buyItem, canSell, shopStock } from '../src/logic/shop';
import { knowsSpell } from '../src/logic/spells';
import { buildWorldGrid, isWalkable, pointTile } from '../src/logic/world-grid';

// Peikkokuninkaan luola: aukeaa bossin voitosta, Excalibur kivessä ja Noidan kauppa.

function bossBeaten(level = 1) {
  const state = createNewGame(minXpForLevel(level));
  state.bossDefeated = true;
  return state;
}

describe('luolan avautuminen', () => {
  it('luola on kiinni, kunnes Peikkokuningas on voitettu', () => {
    const closed = createNewGame(minXpForLevel(CAVE.swordMinLevel));
    expect(isCaveOpen(closed)).toBe(false);
    expect(pullSword(closed)).toBe(false);
    expect(isCaveOpen(bossBeaten())).toBe(true);
  });

  it('luolan suu on kävelymaata, ja sille pääsee viereisestä ruudusta', () => {
    const grid = buildWorldGrid(WORLD);
    const mouth = pointTile(CAVE);
    expect(isWalkable(grid, mouth)).toBe(true);
    expect(atCaveMouth(mouth)).toBe(true);
    expect(atCaveMouth({ x: mouth.x + 1, y: mouth.y - 1 })).toBe(true);
    expect(atCaveMouth({ x: mouth.x + 2, y: mouth.y })).toBe(false);
  });

  it('vanhassa tallennuksessa voitetun bossin luola on auki, ja miekka on yhä kivessä', () => {
    const raw = JSON.parse(encodeSave(bossBeaten(), { savedAt: 1, place: 'Kotiranta' })) as {
      state: Record<string, unknown>;
    };
    delete raw.state['swordTaken'];
    const loaded = decodeSave(JSON.stringify(raw))?.state;
    expect(loaded?.swordTaken).toBe(false);
    expect(loaded && isCaveOpen(loaded)).toBe(true);
  });
});

describe('Excalibur kivessä', () => {
  it('miekan voi vetää vasta tarpeeksi korkealla tasolla', () => {
    const low = bossBeaten(CAVE.swordMinLevel - 1);
    expect(swordStatus(low)).toBe('level');
    expect(pullSword(low)).toBe(false);
    expect(low.equipped.hand).toBeUndefined();
  });

  it('vedetty miekka menee käteen, ja vanha ase palaa reppuun', () => {
    const state = bossBeaten(CAVE.swordMinLevel);
    state.equipped.hand = 'club';
    const attackBefore = playerStats(state).attack;
    expect(swordStatus(state)).toBe('ready');
    expect(pullSword(state)).toBe(true);
    expect(state.equipped.hand).toBe('excalibur');
    expect(state.inventory['club']).toBe(1);
    expect(playerStats(state).attack).toBeGreaterThan(attackBefore);
    expect(swordStatus(state)).toBe('taken');
  });

  it('miekan saa vain kerran, vaikka sen myisi', () => {
    const state = bossBeaten(CAVE.swordMinLevel);
    pullSword(state);
    // Myydään miekka: se ei ole enää sankarilla, mutta kivi pysyy tyhjänä.
    delete state.equipped.hand;
    expect(swordStatus(state)).toBe('taken');
    expect(pullSword(state)).toBe(false);
    const loaded = decodeSave(encodeSave(state, { savedAt: 1, place: 'Kotiranta' }))?.state;
    expect(loaded?.swordTaken).toBe(true);
  });

  it('salainen burgeri antaa Excaliburin, jolloin kivi on tyhjä', () => {
    const state = bossBeaten(CAVE.swordMinLevel);
    eatBurger(state);
    expect(state.equipped.hand).toBe('excalibur');
    expect(swordStatus(state)).toBe('taken');
  });

  it('Excalibur on pelin paras ase', () => {
    expect(getItem(CAVE.sword).kind).toBe('gear');
    expect(bestGear('hand')?.id).toBe(CAVE.sword);
  });
});

describe('Noidan kauppa', () => {
  it('Noita myy loitsukirjoja ja voimia, ja jokaisella on hinta ja kuva', () => {
    const kinds = new Set(shopStock(WITCH).map((item) => item.kind));
    expect([...kinds].sort()).toEqual(['power', 'spell']);
    for (const item of shopStock(WITCH)) {
      expect(item.price ?? 0, item.id).toBeGreaterThan(0);
      expect(getSprite(item.sprite).id).toBe(item.sprite);
    }
  });

  it('Noidan kaupassa on "???"-nappi, ja tavarat mahtuvat yhdelle riville sen yläpuolelle', () => {
    expect(WITCH.comingSoon).toBe(true);
    expect(shopStock(WITCH).length).toBeLessThanOrEqual(BACKPACK_VIEW.bagColumns);
  });

  it('loitsukirjan ostaminen opettaa loitsun, eikä samaa kirjaa osteta toista kertaa', () => {
    const state = bossBeaten();
    state.coins = 1000;
    expect(knowsSpell(state.inventory, 'lightning')).toBe(false);
    expect(buyItem(state, 'spell-lightning')).toBe(true);
    expect(knowsSpell(state.inventory, 'lightning')).toBe(true);
    expect(state.coins).toBe(1000 - (getItem('spell-lightning').price ?? 0));
    expect(buyBlock(state, 'spell-lightning')).toBe('owned');
  });

  it('opittua loitsua ei voi myydä', () => {
    const state = bossBeaten();
    state.inventory['spell-lightning'] = 1;
    expect(canSell(state, 'spell-lightning')).toBe(false);
  });

  it('paremmat loitsut myydään vasta korkeammalla tasolla', () => {
    const state = bossBeaten(1);
    state.coins = 10_000;
    expect(buyBlock(state, 'spell-healing')).toBe('level');
  });
});
