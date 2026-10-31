// Pelin nimi yhdessä paikassa. Kun nimi vaihtuu, muuta vain tätä tiedostoa:
// - pelin sisäiset tekstit käyttävät nimeä i18n/fi.ts:n kautta (TEXT.gameTitle)
// - vite.config.ts kirjoittaa nimen sivun otsikkoon (index.html) ja PWA-manifestiin
// Repon nimi ja julkaisuosoite (/EquinoxUni/) eivät riipu tästä.
// Tiedosto ei tuo mitään, jotta vite.config.ts voi lukea sen suoraan.

export const GAME_INFO = {
  /** Koko nimi: alkuruutu, selaimen välilehti, aloitusnäytön asennus. */
  name: 'Equinox Universe',
  /** Lyhyt nimi puhelimen aloitusnäytön kuvakkeen alle (enintään noin 12 merkkiä). */
  shortName: 'Equinox',
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
