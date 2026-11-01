import { EN } from './en';
import { FI, type Texts } from './fi';
import { DEFAULT_LANGUAGE, type Language } from './language';

// Pelin tekstit valitulla kielellä. Käyttö kaikkialla: TEXT.menu.play.
// TEXT lukee tekstin aina sillä hetkellä valitusta kielestä, joten kun kieli vaihtuu,
// seuraavaksi piirrettävä näkymä on jo uudella kielellä. Älä siksi tallenna tekstejä
// tiedoston ylätasolle (const LABEL = TEXT.x), vaan hae ne vasta, kun niitä tarvitaan.

const DICTIONARIES: Readonly<Record<Language, Texts>> = { fi: FI, en: EN };

let current: Language = DEFAULT_LANGUAGE;

/** Vaihtaa pelin kielen. Kutsutaan asetuksista (systems/game-settings.ts). */
export function setLanguage(language: Language): void {
  current = language;
}

/** Tällä hetkellä valittu kieli. */
export function currentLanguage(): Language {
  return current;
}

/** Valitun kielen kaikki tekstit. */
export function textsFor(language: Language): Texts {
  return DICTIONARIES[language];
}

export const TEXT: Texts = new Proxy(FI, {
  get: (_target, key) => Reflect.get(DICTIONARIES[current], key),
});
