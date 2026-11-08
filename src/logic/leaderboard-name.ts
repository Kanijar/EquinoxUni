import { BLOCKED_NAME_WORDS } from '../data/blocked-names';
import { cleanHeroName } from './hero-name';

// Nimimerkki 10 parhaan listalla. Nimi siistitään samoin kuin hahmonluonnissa
// (logic/hero-name.ts), ja jos siinä on estetty sana (data/blocked-names.ts), listalla näkyy
// oletusnimi. Sama tarkistus tehdään sekä palvelimella että pelissä.

/** Numerot, joilla kirjaimia yritetään korvata (v1ttu, p4ska). */
const LOOKALIKES: Readonly<Record<string, string>> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
};
const NOT_LETTERS = /[^\p{L}]/gu;

/** Nimi vertailua varten: pienet kirjaimet, numerot kirjaimiksi, ei välejä eikä viivoja. */
function comparable(name: string): string {
  const lower = name.toLowerCase();
  const letters = [...lower].map((char) => LOOKALIKES[char] ?? char).join('');
  return letters.replace(NOT_LETTERS, '');
}

/** Onko nimessä estetty sana. */
export function hasBlockedWord(
  name: string,
  words: readonly string[] = BLOCKED_NAME_WORDS,
): boolean {
  const plain = comparable(name);
  return words.some((word) => plain.includes(word));
}

/** Listalle kelpaava nimi. Tyhjä = oletusnimi (Sankari / Hero). */
export function leaderboardName(raw: string): string {
  const name = cleanHeroName(raw);
  return hasBlockedWord(name) ? '' : name;
}
