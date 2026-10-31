// Pelin perusvakiot. Muuta näitä, älä kovakoodaa lukuja muualle.

/** Pelin sisäinen resoluutio (16:9). Skaalataan puhelimen näytölle pikselitarkasti. */
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 270;

/** Yhden karttaruudun koko pikseleinä. */
export const TILE_SIZE = 16;

export const COLORS = {
  background: '#10141f',
  text: '#ffffff',
  textShadow: '#000000',
  hpBar: 0xe0303a,
  hpBarBack: 0x3a1015,
  xpBar: 0x3fa9f5,
  xpBarBack: 0x10283d,
  uiFill: 0xffffff,
  panel: 0x10141f,
  panelBorder: 0xffffff,
  button: 0x2e4a7a,
  buttonPressed: 0x4a6fae,
  battleSky: 0x6fa8dc,
  battleGround: 0x4f8c34,
  battlePlatform: 0x3d6e28,
  hurt: 0xff4444,
  hitFlash: 0xffffff,
} as const;

export const FONT = {
  family: 'monospace',
  small: '10px',
  medium: '14px',
  large: '24px',
} as const;

/** Scenejen avaimet yhdessä paikassa, ettei kirjoitusvirheitä synny. */
export const SCENES = {
  boot: 'boot',
  menu: 'menu',
  world: 'world',
  battle: 'battle',
  gameOver: 'game-over',
  skills: 'skills',
} as const;

/** Karttanäkymän asetukset. */
export const WORLD_VIEW = {
  /** Etäisyys pikseleinä, jolla vihollinen "osuu" pelaajaan ja taistelu alkaa. */
  encounterRange: 12,
  /** Aika, jonka viholliset odottavat ennen kuin ne voivat aloittaa taistelun. */
  graceMs: { start: 1000, afterBattle: 1000, afterFlee: 2500 },
  /** Ilmoitusten näkymisaika. */
  toastMs: 2500,
  /** Paikkakunnassa näkyvä KYKYPISTEET-nappi oikeassa alakulmassa. */
  skillButton: { width: 150, height: 40, margin: 6 },
} as const;

/** Kykypistenäkymän asetukset. */
export const SKILLS_VIEW = {
  titleY: 20,
  pointsLeftY: 46,
  firstRowY: 84,
  rowGap: 48,
  nameX: 40,
  valueX: 190,
  perPointX: 210,
  addButtonX: 420,
  buttonHeight: 40,
  addButtonWidth: 56,
  doneButtonWidth: 120,
  margin: 6,
} as const;

/** Taistelunäkymän asetukset. */
export const BATTLE_VIEW = {
  spriteScale: 4,
  /** Kuinka kauan kukin taisteluviesti näkyy ennen seuraavaa. */
  messageMs: 900,
  buttonWidth: 104,
  buttonHeight: 40,
  margin: 6,
  /** Kuinka kauan KP-palkin täyttyminen kestää voiton jälkeen. */
  xpFillMs: 600,
} as const;
