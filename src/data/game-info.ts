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
  /** Lyhyt kuvaus, jonka puhelin voi näyttää asennuksen yhteydessä. */
  description: 'Pikseliseikkailu isolla saarella: tutki kyliä ja taistele hirviöitä vastaan.',
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

/** Kuvakkeen rivi manifestissa (data/app-icon.ts manifestIcon). */
export interface WebManifestIcon {
  readonly src: string;
  readonly sizes: string;
  readonly type: string;
  readonly purpose: string;
}

/** PWA-manifesti: Chrome tarvitsee nimen, kuvakkeet, aloitusosoitteen ja näyttötavan asennukseen. */
export interface WebManifest {
  readonly id: string;
  readonly name: string;
  readonly short_name: string;
  readonly description: string;
  readonly lang: string;
  readonly start_url: string;
  readonly scope: string;
  readonly display: string;
  readonly orientation: string;
  readonly background_color: string;
  readonly theme_color: string;
  readonly icons: readonly WebManifestIcon[];
}

/**
 * PWA-manifestin sisältö. vite.config.ts tarjoilee sen osoitteessa manifest.webmanifest.
 * Polut ovat suhteessa manifestiin, joten ne toimivat julkaisuosoitteessa /EquinoxUni/.
 * id pysyy samana, jotta asennettu peli tunnistetaan samaksi, vaikka start_url muuttuisi.
 */
export function webManifest(
  backgroundColor: string,
  icons: readonly WebManifestIcon[],
): WebManifest {
  return {
    id: './',
    name: GAME_INFO.name,
    short_name: GAME_INFO.shortName,
    description: GAME_INFO.description,
    lang: 'fi',
    start_url: './',
    scope: './',
    display: 'fullscreen',
    orientation: 'landscape',
    background_color: backgroundColor,
    theme_color: backgroundColor,
    icons,
  };
}
