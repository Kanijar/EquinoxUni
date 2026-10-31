import type { SpriteDef } from './types';

// Bossien pikselispritet. Bossit ovat isompia (24x24) kuin tavalliset hahmot (16x16),
// joten ne näkyvät kartalla ja taistelussa selvästi muita suurempina.

export const BOSS_SPRITES: readonly SpriteDef[] = [
  {
    // Peikkokuningas: kultainen kruunu, hehkuvat silmät, sammalparta, purppuraviitta ja
    // piikkinuija. Loppuboss (data/boss.ts).
    id: 'troll-king',
    palette: {
      k: '#ffd23f',
      K: '#c8961e',
      r: '#e0303a',
      t: '#6f8aa6',
      d: '#4a5f78',
      e: '#ff7a3c',
      w: '#ffffff',
      g: '#6b8f3a',
      f: '#6a3a86',
      m: '#43245a',
      b: '#2a1a10',
      c: '#8b5a2b',
      C: '#5e3b1a',
      s: '#c9d2dc',
    },
    rows: [
      '.......k...k...k........',
      '.......kk.kkk.kk........',
      '.......kkkkrkkkk........',
      '......tKKKKKKKKKt.......',
      '.....ttttttttttttt......',
      '.....tdeettttteedt......',
      '.....ttttttdtttttt......',
      '.....twtttttttttwt......',
      '.....gwgggggggggwg......',
      '......ggggggggggg.......',
      '..ffffftggggggtfffff..c.',
      '.fffffftttggtttffffff.cc',
      '.ffmfffttttttttfffmfftcc',
      '.ffmffttttttttttffmftttC',
      '.ffmffbbbbbbbbbbffmf.cCc',
      '.tfmffbbbkkbbbbbffmf.cCc',
      '.t.mffttttttttttffm..cCc',
      '.tt.ffdddddddddddff..CCC',
      '....fftttt...ttttff..sCs',
      '....m.tttt...tttt.m...C.',
      '......tttt...tttt.......',
      '......dttt...tttd.......',
      '.....ddddd...ddddd......',
      '........................',
    ],
  },
];
