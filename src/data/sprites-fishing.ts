import type { SpriteDef } from './types';

// Kalastuksen pikselispritet: esineet (16x16, data/fishing-items.ts), hai ja jättimustekala
// (16x16, data/enemies.ts) ja koho (6x6), joka kelluu vedessä kalastaessa.

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

/** Onkien yhteinen muoto: b vapa, d kahva, r rulla, l siima, o ja w koho, k koukku. */
const ROD_ROWS = [
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
];

/** Onkien siima, koho ja koukku ovat samanväriset. */
const ROD_LINE = { l: '#e8e8e8', k: '#2a2a2a', o: '#e0303a', w: '#ffffff' };

export const FISHING_SPRITES: readonly SpriteDef[] = [
  {
    // Hiilikuituvapa: musta vapa ja punainen kahva.
    id: 'carbon-rod',
    palette: { b: '#2a2a35', d: '#c03030', r: '#c9d2dc', ...ROD_LINE },
    rows: ROD_ROWS,
  },
  {
    // Kultainen vapa.
    id: 'golden-rod',
    palette: { b: '#ffd23f', d: '#a8763e', r: '#fff6b0', ...ROD_LINE },
    rows: ROD_ROWS,
  },
  {
    // Merenkuninkaan vapa: meren sininen vapa ja kultainen kahva.
    id: 'sea-king-rod',
    palette: { b: '#3fa0e0', d: '#ffd23f', r: '#e8f6ff', ...ROD_LINE },
    rows: ROD_ROWS,
  },
  {
    // Kärpänen: läpikuultavat siivet ja vihreä kiiltävä vartalo.
    id: 'fly',
    palette: { w: '#d8eeff', k: '#1a1a1a', g: '#4a8a3a', G: '#2f5a28' },
    rows: [
      '................',
      '................',
      '................',
      '................',
      '....ww....ww....',
      '...wwww..wwww...',
      '...wwwwkkwwww...',
      '....wwkggkww....',
      '......kggk......',
      '......kGGk......',
      '.....k.kk.k.....',
      '....k..kk..k....',
      '.......kk.......',
      '................',
      '................',
      '................',
    ],
  },
  {
    // Katkarapu: vaaleanpunainen ja mutkalla, pitkät tuntosarvet.
    id: 'shrimp',
    palette: { p: '#f08a6a', P: '#c05a40', a: '#e0b0a0', k: '#1a1a1a', l: '#f4b0a0' },
    rows: [
      '................',
      '................',
      '................',
      '........a...a...',
      '.........a.a....',
      '.....pppppk.....',
      '...ppPpPpPpp....',
      '..pPpPpPpPp.....',
      '..ppPpPp........',
      '..pPp...........',
      '..ppp...........',
      '...ppp.l........',
      '....pllll.......',
      '.....ll.........',
      '................',
      '................',
    ],
  },
  {
    // Kiiltävä uistin: hopeinen lusikka, punainen täplä ja koukku.
    id: 'lure',
    palette: { s: '#c9d2dc', w: '#ffffff', r: '#e0303a', k: '#5a5a5a' },
    rows: [
      '................',
      '................',
      '.......k........',
      '......k.k.......',
      '.......k........',
      '......sss.......',
      '.....swwss......',
      '.....swsss......',
      '.....ssrss......',
      '.....ssrrs......',
      '......sss.......',
      '.......k........',
      '.......k..k.....',
      '.......kkkk.....',
      '................',
      '................',
    ],
  },
  {
    // Taimen: ruskea, punaiset täplät.
    id: 'trout',
    palette: { b: '#b08a5a', d: '#5a4a2a', s: '#c03030', w: '#f0e0c0', f: '#8a6a3a', k: '#1a1a1a' },
    rows: FISH_ROWS,
  },
  {
    // Kultakala: kultainen ja kimaltava.
    id: 'golden-fish',
    palette: { b: '#ffd23f', d: '#e0a020', s: '#fff6b0', w: '#fff6d0', f: '#ff8a1a', k: '#1a1a1a' },
    rows: FISH_ROWS,
  },
  {
    // Helmikoru: valkoiset helmet ja iso helmi keskellä.
    id: 'pearl-necklace',
    palette: { w: '#f4f0ff', p: '#d0c8ff', P: '#ffffff' },
    rows: [
      '................',
      '................',
      '...w........w...',
      '...w........w...',
      '....w......w....',
      '....w......w....',
      '.....w....w.....',
      '......w..w......',
      '.......pp.......',
      '......pPPp......',
      '......pPPp......',
      '.......pp.......',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  {
    // Jättimustekala: violetti, isot silmät ja kahdeksan lonkeroa.
    id: 'octopus',
    palette: { p: '#9a4ab0', P: '#6a2a80', w: '#ffffff', k: '#1a1a1a' },
    rows: [
      '................',
      '.....pppppp.....',
      '....pppppppp....',
      '...pppppppppp...',
      '...pwkppppwkp...',
      '...pppppppppp...',
      '....pppPPppp....',
      '...pppppppppp...',
      '..pp.pp..pp.pp..',
      '.pp..pp..pp..pp.',
      '.p..pp....pp..p.',
      'pp..p......p..pp',
      'p...pp....pp...p',
      '................',
      '................',
      '................',
    ],
  },
  {
    // Onki: puinen vapa, rulla ja siima, jonka päässä punainen koho.
    id: 'fishing-rod',
    palette: { b: '#a8763e', d: '#5a3a1a', r: '#9aa0a8', ...ROD_LINE },
    rows: ROD_ROWS,
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
