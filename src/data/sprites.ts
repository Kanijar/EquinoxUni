import { CHARACTER_SPRITES } from './sprites-characters';
import { TILE_SPRITES } from './sprites-tiles';
import { UI_SPRITES } from './sprites-ui';
import type { SpriteDef } from './types';

// Kaikki pikselispritet yhdessä listassa. Hahmot ja esineet: sprites-characters.ts,
// karttaruudut: sprites-tiles.ts, käyttöliittymän ikonit: sprites-ui.ts.
export const SPRITES: readonly SpriteDef[] = [...CHARACTER_SPRITES, ...TILE_SPRITES, ...UI_SPRITES];
