import { distance, directionTo, type Vec2 } from './vector';

// Vihollisen päätöksenteko. Palauttaa mitä vihollinen haluaa tehdä tällä hetkellä;
// varsinainen liikuttaminen tapahtuu entities/enemy.ts:ssä.

export type EnemyIntent =
  | { readonly kind: 'idle' }
  | { readonly kind: 'chase'; readonly direction: Vec2 }
  | { readonly kind: 'attack' };

export interface EnemySenses {
  readonly self: Vec2;
  readonly player: Vec2;
  readonly aggroRange: number;
  readonly attackRange: number;
}

export function decideIntent(senses: EnemySenses): EnemyIntent {
  const dist = distance(senses.self, senses.player);
  if (dist <= senses.attackRange) {
    return { kind: 'attack' };
  }
  if (dist <= senses.aggroRange) {
    return { kind: 'chase', direction: directionTo(senses.self, senses.player) };
  }
  return { kind: 'idle' };
}
