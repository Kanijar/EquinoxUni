import type { SpriteDef } from './types';

// Venekaupan neljä venettä (data/isle-items.ts, 16x16): tyhjä vene repussa, kaupassa ja
// laiturissa, ja sama vene sankari kyydissä kartalla merellä (BoatItemDef.mapSprite). Keula on
// oikealla: kuva peilataan, kun sankari kulkee vasemmalle. Sankarin hiukset (h) ja iho (s)
// vaihtuvat hänen ulkonäkönsä mukaan (logic/hero-look.ts driverSprite).

const SKIN = '#f2c38f';
const WAKE = '#cfe8ff';

/** Sankarin pää sivulta: h hiukset, s iho, e silmä (katse oikealle eli keulaan päin). */
const HEAD = ['.hhh.', 'hhhhh', 'hssss', 'sssse'];

/** Sankarin värit, kun hän istuu veneessä. */
const HERO_COLORS = { h: '#5a3a1a', s: SKIN, e: '#1a1a1a' };

/** Piirtää sankarin pään veneen kuvaan kohtaan (x, y) (vasen yläkulma). */
function withHero(rows: readonly string[], x: number, y: number): string[] {
  return rows.map((row, r) => {
    const head = HEAD[r - y];
    if (!head) {
      return row;
    }
    const cells = [...row];
    [...head].forEach((pixel, c) => {
      if (pixel !== '.') {
        cells[x + c] = pixel;
      }
    });
    return cells.join('');
  });
}

/** Tyhjä vene ja sama vene sankari kyydissä (id + '-hero'). */
function boatSprites(
  id: string,
  palette: Readonly<Record<string, string>>,
  rows: readonly string[],
  seat: { readonly x: number; readonly y: number },
): SpriteDef[] {
  return [
    { id, palette, rows },
    {
      id: `${id}-hero`,
      palette: { ...palette, ...HERO_COLORS },
      rows: withHero(rows, seat.x, seat.y),
    },
  ];
}

/** Soutuvene: pieni puuvene ja airot (o). */
const ROWBOAT_ROWS = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '....o......o....',
  '.kbbbbbbbbbbbbk.',
  '..kBBBBBBBBBBk..',
  '.o.kBBBBBBBBk.o.',
  'oo..kkkkkkkk..oo',
  '.cc...cc....cc..',
  '................',
  '................',
  '................',
  '................',
];

/** Purjevene: puurunko, masto (m) ja valkoinen purje (w). */
const SAILBOAT_ROWS = [
  '................',
  '........m.......',
  '........mw......',
  '........mww.....',
  '........mwww....',
  '........mwwww...',
  '........mwwwww..',
  '........mwwwwww.',
  '........m.......',
  '........m.......',
  'kbbbbbbbbbbbbbbk',
  '.kBBBBBBBBBBBBk.',
  '..kBBBBBBBBBBk..',
  '...kkkkkkkkkk...',
  '.cc...cc....cc..',
  '................',
];

/** Moottorivene: valkoinen runko, punainen raita (r), tuulilasi (g) ja perämoottori (m). */
const MOTORBOAT_ROWS = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '..........gg....',
  '.m.......gggk...',
  'mmkwwwwwwwwwwwwk',
  '.mkrrrrrrrrrrrk.',
  '.mkwwwwwwwwwwk..',
  '.m.kkkkkkkkkk...',
  'cc..cc..cc......',
  '................',
  '................',
  '................',
  '................',
];

/** Luksusvene: valkoinen jahti, ikkunat (g), kultaraita (y), tummansininen pohja ja lippu (r). */
const LUXURY_ROWS = [
  '................',
  '........m.......',
  '........mrr.....',
  '........mr......',
  '.......wwwww....',
  '.......wgwgwk...',
  '......wwwwwwwk..',
  '......wgggwggwk.',
  'kwwwwwwwwwwwwwwk',
  'kyyyyyyyyyyyyyk.',
  '.kwwwwwwwwwwwk..',
  '.kBBBBBBBBBBk...',
  '..kkkkkkkkkk....',
  '................',
  'cc..cc..cc.cc...',
  '................',
];

export const BOAT_SPRITES: readonly SpriteDef[] = [
  ...boatSprites(
    'rowboat',
    { b: '#8a6a3e', B: '#5e4428', k: '#3b2a1a', o: '#c8a060', c: WAKE },
    ROWBOAT_ROWS,
    { x: 5, y: 3 },
  ),
  ...boatSprites(
    'sailboat',
    { m: '#6b4a2a', w: '#f4f4f4', b: '#a8763e', B: '#7a5230', k: '#3b2a1a', c: WAKE },
    SAILBOAT_ROWS,
    { x: 2, y: 6 },
  ),
  ...boatSprites(
    'motorboat',
    { w: '#f4f4f4', r: '#d23a3a', k: '#2a2a35', g: '#9fd8ff', m: '#5a5f6a', c: WAKE },
    MOTORBOAT_ROWS,
    { x: 4, y: 3 },
  ),
  ...boatSprites(
    'luxury-boat',
    {
      w: '#ffffff',
      g: '#3a6aa0',
      y: '#f0c419',
      B: '#1f3a6a',
      k: '#1a2030',
      m: '#c0c0c0',
      r: '#d23a3a',
      c: WAKE,
    },
    LUXURY_ROWS,
    { x: 1, y: 4 },
  ),
];
