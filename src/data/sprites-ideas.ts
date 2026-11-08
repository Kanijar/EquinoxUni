import type { SpriteDef } from './types';

// Ideaviestien pikselikuvat: Tykkäysmiekka (16×16, data/idea-items.ts) sekä tykkäys- ja
// kommenttinappien ikonit (8×8, piirretään kaksinkertaisina, scenes/ideas-scene.ts).

export const IDEA_SPRITES: readonly SpriteDef[] = [
  {
    // Tykkäysmiekka: vaaleanpunainen terä, punainen sydän väistimenä ja kultainen kahva.
    id: 'like-sword',
    palette: { s: '#ffd6ea', b: '#ff7ab8', k: '#3a1a2a', r: '#e0303a', p: '#ff8a9a', g: '#ffd23f' },
    rows: [
      '.............kk.',
      '............ksbk',
      '...........ksbk.',
      '..........ksbk..',
      '.........ksbk...',
      '........ksbk....',
      '.......ksbk.....',
      '..kk.kksbk......',
      '.krrkrrbk.......',
      '.kprrrrk........',
      '..krrrk.........',
      '...krgk.........',
      '...kkggk........',
      '..kg..gk........',
      '.kg.............',
      'kk..............',
    ],
  },
  {
    // Sydän tykkäysnappiin.
    id: 'icon-heart',
    palette: { r: '#ff4a6a', p: '#ffb0c0' },
    rows: [
      '........',
      '.rr..rr.',
      'rprrrrrr',
      'rrrrrrrr',
      'rrrrrrrr',
      '.rrrrrr.',
      '..rrrr..',
      '...rr...',
    ],
  },
  {
    // Puhekupla kommenttinappiin.
    id: 'icon-bubble',
    palette: { w: '#e8eef8' },
    rows: [
      '.wwwwww.',
      'wwwwwwww',
      'wwwwwwww',
      'wwwwwwww',
      '.wwwwww.',
      '..ww....',
      '.ww.....',
      '........',
    ],
  },
];
