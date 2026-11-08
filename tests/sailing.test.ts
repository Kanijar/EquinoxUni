import { describe, expect, it } from 'vitest';
import { getEnemy, getItem, getNpc, getQuest, getSprite, QUESTS, TOWNS, WORLD } from '../src/data';
import { BOAT_SHOP } from '../src/data/boat-shop';
import { ISLE_ENEMIES } from '../src/data/isle-enemies';
import { ISLE_QUESTS } from '../src/data/isle-quests';
import { LEVEL_CURVE } from '../src/data/rules';
import { createNewGame, type GameState } from '../src/logic/game-state';
import { decodeSave, encodeSave } from '../src/logic/save-format';
import { buyBlock, buyItem, shopEntries } from '../src/logic/shop';
import {
  boardingTile,
  boatSpeedFactor,
  isBoat,
  isSailable,
  isSailing,
  landingTile,
  ownedBoat,
  readIsles,
  recordLanding,
  sailAction,
  toggleSailing,
} from '../src/logic/sailing';
import { toggleDriving } from '../src/logic/vehicle';
import type { Vec2 } from '../src/logic/vector';
import { buildWorldGrid, isleAt, isWalkable, townTile } from '../src/logic/world-grid';

// Venekauppa, vene ja pienet saaret (logic/sailing.ts, data/isles.ts).

const grid = buildWorldGrid(WORLD);
const meta = { savedAt: 1_700_000_000_000, place: 'Venesatama' };
const dockTown = TOWNS.find((town) => town.id === BOAT_SHOP.town);
if (!dockTown) throw new Error('Venesatamaa ei löytynyt');
const dock = townTile(dockTown);

/** Ensimmäinen ruutu, joka täyttää ehdon, kun kuljetaan Venesatamasta etelään. */
function southOfDock(test: (tile: Vec2) => boolean): Vec2 {
  for (let y = dock.y; y < grid.height; y++) {
    const tile = { x: dock.x, y };
    if (test(tile)) return tile;
  }
  throw new Error('ruutua ei löytynyt');
}

/** Rantaruutu Venesataman eteläpuolella (maata, vieressä meri). */
const shore = southOfDock((t) => isWalkable(grid, t) && boardingTile(grid, t) !== null);

function gameWithBoat(): GameState {
  const state = createNewGame();
  state.inventory['sailboat'] = 1;
  return state;
}

describe('venekauppa', () => {
  it('Veikko myy Venesatamassa neljää venettä, ensin Soutuveneen', () => {
    const boat = getItem('rowboat');
    expect(isBoat(boat)).toBe(true);
    expect(isBoat(boat) && getSprite(boat.mapSprite).id).toBe('rowboat-hero');
    expect(BOAT_SHOP.town).toBe('venesatama');
    const stock = shopEntries(createNewGame(), 'buy', BOAT_SHOP).map((entry) => entry.item.id);
    expect(stock.slice(0, 4)).toEqual(['rowboat', 'sailboat', 'motorboat', 'luxury-boat']);
  });

  it('veneen voi ostaa kolikoilla, mutta vain yhden', () => {
    const state = createNewGame();
    expect(buyBlock(state, 'rowboat')).toBe('noMoney');
    state.coins = 5000;
    expect(buyItem(state, 'rowboat')).toBe(true);
    expect(state.coins).toBe(5000 - (getItem('rowboat').price ?? 0));
    expect(ownedBoat(state)?.id).toBe('rowboat');
    expect(buyBlock(state, 'rowboat')).toBe('owned');
    expect(buyItem(state, 'rowboat')).toBe(false);
  });

  it('Venesatama on rannalla, ja sinne pääsee Kotirannasta tietä pitkin', () => {
    expect(isleAt(WORLD, dock)).toBeUndefined();
    expect(WORLD.roads).toContainEqual(['kotiranta', 'venesatama']);
    expect(Math.abs(shore.y - dock.y)).toBeLessThanOrEqual(3);
  });
});

