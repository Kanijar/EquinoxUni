// Hahmonluonnin (scenes/hero-scene.ts) mitat pelin pikseleinä (480 × 270).
// Vasemmalla nimi, iso sankari ja ARVO-nappi, oikealla ulkonäön valintarivit.
// Nimikenttä on ylhäällä, ettei puhelimen näppäimistö peitä sitä.
// Ylhäällä TAKAISIN (vasen kulma), otsikko ja ALOITA (oikea kulma).

export const HERO_VIEW = {
  titleY: 24,
  /** Yläkulmien napit TAKAISIN ja ALOITA. */
  topButtonWidth: 112,
  topButtonHeight: 36,
  margin: 6,
  /** Iso sankari: keskikohta, jalkojen korkeus ja skaalaus 16 px → 96 px. */
  previewX: 100,
  previewFeetY: 204,
  previewScale: 6,
  /** Sankari keinuu hiljaa kuten alkuruudulla. */
  bobPx: 3,
  bobMs: 600,
  /** Jalkojen alla varjo. */
  shadow: { width: 56, height: 8, color: 0x000000, alpha: 0.35 },
  /** Nimikenttä vasemmalla ylhäällä (HTML-tekstikenttä, ui/name-input.ts): teksti, vasen reuna, keskikohta. */
  nameLabelX: 10,
  nameX: 54,
  nameY: 66,
  nameWidth: 136,
  nameHeight: 30,
  /** Fontin koko pelin pikseleinä. */
  nameFontPx: 14,
  /** ARVO-nappi sankarin alla. */
  randomY: 240,
  randomWidth: 120,
  randomHeight: 36,
  /** Valintarivit oikealla: nimi, [<] väri tai numero [>]. */
  firstRowY: 72,
  rowGap: 42,
  rowLabelX: 200,
  lessX: 336,
  moreX: 448,
  stepButtonWidth: 48,
  stepButtonHeight: 38,
  swatchSize: 26,
} as const;
