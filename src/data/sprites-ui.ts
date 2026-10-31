import type { SpriteDef } from './types';

// Käyttöliittymän pienet pikselikuvat: taistelunappien ikonit (8×8) ja taivaan pilvi.
// Ikonit piirretään kaksinkertaisina (config/battle-config.ts ACTION_BUTTON).

const BLADE = { w: '#e8eef8', l: '#9aa8c0', g: '#ffd23f', k: '#8a5a2a' };
const WHITE = { w: '#e8eef8' };

export const UI_SPRITES: readonly SpriteDef[] = [
  {
    id: 'icon-sword',
    palette: BLADE,
    rows: [
      '......ww',
      '.....wwl',
      '....wwl.',
      '.g.wwl..',
      '..gwl...',
      '..kg....',
      '.k..g...',
      'k.......',
    ],
  },
  {
    id: 'icon-shield',
    palette: { d: '#1f4f8f', b: '#3f8fe0', w: '#cfe8ff', y: '#ffd23f' },
    rows: [
      'dddddddd',
      'dwbbbbbd',
      'dwbyybbd',
      'dbyyyybd',
      'dbbyybbd',
      '.dbbbbd.',
      '..dbbd..',
      '...dd...',
    ],
  },
  {
    id: 'icon-run',
    palette: WHITE,
    rows: [
      '...ww..w',
      '..ww..ww',
      '.ww..ww.',
      'ww..ww..',
      '.ww..ww.',
      '..ww..ww',
      '...ww..w',
      '........',
    ],
  },
  {
    id: 'icon-fist',
    palette: { s: '#f2c38f', d: '#c8925a' },
    rows: [
      '.sss.ss.',
      'ssssssss',
      'sdsdsdss',
      'ssssssss',
      'dsssssss',
      '.sssssss',
      '..ssssd.',
      '..ssss..',
    ],
  },
  {
    id: 'icon-fire',
    palette: { r: '#e0401a', o: '#ff9a3c', y: '#fff2a8' },
    rows: [
      '...r....',
      '...rr..r',
      '..rorr.r',
      '.rooorrr',
      '.royyoor',
      'royyyyor',
      'royyyyor',
      '.rooooo.',
    ],
  },
  {
    id: 'icon-back',
    palette: WHITE,
    rows: [
      '..w.....',
      '.ww.....',
      'wwwwwww.',
      '.ww...ww',
      '..w....w',
      '.......w',
      '..wwwwww',
      '........',
    ],
  },
  {
    id: 'cloud',
    palette: { w: '#ffffff', s: '#dbe6f5' },
    rows: [
      '.......wwww...........',
      '.....wwwwwwww..www....',
      '...wwwwwwwwwwwwwwwww..',
      '.wwwwwwwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwwwwwwwww',
      '.ssssssssssssssssssss.',
    ],
  },
];
