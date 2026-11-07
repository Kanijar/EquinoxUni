import type { SpriteDef } from './types';

// Kalastuksen pikselispritet: esineet (16x16, data/fishing-items.ts), hai (16x16,
// data/enemies.ts) ja koho (6x6), joka kelluu vedessä kalastaessa.

/** Kalojen yhteinen muoto: b kylki, d selkä, s raidat tai täplät, w vatsa, f evät, k silmä. */
const FISH_ROWS = [
  '................',
  '................',
  '................',
  '.....ddd........',
  '....dddddd...ff.',
  '..ddbbbbbbd.fff.',
  '.dbkbsbsbbbdff..',
  'dbbbbsbsbbbbbf..',
  '.bwwbsbsbbbbff..',
  '..wwwwwwwwb.fff.',
  '....ffwww....ff.',
  '.....f..........',
  '................',
  '................',
  '................',
  '................',
];

export const FISHING_SPRITES: readonly SpriteDef[] = [
  {
    // Onki: puinen vapa, rulla ja siima, jonka päässä punainen koho.
    id: 'fishing-rod',
    palette: {
      b: '#a8763e',
      d: '#5a3a1a',
      l: '#e8e8e8',
      r: '#9aa0a8',
      k: '#2a2a2a',
      o: '#e0303a',
      w: '#ffffff',
    },
    rows: [
      '.............bb.',
      '............bbl.',
      '...........bb.l.',
      '..........bb..l.',
      '.........bb...l.',
      '........bb....l.',
      '.......bb.....o.',
      '......bb......w.',
      '.....bb.......l.',
      '....bbrr......k.',
      '...ddrkr........',
      '..dd.rr.........',
      '.dd.............',
      'dd..............',
      '................',
      '................',
    ],
  },
  {
    // Mato: vaaleanpunainen ja mutkalla.
    id: 'worm',
    palette: { p: '#e88a9a', P: '#c0607a', k: '#2a1a1a' },
    rows: [
      '................',
      '................',
      '................',
      '................',
      '...........ppp..',
      '..........pkpPp.',
      '..........pppP..',
      '..pp.....pPp....',
      '.pPPp...pPp.....',
      '.p..pp.pPp......',
      '.....pPPp.......',
      '......pp........',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  {
    // Ahven: vihreä, tummat raidat ja oranssit evät.
    id: 'perch',
    palette: { b: '#9ab04a', d: '#5a6a2a', s: '#3a4a1a', w: '#e8e0b0', f: '#e0602a', k: '#1a1a1a' },
    rows: FISH_ROWS,
  },
  {
    // Hauki: tummanvihreä ja vaaleat täplät.
    id: 'pike',
    palette: { b: '#6a8a4a', d: '#3f5a2a', s: '#c8d890', w: '#e0e8c0', f: '#8a6a3a', k: '#1a1a1a' },
    rows: FISH_ROWS,
  },
  {
    // Lohi: hopeinen ja vaaleanpunainen raita.
    id: 'salmon',
    palette: { b: '#c0c8d0', d: '#5a6a8a', s: '#f08a7a', w: '#f4f0f0', f: '#7a8aa0', k: '#1a1a1a' },
    rows: FISH_ROWS,
  },
  {
    // Kalan suomupanssari: turkoosit kiiltävät suomut.
    id: 'fish-scale-armor',
    palette: { t: '#3fa0a0', T: '#2a7070', w: '#a8f0e8', k: '#1a3a3a' },
    rows: [
      '................',
      '................',
      '...kkk....kkk...',
      '..ktwtk..ktwtk..',
      '..kttttkkttttk..',
      '..kTwTwTwTwTwk..',
      '..ktTtTtTtTtTk..',
      '...kwTwTwTwTk...',
      '...kTtTtTtTtk...',
      '...kwTwTwTwTk...',
      '...kTtTtTtTtk...',
      '...kwTwTwTwTk...',
      '...kkkkkkkkkk...',
      '................',
      '................',
      '................',
    ],
  },
  {
    // Hai: harmaa selkäevä, valkoinen vatsa ja terävät hampaat.
    id: 'shark',
    palette: { g: '#7a8a9a', G: '#5a6878', w: '#e8eef4', k: '#1a1a1a', t: '#ffffff', r: '#c03030' },
    rows: [
      '................',
      '.......G........',
      '......GG........',
      '.....GGG.....G..',
      '....gGGGg...GG..',
      '..ggggggggg.GG..',
      '.gkgggggggggGG..',
      'ggggggggggggGG..',
      'rtrtwwwwwwggggG.',
      'rrrwwwwwwwwgg.GG',
      '.twtwwwwwwwg...G',
      '..wwwwwwwwg.....',
      '....GG..GG......',
      '................',
      '................',
      '................',
    ],
  },
  {
    // Koho kelluu vedessä kalastaessa (systems/fishing-control.ts).
    id: 'bobber',
    palette: { w: '#ffffff', r: '#e0303a' },
    rows: ['..ww..', '.wwww.', 'rrrrrr', 'rrrrrr', '.rrrr.', '..rr..'],
  },
];
