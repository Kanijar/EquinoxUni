import { SAVE_VERSION } from '../config/persistence';
import type { GameState } from './game-state';
import { parseJson } from './key-value-store';
import { isRecord, readGameState } from './save-validate';

// Tallennuksen muoto. Tallennus on JSON-teksti, jossa on versio, tallennushetki,
// paikkakunnan nimi ja pelin tila. Vanhat versiot muunnetaan uuteen SAVE_MIGRATIONS-listalla.

export interface SaveFile {
  readonly version: number;
  /** Tallennushetki millisekunteina (Date.now()). */
  readonly savedAt: number;
  /** Paikkakunta, jossa peli tallennettiin (näytetään tallennuslistassa). */
  readonly place: string;
  readonly state: GameState;
}

export interface SaveMeta {
  readonly savedAt: number;
  readonly place: string;
}

type RawSave = Record<string, unknown>;

/**
 * Muunnokset vanhasta versiosta seuraavaan: SAVE_MIGRATIONS[n] muuttaa version n
 * tallennuksen versioksi n + 1. Kun nostat SAVE_VERSIONia, lisää tänne muunnos.
 */
export const SAVE_MIGRATIONS: Readonly<Record<number, (save: RawSave) => RawSave>> = {};

export function encodeSave(state: GameState, meta: SaveMeta): string {
  const file: SaveFile = { version: SAVE_VERSION, savedAt: meta.savedAt, place: meta.place, state };
  return JSON.stringify(file);
}

/** Muuntaa vanhan version tallennuksen nykyiseksi. null, jos versio on tuntematon. */
export function migrateSave(save: RawSave): RawSave | null {
  let current = save;
  let version = current['version'];
  while (typeof version === 'number' && version < SAVE_VERSION) {
    const migrate = SAVE_MIGRATIONS[version];
    if (!migrate) {
      return null;
    }
    current = { ...migrate(current), version: version + 1 };
    version = current['version'];
  }
  return version === SAVE_VERSION ? current : null;
}

/** Lukee tallennuksen. Palauttaa null, jos tallennus on rikki tai uudemmasta pelin versiosta. */
export function decodeSave(text: string): SaveFile | null {
  const raw = parseJson(text);
  const save = isRecord(raw) ? migrateSave(raw) : null;
  if (!save) {
    return null;
  }
  const state = readGameState(save['state']);
  const { savedAt, place } = save;
  if (!state || typeof savedAt !== 'number' || typeof place !== 'string') {
    return null;
  }
  return { version: SAVE_VERSION, savedAt, place, state };
}
