import { describe, expect, it } from 'vitest';
import {
  applyDamage,
  calculateDamage,
  heal,
  isDefeated,
  strike,
  type Fighter,
} from '../src/logic/combat';

const fighter = (hp: number, attack = 5, defense = 0): Fighter => ({
  hp,
  maxHp: 20,
  attack,
  defense,
});

describe('combat', () => {
  it('vahinko on hyökkäys miinus puolustus', () => {
    expect(calculateDamage(6, 2)).toBe(4);
  });

  it('vahinko on aina vähintään 1', () => {
    expect(calculateDamage(1, 10)).toBe(1);
  });

  it('elämä ei laske alle nollan', () => {
    const target = fighter(3);
    expect(applyDamage(target, 10)).toBe(3);
    expect(target.hp).toBe(0);
    expect(isDefeated(target)).toBe(true);
  });

  it('strike käyttää hyökkääjän ja kohteen arvoja', () => {
    const target = fighter(20, 0, 2);
    strike(fighter(20, 7), target);
    expect(target.hp).toBe(15);
  });

  it('parannus ei ylitä maksimia', () => {
    const target = fighter(15);
    expect(heal(target, 10)).toBe(5);
    expect(target.hp).toBe(20);
  });
});
