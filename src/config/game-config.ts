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
  uiFill: 0xffffff,
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
  game: 'game',
  gameOver: 'game-over',
} as const;
