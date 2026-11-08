import type { SpriteDef } from './types';

// Dev-varusteiden kuvat repussa (data/dev-items.ts): musta pohja, neonsyaani,
// neonpinkki ja kulta. Samat värit näkyvät sankarin päällä (data/gear-looks.ts).

const NEON = {
  white: '#ffffff',
  cyan: '#3fffe0',
  pink: '#ff3fd8',
  gold: '#ffd23f',
  darkGold: '#c08a1a',
  violet: '#5a2a9a',
  dark: '#1a1030',
  outline: '#0a0612',
} as const;

export const DEV_ITEM_SPRITES: readonly SpriteDef[] = [
  {
    // Vino neonmiekka: valkoinen ydin, syaani reuna, pinkki hehku ja kipinät.
    id: 'dev-sword',
    palette: {
      w: NEON.white,
      c: NEON.cyan,
      m: NEON.pink,
      g: NEON.gold,
      o: NEON.darkGold,
      k: NEON.outline,
    },
    rows: [
      '..m..........mm.',
      '............mwwm',
      '.....m.....mwcm.',
      '..........mwcm..',
      '.........mwcm...',
      '........mwcm..m.',
      '.......mwcm.....',
      '......mwcm......',
      '..gk.mwcm.......',
      '..ogmwcm....m...',
      '...ogmk.........',
      '....mgo.........',
      '...kogog........',
      '..ko..og........',
      '.ko.............',
      'kk..............',
    ],
  },
  {
    // Musta haarniska: syaanit olkasuojat, pinkki timantti rinnassa ja kultainen vyö.
    id: 'dev-armor',
    palette: {
      c: NEON.cyan,
      m: NEON.pink,
      g: NEON.gold,
      v: NEON.violet,
      d: NEON.dark,
      k: NEON.outline,
    },
    rows: [
      '................',
      '.kkk........kkk.',
      'kccckkkkkkkkccck',
      'kcccddddddddccck',
      'kkccdddmmdddcckk',
      '.kkvddmmmmddvkk.',
      '..kvddmmmmddvk..',
      '..kvdddmmdddvk..',
      '..kvddddddddvk..',
      '..kvddddddddvk..',
      '..kggggggggggk..',
      '..kvddddddddvk..',
      '..kvdcddddcdvk..',
      '..kkkkkkkkkkkk..',
      '................',
      '................',
    ],
  },
  {
    // Pinkki neontähti kultaketjussa, syaanit kipinät.
    id: 'dev-amulet',
    palette: { w: NEON.white, c: NEON.cyan, m: NEON.pink, g: NEON.gold },
    rows: [
      '.g............g.',
      '.g............g.',
      '..g..........g..',
      '..g...c..c...g..',
      '...g........g...',
      '....g......g....',
      '.....g....g.....',
      '......gggg......',
      '.......mm.......',
      '......mmmm......',
      '..mmmmmwwmmmmm..',
      '....mmmmmmmm....',
      '...mmm....mmm...',
      '...m........m...',
      '................',
      '................',
    ],
  },
];
