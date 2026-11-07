// Kalastuksen mitat ja ajat kartalla (systems/fishing-control.ts, ui/fish-button.ts).
// Kaikki luvut pelin pikseleinä (480 × 270). Säännöt: data/fishing.ts.

export const FISHING_VIEW = {
  /**
   * KALASTA-nappi kartan alarivissä muiden alarivin nappien (REPPU, BUGATTI, KAUPPA)
   * vasemmalla puolella. Näkyy, kun sankarilla on onki ja hän on veden vieressä.
   */
  buttonWidth: 110,
  /** Koho ja siima piirretään maaston päälle mutta sankarin alle. */
  depth: 9,
  /** Siima lähtee sankarin kädestä (siirtymä sankarin keskipisteestä). */
  handOffset: { x: 5, y: -2 },
  lineColor: 0xf2f2f2,
  lineAlpha: 0.8,
  /** Koho keinuu odottaessa ylös ja alas. */
  bobPx: 1,
  bobMs: 600,
  /** Kun kala nappaa, koho sukeltaa nopeasti ja sen päälle tulee huutomerkki. */
  dipPx: 3,
  dipMs: 90,
  markOffsetY: -10,
  markColor: '#ffe066',
} as const;
