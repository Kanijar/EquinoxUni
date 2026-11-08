import { FISHING } from '../data/fishing';
import type { BaitDef, FishingCatchDef, FishingRules, RodDef } from '../data/types';
import type { Rng } from './battle';
import { findGear, ownsItem } from './equipment';
import { baitInUse, bestRod } from './fishing-gear';
import type { GameState } from './game-state';
import type { Vec2 } from './vector';
import { terrainAt, type WorldGrid } from './world-grid';

// Kalastuksen säännöt (data/fishing.ts). Sankari tarvitsee ongen ja syöttiä, ja hänen pitää
// seistä veden (meri tai järvi) vieressä. Heitto: kala nappaa satunnaisen ajan päästä, ja
// silloin pitää nykäistä ongen biteWindowMs:n sisällä. Syötti kuluu, kun kala nappaa (nykäisi
// pelaaja ajoissa tai ei). Liian aikainen nykäisy vain säikäyttää kalan, eikä syötti kulu.
// Saalis arvotaan syötin painoilla: parempi onki kertoo harvinaisten saaliiden painot.
// Mikä onki ja syötti ovat käytössä: logic/fishing-gear.ts.
// Aika annetaan ulkoa millisekunteina, joten säännöt voi testata ilman peliä.

/** Miksi kalastus ei onnistu: ei onkea tai ei syöttiä. */
export type FishingBlock = 'noRod' | 'noBait';

/** Heitto: milloin kala nappaa ja kauanko on aikaa nykäistä (ms heitosta), ja millä välineillä. */
export interface Cast {
  readonly biteAtMs: number;
  readonly windowMs: number;
  /** Syötti, joka kuluu, kun kala nappaa. Sen saaliit arvotaan. */
  readonly bait: BaitDef;
  /** Ongen kerroin harvinaisille saaliille. */
  readonly rareMultiplier: number;
}

/** Heiton vaihe: odotetaan, kala nappaa nyt tai kala ehti karata syötin kanssa. */
export type CastPhase = 'waiting' | 'bite' | 'escaped';

/** Nykäisyn tulos: liian aikaisin, kala tarttui tai liian myöhään. */
export type ReelResult = 'early' | 'caught' | 'escaped';

/** Saalis: esine reppuun tai vihollinen, joka hyökkää (taistelu alkaa). */
export type FishingCatch =
  | { readonly kind: 'item'; readonly item: string }
  | { readonly kind: 'enemy'; readonly enemy: string };

/** Voiko vihollinen tarttua onkeen (esim. hai): taistelun aloitusviesti on silloin oma. */
export function isFishedEnemy(enemyId: string, rules: FishingRules = FISHING): boolean {
  return rules.baits.some((bait) =>
    bait.catches.some((entry) => entry.kind === 'enemy' && entry.enemy === enemyId),
  );
}

/** Miksi sankari ei voi kalastaa, tai null, kun onki ja syöttiä on. */
export function fishingBlock(state: GameState, rules: FishingRules = FISHING): FishingBlock | null {
  if (!bestRod(state.inventory, rules)) {
    return 'noRod';
  }
  return baitInUse(state, state.inventory, rules) ? null : 'noBait';
}

/** Onko sankarilla onki (silloin KALASTA-nappi näkyy rannalla). */
export function hasRod(state: GameState, rules: FishingRules = FISHING): boolean {
  return bestRod(state.inventory, rules) !== null;
}

/**
 * Lähin vesiruutu, johon koho heitetään, tai null, kun vettä ei ole tarpeeksi lähellä.
 * Lähin = pienin etäisyys; tasapelissä ensin löytynyt (ylhäältä vasemmalta). Sankarin omaa
 * ruutua ei lasketa, koska veneessä (Luksusvene) sankari on itse vedessä.
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
      if (
        inside &&
        d > 0 &&
        d < bestDistance &&
        rules.waterTerrains.includes(terrainAt(grid, spot))
      ) {
        best = spot;
        bestDistance = d;
      }
    }
  }
  return best;
}

/**
 * Heittää kohon veteen parhaalla ongella ja valitulla syötillä. Kala nappaa satunnaisen
 * ajan päästä (parempi onki: nopeammin). null, jos onkea tai syöttiä ei ole.
 */
