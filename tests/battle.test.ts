import { describe, expect, it } from 'vitest';
import type { BattleRules } from '../src/data/types';
import {
  canChoose,
  createBattle,
  enemyFighter,
  firstHealItem,
  healItemCount,
  rollDamage,
  recoverStolen,
  takeTurn,
  type Rng,
} from '../src/logic/battle';
import type { Fighter } from '../src/logic/combat';

// Vuoropohjaisen taistelun testit. Satunnaisuus korvataan vakioluvuilla.

const rules: BattleRules = {
  damageVariance: 0.2,
  critChance: 0.1,
  critMultiplier: 2,
  defendMultiplier: 0.5,
  fleeChance: 0.6,
};

/** 0.5 = ei vaihtelua, ei kriittistä osumaa, pako onnistuu. */
const middle: Rng = () => 0.5;
const sequence = (...values: number[]): Rng => {
  let i = 0;
  return () => values[i++ % values.length] ?? 0.5;
};

const fighter = (hp: number, attack: number, defense: number): Fighter => ({
  hp,
  maxHp: hp,
  attack,
  defense,
});

const newBattle = (inventory: Record<string, number> = { potion: 1 }) =>
  createBattle(fighter(30, 7, 2), fighter(12, 5, 0), inventory);

describe('taistelu', () => {
  it('hyökkäys vahingoittaa vihollista ja vihollinen lyö takaisin', () => {
    const battle = newBattle();
    const events = takeTurn(battle, { kind: 'attack' }, middle, rules);
    expect(events).toEqual([
      { kind: 'hit', attacker: 'player', damage: 7, crit: false, defended: false },
      { kind: 'hit', attacker: 'enemy', damage: 3, crit: false, defended: false },
    ]);
    expect(battle.enemy.hp).toBe(5);
    expect(battle.player.hp).toBe(27);
  });

  it('voitettu vihollinen ei enää lyö takaisin', () => {
    const battle = newBattle();
    battle.enemy.hp = 3;
    const events = takeTurn(battle, { kind: 'attack' }, middle, rules);
    expect(events).toHaveLength(1);
    expect(battle.outcome).toBe('won');
    expect(canChoose(battle, { kind: 'attack' })).toBe(false);
  });

  it('puolustus puolittaa vihollisen vahingon', () => {
    const battle = createBattle(fighter(30, 7, 0), fighter(12, 10, 0), {});
    const events = takeTurn(battle, { kind: 'defend' }, middle, rules);
    expect(events[1]).toEqual({
      kind: 'hit',
      attacker: 'enemy',
      damage: 5,
      crit: false,
      defended: true,
    });
  });

  it('juoma parantaa ja kuluu', () => {
    const battle = newBattle({ potion: 1 });
    battle.player.hp = 10;
    const events = takeTurn(battle, { kind: 'item', itemId: 'potion' }, middle, rules);
    expect(events[0]).toEqual({ kind: 'heal', itemId: 'potion', amount: 10 });
    expect(battle.inventory['potion']).toBe(0);
    expect(battle.player.hp).toBe(17); // +10 ja vihollinen löi 3
  });

  it('esinettä ei voi käyttää, jos sitä ei ole', () => {
    const battle = newBattle({ potion: 0 });
    expect(canChoose(battle, { kind: 'item', itemId: 'potion' })).toBe(false);
    expect(takeTurn(battle, { kind: 'item', itemId: 'potion' }, middle, rules)).toEqual([]);
  });

  it('onnistunut pako päättää taistelun', () => {
    const battle = newBattle();
    const events = takeTurn(battle, { kind: 'flee' }, sequence(0.1), rules);
    expect(events).toEqual([{ kind: 'flee', success: true }]);
    expect(battle.outcome).toBe('fled');
  });

  it('epäonnistuneen paon jälkeen vihollinen lyö', () => {
    const battle = newBattle();
    const events = takeTurn(battle, { kind: 'flee' }, sequence(0.9, 0.5, 0.5), rules);
    expect(events[0]).toEqual({ kind: 'flee', success: false });
    expect(events[1]?.kind).toBe('hit');
    expect(battle.outcome).toBe('ongoing');
  });

  it('pelaaja häviää, kun elämä loppuu', () => {
    const battle = newBattle();
    battle.player.hp = 2;
    takeTurn(battle, { kind: 'defend' }, middle, rules);
    expect(battle.player.hp).toBe(0);
    expect(battle.outcome).toBe('lost');
  });

  it('kriittinen osuma tekee enemmän vahinkoa', () => {
    const attacker = fighter(10, 10, 0);
    const target = fighter(10, 0, 0);
    expect(rollDamage(attacker, target, sequence(0.5, 0.0), rules)).toEqual({
      damage: 20,
      crit: true,
    });
  });

  it('kriittinen osuma tulee vain, kun arpa on alle todennäköisyyden', () => {
    const attacker = fighter(10, 10, 0);
    const target = fighter(10, 0, 0);
    expect(rollDamage(attacker, target, sequence(0.5, 0.09), rules).crit).toBe(true);
    expect(rollDamage(attacker, target, sequence(0.5, 0.1), rules).crit).toBe(false);
  });

  it('taistelijan oma kriittisen osuman todennäköisyys korvaa yhteisen', () => {
    const target = fighter(10, 0, 0);
    const lucky = { ...fighter(10, 10, 0), critChance: 0.5 };
    const never = { ...fighter(10, 10, 0), critChance: 0 };
    expect(rollDamage(lucky, target, sequence(0.5, 0.4), rules).crit).toBe(true);
    expect(rollDamage(never, target, sequence(0.5, 0.0), rules).crit).toBe(false);
  });

  it('myös vihollinen voi lyödä kriittisen osuman', () => {
    const battle = newBattle();
    // pelaajan isku: vaihtelu 0.5, ei kriittistä; vihollisen isku: vaihtelu 0.5, kriittinen
    const events = takeTurn(battle, { kind: 'attack' }, sequence(0.5, 0.5, 0.5, 0.0), rules);
    expect(events[1]).toEqual({
      kind: 'hit',
      attacker: 'enemy',
      damage: 6,
      crit: true,
      defended: false,
    });
    expect(battle.player.hp).toBe(24);
  });

  it('puolustus pienentää myös kriittistä osumaa', () => {
    const battle = createBattle(fighter(30, 7, 0), fighter(12, 10, 0), {});
    const events = takeTurn(battle, { kind: 'defend' }, sequence(0.5, 0.0), rules);
    expect(events[1]).toMatchObject({ damage: 10, crit: true, defended: true });
  });

  it('vihollisen taistelija saa oman kriittisen osuman todennäköisyyden datasta', () => {
    const stats = { maxHp: 20, attack: 7, defense: 1, speed: 50 };
    const base = { id: 'test', name: 'Testi', sprite: 'slime', stats, aggroRange: 0, xp: 1 };
    expect(enemyFighter(base)).toEqual({ hp: 20, maxHp: 20, attack: 7, defense: 1 });
    expect(enemyFighter({ ...base, critChance: 0.3 }).critChance).toBe(0.3);
  });

  it('vahinko vaihtelee enintään ±20 % ja on aina vähintään 1', () => {
    const attacker = fighter(10, 10, 0);
    const target = fighter(10, 0, 0);
    expect(rollDamage(attacker, target, sequence(0, 0.5), rules).damage).toBe(8);
    expect(rollDamage(attacker, target, sequence(0.999, 0.5), rules).damage).toBe(12);
    expect(rollDamage(fighter(1, 1, 0), fighter(1, 0, 50), middle, rules).damage).toBe(1);
  });

  it('varas nappaa juoman lyönnin sijaan', () => {
    const battle = createBattle(fighter(30, 7, 2), fighter(30, 5, 0), { potion: 2 }, 0.35);
    const events = takeTurn(battle, { kind: 'defend' }, sequence(0.1), rules);
    expect(events[1]).toEqual({ kind: 'steal', itemId: 'potion' });
    expect(battle.inventory['potion']).toBe(1);
    expect(battle.stolen['potion']).toBe(1);
    expect(battle.player.hp).toBe(30);
  });

  it('varas lyö, jos arpa ei osu tai varastettavaa ei ole', () => {
    const battle = createBattle(fighter(30, 7, 2), fighter(30, 5, 0), { potion: 1 }, 0.35);
    expect(takeTurn(battle, { kind: 'defend' }, middle, rules)[1]?.kind).toBe('hit');
    const empty = createBattle(fighter(30, 7, 2), fighter(30, 5, 0), {}, 1);
    expect(takeTurn(empty, { kind: 'defend' }, middle, rules)[1]?.kind).toBe('hit');
  });

  it('varastetut esineet saa takaisin', () => {
    const battle = createBattle(fighter(30, 7, 2), fighter(30, 5, 0), { potion: 1 }, 1);
    takeTurn(battle, { kind: 'defend' }, middle, rules);
    expect(battle.inventory['potion']).toBe(0);
    expect(recoverStolen(battle)).toEqual([{ id: 'potion', count: 1 }]);
    expect(battle.inventory['potion']).toBe(1);
    expect(recoverStolen(battle)).toEqual([]);
  });

  it('löytää parannusesineen ja laskee niiden määrän', () => {
    expect(firstHealItem({ potion: 0 })).toBeNull();
    expect(firstHealItem({ potion: 2 })).toBe('potion');
    expect(healItemCount({ potion: 2 })).toBe(2);
  });
});
