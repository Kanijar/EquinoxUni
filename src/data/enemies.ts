import type { EnemyDef } from './types';

// Uusi vihollinen: lisää olio tähän listaan ja sijoita se kartalle (map-enemies.ts).
// Testit tarkistavat, että sprite on olemassa.
export const ENEMIES: readonly EnemyDef[] = [
  {
    id: 'slime',
    name: 'Lima',
    sprite: 'slime',
    stats: { maxHp: 12, attack: 5, defense: 0, speed: 35 },
    aggroRange: 60,
    xp: 6,
  },
  {
    id: 'hiisi',
    name: 'Metsähiisi',
    sprite: 'hiisi',
    stats: { maxHp: 20, attack: 7, defense: 1, speed: 50 },
    aggroRange: 70,
    xp: 12,
    drop: 'potion',
  },
  {
    id: 'wolf',
    name: 'Harmaasusi',
    sprite: 'wolf',
    stats: { maxHp: 26, attack: 9, defense: 2, speed: 62 },
    aggroRange: 90,
    xp: 18,
    // Terävät hampaat: susi lyö kriittisen osuman tavallista useammin.
    critChance: 0.12,
  },
  {
    id: 'troll',
    name: 'Tunturipeikko',
    sprite: 'troll',
    stats: { maxHp: 45, attack: 13, defense: 4, speed: 40 },
    aggroRange: 70,
    xp: 35,
    drop: 'potion',
  },
  {
    // Ei kulje kartalla, vaan hyökkää väijytyksestä metsässä (data/ambushes.ts).
    id: 'robber',
    name: 'Ryöstäjä',
    sprite: 'robber',
    stats: { maxHp: 18, attack: 6, defense: 1, speed: 55 },
    aggroRange: 0,
    xp: 10,
    stealChance: 0.35,
  },
];
