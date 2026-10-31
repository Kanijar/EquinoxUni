import { ITEMS, MAP_ENEMIES, TOWNS, WORLD } from '../data';
import { GEAR_SLOTS } from '../data/items';
import { SKILLS } from '../data/skills';
import { findGear, type Equipped } from './equipment';
import { playerStats, type GameState } from './game-state';
import { mapEnemyRespawnMs, type RespawnTimer } from './respawn';
import { noSkillPoints, type SkillPoints } from './skill-points';
import type { Vec2 } from './vector';

// Tarkistaa tallennuksesta luetun pelin tilan. Selaimen tietoja voi muokata
// käsin tai ne voivat olla vanhasta pelin versiosta, joten mitään ei oleteta.
// Tuntemattomat esineet ja viholliset jätetään pois, puuttuvat kyvyt ovat 0
// ja puuttuvat varusteet tyhjiä.

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

/**
 * Käytössä olevat varusteet. Puuttuva (vanha tallennus) = ei varusteita. Tuntematon esine
 * tai varuste väärässä paikassa jätetään pois.
 */
function readEquipped(value: unknown): Equipped {
  const equipped: Equipped = {};
  if (!isRecord(value)) {
    return equipped;
  }
  for (const slot of GEAR_SLOTS) {
    const id = value[slot];
    if (typeof id === 'string' && findGear(id)?.slot === slot) {
      equipped[slot] = id;
    }
  }
  return equipped;
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

/** Tuntematon tai puuttuva paikkakunta = aloituspaikkakunta. */
function readLastTown(value: unknown): string {
  return TOWNS.some((town) => town.id === value) ? (value as string) : WORLD.startTown;
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

function readRespawnTimer(value: unknown, defeated: readonly number[]): RespawnTimer | null {
  if (!isRecord(value)) {
    return null;
  }
  const { index, msLeft } = value;
  if (typeof index !== 'number' || !defeated.includes(index)) {
    return null;
  }
  if (typeof msLeft !== 'number' || !Number.isFinite(msLeft)) {
    return null;
  }
  // Aika pysyy rajoissa: 0 .. vihollisen palautusaika.
  return { index, msLeft: Math.min(Math.max(0, msLeft), mapEnemyRespawnMs(index)) };
}

/**
 * Palautusajat. Puuttuva lista = tyhjä. Virheelliset rivit ja viholliset, joita ei ole
 * voitettu, jätetään pois; sama vihollinen vain kerran.
 */
function readRespawning(value: unknown, defeated: readonly number[]): RespawnTimer[] | null {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    return null;
  }
  const timers: RespawnTimer[] = [];
  for (const entry of value) {
    const timer = readRespawnTimer(entry, defeated);
    if (timer && !timers.some((other) => other.index === timer.index)) {
      timers.push(timer);
    }
  }
  return timers;
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
  const respawning = defeated && readRespawning(value['respawning'], defeated);
  if (!skills || !inventory || position === undefined || !defeated || !respawning) {
    return null;
  }
  const state: GameState = {
    hp: value['hp'],
    xp: value['xp'],
    skills,
    inventory,
    equipped: readEquipped(value['equipped']),
    position,
    lastTown: readLastTown(value['lastTown']),
    defeated,
    respawning,
  };
  // Elämä pysyy rajoissa: vähintään 1, enintään maksimielämä.
  state.hp = Math.min(Math.max(1, state.hp), playerStats(state).maxHp);
  return state;
}
