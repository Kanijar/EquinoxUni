// 10 parhaan listan vakiot (ks. docs/PELAAJALASKURI.md, luku "10 parhaan lista").
// Palvelin (worker/presence) ja peli käyttävät samoja arvoja, joten ne ovat tässä yhdessä paikassa.

export const LEADERBOARD = {
  /** Listan osoite pelaajalaskurin palvelimella (https://...workers.dev/leaderboard). */
  path: '/leaderboard',
  /** Montako parasta näytetään. */
  topCount: 10,
  /** Palvelin muistaa enintään näin monta sankaria; huonoimmat poistetaan (ilmaiskiintiö). */
  maxEntries: 5_000,
  /** Sankarin satunnaisen tunnisteen pituus (kirjaimia a–z ja numeroita). */
  heroIdLength: 20,
  /** Suurin hyväksytty KP-määrä. Estää järjettömät luvut, oikea peli ei pääse lähellekään. */
  maxXp: 100_000_000,
  /** Palvelin ei lue tätä pidempiä viestejä. */
  maxBodyBytes: 512,
  /** Jos palvelin ei vastaa tässä ajassa, talo kertoo, ettei listaa saatu. */
  timeoutMs: 8_000,
} as const;
