import { describe, expect, it } from 'vitest';
import { BACKDROP_BY_TERRAIN, BATTLE_BACKDROPS } from '../src/data/battle-backdrops';
import { PARTICLE_BURSTS } from '../src/data/battle-effects';
import { ACTION_BUTTON, BATTLE_STAGE } from '../src/config/battle-config';
import { getSprite, TERRAINS } from '../src/data';
import type { TerrainId } from '../src/data/types';
import { backdropForBattle, backdropForTerrain, hpTier, wipeOrder } from '../src/logic/battle-look';
import { createSeededRng, randomInt } from '../src/logic/seeded-random';

// Taistelunäkymän ulkoasun säännöt: tausta maaston mukaan, elämäpalkin väri,
// siirtymäefektin järjestys ja toistettava satunnaisuus.

const CSS_COLOR = /^#[0-9a-f]{6}$/;

describe('taistelun tausta', () => {
  it('pellolla, metsässä, lumessa ja tiellä on omat taustansa', () => {
    expect(backdropForTerrain('field').id).toBe('field');
    expect(backdropForTerrain('forest').id).toBe('forest');
    expect(backdropForTerrain('snow').id).toBe('snow');
    expect(backdropForTerrain('road').id).toBe('village');
  });

  it('tuntematon maasto antaa oletustaustan', () => {
    expect(backdropForTerrain(undefined).id).toBe('field');
    expect(backdropForTerrain('suo' as TerrainId).id).toBe('field');
  });

  it('vihollisen oma tausta voittaa maaston (loppuboss tunturin huipulla)', () => {
    expect(backdropForBattle('forest', { backdrop: 'summit' }).id).toBe('summit');
    expect(backdropForBattle('forest', {}).id).toBe('forest');
    expect(BATTLE_BACKDROPS.summit.aurora?.length).toBeGreaterThan(0);
  });

  it('jokaisella maastolla on tausta', () => {
    for (const terrain of TERRAINS) {
      expect(BATTLE_BACKDROPS[BACKDROP_BY_TERRAIN[terrain.id]]).toBeDefined();
    }
  });

  it('taustojen värit ovat kelvollisia ja taivaassa ja maassa on raitoja', () => {
    for (const [id, backdrop] of Object.entries(BATTLE_BACKDROPS)) {
      expect(backdrop.id).toBe(id);
      expect(backdrop.sky.length).toBeGreaterThan(1);
      expect(backdrop.ground.length).toBeGreaterThan(1);
      const colors = [
        ...backdrop.sky,
        ...backdrop.ground,
        ...backdrop.speckles,
        backdrop.sun.color,
      ];
      for (const color of colors) {
        expect(color).toMatch(CSS_COLOR);
      }
    }
  });

  it('säähiukkasia on vähän, jotta puhelin jaksaa', () => {
    for (const backdrop of Object.values(BATTLE_BACKDROPS)) {
      expect(backdrop.weather?.count ?? 0).toBeLessThanOrEqual(30);
    }
  });
});

describe('hiukkasefektit', () => {
  it('yksi räjähdys on pieni ja hiukkaset elävät alle sekunnin', () => {
    for (const burst of Object.values(PARTICLE_BURSTS)) {
      expect(burst.count).toBeGreaterThan(0);
      expect(burst.count).toBeLessThanOrEqual(30);
      expect(burst.lifeMs).toBeLessThan(1000);
      expect(burst.colors.length).toBeGreaterThan(0);
      expect(burst.speed.min).toBeLessThanOrEqual(burst.speed.max);
    }
  });
});

describe('elämäpalkin väri', () => {
  const limits = { high: 0.5, mid: 0.25 };

  it('yli puolet elämästä on vihreä, alle neljännes punainen', () => {
    expect(hpTier(1, limits)).toBe('high');
    expect(hpTier(0.51, limits)).toBe('high');
    expect(hpTier(0.5, limits)).toBe('mid');
    expect(hpTier(0.3, limits)).toBe('mid');
    expect(hpTier(0.25, limits)).toBe('low');
    expect(hpTier(0, limits)).toBe('low');
  });
});

describe('siirtymäefekti', () => {
  it('jokaisella ruudulla on vaihe väliltä 0..1', () => {
    const order = wipeOrder(30, 17);
    expect(order).toHaveLength(30 * 17);
    for (const value of order) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it('pyyhkäisy alkaa vasemmasta yläkulmasta ja päättyy oikeaan alakulmaan', () => {
    const order = wipeOrder(30, 17);
    const first = order[0] ?? 1;
    const last = order.at(-1) ?? 0;
    expect(first).toBeLessThan(0.3);
    expect(last).toBeGreaterThan(0.7);
  });
});

describe('toistettava satunnaisuus', () => {
  it('sama siemen antaa saman lukujonon', () => {
    const a = createSeededRng(42);
    const b = createSeededRng(42);
    const valuesA = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(valuesA);
  });

  it('luvut ovat väliltä 0..1 ja kokonaisluvut annetulta väliltä', () => {
    const rng = createSeededRng(7);
    for (let i = 0; i < 200; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
      const int = randomInt(rng, 3, 5);
      expect(int).toBeGreaterThanOrEqual(3);
      expect(int).toBeLessThanOrEqual(5);
    }
  });
});

describe('taistelun kuvat', () => {
  it('nappien ikonit ja pilvi ovat olemassa', () => {
    for (const id of [...Object.values(ACTION_BUTTON.icons), BATTLE_STAGE.clouds.sprite]) {
      expect(() => getSprite(id)).not.toThrow();
    }
  });

  it('jokainen nappi on saanut ikonin lisäksi korostevärin', () => {
    expect(Object.keys(ACTION_BUTTON.accents).sort()).toEqual(
      Object.keys(ACTION_BUTTON.icons).sort(),
    );
  });
});
