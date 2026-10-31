// Pelaajalaskurin vakiot (ks. docs/PELAAJALASKURI.md).
// Palvelin (worker/presence) ja peli käyttävät samoja viestejä, joten ne ovat tässä yhdessä paikassa.

export const PRESENCE = {
  /** Peli lähettää tämän säännöllisesti, jotta puhelinverkko ei katkaise hiljaista yhteyttä. */
  ping: 'p',
  /** Palvelin vastaa pingiin tällä (vastaus ei herätä palvelinta, joten se on ilmainen). */
  pong: 'o',
  pingIntervalMs: 45_000,
  /** Katkenneen yhteyden uusi yritys: odotus tuplaantuu joka kerta, mutta enintään maxRetryMs. */
  firstRetryMs: 2_000,
  maxRetryMs: 60_000,
  /** Palvelin ottaa vastaan enintään näin monta yhtäaikaista pelaajaa (suojaa ilmaiskiintiötä). */
  maxPlayers: 1_000,
} as const;
