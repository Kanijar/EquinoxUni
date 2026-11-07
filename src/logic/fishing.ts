import { FISHING } from '../data/fishing';
import type { FishingCatchDef, FishingRules } from '../data/types';
import type { Rng } from './battle';
import { findGear, ownsItem } from './equipment';
import type { GameState } from './game-state';
import type { Vec2 } from './vector';
import { terrainAt, type WorldGrid } from './world-grid';

// Kalastuksen säännöt (data/fishing.ts). Sankari tarvitsee ongen ja matoja, ja hänen pitää
// seistä veden (meri tai järvi) vieressä. Heitto: kala nappaa satunnaisen ajan päästä, ja
// silloin pitää nykäistä biteWindowMs:n sisällä. Mato kuluu, kun kala nappaa (nykäisi pelaaja
// ajoissa tai ei). Liian aikainen nykäisy vain säikäyttää kalan, eikä mato kulu.
// Saalis arvotaan painoilla: kalaa, harvinainen panssari tai hai (taistelu).
// Aika annetaan ulkoa millisekunteina, joten säännöt voi testata ilman peliä.

/** Miksi kalastus ei onnistu: ei onkea tai ei matoja. */
export type FishingBlock = 'noRod' | 'noBait';

/** Heitto: milloin kala nappaa (ms heitosta). */
export interface Cast {
  readonly biteAtMs: number;
}

/** Heiton vaihe: odotetaan, kala nappaa nyt tai kala ehti karata madon kanssa. */
export type CastPhase = 'waiting' | 'bite' | 'escaped';

/** Nykäisyn tulos: liian aikaisin, kala tarttui tai liian myöhään. */
export type ReelResult = 'early' | 'caught' | 'escaped';

/** Saalis: esine reppuun tai vihollinen, joka hyökkää (taistelu alkaa). */
export type FishingCatch =
  | { readonly kind: 'item'; readonly item: string }
  | { readonly kind: 'enemy'; readonly enemy: string };

/** Voiko vihollinen tarttua onkeen (esim. hai): taistelun aloitusviesti on silloin oma. */
export function isFishedEnemy(enemyId: string, rules: FishingRules = FISHING): boolean {
  return rules.catches.some((entry) => entry.kind === 'enemy' && entry.enemy === enemyId);
}

/** Miksi sankari ei voi kalastaa, tai null, kun onki ja matoja on. */
export function fishingBlock(state: GameState, rules: FishingRules = FISHING): FishingBlock | null {
  if ((state.inventory[rules.rodItem] ?? 0) <= 0) {
    return 'noRod';
  }
  return (state.inventory[rules.baitItem] ?? 0) > 0 ? null : 'noBait';
}

/** Onko sankarilla onki (silloin KALASTA-nappi näkyy rannalla). */
export function hasRod(state: GameState, rules: FishingRules = FISHING): boolean {
  return (state.inventory[rules.rodItem] ?? 0) > 0;
}

/**
 * Lähin vesiruutu, johon koho heitetään, tai null, kun vettä ei ole tarpeeksi lähellä.
 * Lähin = pienin etäisyys; tasapelissä ensin löytynyt (ylhäältä vasemmalta).
 */
export function fishingSpot(
  grid: WorldGrid,
  tile: Vec2,
  rules: FishingRules = FISHING,
): Vec2 | null {
  let best: Vec2 | null = null;
  let bestDistance = Infinity;
  const reach = rules.reachTiles;
  for (let dy = -reach; dy <= reach; dy++) {
    for (let dx = -reach; dx <= reach; dx++) {
      const spot = { x: tile.x + dx, y: tile.y + dy };
      const inside = spot.x >= 0 && spot.y >= 0 && spot.x < grid.width && spot.y < grid.height;
      const d = dx * dx + dy * dy;
      if (inside && d < bestDistance && rules.waterTerrains.includes(terrainAt(grid, spot))) {
        best = spot;
        bestDistance = d;
      }
    }
  }
  return best;
}

/** Heittää kohon veteen: kala nappaa satunnaisen ajan päästä. */
export function startCast(rng: Rng, rules: FishingRules = FISHING): Cast {
  const { min, max } = rules.biteDelayMs;
  return { biteAtMs: Math.round(min + rng() * (max - min)) };
}

/** Heiton vaihe, kun heitosta on kulunut elapsedMs. */
export function castPhase(cast: Cast, elapsedMs: number, rules: FishingRules = FISHING): CastPhase {
  if (elapsedMs < cast.biteAtMs) {
    return 'waiting';
  }
  return elapsedMs < cast.biteAtMs + rules.biteWindowMs ? 'bite' : 'escaped';
}

/** Mitä nykäisy tekee, kun heitosta on kulunut elapsedMs. */
export function reel(cast: Cast, elapsedMs: number, rules: FishingRules = FISHING): ReelResult {
  const phase = castPhase(cast, elapsedMs, rules);
  if (phase === 'waiting') {
    return 'early';
  }
  return phase === 'bite' ? 'caught' : 'escaped';
}

/** Saaliit, jotka voivat tulla: varustetta, joka pelaajalla jo on, ei saa toista kertaa. */
function possibleCatches(state: GameState, rules: FishingRules): FishingCatchDef[] {
  return rules.catches.filter(
    (entry) =>
      entry.kind === 'enemy' ||
      findGear(entry.item) === null ||
      !ownsItem(state.inventory, state.equipped, entry.item),
  );
}

/** Arpoo saaliin painojen mukaan. */
export function rollCatch(state: GameState, rng: Rng, rules: FishingRules = FISHING): FishingCatch {
  const options = possibleCatches(state, rules);
  const total = options.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = rng() * total;
  let picked = options.at(-1);
  for (const entry of options) {
    if (roll < entry.weight) {
      picked = entry;
      break;
    }
    roll -= entry.weight;
  }
  if (!picked) {
    throw new Error('Kalastuksella ei ole saaliita (data/fishing.ts).');
  }
  return picked.kind === 'item'
    ? { kind: 'item', item: picked.item }
    : { kind: 'enemy', enemy: picked.enemy };
}

/**
 * Nykäisyn jälkeen: mato kuluu, jos kala ehti napata, ja tarttunut saalis arvotaan.
 * Esine menee reppuun. Palauttaa saaliin, tai null, jos mitään ei tullut.
 */
export function finishCast(
  state: GameState,
  result: ReelResult,
  rng: Rng,
  rules: FishingRules = FISHING,
): FishingCatch | null {
  if (result === 'early') {
    return null;
  }
  const bait = rules.baitItem;
  state.inventory[bait] = Math.max(0, (state.inventory[bait] ?? 0) - 1);
  if (result === 'escaped') {
    return null;
  }
  const caught = rollCatch(state, rng, rules);
  if (caught.kind === 'item') {
    state.inventory[caught.item] = (state.inventory[caught.item] ?? 0) + 1;
  }
  return caught;
}
