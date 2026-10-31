import { PLAYER } from '../data/player';
import type { CombatStats, EnemyDef, ItemStack } from '../data/types';
import { recoverStolen, type Battle } from './battle';
import type { Fighter } from './combat';
import { levelForXp, statsForLevel } from './progression';
import type { Vec2 } from './vector';

// Pelin eteneminen, joka säilyy kartan ja taistelun välillä:
// elämä, kokemus, esineet, sijainti ja voitetut viholliset.

export interface GameState {
  hp: number;
  xp: number;
  /** Esineiden määrät tunnisteittain. */
  readonly inventory: Record<string, number>;
  /** Sijainti kartalla pikseleinä. null = aloituspaikkakunta. */
  position: Vec2 | null;
  /** Voitettujen karttavihollisten järjestysnumerot (data/map-enemies.ts). */
  readonly defeated: number[];
}

export function createNewGame(): GameState {
  const inventory: Record<string, number> = {};
  for (const stack of PLAYER.startItems) {
    inventory[stack.id] = (inventory[stack.id] ?? 0) + stack.count;
  }
  return { hp: PLAYER.stats.maxHp, xp: 0, inventory, position: null, defeated: [] };
}

export function playerLevel(state: GameState): number {
  return levelForXp(state.xp);
}

export function playerStats(state: GameState): CombatStats {
  return statsForLevel(playerLevel(state));
}

/** Taisteluhahmo pelaajan nykyisillä arvoilla. */
export function playerFighter(state: GameState): Fighter {
  const stats = playerStats(state);
  return { ...stats, hp: Math.min(state.hp, stats.maxHp) };
}

/** Palauttaa elämän täyteen (esim. paikkakunnassa levätessä). */
export function restoreHp(state: GameState): void {
  state.hp = playerStats(state).maxHp;
}

export interface VictoryReward {
  readonly xp: number;
  readonly leveledUp: boolean;
  readonly level: number;
  readonly drop?: string;
  /** Esineet, jotka vihollinen oli varastanut ja jotka saatiin takaisin. */
  readonly recovered?: readonly ItemStack[];
}

/**
 * Voitto vihollisesta: kokemus, mahdollinen esine ja tason nousu.
 * mapEnemyIndex on null, kun vihollinen ei ollut kartalla (esim. väijytys).
 */
export function grantVictory(
  state: GameState,
  mapEnemyIndex: number | null,
  enemy: EnemyDef,
): VictoryReward {
  const before = playerLevel(state);
  state.xp += enemy.xp;
  if (mapEnemyIndex !== null) {
    state.defeated.push(mapEnemyIndex);
  }
  if (enemy.drop) {
    state.inventory[enemy.drop] = (state.inventory[enemy.drop] ?? 0) + 1;
  }
  const level = playerLevel(state);
  const leveledUp = level > before;
  if (leveledUp) {
    restoreHp(state);
  }
  const reward = { xp: enemy.xp, leveledUp, level };
  return enemy.drop ? { ...reward, drop: enemy.drop } : reward;
}

/**
 * Tallentaa taistelun lopputuloksen peliin: elämä talteen ja voitosta palkinto.
 * Voitosta saa takaisin myös varastetut esineet. Palauttaa palkinnon, jos taistelu voitettiin.
 */
export function applyBattleResult(
  state: GameState,
  battle: Battle,
  mapEnemyIndex: number | null,
  enemy: EnemyDef,
): VictoryReward | null {
  state.hp = Math.max(0, battle.player.hp);
  if (battle.outcome !== 'won') {
    return null;
  }
  const reward = grantVictory(state, mapEnemyIndex, enemy);
  const recovered = recoverStolen(battle);
  return recovered.length > 0 ? { ...reward, recovered } : reward;
}
