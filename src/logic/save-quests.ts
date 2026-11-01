import { QUESTS } from '../data';
import type { QuestEntry, QuestLog } from './quest-log';

// Tallennuksen tehtäväkirjan tarkistus (GameState.quests). Vanhoissa tallennuksissa ei
// ole tehtäviä, joten puuttuva tehtäväkirja on tyhjä: tallennusversiota ei tarvinnut nostaa.
// Tuntemattomat tehtävät ja rikkinäiset rivit jätetään pois.

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function readEntry(value: unknown): QuestEntry | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  const { active, progress, completions } = value as Record<string, unknown>;
  if (typeof active !== 'boolean' || !isCount(progress) || !isCount(completions)) {
    return null;
  }
  return { active, progress, completions };
}

/** Lukee tehtäväkirjan. Puuttuva tai rikkinäinen = tyhjä (ei tehtäviä). */
export function readQuests(value: unknown): QuestLog {
  const log: QuestLog = {};
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return log;
  }
  const raw = value as Record<string, unknown>;
  for (const quest of QUESTS) {
    const entry = readEntry(raw[quest.id]);
    if (entry) {
      log[quest.id] = entry;
    }
  }
  return log;
}
