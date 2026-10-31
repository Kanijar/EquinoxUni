import type Phaser from 'phaser';
import type { SpriteDef } from '../data/types';

// Muuttaa data/sprites.ts:n merkkiruudukot Phaserin tekstuureiksi.
// Kun oikeat PNG-kuvat tulevat, ne ladataan BootScenessä samoilla avaimilla.

export function createSpriteTexture(
  textures: Phaser.Textures.TextureManager,
  def: SpriteDef,
): void {
  if (textures.exists(def.id)) {
    return;
  }
  const width = def.rows[0]?.length ?? 0;
  const canvas = textures.createCanvas(def.id, width, def.rows.length);
  if (!canvas) {
    throw new Error(`Tekstuurin luonti epäonnistui: ${def.id}`);
  }
  const ctx = canvas.getContext();
  def.rows.forEach((row, y) => {
    [...row].forEach((char, x) => {
      const color = def.palette[char];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    });
  });
  canvas.refresh();
}
