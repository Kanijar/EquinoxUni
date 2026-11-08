// Peikkokuninkaan luolan mitat: suuaukko kartalla ja luolan näkymä (scenes/cave-scene.ts).

/** Luolan suu kartalla ja LUOLA-nappi. */
export const CAVE_MAP = {
  /** Suuaukko piirretään maan päälle, mutta sankarin (10) alle. */
  depth: 5,
  /** Suuaukko ja kivi piirretään kaksinkertaisina, jotta luola erottuu metsän kivistä. */
  scale: 2,
  /** LUOLA-nappi oikean alakulman pinossa KYKYPISTEET-napin paikalla (sitä ei näy luolalla). */
  buttonStackIndex: 1,
  buttonWidth: 96,
} as const;

/** Luolan näkymä: vasemmalla miekka kivessä, oikealla Noita. */
export const CAVE_VIEW = {
  background: 0x1a1424,
  rock: 0x2e2638,
  /** Tippukivet katossa: määrä, leveys ja suurin pituus. */
  stalactites: { count: 12, width: 24, maxLength: 34, minLength: 12 },
  floorHeight: 40,
  titleY: 22,
  swordX: 120,
  witchX: 360,
  figureY: 112,
  figureScale: 4,
  /** Miekan takana sykkivä hehku, kun sen voi vetää. */
  glow: { color: 0xffe14a, radius: 34, alpha: 0.35, pulseMs: 700 },
  textY: 176,
  textWrap: 210,
  buttonY: 232,
  buttonWidth: 170,
  buttonHeight: 40,
  doneButtonWidth: 96,
  margin: 6,
} as const;
