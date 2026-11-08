import { LEADERBOARD } from '../config/leaderboard';
import type { Rng } from './battle';
import { leaderboardName } from './leaderboard-name';
import { serverUrl } from './server-url';

// Koko pelin 10 parhaan lista (sankarin talo, data/house.ts). Paremmuus ratkeaa
// kokemuspisteistä (KP), joista myös taso lasketaan. Pelaaja lähettää palvelimelle vain
// satunnaisen sankaritunnisteen, nimimerkin ja KP:t, kun hän menee taloonsa.
// Tunniste erottaa saman nimiset sankarit toisistaan, eikä sitä näytetä kenellekään.
// Palvelin: worker/presence (sama kuin pelaajalaskurilla), yhteys: net/leaderboard.ts.

/** Yksi rivi listalla. */
export interface LeaderboardEntry {
  /** Nimimerkki. Tyhjä = oletusnimi valitulla kielellä. */
  readonly name: string;
  readonly xp: number;
}

/** Pelaajan lähettämä tulos. */
export interface ScoreSubmission {
  readonly id: string;
  readonly name: string;
  readonly xp: number;
}

/** Palvelimen vastaus: parhaat ja oman sankarin sija (null = ei listalla). */
export interface LeaderboardReply {
  readonly top: readonly LeaderboardEntry[];
  readonly rank: number | null;
}

/** Tallentuva tieto: sankarin satunnainen tunniste (logic/game-state.ts). */
export interface LeaderboardProgress {
  heroId: string;
}

const ID_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';
const ID_PATTERN = new RegExp(`^[a-z0-9]{${LEADERBOARD.heroIdLength}}$`);

type RawRecord = Readonly<Record<string, unknown>>;

function isRecord(value: unknown): value is RawRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Uusi satunnainen sankaritunniste (uusi peli tai vanha tallennus ilman tunnistetta). */
export function newHeroId(random: Rng = Math.random): string {
  let id = '';
  for (let index = 0; index < LEADERBOARD.heroIdLength; index += 1) {
    id += ID_CHARS[Math.floor(random() * ID_CHARS.length)] ?? 'a';
  }
  return id;
}

export function isHeroId(value: unknown): value is string {
  return typeof value === 'string' && ID_PATTERN.test(value);
}

function isXp(value: unknown): value is number {
  return (
    typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= LEADERBOARD.maxXp
  );
}

/** Lukee pelaajan lähettämän tuloksen. null = viesti ei kelpaa. */
export function readSubmission(value: unknown): ScoreSubmission | null {
  if (!isRecord(value) || !isHeroId(value['id']) || !isXp(value['xp'])) {
    return null;
  }
  const name = typeof value['name'] === 'string' ? leaderboardName(value['name']) : '';
  return { id: value['id'], name, xp: value['xp'] };
}

function readEntry(value: unknown): LeaderboardEntry | null {
  if (!isRecord(value) || !isXp(value['xp'])) {
    return null;
  }
  const name = typeof value['name'] === 'string' ? leaderboardName(value['name']) : '';
  return { name, xp: value['xp'] };
}

function readRank(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 ? value : null;
}

/** Lukee palvelimen vastauksen. null = vastaus on rikki. */
export function readReply(value: unknown): LeaderboardReply | null {
  if (!isRecord(value) || !Array.isArray(value['top'])) {
    return null;
  }
  const top: LeaderboardEntry[] = [];
  for (const raw of value['top'].slice(0, LEADERBOARD.topCount)) {
    const entry = readEntry(raw);
    if (!entry) {
      return null;
    }
    top.push(entry);
  }
  return { top, rank: readRank(value['rank']) };
}

/**
 * Listan osoite pelaajalaskurin osoitteesta: wss://x.workers.dev → https://x.workers.dev/leaderboard.
 * null = laskuria ei ole määritetty, joten listaakaan ei ole.
 */
export function leaderboardUrl(presenceUrl: string | undefined): string | null {
  return serverUrl(presenceUrl, LEADERBOARD.path);
}

/** Sankarin tulos lähetettäväksi: tunniste, nimimerkki (siistitty) ja KP. */
export function submissionFor(hero: {
  readonly heroId: string;
  readonly name: string;
  readonly xp: number;
}): ScoreSubmission {
  const xp = Math.min(Math.max(0, Math.floor(hero.xp)), LEADERBOARD.maxXp);
  return { id: hero.heroId, name: leaderboardName(hero.name), xp };
}
