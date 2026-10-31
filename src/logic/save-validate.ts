import { ITEMS, MAP_ENEMIES } from '../data';
import { SKILLS } from '../data/skills';
import { playerStats, type GameState } from './game-state';
import { noSkillPoints, type SkillPoints } from './skill-points';
import type { Vec2 } from './vector';

// Tarkistaa tallennuksesta luetun pelin tilan. Selaimen tietoja voi muokata
// käsin tai ne voivat olla vanhasta pelin versiosta, joten mitään ei oleteta.
// Tuntemattomat esineet ja viholliset jätetään pois, puuttuvat kyvyt ovat 0.

type RawRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is RawRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function readSkills(value: unknown): SkillPoints | null {
  if (!isRecord(value)) {
    return null;
  }
  const skills = noSkillPoints();
  for (const skill of SKILLS) {
    const points = value[skill.id] ?? 0;
    if (!isCount(points)) {
      return null;
    }
    skills[skill.id] = points;
  }
  return skills;
}

function readInventory(value: unknown): Record<string, number> | null {
  if (!isRecord(value)) {
    return null;
  }
  const inventory: Record<string, number> = {};
  for (const item of ITEMS) {
    const count = value[item.id];
    if (isCount(count) && count > 0) {
      inventory[item.id] = count;
    }
  }
  return inventory;
}

/** Palauttaa undefined, jos sijainti on virheellinen (null on sallittu: aloituspaikkakunta). */
function readPosition(value: unknown): Vec2 | null | undefined {
  if (value === null) {
    return null;
  }
  if (!isRecord(value)) {
    return undefined;
  }
  const { x, y } = value;
  if (typeof x !== 'number' || typeof y !== 'number') {
    return undefined;
  }
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : undefined;
}

function readDefeated(value: unknown): number[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const valid = value
    .filter((index): index is number => isCount(index))
    .filter((index) => index < MAP_ENEMIES.length);
  return [...new Set(valid)];
}

/** Lukee pelin tilan. Palauttaa null, jos tila on rikki. */
export function readGameState(value: unknown): GameState | null {
  if (!isRecord(value) || !isCount(value['hp']) || !isCount(value['xp'])) {
    return null;
  }
  const skills = readSkills(value['skills']);
  const inventory = readInventory(value['inventory']);
  const position = readPosition(value['position']);
  const defeated = readDefeated(value['defeated']);
  if (!skills || !inventory || position === undefined || !defeated) {
    return null;
  }
  const state: GameState = {
    hp: value['hp'],
    xp: value['xp'],
    skills,
    inventory,
    position,
    defeated,
  };
  // Elämä pysyy rajoissa: vähintään 1, enintään maksimielämä.
  state.hp = Math.min(Math.max(1, state.hp), playerStats(state).maxHp);
  return state;
}
