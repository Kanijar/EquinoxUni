import type { PlayerDef } from './types';

// Pelaajan arvot pelin alussa. Arvot kasvavat vain kykypisteillä (skills.ts).
export const PLAYER: PlayerDef = {
  name: 'Sankari',
  eyeColor: 'yellow',
  eyeSprites: { yellow: 'hero', black: 'hero-black-eyes' },
  // attack 4: lyönti tekee ilman kykypisteitä 4 vahinkoa (miinus vihollisen puolustus).
  // critPercent: kriittisen osuman mahdollisuus prosentteina (sama kuin yleinen 8 %),
  // Tarkkuus-kyky nostaa sitä. magic: tulivoima, jota Maagia-kyky nostaa.
  stats: { maxHp: 30, attack: 4, defense: 2, speed: 75, critPercent: 8, magic: 0 },
  spell: 'fireball',
  startItems: [{ id: 'potion', count: 3 }],
};
