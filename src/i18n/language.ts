// Pelin kielet. Kieli valitaan alkuruudun asetuksista (SUOMI / ENGLISH), ja valinta
// tallentuu asetuksiin (logic/settings.ts). Uusi kieli: lisää tunniste tähän, uusi
// tekstitiedosto (vrt. i18n/en.ts) ja rivi i18n/text.ts:n DICTIONARIES-listaan.

/** Kielen tunniste: suomi tai englanti. */
export type Language = 'fi' | 'en';

/** Kielet siinä järjestyksessä kuin ne näkyvät asetuksissa. */
export const LANGUAGES: readonly Language[] = ['fi', 'en'];

/** Pelin oletuskieli. */
export const DEFAULT_LANGUAGE: Language = 'fi';

/** Lukee kielen tallennetusta arvosta. Tuntematon arvo → oletuskieli. */
export function parseLanguage(value: unknown): Language {
  return LANGUAGES.find((language) => language === value) ?? DEFAULT_LANGUAGE;
}
