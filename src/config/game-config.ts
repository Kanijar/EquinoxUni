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
  slotPanel: 0x1c2438,
  notice: '#ffe066',
  hitFlash: 0xffffff,
  /** Kriittisen osuman välähdys ja teksti. */
  critFlash: 0xffd23f,
  critText: '#ffd23f',
  /** Loitsun osuman ja palamisen välähdys sekä palamisen vahinkoteksti. */
  spellFlash: 0xff7a1a,
  burnText: '#ff9a3c',
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
  settings: 'settings',
  saves: 'saves',
  exit: 'exit',
} as const;

/** Yleiset nappien mitat. Kosketusnapit vähintään 40 px korkeita (peukalolla painettava). */
export const BUTTON = {
  height: 40,
  margin: 6,
  /** Aika, jonka VARMA?-nappi odottaa toista painallusta. */
  confirmMs: 3000,
} as const;

/** Alkuruudun (päävalikko) asetukset. */
export const MENU_VIEW = {
  titleY: 30,
  firstButtonY: 78,
  buttonGap: 44,
  buttonWidth: 168,
  /** Koristehahmot ja maa ruudun alareunassa (pixelart-skaalaus). */
  heroX: 88,
  enemyXs: [372, 428],
  characterScale: 4,
  groundScale: 2,
  bobPx: 3,
  bobMs: 600,
  /** Versioteksti oikeassa alakulmassa: etäisyys reunoista ja himmennys. */
  versionMargin: 4,
  versionAlpha: 0.7,
} as const;

/** Asetusnäkymän asetukset. */
export const SETTINGS_VIEW = {
  titleY: 24,
  firstRowY: 84,
  rowGap: 52,
  labelX: 40,
  lessX: 260,
  moreX: 400,
  stepButtonWidth: 48,
  toggleWidth: 188,
  backButtonWidth: 120,
} as const;

/** Tallennusnäkymän asetukset. */
export const SAVES_VIEW = {
  titleY: 18,
  statusY: 42,
  firstRowY: 82,
  rowGap: 52,
  rowHeight: 48,
  textX: 16,
  buttonWidths: { save: 96, load: 80, remove: 80 },
  backButtonWidth: 120,
} as const;

/** Karttanäkymän asetukset. */
export const WORLD_VIEW = {
  /** Etäisyys pikseleinä, jolla vihollinen "osuu" pelaajaan ja taistelu alkaa. */
  encounterRange: 12,
  /** Aika, jonka viholliset odottavat ennen kuin ne voivat aloittaa taistelun. */
  graceMs: { start: 1000, afterBattle: 1000, afterFlee: 2500, afterRevive: 3000 },
  /** Ilmoitusten näkymisaika. */
  toastMs: 2500,
  /** Paikkakunnassa näkyvä KYKYPISTEET-nappi oikeassa alakulmassa. */
  skillButton: { width: 150, height: 40, margin: 6 },
  /** Paikkakunnassa näkyvä TALLENNA-nappi KYKYPISTEET-napin yläpuolella. */
  saveButton: { width: 150, height: 40, gap: 6 },
} as const;

/** Kykypistenäkymän asetukset. Viisi riviä, VALMIS-nappi oikeassa yläkulmassa. */
export const SKILLS_VIEW = {
  titleY: 20,
  pointsLeftY: 42,
  firstRowY: 66,
  rowGap: 42,
  hintY: 262,
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
  /** Kriittinen osuma: ruutu tärähtää ja kohteen yläpuolelle nousee teksti. */
  /** Tulipallo lentää pelaajalta viholliseen. */
  fireball: { radius: 7, flightMs: 260, color: 0xff7a1a, glowColor: 0xffd23f, offsetY: 30 },
  /** Palamisen vahinko nousee palavan vihollisen yläpuolelle. */
  burn: { popupMs: 700, popupRisePx: 18, popupOffsetY: 68, stroke: 3 },
  crit: { shakeMs: 200, shakeIntensity: 0.012, popupMs: 800, popupRisePx: 24, popupOffsetY: 70 },
} as const;
