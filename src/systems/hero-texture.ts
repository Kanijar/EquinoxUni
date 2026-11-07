import type Phaser from 'phaser';
import { getSprite } from '../data';
import type { HeroLook } from '../data/types';
import { driverSprite, heroSprite, type HeroAppearance } from '../logic/hero-look';
import { createSpriteTexture } from './sprite-textures';

// Sankarin tekstuuri pelaajan valitsemalla ulkonäöllä (logic/hero-look.ts).
// Tekstuuri piirretään ensimmäisellä kerralla, ja sama ulkonäkö käyttää samaa avainta,
// joten kartta, taistelu ja voittoruutu jakavat yhden pienen kuvan.

type Look = Pick<HeroAppearance, 'look' | 'eyeColor'>;

/** Sankarin tekstuurin avain (kartta, taistelu, voittoruutu, hahmonluonti). */
export function heroTexture(textures: Phaser.Textures.TextureManager, hero: Look): string {
  const def = heroSprite(hero.look, hero.eyeColor);
  createSpriteTexture(textures, def);
  return def.id;
}

/** Kulkuneuvon tekstuuri (esim. Bugatti), jonka kuskilla on sankarin hiukset ja iho. */
export function driverTexture(
  textures: Phaser.Textures.TextureManager,
  vehicleSprite: string,
  look: HeroLook,
): string {
  const def = driverSprite(getSprite(vehicleSprite), look);
  createSpriteTexture(textures, def);
  return def.id;
}
