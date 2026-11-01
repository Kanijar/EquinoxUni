// Pelin nimi, kehitysvaihe ja versionumeron alku yhdessä paikassa. Kun ne vaihtuvat, muuta vain tätä tiedostoa:
// - pelin sisäiset tekstit käyttävät nimeä i18n/fi.ts:n kautta (TEXT.gameTitle)
// - vite.config.ts kirjoittaa nimen sivun otsikkoon (index.html) ja PWA-manifestiin
// Repon nimi ja julkaisuosoite (/EquinoxUni/) eivät riipu tästä.
// Tiedosto ei tuo mitään, jotta vite.config.ts voi lukea sen suoraan.

export const GAME_INFO = {
  /** Koko nimi: alkuruutu, selaimen välilehti, aloitusnäytön asennus. */
  name: 'Equinox Universe',
  /** Lyhyt nimi puhelimen aloitusnäytön kuvakkeen alle (enintään noin 12 merkkiä). */
  shortName: 'Equinox',
  /**
   * Pelin kehitysvaihe, joka näkyy versionumeron perässä ("Versio: 0.25 (alfa)").
   * Kun peli etenee, vaihda tähän esim. 'beta'.
   */
  version: 'alfa',
  /**
   * Versionumeron alkuosa. Loppuosa on uusimman PR:n numero, jonka buildi lukee gitistä:
   * PR #25 → versio 0.25 (logic/release-number.ts). Kun peli on valmis, vaihda tähän 1.
   */
  versionMajor: 0,
  /** Julkaisuaika näytetään Suomen aikaa, kesäaika mukaan lukien. */
  timeZone: 'Europe/Helsinki',
} as const;

/** PWA-manifestin sisältö. vite.config.ts tarjoilee sen osoitteessa manifest.webmanifest. */
export function webManifest(backgroundColor: string): Record<string, string> {
  return {
    name: GAME_INFO.name,
    short_name: GAME_INFO.shortName,
    lang: 'fi',
    start_url: './',
    display: 'fullscreen',
    orientation: 'landscape',
    background_color: backgroundColor,
    theme_color: backgroundColor,
  };
}
