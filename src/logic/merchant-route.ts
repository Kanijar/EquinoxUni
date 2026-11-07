import { TILE_SIZE } from '../config/game-config';
import { getTown, WORLD } from '../data';
import { MERCHANT } from '../data/merchant';
import type { MerchantDef } from '../data/types';
import { gridLine } from './grid-line';
import type { Vec2 } from './vector';
import { townTile } from './world-grid';

// Kulkevan kauppiaan reitti kartalla. Kauppias pysähtyy paikkakuntaan (MERCHANT.stopMs) ja
// kävelee sitten tietä pitkin seuraavaan. Viimeisestä paikkakunnasta hän palaa ensimmäiseen.
// Tie kulkee samaa ruutuviivaa kuin kartan tiet (logic/world-grid.ts drawRoads), joten
// kauppias pysyy tiellä. Paikka lasketaan kauppiaan kellosta (GameState.merchantMs):
// kello käy vain kartalla ja pysähtyy, kun sankari juttelee kauppiaan kanssa.

/** Kauppiaan kello pelin tilassa: montako millisekuntia kierrosta on kuljettu. */
export interface MerchantProgress {
  merchantMs: number;
}

/** Reitin osa: pysähdys paikkakunnassa tai kävely tietä pitkin. */
export type RouteLeg =
  | { readonly kind: 'stop'; readonly town: string; readonly tile: Vec2; readonly ms: number }
  | { readonly kind: 'walk'; readonly path: readonly Vec2[]; readonly ms: number };

export interface MerchantPlan {
  readonly legs: readonly RouteLeg[];
  /** Koko kierroksen kesto millisekunteina. */
  readonly totalMs: number;
}

/** Reitin pysähdyspaikka: paikkakunnan tunniste ja ruutu. */
export interface RouteStop {
  readonly town: string;
  readonly tile: Vec2;
}

/** Kauppiaan paikka ruutuina (desimaaliluku: 3,5 = ruutujen 3 ja 4 puolivälissä). */
export interface MerchantSpot {
  readonly tile: Vec2;
  /** Paikkakunta, jossa kauppias on pysähtyneenä, tai null, kun hän kävelee. */
  readonly town: string | null;
  /** Katsooko kauppias oikealle (1) vai vasemmalle (-1). */
  readonly facing: 1 | -1;
}

/** Tie paikkakuntien välillä. */
export type Road = readonly [string, string];

/**
 * Tien ruudut paikkakunnasta toiseen. Ruutuviiva lasketaan samaan suuntaan kuin kartan tie
 * (ROADS), koska viiva voi valita eri ruudut toiseen suuntaan laskettuna.
 */
function roadPath(from: RouteStop, to: RouteStop, roads: readonly Road[]): Vec2[] {
  const reversed = roads.some(([a, b]) => a === to.town && b === from.town);
  return reversed ? gridLine(to.tile, from.tile).reverse() : gridLine(from.tile, to.tile);
}

/** Laskee kierroksen pysähdyksineen. Kävelyn kesto tulee matkasta ja nopeudesta. */
export function planRoute(
  stops: readonly RouteStop[],
  roads: readonly Road[],
  def: Pick<MerchantDef, 'speed' | 'stopMs'>,
): MerchantPlan {
  const msPerTile = (TILE_SIZE / def.speed) * 1000;
  const legs: RouteLeg[] = stops.flatMap((stop, index) => {
    const next = stops[(index + 1) % stops.length] ?? stop;
    const path = roadPath(stop, next, roads);
    const walk: RouteLeg = { kind: 'walk', path, ms: (path.length - 1) * msPerTile };
    return [{ kind: 'stop', town: stop.town, tile: stop.tile, ms: def.stopMs }, walk];
  });
  return { legs, totalMs: legs.reduce((sum, leg) => sum + leg.ms, 0) };
}

/** Kävelevän kauppiaan paikka tiellä, kun osan alusta on kulunut ms millisekuntia. */
function walkSpot(path: readonly Vec2[], legMs: number, ms: number): MerchantSpot {
  const first = path[0] ?? { x: 0, y: 0 };
  const last = path[path.length - 1] ?? first;
  const facing = last.x < first.x ? -1 : 1;
  const steps = path.length - 1;
  const travelled = legMs > 0 ? (ms / legMs) * steps : 0;
  const index = Math.min(Math.floor(travelled), Math.max(0, steps - 1));
  const from = path[index] ?? first;
  const to = path[index + 1] ?? from;
  const part = Math.min(1, travelled - index);
  const tile = { x: from.x + (to.x - from.x) * part, y: from.y + (to.y - from.y) * part };
  return { tile, town: null, facing };
}

/** Kauppiaan paikka kierroksella, kun kierroksen alusta on kulunut ms millisekuntia. */
export function merchantSpot(plan: MerchantPlan, ms: number): MerchantSpot {
  let left = plan.totalMs > 0 ? ((ms % plan.totalMs) + plan.totalMs) % plan.totalMs : 0;
  for (const leg of plan.legs) {
    if (left < leg.ms) {
      return leg.kind === 'stop'
        ? { tile: leg.tile, town: leg.town, facing: 1 }
        : walkSpot(leg.path, leg.ms, left);
    }
    left -= leg.ms;
  }
  const first = plan.legs[0];
  return first?.kind === 'stop'
    ? { tile: first.tile, town: first.town, facing: 1 }
    : { tile: { x: 0, y: 0 }, town: null, facing: 1 };
}

/** Kello eteenpäin. Kierroksen lopussa alkaa uusi kierros, joten luku ei kasva loputtomiin. */
export function advanceMerchant(plan: MerchantPlan, ms: number, deltaMs: number): number {
  return plan.totalMs > 0 ? (ms + deltaMs) % plan.totalMs : 0;
}

/** Tallennuksesta luettu kello. Puuttuva tai virheellinen = kierroksen alku. */
export function readMerchantMs(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
}

let cachedPlan: MerchantPlan | null = null;

/** Kulkevan kauppiaan (data/merchant.ts) kierros. Lasketaan vain kerran. */
export function merchantPlan(): MerchantPlan {
  cachedPlan ??= planRoute(
    MERCHANT.route.map((id) => ({ town: id, tile: townTile(getTown(id)) })),
    WORLD.roads,
    MERCHANT,
  );
  return cachedPlan;
}
