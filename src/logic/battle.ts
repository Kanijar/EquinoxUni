import { getItem } from '../data';
import { BATTLE_RULES } from '../data/rules';
import type { BattleRules, ItemStack } from '../data/types';
import { applyDamage, calculateDamage, heal, isDefeated, type Fighter } from './combat';

// Vuoropohjainen taistelu. Pelaaja valitsee toiminnon, sitten vihollinen vastaa.
// Puhdasta logiikkaa: palauttaa tapahtumat, jotka taistelunäkymä näyttää järjestyksessä.

/** Satunnaislukufunktio 0..1. Peli käyttää Math.random, testit omaa. */
export type Rng = () => number;

export type BattleAction =
  | { readonly kind: 'attack' }
  | { readonly kind: 'defend' }
  | { readonly kind: 'item'; readonly itemId: string }
  | { readonly kind: 'flee' };

export type Side = 'player' | 'enemy';

export type BattleEvent =
  | {
      readonly kind: 'hit';
      readonly attacker: Side;
      readonly damage: number;
      readonly crit: boolean;
      readonly defended: boolean;
    }
  | { readonly kind: 'defend' }
  | { readonly kind: 'heal'; readonly itemId: string; readonly amount: number }
  | { readonly kind: 'steal'; readonly itemId: string }
  | { readonly kind: 'flee'; readonly success: boolean };

export type BattleOutcome = 'ongoing' | 'won' | 'lost' | 'fled';

export interface Battle {
  readonly player: Fighter;
  readonly enemy: Fighter;
  /** Esineiden määrät tunnisteittain. Taistelu vähentää käytetyt esineet tästä. */
  readonly inventory: Record<string, number>;
  /** Todennäköisyys, jolla vihollinen varastaa esineen lyönnin sijaan (0 = ei koskaan). */
  readonly enemyStealChance: number;
  /** Vihollisen varastamat esineet. Pelaaja saa ne takaisin voittaessaan. */
  readonly stolen: Record<string, number>;
  outcome: BattleOutcome;
}

export function createBattle(
  player: Fighter,
  enemy: Fighter,
  inventory: Record<string, number>,
  enemyStealChance = 0,
): Battle {
  return { player, enemy, inventory, enemyStealChance, stolen: {}, outcome: 'ongoing' };
}

/** Voiko toiminnon valita juuri nyt (esim. esinettä pitää olla jäljellä). */
export function canChoose(battle: Battle, action: BattleAction): boolean {
  if (battle.outcome !== 'ongoing') {
    return false;
  }
  return action.kind !== 'item' || (battle.inventory[action.itemId] ?? 0) > 0;
}

/** Pelaa yhden vuoron: pelaajan toiminto ja vihollisen vastaus. */
export function takeTurn(
  battle: Battle,
  action: BattleAction,
  rng: Rng,
  rules: BattleRules = BATTLE_RULES,
): BattleEvent[] {
  if (!canChoose(battle, action)) {
    return [];
  }
  const events = [playerAct(battle, action, rng, rules)];
  if (battle.outcome === 'ongoing') {
    events.push(enemyAct(battle, action.kind === 'defend', rng, rules));
  }
  return events;
}

/** Vahinko satunnaisvaihtelun ja kriittisen osuman kanssa. Aina vähintään 1. */
export function rollDamage(
  attacker: Fighter,
  target: Fighter,
  rng: Rng,
  rules: BattleRules = BATTLE_RULES,
): { readonly damage: number; readonly crit: boolean } {
  const base = calculateDamage(attacker.attack, target.defense);
  const variance = 1 + (rng() * 2 - 1) * rules.damageVariance;
  const crit = rng() < rules.critChance;
  const damage = Math.max(1, Math.round(base * variance * (crit ? rules.critMultiplier : 1)));
  return { damage, crit };
}

function playerAct(
  battle: Battle,
  action: BattleAction,
  rng: Rng,
  rules: BattleRules,
): BattleEvent {
  switch (action.kind) {
    case 'attack': {
      const { damage, crit } = rollDamage(battle.player, battle.enemy, rng, rules);
      applyDamage(battle.enemy, damage);
      if (isDefeated(battle.enemy)) {
        battle.outcome = 'won';
      }
      return { kind: 'hit', attacker: 'player', damage, crit, defended: false };
    }
    case 'defend':
      return { kind: 'defend' };
    case 'item':
      return useItem(battle, action.itemId);
    case 'flee': {
      const success = rng() < rules.fleeChance;
      if (success) {
        battle.outcome = 'fled';
      }
      return { kind: 'flee', success };
    }
  }
}

function useItem(battle: Battle, itemId: string): BattleEvent {
  const item = getItem(itemId);
  battle.inventory[itemId] = (battle.inventory[itemId] ?? 0) - 1;
  const amount = item.kind === 'heal' ? heal(battle.player, item.value) : 0;
  return { kind: 'heal', itemId, amount };
}

function enemyAct(battle: Battle, defended: boolean, rng: Rng, rules: BattleRules): BattleEvent {
  const theft = trySteal(battle, rng);
  if (theft) {
    return theft;
  }
  const roll = rollDamage(battle.enemy, battle.player, rng, rules);
  const damage = defended
    ? Math.max(1, Math.round(roll.damage * rules.defendMultiplier))
    : roll.damage;
  applyDamage(battle.player, damage);
  if (isDefeated(battle.player)) {
    battle.outcome = 'lost';
  }
  return { kind: 'hit', attacker: 'enemy', damage, crit: roll.crit, defended };
}

/** Vihollinen yrittää varastaa ensimmäisen esineen, jota pelaajalla on. */
function trySteal(battle: Battle, rng: Rng): BattleEvent | null {
  if (battle.enemyStealChance <= 0) {
    return null;
  }
  const found = Object.entries(battle.inventory).find(([, count]) => count > 0);
  if (!found || rng() >= battle.enemyStealChance) {
    return null;
  }
  const [itemId] = found;
  battle.inventory[itemId] = (battle.inventory[itemId] ?? 0) - 1;
  battle.stolen[itemId] = (battle.stolen[itemId] ?? 0) + 1;
  return { kind: 'steal', itemId };
}

/** Siirtää varastetut esineet takaisin pelaajalle. Palauttaa palautetut esineet. */
export function recoverStolen(battle: Battle): ItemStack[] {
  const recovered = Object.entries(battle.stolen)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => ({ id, count }));
  for (const { id, count } of recovered) {
    battle.inventory[id] = (battle.inventory[id] ?? 0) + count;
    battle.stolen[id] = 0;
  }
  return recovered;
}

/** Ensimmäinen parannusesine, jota on jäljellä, tai null. */
export function firstHealItem(inventory: Readonly<Record<string, number>>): string | null {
  const found = Object.entries(inventory).find(
    ([id, count]) => count > 0 && getItem(id).kind === 'heal',
  );
  return found ? found[0] : null;
}

/** Parannusesineiden yhteismäärä. */
export function healItemCount(inventory: Readonly<Record<string, number>>): number {
  return Object.entries(inventory)
    .filter(([id]) => getItem(id).kind === 'heal')
    .reduce((sum, [, count]) => sum + Math.max(0, count), 0);
}
