import type { PlayerDef } from './types';

// Pelaajan arvot pelin alussa. Arvot kasvavat vain kykypisteillä (skills.ts).
export const PLAYER: PlayerDef = {
  name: 'Sankari',
  sprite: 'hero',
  stats: { maxHp: 30, attack: 7, defense: 2, speed: 75 },
  startItems: [{ id: 'potion', count: 3 }],
};
