import type { BattleBackdropDef, BattleBackdropId, TerrainId } from './types';

// Taistelun taustat. Tausta valitaan sen maaston mukaan, jossa taistelu alkaa:
// pellolla kesäinen pelto, metsässä kuusikko, tuntureilla lumiset huiput, tiellä
// kylä punaisine mökkeineen, rannalla meri, suolla usvainen räme ja tulivuorella
// hehkuvat laavahuiput. Uusi tausta = uusi olio tähän ja rivi BACKDROP_BY_TERRAIN-listaan.
// Koordinaatit ovat taustan pikseleinä (240 × 135, piirretään kaksinkertaisena).

export const BATTLE_BACKDROPS: Readonly<Record<BattleBackdropId, BattleBackdropDef>> = {
  field: {
    id: 'field',
    sky: ['#3f7fd6', '#4f8bdc', '#64a0e6', '#7db1ec', '#9cc4f0', '#c4dcf5'],
    sun: { x: 40, y: 22, radius: 9, color: '#fff3b0' },
    hills: { color: '#77a86a', height: 12, peaks: false },
    trees: { kind: 'birch', color: '#5f9b47', shade: '#4a7f37', count: 6 },
    houses: 0,
    ground: ['#79b84a', '#6fae43', '#67a43e', '#5f9a39', '#589035', '#508631'],
    speckles: ['#9bd862', '#f2e55c', '#ffffff'],
    path: null,
    // Siitepöly ja pienet perhoset leijuvat.
    weather: { kind: 'float', colors: [0xfff6a0, 0xffffff], count: 12 },
  },
  forest: {
    id: 'forest',
    sky: ['#2f5f8f', '#386a98', '#4679a3', '#5a8db3', '#76a3c2', '#94b9cf'],
    sun: { x: 196, y: 18, radius: 6, color: '#eef5c8' },
    hills: { color: '#3d6a52', height: 22, peaks: false },
    trees: { kind: 'pine', color: '#1f4a2c', shade: '#2c6038', count: 15 },
    houses: 0,
    ground: ['#44742f', '#3e6b2c', '#38632a', '#335a26', '#2e5222', '#2a4b1f'],
    speckles: ['#5f9a3e', '#d04a3c', '#8a6a44'],
    path: null,
    // Tulikärpäset tuikkivat metsän hämärässä.
    weather: { kind: 'float', colors: [0xd8ff7a, 0xfff2a8], count: 10 },
  },
  snow: {
    id: 'snow',
    sky: ['#5d7fc0', '#6d8fc9', '#8aa7d6', '#a9bfe2', '#cad8ee', '#e4ecf7'],
    sun: { x: 190, y: 24, radius: 8, color: '#ffffff' },
    hills: { color: '#8193b3', height: 38, peaks: true, cap: '#f4f8ff' },
    trees: { kind: 'pine', color: '#2a4a4a', shade: '#e8f0fa', count: 7 },
    houses: 0,
    ground: ['#f4f8fd', '#eaf0f9', '#e0e8f5', '#d6e0f0', '#ccd8eb', '#c2d0e6'],
    speckles: ['#ffffff', '#b4c6e6'],
    path: null,
    weather: { kind: 'fall', colors: [0xffffff, 0xdfe9ff], count: 26 },
  },
  village: {
    id: 'village',
    sky: ['#4a6fb8', '#5b7cbf', '#7a8fc6', '#a49fc0', '#d6a98f', '#f2c48a'],
    sun: { x: 176, y: 60, radius: 12, color: '#ffd27a' },
    hills: { color: '#5f7f5a', height: 12, peaks: false },
    trees: { kind: 'birch', color: '#4f8a3a', shade: '#3e7030', count: 5 },
    houses: 3,
    ground: ['#64a03c', '#5d9638', '#568c34', '#4f8230', '#48782c', '#426f28'],
    speckles: ['#86c651', '#f2e55c'],
    path: '#b58b5a',
    weather: null,
  },
  // Loppubossin tausta (EnemyDef.backdrop): tunturin huippu yöllä revontulten alla.
  summit: {
    id: 'summit',
    sky: ['#070b1f', '#0b1230', '#111a40', '#18264f', '#22355f', '#2f4670'],
    sun: { x: 36, y: 20, radius: 6, color: '#f4f1d8' },
    hills: { color: '#2b3956', height: 48, peaks: true, cap: '#cfdcf2' },
    trees: null,
    houses: 0,
    ground: ['#b9c7e0', '#aebdd8', '#a3b3d0', '#98a9c8', '#8d9fc0', '#8295b8'],
    speckles: ['#e6eeff', '#6f82a8'],
    path: null,
    weather: { kind: 'fall', colors: [0xffffff, 0xbfe8ff], count: 30 },
    aurora: ['#3dffa0', '#2fd6c8', '#9b6bff'],
  },
  // Hiekkaranta: meri horisontissa (matala sininen "kukkula") ja vaalea hiekka.
  beach: {
    id: 'beach',
    sky: ['#3a86d8', '#4b93de', '#62a3e4', '#7fb6ea', '#a2cbf0', '#cfe4f7'],
    sun: { x: 54, y: 20, radius: 10, color: '#fff6c2' },
    hills: { color: '#2f7fc4', height: 7, peaks: false },
    trees: null,
    houses: 0,
    ground: ['#f0dc9a', '#ead490', '#e4cc86', '#ddc37c', '#d6bb73', '#cfb26a'],
    speckles: ['#ffffff', '#f7c6b0', '#a89060'],
    path: null,
    // Merituuli kuljettaa vaahtoa ja hiekkaa.
    weather: { kind: 'float', colors: [0xffffff, 0xdff3ff], count: 10 },
  },
  // Suo: harmaanvihreä usva, kituliaat kuuset ja virvatulet.
  swamp: {
    id: 'swamp',
    sky: ['#3d4a4a', '#465454', '#516060', '#5d6d69', '#6b7a72', '#7b897d'],
    sun: { x: 180, y: 26, radius: 7, color: '#d8e0c0' },
    hills: { color: '#43523d', height: 14, peaks: false },
    trees: { kind: 'pine', color: '#26331f', shade: '#33432a', count: 9 },
    houses: 0,
    ground: ['#566842', '#4f603c', '#485836', '#415031', '#3a482c', '#344128'],
    speckles: ['#3f5f63', '#8a9a4a', '#6f8e8a'],
    path: null,
    // Virvatulet leijuvat suon yllä.
    weather: { kind: 'float', colors: [0x9fffe0, 0xd8ffb0], count: 10 },
  },
  // Tulivuori: punainen taivas, tummat huiput hehkuvine laavapäineen ja kipinät.
  volcano: {
    id: 'volcano',
    sky: ['#2a0e0e', '#3d1410', '#561c12', '#742814', '#933a18', '#b4521e'],
    sun: { x: 196, y: 22, radius: 7, color: '#ffcf6a' },
    hills: { color: '#2b2222', height: 44, peaks: true, cap: '#ff7a1e' },
    trees: null,
    houses: 0,
    ground: ['#4d4240', '#463c3a', '#3f3634', '#38302e', '#312a28', '#2a2423'],
    speckles: ['#e8641e', '#ffb347', '#5b514f'],
    path: null,
    // Kipinät ja tuhka leijuvat.
    weather: { kind: 'float', colors: [0xffa040, 0xff5a1e], count: 14 },
  },
};

/** Mikä tausta näytetään missäkin maastossa. Tie kulkee kylien välillä. */
export const BACKDROP_BY_TERRAIN: Readonly<Record<TerrainId, BattleBackdropId>> = {
  field: 'field',
  forest: 'forest',
  snow: 'snow',
  road: 'village',
  sand: 'beach',
  swamp: 'swamp',
  ash: 'volcano',
  lava: 'volcano',
  // Kiven päällä ei seistä, mutta kivet ovat metsässä.
  rock: 'forest',
  // Vesillä ei taistella, mutta varmuuden vuoksi niillekin on tausta.
  sea: 'field',
  lake: 'field',
};

/** Tausta, jos maastoa ei tiedetä (esim. vanha tallennus tai testi). */
export const DEFAULT_BACKDROP: BattleBackdropId = 'field';
