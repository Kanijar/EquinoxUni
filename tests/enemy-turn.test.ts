import { describe, expect, it } from 'vitest';
import type { BattleRules, EnemyMovesDef } from '../src/data/types';
import { createBattle, takeTurn, type Rng } from '../src/logic/battle';
import type { Fighter } from '../src/logic/combat';

// Loppubossin erikoisliikkeet: voimaisku valmistellaan edellisellä vuorolla ja
// lumimyrsky ohittaa puolustuksen ja sammuttaa liekit. Satunnaisuus on vakioitu.

const rules: BattleRules = {
  damageVariance: 0.2,
  critChance: 0.1,
  critMultiplier: 2,
  defendMultiplier: 0.5,
  fleeChance: 0.6,
};
const moves: EnemyMovesDef = {
  chargeChance: 0.25,
  chargeMultiplier: 3,
  specialChance: 0.2,
  specialPower: 10,
};
const fighter = (hp: number, attack: number, defense: number): Fighter => ({
  hp,
  maxHp: hp,
  attack,
  defense,
});
const sequence = (...values: number[]): Rng => {
  let i = 0;
  return () => values[i++] ?? 0.5;
};

/** Pelaaja (puolustus 5) ja boss (hyökkäys 15, paljon elämää). */
const bossBattle = () => createBattle(fighter(100, 4, 5), fighter(500, 15, 0), {}, { moves });

describe('loppubossin liikkeet', () => {
  it('valmistelu ei vahingoita, ja seuraavalla vuorolla tulee kolminkertainen isku', () => {
    const battle = bossBattle();
    // Pelaajan lyönti (0.5, 0.5), sitten bossi arpoo valmistelun (0.1).
    const [, charge] = takeTurn(battle, { kind: 'attack' }, sequence(0.5, 0.5, 0.1), rules);
    expect(charge).toEqual({ kind: 'charge' });
    expect(battle.enemyCharging).toBe(true);
    expect(battle.player.hp).toBe(100);
    // Lyönti (0.5, 0.5), voimaisku ilman arvontaa: (15 − 5) × 3 = 30.
    const [, smash] = takeTurn(battle, { kind: 'attack' }, sequence(0.5, 0.5, 0.5, 0.5), rules);
    expect(smash).toMatchObject({ kind: 'hit', attacker: 'enemy', damage: 30, heavy: true });
    expect(battle.enemyCharging).toBe(false);
    expect(battle.player.hp).toBe(70);
  });

  it('PUOLUSTA puolittaa voimaiskun', () => {
    const battle = bossBattle();
    battle.enemyCharging = true;
    const [, smash] = takeTurn(battle, { kind: 'defend' }, sequence(0.5, 0.5), rules);
    expect(smash).toMatchObject({ kind: 'hit', damage: 15, defended: true, heavy: true });
  });

  it('lumimyrsky ohittaa puolustuksen ja sammuttaa liekit', () => {
    const battle = bossBattle();
    battle.enemyBurn = { damage: 2, secondsLeft: 3, carry: 0 };
    // Pelaaja puolustaa, boss arpoo myrskyn (0.3) ja vaihtelun (0.5): 10 × 0,5 = 5.
    const [, storm] = takeTurn(battle, { kind: 'defend' }, sequence(0.3, 0.5), rules);
    expect(storm).toEqual({ kind: 'special', damage: 5, defended: true, extinguished: true });
    expect(battle.enemyBurn).toBeNull();
    // Ilman puolustusta täysi vahinko, vaikka pelaajan puolustus-arvo on 5.
    const [, again] = takeTurn(battle, { kind: 'attack' }, sequence(0.5, 0.5, 0.3, 0.5), rules);
    expect(again).toEqual({ kind: 'special', damage: 10, defended: false, extinguished: false });
  });

  it('muuten boss lyö tavallisesti', () => {
    const battle = bossBattle();
    const [, hit] = takeTurn(battle, { kind: 'attack' }, sequence(0.5, 0.5, 0.9, 0.5, 0.5), rules);
    expect(hit).toEqual({
      kind: 'hit',
      attacker: 'enemy',
      damage: 10,
      crit: false,
      defended: false,
    });
  });

  it('tavallinen vihollinen ei valmistele eikä käytä erikoisliikkeitä', () => {
    const battle = createBattle(fighter(100, 4, 5), fighter(500, 15, 0), {});
    for (let i = 0; i < 5; i++) {
      const [, enemy] = takeTurn(battle, { kind: 'attack' }, sequence(0.5, 0.5, 0.1, 0.5), rules);
      expect(enemy?.kind).toBe('hit');
    }
    expect(battle.enemyCharging).toBe(false);
  });
});
