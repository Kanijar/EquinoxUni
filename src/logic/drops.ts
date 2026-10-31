import type { DropDef } from '../data/types';
import type { Rng } from './battle';
import { findGear } from './equipment';

// Pudotukset: kaatuessaan vihollinen voi jättää jälkeensä esineitä (EnemyDef.drops,
// data/enemies.ts). Jokainen pudotus arvotaan erikseen omalla todennäköisyydellään.
// Varustetta, joka pelaajalla jo on (repussa tai käytössä), ei pudoteta toista kertaa:
// kaksi samaa nuijaa ei auttaisi mitään. Juomia voi saada aina lisää.

/**
 * Arpoo vihollisen pudotukset. owns kertoo, onko pelaajalla esine jo.
 * Palauttaa pudonneiden esineiden tunnisteet.
 */
export function rollDrops(
  drops: readonly DropDef[],
  owns: (itemId: string) => boolean,
  rng: Rng,
): string[] {
  const found: string[] = [];
  for (const drop of drops) {
    const alreadyOwned = findGear(drop.item) !== null && owns(drop.item);
    if (!alreadyOwned && rng() < drop.chance) {
      found.push(drop.item);
    }
  }
  return found;
}
