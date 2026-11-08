// Sankarin talon mitat: talo kartalla ja talon näkymä (scenes/house-scene.ts).
// Kaikki luvut pelin pikseleinä (480 × 270).

/** Talo kartalla ja TALO-nappi. */
export const HOUSE_MAP = {
  /** Talo piirretään maan päälle, mutta sankarin (10) alle. */
  depth: 5,
  /** Talo piirretään kaksinkertaisena, jotta se erottuu paikkakuntien taloista. */
  scale: 2,
  /** Nimi talon alla. */
  labelOffsetY: 15,
  /** TALO-nappi oikean alakulman pinossa KYKYPISTEET-napin paikalla (sitä ei näy talolla). */
  buttonStackIndex: 1,
  buttonWidth: 96,
} as const;

/** Talon näkymä: vasemmalla sankari ja pokaali, oikealla 10 parhaan lista. */
export const HOUSE_VIEW = {
  wall: 0x6b4423,
  /** Hirsiseinän raidat. */
  log: 0x5a381c,
  logHeight: 18,
  floor: 0x8a5a30,
  floorHeight: 36,
  titleY: 22,
  margin: 6,
  doneButtonWidth: 110,
  buttonHeight: 40,
  /** Sankari ja pokaali vasemmalla. */
  heroX: 96,
  trophyY: 60,
  trophyScale: 2,
  heroY: 106,
  heroScale: 3,
  rankY: 142,
  /** Kertomus listasta (yläreuna) ja LISÄÄ TULOKSENI -nappi sen alla. */
  privacyY: 156,
  privacyWrap: 176,
  submitY: 240,
  submitWidth: 180,
  /** Lista oikealla tummalla taululla. */
  panel: { x: 196, y: 44, width: 276, height: 216, color: 0x1c2438, border: 0xffd23f },
  listTitleY: 60,
  firstRowY: 82,
  rowGap: 17,
  rowPadding: 10,
  /** KP-sarakkeen leveys: tason sarake päättyy sen vasempaan reunaan. */
  xpColumnWidth: 78,
  /** Oman sankarin rivi korostetaan. */
  ownRowColor: '#ffe066',
} as const;
