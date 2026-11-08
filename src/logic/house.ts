import { HOUSE } from '../data/house';
import type { HouseDef } from '../data/types';
import type { Vec2 } from './vector';

// Sankarin talo Kotirannan laidalla (data/house.ts). Talon ovella kartalle tulee TALO-nappi.

/** Onko sankari talon ovella (enintään house.enterTiles ruudun päässä talosta). */
export function atHouseDoor(tile: Vec2, house: HouseDef = HOUSE): boolean {
  const reach = house.enterTiles;
  return Math.abs(tile.x - house.x) <= reach && Math.abs(tile.y - house.y) <= reach;
}