export function startCast(state: GameState, rng: Rng, rules: FishingRules = FISHING): Cast | null {
  const rod = bestRod(state.inventory, rules);
  const bait = baitInUse(state, state.inventory, rules);
  return rod && bait ? castWith(rod, bait, rng, rules) : null;
}

/** Heitto annetulla ongella ja syötillä. */
export function castWith(
  rod: RodDef,
  bait: BaitDef,
  rng: Rng,
  rules: FishingRules = FISHING,
): Cast {
  const { min, max } = rules.biteDelayMs;
  const delay = (min + rng() * (max - min)) * rod.biteDelayFactor;
  return {
    biteAtMs: Math.round(delay),
    windowMs: rod.biteWindowMs,
    bait,
    rareMultiplier: rod.rareMultiplier,
  };
}

/** Heiton vaihe, kun heitosta on kulunut elapsedMs. */
export function castPhase(cast: Cast, elapsedMs: number): CastPhase {
  if (elapsedMs < cast.biteAtMs) {
    return 'waiting';
  }
  return elapsedMs < cast.biteAtMs + cast.windowMs ? 'bite' : 'escaped';
}

/** Mitä nykäisy tekee, kun heitosta on kulunut elapsedMs. */
export function reel(cast: Cast, elapsedMs: number): ReelResult {
  const phase = castPhase(cast, elapsedMs);
  if (phase === 'waiting') {
    return 'early';
  }
  return phase === 'bite' ? 'caught' : 'escaped';
}

/** Saaliit, jotka voivat tulla: varustetta, joka pelaajalla jo on, ei saa toista kertaa. */
function possibleCatches(state: GameState, bait: BaitDef): FishingCatchDef[] {
  return bait.catches.filter(
    (entry) =>
      entry.kind === 'enemy' ||
      findGear(entry.item) === null ||
      !ownsItem(state.inventory, state.equipped, entry.item),
  );
}

/** Saaliin paino ongella: harvinaisen saaliin paino kerrotaan ongen kertoimella. */
export function catchWeight(entry: FishingCatchDef, rareMultiplier: number): number {
  return entry.rare ? entry.weight * rareMultiplier : entry.weight;
}

/** Arpoo saaliin syötin painojen mukaan (harvinaiset kerrottuna ongen kertoimella). */
export function rollCatch(
  state: GameState,
  bait: BaitDef,
  rareMultiplier: number,
  rng: Rng,
): FishingCatch {
  const options = possibleCatches(state, bait);
  const weight = (entry: FishingCatchDef): number => catchWeight(entry, rareMultiplier);
  const total = options.reduce((sum, entry) => sum + weight(entry), 0);
  let roll = rng() * total;
  let picked = options.at(-1);
  for (const entry of options) {
    if (roll < weight(entry)) {
      picked = entry;
      break;
    }
    roll -= weight(entry);
  }
  if (!picked) {
    throw new Error(`Syötillä ${bait.item} ei ole saaliita (data/fishing.ts).`);
  }
  return picked.kind === 'item'
    ? { kind: 'item', item: picked.item }
    : { kind: 'enemy', enemy: picked.enemy };
}

/**
 * Nykäisyn jälkeen: syötti kuluu, jos kala ehti napata, ja tarttunut saalis arvotaan.
 * Esine menee reppuun. Palauttaa saaliin, tai null, jos mitään ei tullut.
 */
export function finishCast(
  state: GameState,
  cast: Cast,
  result: ReelResult,
  rng: Rng,
): FishingCatch | null {
  const { bait } = cast;
  if (result === 'early') {
    return null;
  }
  state.inventory[bait.item] = Math.max(0, (state.inventory[bait.item] ?? 0) - 1);
  if (result === 'escaped') {
    return null;
  }
  const caught = rollCatch(state, bait, cast.rareMultiplier, rng);
  if (caught.kind === 'item') {
    state.inventory[caught.item] = (state.inventory[caught.item] ?? 0) + 1;
  }
  return caught;
}
