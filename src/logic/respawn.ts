import { getEnemy, MAP_ENEMIES } from '../data';
import { RESPAWN_RULES } from '../data/rules';
import type { EnemyDef } from '../data/types';
import { distance, type Vec2 } from './vector';

// Voitettujen karttavihollisten palaaminen. Voitettu vihollinen on poissa kartalta
// palautusajan (RESPAWN_RULES.delayMs tai EnemyDef.respawnMs) ja palaa sitten
// alkuperäiselle paikalleen, kunhan pelaaja ei ole liian lähellä.
// Kello annetaan ulkoa: tickRespawns() saa kuluneen ajan, joten tämä testataan ilman Phaseria.

/** Kartalta poissa oleva vihollinen ja aika, jonka jälkeen se palaa. */
export interface RespawnTimer {
  /** Järjestysnumero data/map-enemies.ts:n listassa. */
  readonly index: number;
  /** Jäljellä oleva aika millisekunteina. 0 = palaa heti, kun pelaaja on tarpeeksi kaukana. */
  msLeft: number;
}

export function respawnDelayMs(enemy: EnemyDef): number {
  return enemy.respawnMs ?? RESPAWN_RULES.delayMs;
}

/** Karttavihollisen palautusaika järjestysnumerosta. Tuntematon numero: yhteinen arvo. */
export function mapEnemyRespawnMs(index: number): number {
  const spawn = MAP_ENEMIES[index];
  return spawn ? respawnDelayMs(getEnemy(spawn.enemy)) : RESPAWN_RULES.delayMs;
}

export function isRespawning(timers: readonly RespawnTimer[], index: number): boolean {
  return timers.some((timer) => timer.index === index);
}

/** Aloittaa palautusajan (korvaa saman vihollisen vanhan ajan). */
export function startRespawn(timers: RespawnTimer[], index: number, delayMs: number): void {
  const old = timers.findIndex((timer) => timer.index === index);
  if (old >= 0) {
    timers.splice(old, 1);
  }
  timers.push({ index, msLeft: delayMs });
}

/** Onko pelaaja tarpeeksi kaukana vihollisen paikasta, jotta se voi palata. */
export function isFarEnough(spawn: Vec2, player: Vec2): boolean {
  return distance(spawn, player) >= RESPAWN_RULES.minPlayerDistancePx;
}

/**
 * Kuluttaa palautusaikoja elapsedMs verran. Palauttaa vihollisten numerot, jotka palaavat
 * nyt kartalle, ja poistaa ne listasta. Valmis vihollinen odottaa (aika 0), kunnes
 * canAppear(index) sallii sen, esim. kun pelaaja on kävellyt tarpeeksi kauas.
 */
export function tickRespawns(
  timers: RespawnTimer[],
  elapsedMs: number,
  canAppear: (index: number) => boolean,
): number[] {
  const back: number[] = [];
  for (const timer of timers) {
    timer.msLeft = Math.max(0, timer.msLeft - Math.max(0, elapsedMs));
    if (timer.msLeft === 0 && canAppear(timer.index)) {
      back.push(timer.index);
    }
  }
  const remaining = timers.filter((timer) => !back.includes(timer.index));
  timers.splice(0, timers.length, ...remaining);
  return back;
}
