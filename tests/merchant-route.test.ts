import { describe, expect, it } from 'vitest';
import { getSprite, getTown, WORLD } from '../src/data';
import { MERCHANT } from '../src/data/merchant';
import { createNewGame } from '../src/logic/game-state';
import {
  advanceMerchant,
  merchantPlan,
  merchantSpot,
  planRoute,
  readMerchantMs,
} from '../src/logic/merchant-route';
import { decodeSave, encodeSave } from '../src/logic/save-format';
import { buildWorldGrid, townTile } from '../src/logic/world-grid';

// Kulkevan kauppiaan reitti: pysähdykset paikkakunnissa, kävely teitä pitkin ja kello,
// joka tallentuu peliin.

const grid = buildWorldGrid(WORLD);
const meta = { savedAt: 1_700_000_000_000, place: 'Kotiranta' };

/** Pieni testireitti: kaksi paikkakuntaa 4 ruudun päässä toisistaan. */
const tinyStops = [
  { town: 'a', tile: { x: 0, y: 0 } },
  { town: 'b', tile: { x: 4, y: 0 } },
];
// 16 px / 16 px/s = 1 s ruudulle, pysähdys 2 s.
const tiny = planRoute(tinyStops, [['a', 'b']], { speed: 16, stopMs: 2000 });

describe('kulkevan kauppiaan reitti', () => {
  it('kierros: pysähdys, kävely, pysähdys, kävely takaisin', () => {
    expect(tiny.legs.map((leg) => leg.kind)).toEqual(['stop', 'walk', 'stop', 'walk']);
    expect(tiny.totalMs).toBe(2000 + 4000 + 2000 + 4000);
  });

  it('pysähdyksen aikana kauppias on paikkakunnassa', () => {
    expect(merchantSpot(tiny, 0)).toEqual({ tile: { x: 0, y: 0 }, town: 'a', facing: 1 });
    expect(merchantSpot(tiny, 6500).town).toBe('b');
  });

  it('kävellessä kauppias etenee tasaisesti ja katsoo kulkusuuntaan', () => {
    expect(merchantSpot(tiny, 2000 + 1500)).toEqual({
      tile: { x: 1.5, y: 0 },
      town: null,
      facing: 1,
    });
    const back = merchantSpot(tiny, 2000 + 4000 + 2000 + 1000);
    expect(back.tile).toEqual({ x: 3, y: 0 });
    expect(back.facing).toBe(-1);
  });

  it('kierroksen jälkeen alkaa uusi kierros', () => {
    expect(merchantSpot(tiny, tiny.totalMs + 100)).toEqual(merchantSpot(tiny, 100));
    expect(advanceMerchant(tiny, tiny.totalMs - 50, 100)).toBe(50);
  });

  it('kauppiaan reitin paikkakunnat ovat olemassa ja niiden välillä on tie', () => {
    const route = MERCHANT.route;
    route.forEach((id, index) => {
      const next = route[(index + 1) % route.length] ?? id;
      expect(getTown(id).id).toBe(id);
      const hasRoad = WORLD.roads.some(
        ([a, b]) => (a === id && b === next) || (a === next && b === id),
      );
      expect(hasRoad, `${id} – ${next}`).toBe(true);
    });
    expect(getSprite(MERCHANT.sprite).id).toBe(MERCHANT.sprite);
  });

  it('kauppias kulkee koko kierroksen tietä pitkin', () => {
    for (const leg of merchantPlan().legs) {
      const tiles = leg.kind === 'walk' ? leg.path : [leg.tile];
      for (const tile of tiles) {
        expect(grid.cells[tile.y]?.[tile.x], `${tile.x},${tile.y}`).toBe('road');
      }
    }
  });

  it('kierros alkaa ensimmäisestä paikkakunnasta', () => {
    const first = getTown(MERCHANT.route[0] ?? '');
    expect(merchantSpot(merchantPlan(), 0).tile).toEqual(townTile(first));
  });

  it('kauppiaan kello tallentuu, ja vanhassa tallennuksessa hän on kierroksen alussa', () => {
    const state = createNewGame();
    state.merchantMs = 12_345;
    expect(decodeSave(encodeSave(state, meta))?.state.merchantMs).toBe(12_345);
    expect(readMerchantMs(undefined)).toBe(0);
    expect(readMerchantMs(-5)).toBe(0);
    expect(readMerchantMs(Number.NaN)).toBe(0);
  });
});
