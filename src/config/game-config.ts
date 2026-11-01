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
  /** Repussa valittu esine: ruudun reunus. */
  selected: 0xffe066,
  notice: '#ffe066',
  hitFlash: 0xffffff,
  /** Kriittisen osuman välähdys ja teksti. */
  critFlash: 0xffd23f,
  critText: '#ffd23f',
  /** Loitsun osuman ja palamisen välähdys sekä palamisen vahinkoteksti. */
  spellFlash: 0xff7a1a,
  /** Loppubossin lumimyrsky osuu pelaajaan. */
  stormFlash: 0x9fd0ff,
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
  victory: 'victory',
  skills: 'skills',
  settings: 'settings',
  saves: 'saves',
  backpack: 'backpack',
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
  /** Napautettu susi nostaa päänsä ulvomaan: kallistus asteina, kesto ja pullistus. */
  wolfHowlAngle: 14,
  wolfHowlMs: 220,
  wolfHowlScale: 1.1,
  /** Versioteksti oikeassa alakulmassa: etäisyys reunoista ja himmennys. */
  versionMargin: 4,
  versionAlpha: 0.7,
} as const;

/** Alkuruudun suden salaisuuden taikaefektit (ui/wolf-magic.ts). */
export const WOLF_MAGIC = {
  /** Tähtisäihke: tähtien määrä ensimmäisellä ja myöhemmillä napautuksilla. */
  starCount: 16,
  starCountSmall: 6,
  starSizePx: 4,
  starColors: [0xfff27a, 0xffffff, 0x6ff7ff],
  starMinPx: 30,
  starMaxPx: 80,
  starMs: 800,
  starDepth: 10,
  /** Valkoisensininen välähdys koko ruudulle (punainen, vihreä, sininen 0–255). */
  flashMs: 300,
  flashRgb: [200, 240, 255],
  /** Henkisuden ympärillä tuikkii tähti näin usein, enintään tämän matkan päässä keskeltä. */
  twinkleEveryMs: 350,
  twinkleRangePx: 34,
  twinkleMs: 900,
} as const;

/** Alkuruudun liman napautus: lima litistyy ja roiskii vihreitä pisaroita (ui/squishy-slime.ts). */
export const SLIME_SQUISH = {
  scaleX: 1.3,
  scaleY: 0.6,
  ms: 120,
  splashCount: 10,
  splashColors: [0x5fd35f, 0x9cf29c, 0x2f8f2f],
} as const;

/** Pelaajalaskuri ("Pelaajia nyt: 3") alkuruudun ja kartan vasemmassa alakulmassa. */
export const PLAYER_COUNT_VIEW = {
  margin: 4,
  alpha: 0.7,
  stroke: 3,
  /** Kartan yllä, mutta ilmoitusten (toast) alla. */
  depth: 900,
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
  /** Kartalle palaava voitettu vihollinen ilmestyy näkyviin näin monessa millisekunnissa. */
  respawnFadeMs: 800,
  /**
   * Napit oikeassa alakulmassa päällekkäin: alimpana REPPU (aina näkyvissä), sen yllä
   * paikkakunnassa KYKYPISTEET ja TALLENNA. height ja gap koskevat kaikkia (ui/corner-stack.ts).
   */
  cornerButtons: { height: 40, margin: 6, gap: 6 },
  backpackButton: { width: 96 },
  skillButton: { width: 150 },
  saveButton: { width: 150 },
  /** Loppuboss kartalla: sykkivä punainen hehku jalkojen alla ja kameran tärähdys herätessä. */
  bossAura: { radius: 18, color: 0xff3c3c, alpha: 0.35, pulseScale: 1.4, pulseMs: 700 },
  bossAwakenShake: { ms: 600, intensity: 0.012 },
  /** Ruudun reunan nuoli, joka osoittaa kohti loppubossia, kun se ei näy ruudulla. */
  bossPointer: { size: 9, margin: 22, color: 0xff3c3c, alpha: 0.9, pulseMs: 500 },
} as const;

/** Voittoruutu (loppuboss tai läpäisy). Peli jatkuu kosketuksella. */
export const VICTORY_VIEW = {
  titleY: 44,
  textY: 82,
  hintY: 104,
  statsY: 128,
  heroY: 236,
  heroScale: 5,
  hopPx: 14,
  hopMs: 320,
  nextY: 256,
  /** Kultaiset tähdet tuikkivat taustalla. */
  stars: { count: 24, size: 3, minMs: 400, maxMs: 1200, color: 0xffd23f },
  /** Kosketus hyväksytään vasta tämän jälkeen, ettei taistelun napautus ohita ruutua. */
  inputDelayMs: 800,
  background: 0x0b1230,
} as const;

/** Reppunäkymän asetukset: varusteet vasemmalla, repun esineet oikealla, tiedot alhaalla. */
export const BACKPACK_VIEW = {
  titleY: 18,
  headingY: 58,
  margin: 6,
  doneButtonWidth: 120,
  /** Esineruutu (kosketettava) ja kuvan skaalaus 16 px → 32 px. */
  tileSize: 40,
  iconScale: 2,
  /** Varustepaikat: rivit vasemmalla. */
  slotX: 32,
  slotTextX: 58,
  slotFirstY: 88,
  slotGap: 46,
  slotRowWidth: 202,
  /** Repun esineet ruudukkona oikealla. */
  bagX: 244,
  bagFirstY: 88,
  bagColumns: 5,
  bagRows: 2,
  bagGap: 48,
  /** Pelaajan arvot kahdella rivillä repun esineiden alla. */
  statsFirstY: 172,
  statsGap: 16,
  /** Valitun esineen tiedot ja toimintonappi alareunassa. */
  infoX: 12,
  infoNameY: 222,
  infoTextY: 240,
  infoBonusY: 256,
  actionButtonWidth: 150,
  actionButtonY: 240,
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
  /** Kun rivillä on lisätieto (Maagia: polttovoima), kaksi pientä riviä näin paljon keskeltä. */
  detailOffsetY: 6,
  addButtonX: 420,
  buttonHeight: 40,
  addButtonWidth: 56,
  doneButtonWidth: 120,
  margin: 6,
} as const;

/** Taistelunäkymän asetukset. */
export const BATTLE_VIEW = {
  /** Kuinka kauan kukin taisteluviesti näkyy ennen seuraavaa. */
  messageMs: 900,
  buttonWidth: 104,
  buttonHeight: 40,
  margin: 6,
  /** Kuinka kauan KP-palkin täyttyminen kestää voiton jälkeen. */
  xpFillMs: 600,
  /** Tulipallo lentää pelaajalta viholliseen kaarena (arcPx = kuinka korkealle). */
  fireball: {
    radius: 6,
    flightMs: 380,
    color: 0xff7a1a,
    glowColor: 0xffd23f,
    coreColor: 0xfff6d0,
    arcPx: 34,
    flickerMs: 60,
  },
  /** Kriittinen osuma: ruutu tärähtää ja kohteen yläpuolelle nousee teksti. */
  crit: { shakeMs: 200, shakeIntensity: 0.012, popupMs: 800, popupRisePx: 24, popupOffsetY: 84 },
  /** Pudonnut esine nousee kaatuneen vihollisen kohdalta (ui/loot-popup.ts). */
  loot: { scale: 3, offsetY: 30, risePx: 26, popMs: 250, holdMs: 500, fadeMs: 300 },
} as const;
