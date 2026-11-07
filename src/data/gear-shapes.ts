import type { ArmorShape, CharmShape, GearShape, WeaponShape } from './types-gear-look';

// Varusteiden kuviot sankarin päällä (16 × 16 sprite, data/hero-looks.ts baseRows).
// Sankarin kädet ovat sarakkeissa 3 ja 12 riveillä 9–10, joten ase on sarakkeessa 13
// (kahva käden vieressä, terä ylöspäin). Kirjaimet: ks. GearShape (data/types-gear-look.ts).

const HANDLE_TO_12 = Array.from({ length: 10 }, () => '.............R..');

/** Aseet kädessä. */
export const WEAPON_SHAPES: Readonly<Record<WeaponShape, GearShape>> = {
  sword: {
    top: 2,
    rows: [
      ...Array.from({ length: 6 }, () => '.............W..'),
      '............GGG.',
      '.............R..',
      '.............R..',
      '.............G..',
    ],
  },
  saber: {
    top: 3,
    rows: [
      '...............W',
      '..............W.',
      '..............W.',
      '.............W..',
      '.............W..',
      '............GGG.',
      '.............R..',
      '.............R..',
    ],
  },
  knife: {
    top: 6,
    rows: [
      '.............W..',
      '.............W..',
      '.............W..',
      '.............G..',
      '.............R..',
    ],
  },
  axe: {
    top: 3,
    rows: ['.............RWW', '.............RGW', '.............RW.', ...HANDLE_TO_12.slice(4)],
  },
  club: {
    top: 3,
    rows: [
      '.............WW.',
      '............GWWG',
      '.............WW.',
      '.............WW.',
      '.............W..',
      ...HANDLE_TO_12.slice(6),
    ],
  },
  hammer: {
    top: 3,
    rows: ['............WWWW', '............GGGG', ...HANDLE_TO_12.slice(3)],
  },
  staff: {
    top: 0,
    rows: ['.............GG.', '............GWWG', '.............GG.', ...HANDLE_TO_12],
  },
  spear: {
    top: 0,
    rows: [
      '.............W..',
      '............WWW.',
      '.............W..',
      '.............G..',
      ...HANDLE_TO_12.slice(1),
    ],
  },
  trident: {
    top: 0,
    rows: ['...........W.W.W', '...........W.W.W', '...........GWWWG', ...HANDLE_TO_12],
  },
};

/** Vartalon varusteet. Peittävät paidan; kädet (sarakkeet 3 ja 12) jäävät näkyviin. */
export const ARMOR_SHAPES: Readonly<Record<ArmorShape, GearShape>> = {
  clothes: {
    top: 7,
    rows: ['....AAAAAAAA....', '...AAAAAAAAAA...', '....AAAAAAAA....', '....TTTTTTTT....'],
  },
  vest: {
    top: 7,
    rows: ['....AAA..AAA....', '...AAAA..AAAA...', '....AAA..AAA....', '....TTTTTTTT....'],
  },
  plate: {
    top: 7,
    rows: ['...TTAAAAAATT...', '...TAAATTAAAT...', '....AAAAAAAA....', '....TTTTTTTT....'],
  },
  scale: {
    top: 7,
    rows: ['....TTTTTTTT....', '...ATATATATAT...', '....TATATATA....', '....ATATATAT....'],
  },
  cloak: {
    // Viitta roikkuu selässä molemmin puolin, soljet olkapäillä, ja paita näkyy keskeltä.
    top: 7,
    rows: [
      '...TTT....TTT...',
      '..AA........AA..',
      '..A..........A..',
      '..A..........A..',
      '..AA........AA..',
      '..AA........AA..',
      '...A........A...',
    ],
  },
};

/** Korut kaulassa. */
export const CHARM_SHAPES: Readonly<Record<CharmShape, GearShape>> = {
  pendant: {
    top: 7,
    rows: ['.....N....N.....', '......NPPN......', '.......PP.......'],
  },
};
