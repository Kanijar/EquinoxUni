// Taistelunäkymän ulkoasun vakiot: hahmojen paikat, animaatioiden ajat, paneelit,
// lentävät numerot ja siirtymäefekti. Taustat ja hiukkaset ovat datana
// (data/battle-backdrops.ts ja data/battle-effects.ts). Napit ja viestien tahti: BATTLE_VIEW.

/** Näyttämö: taistelijoiden jalkojen paikat ja hahmojen animaatiot. */
export const BATTLE_STAGE = {
  /** Taivaan ja maan raja. */
  horizonY: 150,
  /** Tausta piirretään puolella resoluutiolla ja venytetään: isot, selkeät pikselit. */
  backdropScale: 2,
  player: { x: 116, y: 180 },
  enemy: { x: 362, y: 152 },
  /** Hahmojen koko: 16 px sprite × 5 = 80 px. */
  spriteScale: 5,
  /** Tavallisen hahmospriten koko pikseleinä (varjon koko on mitoitettu tälle). */
  baseSpritePx: 16,
  /**
   * Suurin hahmon korkeus näyttämöllä. Isompi sprite (esim. 24 px loppuboss) saa pienemmän
   * kokonaislukukertoimen (24 × 4 = 96 px), jottei se osu nimikylttiin.
   */
  maxFighterPx: 100,
  shadow: { width: 64, height: 12, color: 0x000000, alpha: 0.3 },
  /** Taistelun alussa hahmot liukuvat paikalleen ruudun reunoilta (kun siirtymä on puolivälissä). */
  enter: { distancePx: 150, ms: 420, delayMs: 220 },
  /** Hengitys paikallaan: pieni pomppu ylös ja litistys. */
  idle: { bobPx: 2, squash: 0.04, ms: 560 },
  /** Hyökkäys: hyppy kohti vastustajaa. Osuma näkyy, kun hyppy on perillä. */
  lunge: { distancePx: 46, hopPx: 12, ms: 140 },
  /** Osuma heittää kohdetta taaksepäin ja ravistaa sitä. */
  hurt: { knockbackPx: 10, shakePx: 3, ms: 70, flashMs: 220 },
  /** Kaatuminen: vihollinen vilkkuu, litistyy ja hajoaa pölyksi. */
  defeat: { blinks: 3, blinkMs: 70, shrinkMs: 380 },
  /** Pako: sankari juoksee vasemmalle ulos ruudusta. */
  flee: { distancePx: 200, ms: 520, failPx: 40, tiltDeg: 20 },
  /** Voittohyppy. */
  cheer: { hopPx: 18, ms: 180 },
  /** Kilpi pelaajan ympärillä puolustaessa. */
  shield: { radius: 46, color: 0x8fd3ff, width: 3, ms: 1800 },
  /** Pilvet (data/sprites-ui.ts) liikkuvat hitaasti taivaalla. */
  clouds: {
    sprite: 'cloud',
    scale: 2,
    count: 3,
    minY: 12,
    maxY: 56,
    minMs: 40000,
    maxMs: 70000,
    alpha: 0.9,
  },
} as const;

/** Nimikyltit ja elämäpalkit ruudun yläreunassa. */
export const BATTLE_PANEL = {
  margin: 6,
  width: 158,
  playerHeight: 60,
  enemyHeight: 44,
  padding: 6,
  barY: 21,
  barHeight: 7,
  xpBarY: 42,
  xpBarHeight: 3,
  /** Menetetty elämä näkyy hetken vaaleana "haamuna" ennen kuin palkki valuu alas. */
  ghostDelayMs: 280,
  drainMs: 420,
  hpColors: { high: 0x46d05a, mid: 0xf5c542, low: 0xe0303a },
  ghostColor: 0xfff2c8,
  /** Raja-arvot värille: yli puolet vihreä, yli neljännes keltainen, muuten punainen. */
  hpLimits: { high: 0.5, mid: 0.25 },
  /** Kun elämää on vähän, palkki sykkii. */
  lowPulseMs: 380,
  /** Palamisen liekki-ikoni vihollisen nimen vieressä. */
  burnIconScale: 2,
} as const;

/** Pikselipaneelien värit (nimikyltit, viestilaatikko, napit). */
export const PIXEL_PANEL = {
  fill: 0x18213a,
  border: 0xf2f4ff,
  shadow: 0x0a0e1a,
  highlight: 0x2e3b63,
  /** Musta ääriviiva palkkien ympärillä. */
  outline: 0x000000,
  alpha: 1,
} as const;

/** Viestilaatikko näyttämön alla: teksti kirjoittuu näkyviin kirjain kerrallaan. */
export const BATTLE_MESSAGE = {
  y: 203,
  /** Kaksi riviä tekstiä mahtuu kehysten sisään. */
  height: 38,
  /** Koko viestin kirjoittamiseen kuluva aika (lyhyt, jotta peli ei hidastu). */
  typeMs: 260,
} as const;

/** Toimintonappien värit ja ikonit (ikonit data/sprites-ui.ts). */
export const ACTION_BUTTON = {
  iconScale: 2,
  iconGap: 4,
  accentHeight: 3,
  pressedOffsetPx: 2,
  /** Ikonien spritet (data/sprites-ui.ts). Juoma käyttää juoman omaa spriteä. */
  icons: {
    attack: 'icon-sword',
    defend: 'icon-shield',
    item: 'potion',
    flee: 'icon-run',
    punch: 'icon-fist',
    spell: 'icon-fire',
    back: 'icon-back',
  },
  accents: {
    attack: 0xe0503a,
    defend: 0x3f8fe0,
    item: 0x46c05a,
    flee: 0x9aa3b5,
    punch: 0xf08a3a,
    spell: 0xff7a1a,
    back: 0x9aa3b5,
  },
} as const;

/** Lentävät vahinkonumerot. */
export const DAMAGE_NUMBERS = {
  risePx: 26,
  ms: 760,
  popScale: 1.6,
  popMs: 120,
  stroke: 4,
  /** Numero nousee hahmon keskeltä (pystysiirto) ja hieman sivuun. */
  offsetY: 4,
  spreadPx: 14,
  colors: {
    damage: '#ffffff',
    crit: '#ffd23f',
    burn: '#ff9a3c',
    heal: '#7dff8a',
    blocked: '#8fd3ff',
  },
  fontSize: { normal: '18px', crit: '26px', small: '14px' },
  /** Paranevan sankarin välähdys. */
  healTint: 0x7dff8a,
} as const;

/** Kriittinen osuma ja voitto: kameran välähdys ja zoomaus. */
export const BATTLE_CAMERA = {
  critFlashMs: 90,
  critFlashRgb: [255, 240, 200],
  punchZoom: 1.05,
  punchMs: 90,
  hitShakeMs: 90,
  hitShakeIntensity: 0.004,
  bannerMs: 1400,
  /** VOITTO!-teksti odottaa, että vihollinen ehtii vilkkua ja hajota. */
  victoryDelayMs: 480,
  bannerY: 104,
} as const;

/** Hiukkasten yläraja yhtä aikaa ruudulla (suorituskyky). */
export const PARTICLE_LIMITS = {
  perBurstEmitter: 48,
  flame: 40,
  weather: 30,
  depth: 700,
} as const;

/** Pikselöity siirtymä kartalta taisteluun ja takaisin. */
export const SCREEN_WIPE = {
  cellPx: 16,
  coverMs: 420,
  revealMs: 420,
  color: 0x05070d,
  depth: 5000,
} as const;
