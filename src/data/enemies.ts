import type { EnemyDef } from './types';

// Uusi vihollinen: lisää olio tähän listaan. Testit tarkistavat, että sprite on olemassa.
export const ENEMIES: readonly EnemyDef[] = [
  {
    id: 'slime',
    name: 'Lima',
    sprite: 'slime',
    stats: { maxHp: 12, attack: 4, defense: 0, speed: 40 },
    aggroRange: 90,
    attackRange: 14,
    attackCooldownMs: 900,
    xp: 5,
  },
];
