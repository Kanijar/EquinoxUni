import { SPRITES } from '../data';
import { GEAR_LOOK_FALLBACK, GEAR_LOOKS } from '../data/gear-looks';
import { ARMOR_SHAPES, CHARM_SHAPES, WEAPON_SHAPES } from '../data/gear-shapes';
import type { GearItemDef, GearSlot, SpriteDef } from '../data/types';
import type { GearLook, GearShape } from '../data/types-gear-look';
import { findGear, type Equipped } from './equipment';

// Käytössä olevat varusteet näkyvät sankarin päällä: ase kädessä, haarniska tai viitta
// vartalolla ja koru kaulassa. Varusteet piirretään sankarin spriten (logic/hero-look.ts)
// päälle kuvioina (data/gear-shapes.ts) varusteen väreillä (data/gear-looks.ts).
// Sama ulkonäkö ja samat varusteet = sama tunniste, joten tekstuuri piirretään vain kerran
// (systems/hero-texture.ts).

/** Piirtojärjestys: vartalo alimmaisena, sitten koru ja ase päällimmäisenä. */
const DRAW_ORDER: readonly GearSlot[] = ['body', 'neck', 'hand'];

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** Värin kirkkaus 0–255 (#rrggbb). Tuntematon muoto = 0. */
export function brightness(color: string): number {
  if (!HEX_COLOR.test(color)) {
    return 0;
  }
  const value = Number.parseInt(color.slice(1), 16);
  return ((value >> 16) + ((value >> 8) & 0xff) + (value & 0xff)) / 3;
}

/** Spriten värit yleisimmästä harvinaisimpaan. Tummat ääriviivat jätetään pois. */
export function spriteColors(sprite: SpriteDef): string[] {
  const counts = new Map<string, number>();
  for (const char of sprite.rows.join('')) {
    const color = sprite.palette[char];
    if (color && brightness(color) >= GEAR_LOOK_FALLBACK.minBrightness) {
      counts.set(color, (counts.get(color) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([color]) => color);
}

/** Ulkonäkö varusteelle, jolla ei ole riviä GEAR_LOOKSissa: värit esineen kuvasta. */
export function guessLook(gear: GearItemDef): GearLook {
  const sprite = SPRITES.find((entry) => entry.id === gear.sprite);
  const colors = sprite ? spriteColors(sprite) : [];
  const first = colors[0] ?? GEAR_LOOK_FALLBACK.color;
  const second = colors[1] ?? first;
  switch (gear.slot) {
    case 'hand':
      return {
        slot: 'hand',
        shape: GEAR_LOOK_FALLBACK.weaponShape,
        blade: first,
        accent: second,
        handle: GEAR_LOOK_FALLBACK.handle,
      };
    case 'body':
      return { slot: 'body', shape: GEAR_LOOK_FALLBACK.armorShape, main: first, trim: second };
    case 'neck':
      return { slot: 'neck', shape: 'pendant', chain: second, gem: first };
  }
}

/** Miltä varuste näyttää sankarin päällä. Väärän paikan rivi korvataan arvauksella. */
export function gearLook(gear: GearItemDef): GearLook {
  const look = GEAR_LOOKS[gear.id];
  return look?.slot === gear.slot ? look : guessLook(gear);
}

/** Varusteen kuvio ja sen kirjainten värit. */
function gearLayer(look: GearLook): { shape: GearShape; colors: Record<string, string> } {
  switch (look.slot) {
    case 'hand':
      return {
        shape: WEAPON_SHAPES[look.shape],
        colors: { W: look.blade, G: look.accent, R: look.handle },
      };
    case 'body':
      return { shape: ARMOR_SHAPES[look.shape], colors: { A: look.main, T: look.trim } };
    case 'neck':
      return { shape: CHARM_SHAPES[look.shape], colors: { N: look.chain, P: look.gem } };
  }
}

/** Piirtää kuvion rivien päälle: '.' jättää alla olevan pikselin näkyviin. */
export function paintShape(rows: readonly string[], shape: GearShape): string[] {
  return rows.map((row, y) => {
    const over = shape.rows[y - shape.top];
    if (over === undefined) {
      return row;
    }
    return [...row].map((char, x) => (over[x] && over[x] !== '.' ? over[x] : char)).join('');
  });
}

/** Käytössä olevat varusteet piirtojärjestyksessä. Tuntemattomat tunnisteet ohitetaan. */
export function wornGear(equipped: Equipped): GearItemDef[] {
  return DRAW_ORDER.flatMap((slot) => {
    const id = equipped[slot];
    const gear = id === undefined ? null : findGear(id);
    return gear ? [gear] : [];
  });
}

/** Sankarin sprite, jonka päälle on piirretty käytössä olevat varusteet. */
export function dressHero(hero: SpriteDef, equipped: Equipped): SpriteDef {
  const gear = wornGear(equipped);
  if (gear.length === 0) {
    return hero;
  }
  let rows: readonly string[] = hero.rows;
  const palette: Record<string, string> = { ...hero.palette };
  for (const item of gear) {
    const { shape, colors } = gearLayer(gearLook(item));
    rows = paintShape(rows, shape);
    Object.assign(palette, colors);
  }
  return { id: `${hero.id}+${gear.map((item) => item.id).join('+')}`, palette, rows };
}
