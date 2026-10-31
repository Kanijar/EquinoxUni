import { CHARACTER_SPRITES } from './sprites-characters';
import { ITEM_SPRITES } from './sprites-items';
import { TILE_SPRITES } from './sprites-tiles';
import type { SpriteDef } from './types';

// Kaikki pikselispritet yhdessä listassa. Hahmot: sprites-characters.ts,
// esineet: sprites-items.ts, karttaruudut: sprites-tiles.ts.
export const SPRITES: readonly SpriteDef[] = [
  ...CHARACTER_SPRITES,
  ...ITEM_SPRITES,
  ...TILE_SPRITES,
];
