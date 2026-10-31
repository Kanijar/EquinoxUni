import { describe, expect, it } from 'vitest';
import { decideIntent } from '../src/logic/enemy-ai';

const senses = (px: number) => ({
  self: { x: 0, y: 0 },
  player: { x: px, y: 0 },
  aggroRange: 50,
  attackRange: 10,
});

describe('enemy-ai', () => {
  it('odottaa, kun pelaaja on kaukana', () => {
    expect(decideIntent(senses(100)).kind).toBe('idle');
  });

  it('jahtaa pelaajaa huomausetäisyydellä', () => {
    expect(decideIntent(senses(30))).toEqual({ kind: 'chase', direction: { x: 1, y: 0 } });
  });

  it('hyökkää, kun pelaaja on lähellä', () => {
    expect(decideIntent(senses(5)).kind).toBe('attack');
  });
});
