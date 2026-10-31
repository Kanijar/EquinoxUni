import type { PlayerDef } from './types';

export const PLAYER: PlayerDef = {
  sprite: 'hero',
  stats: { maxHp: 30, attack: 6, defense: 2, speed: 90 },
  attackRange: 22,
  attackCooldownMs: 400,
};
