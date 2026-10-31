import { getItem, getSpell } from '../data';
import { BATTLE_RULES } from '../data/rules';
import type { BattleRules, EnemyDef, EnemyMovesDef, ItemStack, SpellId } from '../data/types';
import { applyDamage, heal, isDefeated, type Fighter } from './combat';
import { rollDamage, type Rng } from './damage-roll';
import { enemyAct } from './enemy-turn';
import { castSpell, type Burn } from './magic';

// Vuoropohjainen taistelu. Pelaaja valitsee toiminnon, sitten vihollinen vastaa.
// Puhdasta logiikkaa: palauttaa tapahtumat, jotka taistelunäkymä näyttää järjestyksessä.

export { rollDamage, type Rng };

export type BattleAction =
  | { readonly kind: 'attack' }
  | { readonly kind: 'defend' }
  | { readonly kind: 'spell'; readonly spellId: SpellId }
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
      /** Valmisteltu voimaisku (logic/enemy-turn.ts). */
      readonly heavy?: boolean;
    }
  | {
      readonly kind: 'spell';
      readonly spellId: SpellId;
      readonly damage: number;
      readonly crit: boolean;
      /** Kuinka monta sekuntia vihollinen palaa. */
      readonly burnSeconds: number;
    }
  | { readonly kind: 'defend' }
  | { readonly kind: 'heal'; readonly itemId: string; readonly amount: number }
  | { readonly kind: 'steal'; readonly itemId: string }
  | { readonly kind: 'flee'; readonly success: boolean }
  /** Vihollinen valmistelee voimaiskua: seuraavalla vuorolla se lyö kovaa. */
  | { readonly kind: 'charge' }
  /** Vihollisen erikoisliike (lumimyrsky): ohittaa puolustuksen ja sammuttaa liekit. */
  | {
      readonly kind: 'special';
      readonly damage: number;
      readonly defended: boolean;
      /** true, jos myrsky sammutti tulipallon liekit. */
      readonly extinguished: boolean;
    };

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
  /** Vihollisen erikoisliikkeet (loppuboss), tai null = vain tavallinen lyönti. */
  readonly enemyMoves: EnemyMovesDef | null;
  /** Vihollinen on valmistellut voimaiskun, joka tulee sen seuraavalla vuorolla. */
  enemyCharging: boolean;
  /** Vihollisen palaminen tulipallon jäljiltä, tai null (logic/magic.ts). */
  enemyBurn: Burn | null;
  outcome: BattleOutcome;
}

/** Vihollisen erityistaidot taistelussa (data/enemies.ts). Puuttuva = ei taitoa. */
export interface EnemyTraits {
  /** Todennäköisyys varastaa esine lyönnin sijaan (ryöstäjä). */
  readonly stealChance?: number;
  /** Erikoisliikkeet (loppuboss). */
  readonly moves?: EnemyMovesDef;
}

export function createBattle(
  player: Fighter,
  enemy: Fighter,
  inventory: Record<string, number>,
  traits: EnemyTraits = {},
): Battle {
  return {
    player,
    enemy,
    inventory,
    enemyStealChance: traits.stealChance ?? 0,
    stolen: {},
    enemyMoves: traits.moves ?? null,
    enemyCharging: false,
    enemyBurn: null,
    outcome: 'ongoing',
  };
}

/** Vihollisen taistelija täydellä elämällä. Mukana vihollisen oma kriittisen osuman mahdollisuus. */
export function enemyFighter(enemy: EnemyDef): Fighter {
  const { maxHp, attack, defense } = enemy.stats;
  const fighter: Fighter = { hp: maxHp, maxHp, attack, defense };
  return enemy.critChance === undefined ? fighter : { ...fighter, critChance: enemy.critChance };
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
    case 'spell':
      return castAtEnemy(battle, action.spellId, rng, rules);
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

/** Loitsu osuu viholliseen ja sytyttää sen palamaan (uusi loitsu aloittaa palamisen alusta). */
function castAtEnemy(battle: Battle, spellId: SpellId, rng: Rng, rules: BattleRules): BattleEvent {
  const { damage, crit, burn } = castSpell(battle.player, getSpell(spellId), rng, rules);
  applyDamage(battle.enemy, damage);
  if (isDefeated(battle.enemy)) {
    battle.outcome = 'won';
  } else {
    battle.enemyBurn = burn;
  }
  return { kind: 'spell', spellId, damage, crit, burnSeconds: burn.secondsLeft };
}

function useItem(battle: Battle, itemId: string): BattleEvent {
  const item = getItem(itemId);
  battle.inventory[itemId] = (battle.inventory[itemId] ?? 0) - 1;
  const amount = item.kind === 'heal' ? heal(battle.player, item.value) : 0;
  return { kind: 'heal', itemId, amount };
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
