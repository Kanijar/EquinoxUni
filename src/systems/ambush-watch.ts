import { WORLD } from '../data';
import { checkAmbush, createAmbushTracker, type AmbushTracker } from '../logic/ambush';
import type { Rng } from '../logic/battle';
import type { Vec2 } from '../logic/vector';
import { terrainAt, townAt, type WorldGrid } from '../logic/world-grid';
import { worldToTile } from './world-map';

// Seuraa pelaajan askelia kartalla ja kertoo, kun joku hyökkää väijytyksestä.
// Säännöt ovat data/ambushes.ts:ssä ja arvonta logic/ambush.ts:ssä.

export class AmbushWatch {
  private readonly tracker: AmbushTracker = createAmbushTracker();

  constructor(
    private readonly grid: WorldGrid,
    private readonly rng: Rng = Math.random,
  ) {}

  /** Palauttaa hyökkäävän vihollisen tunnisteen tai null. */
  update(playerPosition: Vec2): string | null {
    const tile = worldToTile(playerPosition);
    const step = {
      tile,
      terrain: terrainAt(this.grid, tile),
      inTown: townAt(WORLD, tile) !== undefined,
    };
    return checkAmbush(this.tracker, step, this.rng);
  }
}
