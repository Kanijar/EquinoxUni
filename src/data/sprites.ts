import { CHARACTER_SPRITES } from './sprites-characters';
import { TILE_SPRITES } from './sprites-tiles';
import type { SpriteDef } from './types';

// Kaikki pikselispritet yhdessä listassa. Hahmot ja esineet: sprites-characters.ts,
// karttaruudut: sprites-tiles.ts.
export const SPRITES: readonly SpriteDef[] = [...CHARACTER_SPRITES, ...TILE_SPRITES];
