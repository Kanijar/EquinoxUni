import type Phaser from 'phaser';
import { getSprite } from '../data';
import type { HeroLook } from '../data/types';
import type { Equipped } from '../logic/equipment';
import { dressHero } from '../logic/hero-gear';
import { driverSprite, heroSprite, type HeroAppearance } from '../logic/hero-look';
import { createSpriteTexture } from './sprite-textures';

// Sankarin tekstuuri pelaajan valitsemalla ulkonäöllä (logic/hero-look.ts).
// Tekstuuri piirretään ensimmäisellä kerralla, ja sama ulkonäkö käyttää samaa avainta,
// joten kartta, taistelu ja voittoruutu jakavat yhden pienen kuvan. Käytössä olevat
// varusteet piirretään sankarin päälle (logic/hero-gear.ts), ja ne kuuluvat avaimeen.

type Look = Pick<HeroAppearance, 'look' | 'eyeColor'> & { readonly equipped?: Equipped };

/** Sankarin tekstuurin avain (kartta, taistelu, voittoruutu, reppu, hahmonluonti). */
export function heroTexture(textures: Phaser.Textures.TextureManager, hero: Look): string {
  const def = dressHero(heroSprite(hero.look, hero.eyeColor), hero.equipped ?? {});
  createSpriteTexture(textures, def);
  return def.id;
}

/**
 * Kulkuneuvon tekstuuri (esim. Bugatti), jonka kuskilla on sankarin hiukset ja iho.
 * Autossa ja veneessä näkyy vain kuskin pää, joten varusteita ei piirretä.
 */
export function driverTexture(
  textures: Phaser.Textures.TextureManager,
  vehicleSprite: string,
  look: HeroLook,
): string {
  const def = driverSprite(getSprite(vehicleSprite), look);
  createSpriteTexture(textures, def);
  return def.id;
}
