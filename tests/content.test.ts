import { describe, expect, it } from 'vitest';
import {
  AMBUSHES,
  ENEMIES,
  ITEMS,
  MAP_ENEMIES,
  SPRITES,
  TERRAINS,
  TOWNS,
  getSprite,
} from '../src/data';
import { PLAYER } from '../src/data/player';
import { BATTLE_RULES, PROGRESSION } from '../src/data/rules';
import { SOUNDS } from '../src/data/sounds';
import { ROADS } from '../src/data/towns';

// Sisältötestit: varmistavat, että data/-kansion tiedostot ovat keskenään
// yhteensopivia. Nämä huomaavat useimmat virheet, kun uutta sisältöä lisätään.
// Kartan sijainnit tarkistetaan tiedostossa world.test.ts.

const ids = (list: readonly { id: string }[]) => list.map((entry) => entry.id);
const unique = (values: string[]) => new Set(values).size === values.length;

describe('sisältödata', () => {
  it('tunnisteet ovat uniikkeja', () => {
    for (const list of [ENEMIES, ITEMS, SPRITES, TOWNS, TERRAINS]) {
      expect(unique(ids(list))).toBe(true);
    }
  });

  it('kaikki viitatut spritet ovat olemassa', () => {
    const used = [
      PLAYER.sprite,
      'town',
      ...ENEMIES.map((e) => e.sprite),
      ...ITEMS.map((i) => i.sprite),
      ...TERRAINS.map((t) => t.sprite),
    ];
    for (const id of used) {
      expect(() => getSprite(id)).not.toThrow();
    }
  });

  it.each(SPRITES)('sprite $id on 16x16 ja käyttää vain palettinsa värejä', (sprite) => {
    expect(sprite.rows.length).toBe(16);
    for (const row of sprite.rows) {
      expect(row.length).toBe(16);
      for (const char of row) {
        expect(char === '.' || char in sprite.palette, `merkki "${char}"`).toBe(true);
      }
    }
  });

  it('karttaruudut ovat täysin peittäviä (ei läpinäkyviä pikseleitä)', () => {
    for (const terrain of TERRAINS) {
      const rows = getSprite(terrain.sprite).rows.join('');
      expect(rows.includes('.'), terrain.sprite).toBe(false);
    }
  });

  it('viittaukset vihollisiin ja esineisiin ovat olemassa', () => {
    for (const spawn of MAP_ENEMIES) {
      expect(ids(ENEMIES)).toContain(spawn.enemy);
    }
    for (const enemy of ENEMIES) {
      if (enemy.drop) {
        expect(ids(ITEMS)).toContain(enemy.drop);
      }
    }
    for (const stack of PLAYER.startItems) {
      expect(ids(ITEMS)).toContain(stack.id);
    }
  });

  it('väijytykset viittaavat olemassa oleviin vihollisiin ja kuljettavaan maastoon', () => {
    for (const rule of AMBUSHES) {
      expect(rule.enemies.length).toBeGreaterThan(0);
      for (const id of rule.enemies) {
        expect(ids(ENEMIES)).toContain(id);
      }
      expect(TERRAINS.find((t) => t.id === rule.terrain)?.walkable).toBe(true);
      expect(rule.chancePerTile).toBeGreaterThan(0);
      expect(rule.chancePerTile).toBeLessThan(1);
    }
  });

  it('varastamistodennäköisyys on välillä 0..1', () => {
    for (const enemy of ENEMIES) {
      const chance = enemy.stealChance ?? 0;
      expect(chance).toBeGreaterThanOrEqual(0);
      expect(chance).toBeLessThanOrEqual(1);
    }
  });

  it('kriittisen osuman todennäköisyys on välillä 0..1 ja osuma tekee lisävahinkoa', () => {
    const chances = [BATTLE_RULES.critChance, ...ENEMIES.map((e) => e.critChance ?? 0)];
    for (const chance of chances) {
      expect(chance).toBeGreaterThanOrEqual(0);
      expect(chance).toBeLessThanOrEqual(1);
    }
    expect(BATTLE_RULES.critMultiplier).toBeGreaterThan(1);
  });

  it('tiet yhdistävät olemassa olevia paikkakuntia', () => {
    for (const [from, to] of ROADS) {
      expect(ids(TOWNS)).toContain(from);
      expect(ids(TOWNS)).toContain(to);
    }
  });

  it('kokemustasojen rajat ovat kasvavassa järjestyksessä ja alkavat nollasta', () => {
    expect(PROGRESSION.xpForLevel[0]).toBe(0);
    PROGRESSION.xpForLevel.forEach((xp, i) => {
      expect(xp).toBeGreaterThanOrEqual(PROGRESSION.xpForLevel[i - 1] ?? 0);
    });
  });

  it('nimet ja kuvaukset on kirjoitettu', () => {
    for (const entry of [...ENEMIES, ...ITEMS, ...TOWNS]) {
      expect(entry.name.trim().length).toBeGreaterThan(0);
    }
    for (const town of TOWNS) {
      expect(town.nameAt.trim().length).toBeGreaterThan(0);
    }
  });

  it('ääniefekteissä on kuultavat sävelet ja järkevä voimakkuus', () => {
    for (const sound of Object.values(SOUNDS)) {
      expect(sound.gain).toBeGreaterThan(0);
      expect(sound.gain).toBeLessThanOrEqual(1);
      expect(sound.notes.length).toBeGreaterThan(0);
      for (const note of sound.notes) {
        expect(note.freq).toBeGreaterThan(20);
        expect(note.ms).toBeGreaterThan(0);
      }
    }
  });
});
