import { getItem } from '../data';
import type { BattleRules, EnemyMovesDef } from '../data/types';
import type { Battle, BattleEvent } from './battle';
import { applyDamage, isDefeated } from './combat';
import { rollDamage, type Rng } from './damage-roll';

// Vihollisen vuoro: tavallinen lyönti, varkaus (ryöstäjä) tai erikoisliikkeet (loppuboss).
// Erikoisliikkeet (EnemyDef.moves, data/enemies.ts):
// - voimaisku: vihollinen valmistautuu yhden vuoron ('charge') ja lyö seuraavalla kovaa.
//   Pelaaja näkee valmistelun ja ehtii puolustaa (PUOLUSTA puolittaa iskun).
// - lumimyrsky ('special'): puolustus-arvo ei auta, ja myrsky sammuttaa palamisen.
// Viholliset ilman liikkeitä eivät arvo mitään ylimääräistä, joten niiden taistelu ei muutu.

export function enemyAct(
  battle: Battle,
  defended: boolean,
  rng: Rng,
  rules: BattleRules,
): BattleEvent {
  const moves = battle.enemyMoves;
  if (moves) {
    return movesAct(battle, moves, { defended, rng, rules });
  }
  return trySteal(battle, rng) ?? strikePlayer(battle, { defended, rng, rules }, 1);
}

interface TurnContext {
  readonly defended: boolean;
  readonly rng: Rng;
  readonly rules: BattleRules;
}

function movesAct(battle: Battle, moves: EnemyMovesDef, ctx: TurnContext): BattleEvent {
  if (battle.enemyCharging) {
    battle.enemyCharging = false;
    return strikePlayer(battle, ctx, moves.chargeMultiplier);
  }
  const roll = ctx.rng();
  if (roll < moves.chargeChance) {
    battle.enemyCharging = true;
    return { kind: 'charge' };
  }
  if (roll < moves.chargeChance + moves.specialChance) {
    return snowstorm(battle, moves, ctx);
  }
  return strikePlayer(battle, ctx, 1);
}

/** Lyönti pelaajaan. power > 1 = voimaisku. Puolustaessa vahinko pienenee. */
function strikePlayer(battle: Battle, ctx: TurnContext, power: number): BattleEvent {
  const roll = rollDamage(battle.enemy, battle.player, ctx.rng, ctx.rules);
  const damage = shielded(Math.round(roll.damage * power), ctx);
  hurtPlayer(battle, damage);
  const event = {
    kind: 'hit',
    attacker: 'enemy',
    damage,
    crit: roll.crit,
    defended: ctx.defended,
  } as const;
  return power > 1 ? { ...event, heavy: true } : event;
}

/** Lumimyrsky: vahinko ohittaa puolustus-arvon ja sammuttaa vihollisen liekit. */
function snowstorm(battle: Battle, moves: EnemyMovesDef, ctx: TurnContext): BattleEvent {
  const variance = 1 + (ctx.rng() * 2 - 1) * ctx.rules.damageVariance;
  const damage = shielded(Math.max(1, Math.round(moves.specialPower * variance)), ctx);
  hurtPlayer(battle, damage);
  const extinguished = battle.enemyBurn !== null;
  battle.enemyBurn = null;
  return { kind: 'special', damage, defended: ctx.defended, extinguished };
}

function shielded(damage: number, ctx: TurnContext): number {
  return ctx.defended ? Math.max(1, Math.round(damage * ctx.rules.defendMultiplier)) : damage;
}

function hurtPlayer(battle: Battle, damage: number): void {
  applyDamage(battle.player, damage);
  if (isDefeated(battle.player)) {
    battle.outcome = 'lost';
  }
}

/**
 * Vihollinen yrittää varastaa ensimmäisen parannusjuoman, jota pelaajalla on.
 * Repussa olevia varusteita ei varasteta.
 */
function trySteal(battle: Battle, rng: Rng): BattleEvent | null {
  if (battle.enemyStealChance <= 0) {
    return null;
  }
  const found = Object.entries(battle.inventory).find(
    ([id, count]) => count > 0 && getItem(id).kind === 'heal',
  );
  if (!found || rng() >= battle.enemyStealChance) {
    return null;
  }
  const [itemId] = found;
  battle.inventory[itemId] = (battle.inventory[itemId] ?? 0) - 1;
  battle.stolen[itemId] = (battle.stolen[itemId] ?? 0) + 1;
  return { kind: 'steal', itemId };
}
