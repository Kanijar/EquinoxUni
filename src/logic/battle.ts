import { getItem } from '../data';
import { BATTLE_RULES } from '../data/rules';
import type { BattleRules, EnemyDef, EnemyMovesDef, ItemStack, SpellId } from '../data/types';
import { applyDamage, heal, isDefeated, type Fighter } from './combat';
import { rollDamage, type Rng } from './damage-roll';
import { enemyAct } from './enemy-turn';
import type { Burn } from './magic';
import { canCast, castPlayerSpell, thawEnemy, tickCooldowns, type SpellCooldowns } from './spells';

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
      /** Kuinka monta sekuntia vihollinen palaa (0 = loitsu ei sytytä). */
      readonly burnSeconds: number;
      /** true, jos jäänuoli jäädytti vihollisen (se ei lyö tällä vuorolla). */
      readonly frozen?: boolean;
    }
  /** Parannusloitsu: sankari sai elämää. */
  | { readonly kind: 'spellHeal'; readonly spellId: SpellId; readonly amount: number }
  /** Jäätynyt vihollinen ei voinut lyödä. */
  | { readonly kind: 'frozen' }
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
  /** Jäänuoli jäädytti vihollisen: se ei lyö tällä vuorolla (logic/spells.ts). */
  enemyFrozen: boolean;
  /** Montako vuoroa kutakin loitsua pitää vielä odottaa (logic/spells.ts). */
  readonly spellCooldowns: SpellCooldowns;
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
    enemyFrozen: false,
    spellCooldowns: {},
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
  if (action.kind === 'spell') {
    return canCast(battle, action.spellId);
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
  tickCooldowns(battle.spellCooldowns);
  const events = [playerAct(battle, action, rng, rules)];
  if (battle.outcome === 'ongoing') {
    const defending = action.kind === 'defend';
    events.push(battle.enemyFrozen ? thawEnemy(battle) : enemyAct(battle, defending, rng, rules));
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
      return castPlayerSpell(battle, action.spellId, rng, rules);
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
