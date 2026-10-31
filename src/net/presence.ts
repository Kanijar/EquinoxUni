// Pelaajalaskurin rajapinta. Peli ei tiedä, mikä palvelu laskee pelaajat:
// toteutuksen voi vaihtaa (esim. Firebase tai Supabase) muuttamalla vain create-presence.ts:ää.
// Laskuri on anonyymi: palvelulle ei lähetetä nimeä, tunnistetta, evästettä tai tallennusta.

/** Montako pelaajaa on juuri nyt pelissä, tai null, jos sitä ei tiedetä (laskuri piiloon). */
export type PlayerCount = number | null;

export interface PresenceService {
  /** Ilmoittaa tämän pelaajan paikalle ja kertoo määrän aina, kun se muuttuu. */
  connect(onChange: (count: PlayerCount) => void): void;
  /** Lähtee pois laskurista (esim. kun selain siirtyy taustalle). */
  disconnect(): void;
}

/** Käytetään, kun palvelua ei ole määritetty: laskuri pysyy piilossa, peli toimii normaalisti. */
export class NoPresence implements PresenceService {
  connect(): void {}

  disconnect(): void {}
}
