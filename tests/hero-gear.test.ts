import { describe, expect, it } from 'vitest';
import { ITEMS } from '../src/data';
import { GEAR_LOOKS } from '../src/data/gear-looks';
import { ARMOR_SHAPES, CHARM_SHAPES, WEAPON_SHAPES } from '../src/data/gear-shapes';
import { DEFAULT_LOOK } from '../src/data/hero-looks';
import type { GearItemDef } from '../src/data/types';
import type { GearShape } from '../src/data/types-gear-look';
import { isGear } from '../src/logic/equipment';
import {
  brightness,
  dressHero,
  gearLook,
  guessLook,
  paintShape,
  spriteColors,
  wornGear,
} from '../src/logic/hero-gear';
import { heroSprite } from '../src/logic/hero-look';

const SIZE = 16;
const hero = heroSprite(DEFAULT_LOOK, 'yellow');
const allGear = ITEMS.filter(isGear);

function checkShapes(shapes: Readonly<Record<string, GearShape>>, letters: string): void {
  for (const [name, shape] of Object.entries(shapes)) {
    expect(shape.top + shape.rows.length, name).toBeLessThanOrEqual(SIZE);
    for (const row of shape.rows) {
      expect(row, name).toHaveLength(SIZE);
      expect(row, name).toMatch(new RegExp(`^[.${letters}]+$`));
    }
  }
}

describe('varusteet sankarin päällä', () => {
  it('kuviot ovat 16 pikseliä leveitä ja käyttävät oman paikkansa kirjaimia', () => {
    checkShapes(WEAPON_SHAPES, 'WGR');
    checkShapes(ARMOR_SHAPES, 'AT');
    checkShapes(CHARM_SHAPES, 'NP');
  });

  it('jokainen ulkonäkörivi kuuluu olemassa olevalle varusteelle oikeassa paikassa', () => {
    for (const [id, look] of Object.entries(GEAR_LOOKS)) {
      const gear = allGear.find((item) => item.id === id);
      expect(gear?.slot, id).toBe(look.slot);
    }
  });

  it('ilman varusteita sankari on ennallaan (vanhat tallennukset ja uusi peli)', () => {
    expect(dressHero(hero, {})).toBe(hero);
    expect(dressHero(hero, { hand: undefined, body: undefined })).toBe(hero);
  });

  it('jokainen varuste muuttaa sankarin kuvaa, ja kaikilla kirjaimilla on väri', () => {
    for (const gear of allGear) {
      const dressed = dressHero(hero, { [gear.slot]: gear.id });
      expect(dressed.rows.join(''), gear.id).not.toBe(hero.rows.join(''));
      expect(dressed.rows, gear.id).toHaveLength(SIZE);
      for (const char of dressed.rows.join('')) {
        expect(char === '.' || dressed.palette[char] !== undefined, `${gear.id} ${char}`).toBe(
          true,
        );
      }
    }
  });

  it('vartalon varuste peittää paidan (viitassa ja liivissä paita näkyy keskeltä), kädet näkyvät', () => {
    for (const gear of allGear.filter((item) => item.slot === 'body')) {
      const rows = dressHero(hero, { body: gear.id }).rows;
      expect(rows[9]?.[3], gear.id).toBe('s');
      expect(rows[9]?.[12], gear.id).toBe('s');
      const look = gearLook(gear);
      const open = look.slot === 'body' && (look.shape === 'cloak' || look.shape === 'vest');
      expect(rows[8]?.includes('b'), gear.id).toBe(open);
    }
  });

  it('ase piirretään viitan ja korun päälle', () => {
    const dressed = dressHero(hero, {
      hand: 'iron-sword',
      body: 'king-cloak',
      neck: 'ruby-amulet',
    });
    expect(dressed.rows[9]?.[13]).toBe('R');
    expect(dressed.rows[8]?.[7]).toBe('P');
    expect(wornGear({ hand: 'iron-sword', body: 'king-cloak' }).map((gear) => gear.slot)).toEqual([
      'body',
      'hand',
    ]);
  });

  it('samat varusteet = sama tunniste (välimuisti), eri varusteet = eri tunniste', () => {
    const a = dressHero(hero, { hand: 'club', body: 'chain-mail' });
    const b = dressHero(hero, { body: 'chain-mail', hand: 'club' });
    const c = dressHero(hero, { hand: 'knife', body: 'chain-mail' });
    expect(a.id).toBe(b.id);
    expect(a.id).not.toBe(c.id);
    expect(a.id).not.toBe(hero.id);
  });

  it('tuntematon varuste ohitetaan', () => {
    expect(dressHero(hero, { hand: 'ei-ole-olemassa' })).toBe(hero);
  });

  it('varuste ilman omaa riviä saa ulkonäön esineen kuvan väreistä', () => {
    const newSword: GearItemDef = {
      id: 'uusi-miekka',
      name: 'Uusi miekka',
      description: 'Testi',
      kind: 'gear',
      sprite: 'iron-sword',
      slot: 'hand',
      bonus: { attack: 1 },
    };
    const look = guessLook(newSword);
    expect(look.slot).toBe('hand');
    expect(gearLook(newSword)).toEqual(look);
    const unknownSprite = guessLook({ ...newSword, slot: 'body', sprite: 'ei-kuvaa' });
    expect(unknownSprite.slot).toBe('body');
  });

  it('kuvan värit yleisimmästä alkaen, tummat ääriviivat pois', () => {
    const sprite = {
      id: 'x',
      palette: { k: '#000000', a: '#ff0000', b: '#00ff00' },
      rows: ['kab', 'bbk'],
    };
    expect(spriteColors(sprite)).toEqual(['#00ff00', '#ff0000']);
    expect(brightness('#ffffff')).toBe(255);
    expect(brightness('punainen')).toBe(0);
  });

  it('kuvion piste "." jättää alla olevan pikselin näkyviin', () => {
    expect(paintShape(['abc', 'def'], { top: 1, rows: ['X.Y'] })).toEqual(['abc', 'XeY']);
  });
});