describe('vene', () => {
  it('ilman venettä nappia ei ole, eikä vesille pääse', () => {
    const state = createNewGame();
    expect(sailAction(state, grid, shore)).toBeNull();
    expect(toggleSailing(state, grid, shore)).toBeNull();
    expect(state.sailing).toBe(false);
  });

  it('rannalla noustaan veneeseen viereiseen meriruutuun, ja Bugatti sammuu', () => {
    const state = gameWithBoat();
    state.inventory['bugatti-keys'] = 1;
    toggleDriving(state);
    expect(sailAction(state, grid, shore)).toBe('board');
    const sea = toggleSailing(state, grid, shore);
    expect(sea && isSailable(grid, sea)).toBe(true);
    expect(sea && Math.max(Math.abs(sea.x - shore.x), Math.abs(sea.y - shore.y))).toBe(1);
    expect(isSailing(state)).toBe(true);
    expect(state.driving).toBe(false);
    expect(boatSpeedFactor(state)).toBe(1.1);
  });

  it('kaukana rannasta ei voi nousta veneeseen', () => {
    const state = gameWithBoat();
    expect(boardingTile(grid, dock)).toBeNull();
    expect(sailAction(state, grid, dock)).toBeNull();
  });

  it('merellä rannan vieressä noustaan maihin, aavalla merellä ei', () => {
    const state = gameWithBoat();
    const sea = toggleSailing(state, grid, shore);
    expect(sea).not.toBeNull();
    if (!sea) return;
    expect(sailAction(state, grid, sea)).toBe('land');
    const openSea = { x: 100, y: 120 };
    expect(isSailable(grid, openSea)).toBe(true);
    expect(landingTile(grid, openSea)).toBeNull();
    expect(sailAction(state, grid, openSea)).toBeNull();
    const ground = toggleSailing(state, grid, sea);
    expect(ground && isWalkable(grid, ground)).toBe(true);
    expect(state.sailing).toBe(false);
    expect(boatSpeedFactor(state)).toBe(1);
  });

  it('järvellä ja kartan ulkopuolella ei purjehdita', () => {
    expect(isSailable(grid, { x: 58, y: 46 })).toBe(false);
    expect(isSailable(grid, { x: -1, y: 5 })).toBe(false);
    expect(isSailable(grid, { x: grid.width, y: 5 })).toBe(false);
  });

  it('ilman venettä sankari ei ole veneessä, vaikka tila sanoisi niin', () => {
    const state = createNewGame();
    state.sailing = true;
    expect(isSailing(state)).toBe(false);
  });
});

describe('pienet saaret', () => {
  it('saaria on neljä, ja jokainen on edellistä vaarallisempi', () => {
    expect(WORLD.isles.map((isle) => isle.id)).toEqual(['palm', 'mist', 'frost', 'storm']);
    const levels = WORLD.isles.map((isle) => isle.level);
    levels.forEach((level, i) => expect(level).toBeGreaterThan(levels[i - 1] ?? 0));
    expect(Math.max(...levels)).toBeLessThanOrEqual(LEVEL_CURVE.maxLevel);
  });

  it('ensimmäinen rantautuminen saarelle tallentuu kerran', () => {
    const state = gameWithBoat();
    const town = TOWNS.find((t) => t.id === 'kookoskyla');
    expect(town).toBeDefined();
    if (!town) return;
    const first = recordLanding(state, WORLD, townTile(town));
    expect(first).toMatchObject({ first: true, found: 1, total: 4 });
    expect(first?.isle.id).toBe('palm');
    expect(recordLanding(state, WORLD, townTile(town))?.first).toBe(false);
    expect(state.isles).toEqual(['palm']);
    expect(recordLanding(state, WORLD, dock)).toBeNull();
  });

  it('jokaisella saarella on kaksi omaa vihollista, jotka vahvistuvat saari saarelta', () => {
    expect(ISLE_ENEMIES.length).toBe(8);
    const power = (id: string): number => {
      const { maxHp, attack } = getEnemy(id).stats;
      return maxHp * attack;
    };
    const pairs = [
      ['pirate', 'jungle-snake'],
      ['skeleton', 'ghost'],
      ['ice-golem', 'crystal-spider'],
      ['thunderbird', 'sea-serpent'],
    ];
    const weakest = pairs.map((pair) => Math.min(...pair.map(power)));
    weakest.forEach((p, i) => expect(p).toBeGreaterThan(weakest[i - 1] ?? power('dragon')));
  });

  it('jokaisella saarella on tehtävänantaja kahdella tehtävällä', () => {
    for (const npc of ['kalle', 'veera', 'pekka', 'matti']) {
      const town = TOWNS.find((t) => t.id === getNpc(npc).town);
      expect(town && isleAt(WORLD, townTile(town))).toBeTruthy();
      const quests = QUESTS.filter((quest) => quest.giver === npc);
      expect(quests.length).toBe(2);
      expect(quests[1]?.requires).toBe(quests[0]?.id);
    }
    expect(ISLE_QUESTS.every((quest) => getQuest(quest.id) === quest)).toBe(true);
  });
});

describe('veneen tallennus', () => {
  it('vene, purjehdus ja löydetyt saaret tallentuvat', () => {
    const state = gameWithBoat();
    state.sailing = true;
    state.isles.push('palm', 'mist');
    const loaded = decodeSave(encodeSave(state, meta));
    expect(loaded?.state.sailing).toBe(true);
    expect(loaded?.state.isles).toEqual(['palm', 'mist']);
    expect(loaded?.state.inventory['sailboat']).toBe(1);
  });

  it('vanha tallennus ilman venettä latautuu: ei veneessä, ei löydettyjä saaria', () => {
    const raw = JSON.parse(encodeSave(createNewGame(), meta)) as Record<string, unknown>;
    const state = raw['state'] as Record<string, unknown>;
    delete state['sailing'];
    delete state['isles'];
    const loaded = decodeSave(JSON.stringify(raw));
    expect(loaded?.state.sailing).toBe(false);
    expect(loaded?.state.isles).toEqual([]);
  });

  it('tuntemattomat ja toistuvat saaret jätetään pois', () => {
    expect(readIsles(['palm', 'atlantis', 'palm', 3, 'storm'], WORLD)).toEqual(['palm', 'storm']);
    expect(readIsles('palm', WORLD)).toEqual([]);
  });
});
