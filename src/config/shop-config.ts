// Kulkevan kauppiaan näkymien mitat: kauppias kartalla, KAUPPA-nappi ja kauppanäkymä
// (scenes/shop-scene.ts). Kaikki luvut pelin pikseleinä (480 × 270).

/** Kauppias kartalla ja kolikko, joka pomppii hänen päänsä päällä. */
export const MERCHANT_MAP_VIEW = {
  /**
   * Kauppias kulkee tien vieressä: tämä siirtymä lisätään tien ruudun keskipisteeseen, jotta
   * paikkakunnassa hän seisoo talon vieressä (Jussi Ketola on talon toisella puolella).
   */
  offsetX: -14,
  offsetY: -2,
  depth: 6,
  /** Kävellessä kauppias keinuu askelten tahdissa. */
  stepBobPx: 1,
  stepBobMs: 180,
  coinOffsetY: -13,
  coinScale: 1,
  coinBobPx: 3,
  coinBobMs: 450,
} as const;

/**
 * KAUPPA-nappi kartan alareunassa REPPU-napin vasemmalla puolella (BUGATTI-napin vasemmalla,
 * kun sekin näkyy). Näkyy vain, kun sankari on kauppiaan vieressä.
 */
export const SHOP_BUTTON = {
  width: 96,
} as const;

/** Kauppanäkymä: kauppias ja OSTA/MYY vasemmalla, tavarat oikealla, tiedot alhaalla. */
export const SHOP_VIEW = {
  /** Kolikot vasemmassa yläkulmassa: iso kolikon kuva (8 px → 16 px) ja määrä. */
  coinX: 18,
  coinY: 20,
  coinScale: 2,
  coinTextX: 32,
  /** Kauppias isona vasemmalla. */
  merchantX: 40,
  merchantY: 116,
  merchantScale: 4,
  /** OSTA- ja MYY-napit kauppiaan oikealla puolella päällekkäin. */
  tabX: 148,
  tabFirstY: 88,
  tabGap: 46,
  tabWidth: 116,
  /** Kauppiaan puhe repun sivunumeron korkeudella vasemmalla. */
  speechX: 12,
  speechY: 180,
  speechWrap: 210,
} as const;

/**
 * "???"-nappi kauppanäkymässä (ui/coming-soon-button.ts), jos kauppiaalla on comingSoon:
 * tavararuudukon alemmalla rivillä, jonka teksti "Tulee pian peliin!" on napin päällä.
 * x on ruudukon keskikohta (BACKPACK_VIEW: bagX − 20 … bagX − 20 + 4 × 48 + 40).
 */
export const COMING_SOON_VIEW = {
  x: 340,
  labelY: 115,
  buttonY: 140,
  width: 136,
  height: 38,
} as const;

/**
 * Venesataman venekauppa kartalla (systems/boat-dock.ts): Veikko seisoo talon vieressä, ja
 * laiturin vieressä meressä keinuu purjevene.
 */
export const BOAT_DOCK_VIEW = {
  offsetX: -14,
  offsetY: -2,
  depth: 6,
  boatBobPx: 1,
  boatBobMs: 900,
} as const;
