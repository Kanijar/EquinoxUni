import { BLOCKED_CONTACT_WORDS, EXACT_CONTACT_WORDS } from '../data/blocked-contacts';
import { BLOCKED_NAME_WORDS } from '../data/blocked-names';
import { comparableText } from './leaderboard-name';

// Ideaviestien ja kommenttien teksti (scenes/ideas-scene.ts, palvelin worker/presence).
// Teksti siistitään samalla tavalla pelissä ja palvelimella: rivinvaihdot ja ylimääräiset
// välit pois ja vain kirjaimet, numerot ja tavalliset välimerkit jäävät. Sen jälkeen tarkistetaan
// kirosanat (data/blocked-names.ts) ja yhteystiedot (puhelinnumero, sähköposti, linkki,
// sovellusten käyttäjänimet, data/blocked-contacts.ts). Pelaajat ovat 12–15-vuotiaita.

/** Miksi tekstiä ei voi lähettää. */
export type IdeaTextProblem = 'empty' | 'tooLong' | 'blocked' | 'contact';

const NOT_ALLOWED = /[^\p{L}\p{N} .,!?:;'"()+\-&%*#=/]/gu;
const SPACES = /\s+/g;
/** Suomalainen tai ulkomainen puhelinnumero: 0 tai + ja vähintään 6 numeroa (välit sallittu). */
const PHONE = /(?:^|[^\p{N}])(?:\+|0)(?:[\s-]?\p{N}){6,}/u;
const EMAIL_OR_LINK = /@|https?:|www\.|\.(?:com|fi|net|org|io|gg|me|tv|ly)\b/i;

/** Siistii kirjoitetun tekstin. Ei lyhennä: liian pitkä teksti huomataan tarkistuksessa. */
export function cleanIdeaText(raw: string): string {
  return raw.replace(SPACES, ' ').replace(NOT_ALLOWED, '').replace(SPACES, ' ').trim();
}

/**
 * Sanat vertailua varten. Peräkkäiset yksittäiset kirjaimet yhdistetään, jotta
 * "v i t t u" huomataan, mutta tavalliset sanat tarkistetaan erikseen ("super seikkailu").
 */
function comparableWords(text: string): string[] {
  const words: string[] = [];
  let letters = '';
  for (const token of text.split(' ').map(comparableText)) {
    if (token.length === 1) {
      letters += token;
      continue;
    }
    if (letters !== '') words.push(letters);
    letters = '';
    if (token !== '') words.push(token);
  }
  if (letters !== '') words.push(letters);
  return words;
}

/** Onko tekstissä kirosana. */
export function hasBlockedText(text: string): boolean {
  return comparableWords(text).some((word) =>
    BLOCKED_NAME_WORDS.some((blocked) => word.includes(blocked)),
  );
}

/** Näyttääkö tekstissä olevan yhteystieto. */
export function hasContactInfo(text: string): boolean {
  if (PHONE.test(text) || EMAIL_OR_LINK.test(text)) {
    return true;
  }
  const words = text.toLowerCase().split(/[^\p{L}]+/u);
  return words.some((word) =>
    BLOCKED_CONTACT_WORDS.some((blocked) =>
      EXACT_CONTACT_WORDS.includes(blocked) ? word === blocked : word.startsWith(blocked),
    ),
  );
}

/** Tarkistaa siistityn tekstin. null = tekstin voi lähettää. */
export function ideaTextProblem(text: string, maxLength: number): IdeaTextProblem | null {
  if (text === '') return 'empty';
  if ([...text].length > maxLength) return 'tooLong';
  if (hasBlockedText(text)) return 'blocked';
  if (hasContactInfo(text)) return 'contact';
  return null;
}
