// Repun sivut: kun esineitä on enemmän kuin yhdelle sivulle mahtuu, ne jaetaan sivuille.
// Sivut numeroidaan nollasta (0 = ensimmäinen sivu). Sivua käännetään nuolinapeilla, ja
// viimeiseltä sivulta eteenpäin pääsee takaisin ensimmäiselle (ja toisin päin).
// Puhdasta TypeScriptiä, jotta sääntöjä voi testata (tests/bag-pages.test.ts).

/** Montako sivua tarvitaan. Tyhjässäkin repussa on yksi sivu. */
export function pageCount(itemCount: number, pageSize: number): number {
  return Math.max(1, Math.ceil(itemCount / pageSize));
}

/** Pitää sivun rajoissa, esim. kun viimeisen sivun ainoa esine laitettiin käyttöön. */
export function clampPage(page: number, itemCount: number, pageSize: number): number {
  const last = pageCount(itemCount, pageSize) - 1;
  return Math.min(Math.max(0, page), last);
}

/** Kääntää sivua eteen (+1) tai taakse (-1). Reunoilla hypätään toiseen päähän. */
export function turnPage(page: number, step: number, itemCount: number, pageSize: number): number {
  const count = pageCount(itemCount, pageSize);
  return (((clampPage(page, itemCount, pageSize) + step) % count) + count) % count;
}

/** Sivu, jolla esine on, kun tiedetään sen järjestysnumero koko repussa. */
export function pageOfIndex(index: number, pageSize: number): number {
  return Math.max(0, Math.floor(index / pageSize));
}

/** Sivulla näkyvät esineet järjestyksessä. */
export function pageItems<T>(items: readonly T[], page: number, pageSize: number): T[] {
  const start = clampPage(page, items.length, pageSize) * pageSize;
  return items.slice(start, start + pageSize);
}
