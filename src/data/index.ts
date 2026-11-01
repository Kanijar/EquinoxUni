import { AMBUSHES } from './ambushes';
import { ENEMIES } from './enemies';
import { ITEMS } from './items';
import { MAP_ENEMIES } from './map-enemies';
import { NPCS } from './npcs';
import { QUESTS } from './quests';
import { SPELLS } from './spells';
import { SPRITES } from './sprites';
import { TOWNS } from './towns';
import { TERRAINS, WORLD } from './world';
import type {
  EnemyDef,
  ItemDef,
  NpcDef,
  QuestDef,
  SpellDef,
  SpellId,
  SpriteDef,
  TownDef,
} from './types';

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
export const getSpell = (id: SpellId): SpellDef => findById(SPELLS, id, 'loitsu');
export const getSprite = (id: string): SpriteDef => findById(SPRITES, id, 'sprite');
export const getTown = (id: string): TownDef => findById(TOWNS, id, 'paikkakunta');
export const getNpc = (id: string): NpcDef => findById(NPCS, id, 'hahmo');
export const getQuest = (id: string): QuestDef => findById(QUESTS, id, 'tehtävä');

export {
  AMBUSHES,
  ENEMIES,
  ITEMS,
  MAP_ENEMIES,
  NPCS,
  QUESTS,
  SPELLS,
  SPRITES,
  TERRAINS,
  TOWNS,
  WORLD,
};
