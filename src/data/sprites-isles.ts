import type { SpriteDef } from './types';

// Pienten saarten (data/isles.ts) hahmot ja ruudut (16x16): venekauppias Veikko, saarten
// tehtävänantajat ja saarten maastot. Veneet: sprites-boats.ts. Viholliset: sprites-isle-monsters.ts,
// esineet: sprites-isle-items.ts.

const SKIN = '#f2c38f';

/**
 * Tehtävänantajan muoto (sama kuin Jussi Ketolalla): c hattu, v lieri, s iho, e silmät,
 * g parta, r ja d paita, l housut, k kengät. Hahmot erottuvat väreistään.
 */
const PERSON_ROWS = [
  '................',
  '.....cccccc.....',
  '....cccccccc....',
  '....vvvvvvvvvv..',
  '....ssssssss....',
  '....sesssses....',
  '....gssssssg....',
  '.....gggggg.....',
  '....rdrrdrrd....',
  '...rrdrrdrrdr...',
  '...sdrrdrrdrs...',
  '...srrdrrdrrs...',
  '....llllllll....',
  '....lll..lll....',
  '....kkk..kkk....',
  '................',
];

export const ISLE_SPRITES: readonly SpriteDef[] = [
  {
    // Veneveistäjä Veikko (data/boat-shop.ts): sininen merimieslakki, valkoinen parta ja raitapaita.
    id: 'veikko',
    palette: {
      c: '#2a4f8f',
      v: '#1c3566',
      s: SKIN,
      e: '#1a1a1a',
      g: '#e8e8e8',
      r: '#f0f0f0',
      d: '#2a4f8f',
      l: '#5a4030',
      k: '#2a1a0e',
    },
    rows: PERSON_ROWS,
  },
  {
    // Kalle Kompassi (Palmusaari): musta kapteeninhattu kultareunuksella ja punainen takki.
    id: 'kalle',
    palette: {
      c: '#1a1a1a',
      v: '#d4a017',
      s: SKIN,
      e: '#1a1a1a',
      g: '#7a4a20',
      r: '#c0392b',
      d: '#d4a017',
      l: '#f0e6d0',
      k: '#1a1a1a',
    },
    rows: PERSON_ROWS,
  },
  {
    // Veera Varjo (Sumusaari): pitkät mustat hiukset ja violetti mekko.
    id: 'veera',
    palette: {
      h: '#1e1a2a',
      s: SKIN,
      e: '#3a8a5a',
      p: '#6a3a9a',
      P: '#4a2470',
      k: '#1a1a1a',
    },
    rows: [
      '................',
      '.....hhhhhh.....',
      '....hhhhhhhh....',
      '...hhhhhhhhhh...',
      '...hssssssssh...',
      '...hsessssesh...',
      '...hssssssssh...',
      '...hhsssssshh...',
      '...hpppppppph...',
      '...pppPppPppp...',
      '..spppPppPppps..',
      '..sppppppppppps.',
      '...pppppppppp...',
      '....pppppppp....',
      '....kkk..kkk....',
      '................',
    ],
  },
  {
    // Pekka Pakkanen (Pakkassaari): valkoinen turkislakki, valkoinen parta ja sininen toppatakki.
    id: 'pekka',
    palette: {
      c: '#f4f4f4',
      v: '#b8b8b8',
      s: SKIN,
      e: '#1a1a1a',
      g: '#ffffff',
      r: '#5aa0e0',
      d: '#2a5aa0',
      l: '#3a3a4a',
      k: '#2a1a0e',
    },
    rows: PERSON_ROWS,
  },
  {
    // Matti Myrsky (Myrskysaari): keltainen sadehattu ja sadetakki, harmaa parta.
    id: 'matti',
    palette: {
      c: '#f0c419',
      v: '#c09a10',
      s: SKIN,
      e: '#1a1a1a',
      g: '#6a6a6a',
      r: '#f0c419',
      d: '#c09a10',
      l: '#2a3a5a',
      k: '#1a1a1a',
    },
    rows: PERSON_ROWS,
  },
  // --- Saarten maastot (data/world.ts TERRAINS) ---
  {
    // Palmusaaren viidakko: vehreää maata ja palmuja.
    id: 'tile-jungle',
    palette: { a: '#2f8a3a', b: '#26742f', t: '#8a6a3a', g: '#5fcf4a' },
    rows: [
      'aaaaaaaaaaaaaaaa',
      'aaggaagaaaaaaaaa',
      'agggggggaaaaabaa',
      'ggabtbaggaaaaaaa',
      'gaaatbaagaaaaaaa',
      'aaaatbaaaaaaaaaa',
      'aaaaatbaaaabaaaa',
      'aaaaatbaaaaaaaaa',
      'aaaaatbaaaaggaga',
      'abaaatbaaagggggg',
      'aaaaaaaaaggabtbg',
      'aaaaaaaaagaaatbg',
      'aaabaaaaaaaaatba',
      'aaaaaaaaaaaaatba',
      'aaaaaaabaaaaatba',
      'aaaaaaaaaaaaaaaa',
    ],
  },
  {
    // Sumusaaren hautausmaan nurmi ja vanhat hautakivet.
    id: 'tile-grave',
    palette: { a: '#3f4f3c', b: '#35432f', g: '#8a8f96', k: '#5a5f66' },
    rows: [
      'aaaaaaaaaaaaaaaa',
      'aaaaaaaaabaaaaaa',
      'aaaggaaaaaaaaaaa',
      'aaggggaaaaaabaaa',
      'aaggggaaaaaaaaaa',
      'aagkkgaaaaaaaaaa',
      'aaggggaaabaaaaaa',
      'akkkkkkaaaaaaaaa',
      'aaaaaaaaaaaaaaaa',
      'aaaaaaaaaaaggaaa',
      'abaaaaaaaaggggaa',
      'aaaaaaaaaaggggaa',
      'aaaaabaaaagkkgaa',
      'aaaaaaaaakkkkkka',
      'aaaaaaaaaaaaaaaa',
      'aaabaaaaaaaaaaba',
    ],
  },
  {
    // Pakkassaaren ikijää: halkeamia ja pieniä violetteja kristalleja.
    id: 'tile-ice',
    palette: { a: '#bfe6f8', b: '#9ac8e6', w: '#ffffff', p: '#c8a0ff' },
    rows: [
      'aaaaaaaaaaaaaaaa',
      'awwaaaaaaaaaaaaa',
      'aawwaaaaaabaaaaa',
      'aaaaaaaaabaaaaaa',
      'aaaaaaaabaaaaaaa',
      'aaaaaaaaaaaaawaa',
      'aaabaaaaaaaaaaaa',
      'aaaabaaaaapaaaaa',
      'aaaaabaaappaaaaa',
      'aaaaaaaaapppaaaa',
      'aaaaaaaaaaaaaaaa',
      'aaaaaaaaaaaawwaa',
      'awaaaaaaaaaaaawa',
      'aaaaaabaaaaaaaaa',
      'aaaaaaabbaaaaaaa',
      'aaaaaaaaaaaaaaaa',
    ],
  },
  {
    // Myrskysaaren musta basaltti: kuusikulmaisia kivipylväitä.
    id: 'tile-basalt',
    palette: { a: '#2e2e36', b: '#3a3a44', c: '#4e4e5c', k: '#1a1a22' },
    rows: [
      'kaaaakaaaakaaaak',
      'abbbakbbbbkabbba',
      'abcbakbcbbkabcba',
      'abbbakbbbbkabbba',
      'kaaaakaaaakaaaak',
      'aakaaaakaaaakaaa',
      'bbkabbbkabbbkabb',
      'cbkabcbkabcbkacb',
      'bbkabbbkabbbkabb',
      'aakaaaakaaaakaaa',
      'kaaaakaaaakaaaak',
      'abbbakbbbbkabbba',
      'abcbakbcbbkabcba',
      'abbbakbbbbkabbba',
      'kaaaakaaaakaaaak',
      'aakaaaakaaaakaaa',
    ],
  },
];
