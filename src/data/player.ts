import type { PlayerDef } from './types';

// Pelaajan arvot tasolla 1. Tasot nostavat arvoja (progression.ts).
export const PLAYER: PlayerDef = {
  name: 'Sankari',
  sprite: 'hero',
  stats: { maxHp: 30, attack: 7, defense: 2, speed: 75 },
  startItems: [{ id: 'potion', count: 3 }],
};
