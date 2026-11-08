// Ideaviestinäkymän mitat (scenes/ideas-scene.ts, ui/ideas/). Pelin pikseleinä (480 × 270).
// Napit ovat vähintään 40 px korkeita ja ruudun reunoilla (peukalolla painettavia).

export const IDEAS_VIEW = {
  margin: 6,
  buttonHeight: 40,
  /** Yläpalkki: otsikko vasemmalla, järjestysnappi keskellä, TAKAISIN oikealla. */
  topY: 26,
  titleX: 56,
  sortX: 228,
  sortWidth: 176,
  backWidth: 110,
  /** Muistutus henkilötiedoista yläpalkin alla. */
  reminderY: 56,
  /** Ideakortit: kolme sivulla. */
  cardsPerPage: 3,
  firstCardY: 66,
  cardHeight: 46,
  cardGap: 4,
  card: { color: 0x1c2438, border: 0x3a4a6a, bestBorder: 0xffd23f, mineBorder: 0x5fd35f },
  /** Kortin vasen sarake (#numero, ★, SINUN) ja tekstin alue. */
  numberX: 12,
  textX: 52,
  textWrap: 290,
  /** Kortissa näkyy enintään kolme riviä; koko teksti näkyy, kun idean avaa. */
  textMaxLines: 3,
  textMaxChars: 140,
  lineSpacing: 1,
  /** Tykkäys- ja kommenttinapit kortin oikeassa reunassa. Ikoni 8 px → 16 px. */
  iconButtonWidth: 58,
  iconButtonGap: 4,
  iconScale: 2,
  iconOffsetX: 14,
  /** Alarivi: sivunuolet vasemmalla, miekan lunastus keskellä, UUSI IDEA oikealla. */
  pagerLeft: 6,
  pagerRight: 206,
  claimX: 280,
  claimWidth: 132,
  newWidth: 120,
  /** Avattu idea: koko teksti ylhäällä, kommentit alla neljä sivulla. */
  detailTextY: 54,
  detailTextWrap: 390,
  detailLikeY: 74,
  firstCommentY: 112,
  commentGap: 26,
  commentsPerPage: 4,
  commentWrap: 456,
  /** Kirjoitusnäkymä: tekstikenttä ylhäällä, jotta puhelimen näppäimistö ei peitä sitä. */
  inputY: 82,
  inputHeight: 64,
  inputFontPx: 12,
  writerTitleY: 24,
  counterY: 122,
  writerTextY: 132,
  writerTextWrap: 448,
  writerButtonWidth: 120,
  /** Ilmoitukset keskellä ruutua tummalla pohjalla (nappien päällä). */
  toastY: 140,
  /** Avatun idean kommenttien otsikko. */
  commentsTitleY: 102,
  /** Tekstin värit: himmeä (numerot) ja muistutus. */
  dimColor: '#9aa8c0',
  mineColor: '#5fd35f',
} as const;
