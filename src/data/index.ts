import { ENEMIES } from './enemies';
import { ITEMS } from './items';
import { MAP_ENEMIES } from './map-enemies';
import { SPRITES } from './sprites';
import { TOWNS } from './towns';
import { TERRAINS, WORLD } from './world';
import type { EnemyDef, ItemDef, SpriteDef, TownDef } from './types';

// Hakufunktiot sisältöön tunnisteen perusteella. Heittää virheen tuntemattomalla
// tunnisteella, jotta kirjoitusvirheet huomataan heti eikä peli hajoa hiljaa.

function findById<T extends { readonly id: string }>(
  list: readonly T[],
  id: string,
  kind: string,
): T {
  const found = list.find((entry) => entry.id === id);
  if (!found) {
    throw new Error(`Tuntematon ${kind}: "${id}"`);
  }
  return found;
}

export const getEnemy = (id: string): EnemyDef => findById(ENEMIES, id, 'vihollinen');
export const getItem = (id: string): ItemDef => findById(ITEMS, id, 'esine');
export const getSprite = (id: string): SpriteDef => findById(SPRITES, id, 'sprite');
export const getTown = (id: string): TownDef => findById(TOWNS, id, 'paikkakunta');

export { ENEMIES, ITEMS, MAP_ENEMIES, SPRITES, TERRAINS, TOWNS, WORLD };
