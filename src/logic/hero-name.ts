import { PLAYER } from '../data/player';

// Pelaajan oma nimi sankarille (hahmonluonti uuden pelin alussa).
// Nimessä saa olla kirjaimia (myös å, ä, ö), numeroita, välilyöntejä ja yhdysmerkkejä.
// Nimi näkyy vain pelaajan omassa pelissä: sitä ei lähetetä minnekään.

const NOT_ALLOWED = /[^\p{L}\p{N} -]/gu;
const SPACES = /\s+/g;
const DOUBLE_SPACES = / {2,}/g;

/**
 * Siistii kirjoitetun nimen: vain sallitut merkit, ei ylimääräisiä välilyöntejä,
 * enintään PLAYER.nameMaxLength merkkiä. Tyhjä tulos = oletusnimi.
 */
export function cleanHeroName(raw: string, maxLength: number = PLAYER.nameMaxLength): string {
  const allowed = raw.replace(SPACES, ' ').replace(NOT_ALLOWED, '').replace(DOUBLE_SPACES, ' ');
  const letters = [...allowed.trimStart()];
  return letters.slice(0, maxLength).join('').trim();
}

/** Näytettävä nimi: oma nimi tai oletusnimi (esim. "Sankari" tai "Hero"). */
export function heroName(name: string, fallback: string): string {
  return name.length > 0 ? name : fallback;
}
