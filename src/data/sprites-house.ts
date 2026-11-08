import type { SpriteDef } from './types';

// Sankarin talon (data/house.ts) spritet: talo kartalla ja pokaali talon 10 parhaan listan
// vieressä (16x16).

export const HOUSE_SPRITES: readonly SpriteDef[] = [
  {
    // Sankarin talo: sininen katto, savupiippu, hirsiseinä, valaistut ikkunat ja ovi.
    id: 'hero-house',
    palette: {
      k: '#1a1a2a',
      b: '#2f6fd0',
      l: '#5a9ae8',
      c: '#7a4a2a',
      w: '#b07840',
      d: '#8a5a30',
      y: '#ffe066',
      o: '#4a2a14',
      g: '#ffd23f',
    },
    rows: [
      '...........kk...',
      '......kk...cc...',
      '.....kllk..cc...',
      '....kllllk.cc...',
      '...kllbbllkcc...',
      '..kllbbbbllk....',
      '.kllbbbbbbllk...',
      'kkkkkkkkkkkkkk..',
      '.kwwwwwwwwwwk...',
      '.kwyywddwyywk...',
      '.kwyywdowyywk...',
      '.kddddooddddk...',
      '.kwwwwogwwwwk...',
      '.kddddooddddk...',
      '.kkkkkkkkkkkk...',
      '................',
    ],
  },
  {
    // Kultainen pokaali.
    id: 'trophy',
    palette: { k: '#3a2a0a', g: '#ffd23f', h: '#fff2a8', o: '#c08a1a', b: '#6b4423' },
    rows: [
      '................',
      '..kkkkkkkkkkkk..',
      'kkgggggggggghgkk',
      'kgkgggggggghggkg',
      'kgkgggggggggogkg',
      '.kkgggggggggokk.',
      '...kgggggggok...',
      '....kgggggok....',
      '.....kgggok.....',
      '......kgok......',
      '......kgok......',
      '.....kgggok.....',
      '....kkkkkkkk....',
      '....kbbbbbbk....',
      '...kbbbbbbbbk...',
      '...kkkkkkkkkk...',
    ],
  },
];
