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
} as const;

/** Karttanäkymän asetukset. */
export const WORLD_VIEW = {
  /** Etäisyys pikseleinä, jolla vihollinen "osuu" pelaajaan ja taistelu alkaa. */
  encounterRange: 12,
  /** Aika, jonka viholliset odottavat ennen kuin ne voivat aloittaa taistelun. */
  graceMs: { start: 1000, afterBattle: 1000, afterFlee: 2500 },
  /** Ilmoitusten näkymisaika. */
  toastMs: 2500,
} as const;

/** Taistelunäkymän asetukset. */
export const BATTLE_VIEW = {
  spriteScale: 4,
  /** Kuinka kauan kukin taisteluviesti näkyy ennen seuraavaa. */
  messageMs: 900,
  buttonWidth: 104,
  buttonHeight: 40,
  margin: 6,
} as const;
