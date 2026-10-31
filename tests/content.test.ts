import { describe, expect, it } from 'vitest';
import { ENEMIES, ITEMS, LEVELS, SPRITES, getSprite } from '../src/data';
import { PLAYER } from '../src/data/player';

// Sisältötestit: varmistavat, että data/-kansion tiedostot ovat keskenään
// yhteensopivia. Nämä huomaavat useimmat virheet, kun uutta sisältöä lisätään.

const ids = (list: readonly { id: string }[]) => list.map((entry) => entry.id);
const unique = (values: string[]) => new Set(values).size === values.length;

describe('sisältödata', () => {
  it('tunnisteet ovat uniikkeja', () => {
    for (const list of [ENEMIES, ITEMS, LEVELS, SPRITES]) {
      expect(unique(ids(list))).toBe(true);
    }
  });

  it('kaikki viitatut spritet ovat olemassa', () => {
    const used = [PLAYER.sprite, ...ENEMIES.map((e) => e.sprite), ...ITEMS.map((i) => i.sprite)];
    for (const id of used) {
      expect(() => getSprite(id)).not.toThrow();
    }
  });

  it.each(SPRITES)('sprite $id on suorakaide ja käyttää vain palettinsa värejä', (sprite) => {
    const width = sprite.rows[0]?.length;
    for (const row of sprite.rows) {
      expect(row.length).toBe(width);
      for (const char of row) {
        expect(char === '.' || char in sprite.palette, `merkki "${char}"`).toBe(true);
      }
    }
  });

  it.each(LEVELS)('kenttä $id on eheä', (level) => {
    const width = level.map[0]?.length;
    for (const row of level.map) {
      expect(row.length).toBe(width);
    }
    const floorAt = (x: number, y: number) => level.map[y]?.[x] === '.';
    expect(floorAt(level.playerStart.x, level.playerStart.y)).toBe(true);
    for (const spawn of [...level.enemies, ...level.items]) {
      expect(floorAt(spawn.x, spawn.y), `${spawn.id} (${spawn.x},${spawn.y})`).toBe(true);
    }
    for (const enemy of level.enemies) {
      expect(ids(ENEMIES)).toContain(enemy.id);
    }
    for (const item of level.items) {
      expect(ids(ITEMS)).toContain(item.id);
    }
  });

  it('nimet ja kuvaukset on kirjoitettu', () => {
    for (const entry of [...ENEMIES, ...ITEMS, ...LEVELS]) {
      expect(entry.name.trim().length).toBeGreaterThan(0);
    }
  });
});
