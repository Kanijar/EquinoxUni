import { BOAT_SPRITES } from './sprites-boats';
import { BOSS_SPRITES } from './sprites-bosses';
import { CAVE_SPRITES } from './sprites-cave';
import { CHARACTER_SPRITES } from './sprites-characters';
import { FISHING_SPRITES } from './sprites-fishing';
import { HOUSE_SPRITES } from './sprites-house';
import { ITEM_SPRITES } from './sprites-items';
import { ISLE_ITEM_SPRITES } from './sprites-isle-items';
import { ISLE_MONSTER_SPRITES } from './sprites-isle-monsters';
import { ISLE_SPRITES } from './sprites-isles';
import { MERCHANT_SPRITES } from './sprites-merchant';
import { MONSTER_SPRITES } from './sprites-monsters';
import { QUEST_ITEM_SPRITES } from './sprites-quest-items';
import { TILE_SPRITES } from './sprites-tiles';
import { UI_SPRITES } from './sprites-ui';
import type { SpriteDef } from './types';

// Kaikki pikselispritet yhdessä listassa. Hahmot: sprites-characters.ts,
// bossit (24x24): sprites-bosses.ts, saaren hirviöt: sprites-monsters.ts, esineet: sprites-items.ts
// ja sprites-quest-items.ts, kulkeva kauppias ja hänen tavaransa: sprites-merchant.ts,
// kalastus (esineet, hai ja koho): sprites-fishing.ts, karttaruudut: sprites-tiles.ts,
// käyttöliittymän ikonit: sprites-ui.ts. Veneet: sprites-boats.ts. Pienet saaret (hahmot, maastot, viholliset ja
// esineet): sprites-isles.ts, sprites-isle-monsters.ts ja sprites-isle-items.ts. Luola (Noita,
// Excalibur ja loitsukirjat): sprites-cave.ts. Sankarin talo ja pokaali: sprites-house.ts.
export const SPRITES: readonly SpriteDef[] = [
  ...CHARACTER_SPRITES,
  ...BOSS_SPRITES,
  ...MONSTER_SPRITES,
  ...ITEM_SPRITES,
  ...QUEST_ITEM_SPRITES,
  ...MERCHANT_SPRITES,
  ...FISHING_SPRITES,
  ...TILE_SPRITES,
  ...UI_SPRITES,
  ...ISLE_SPRITES,
  ...BOAT_SPRITES,
  ...ISLE_MONSTER_SPRITES,
  ...ISLE_ITEM_SPRITES,
  ...CAVE_SPRITES,
  ...HOUSE_SPRITES,
];
