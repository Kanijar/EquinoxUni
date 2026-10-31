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
  drawSprite(canvas.getContext(), def, 0);
  canvas.refresh();
}

/** Kokoaa monta spriteä vierekkäin yhdeksi kuvaksi (esim. karttaruudut tilemapille). */
export function createStripTexture(
  textures: Phaser.Textures.TextureManager,
  key: string,
  defs: readonly SpriteDef[],
): void {
  if (textures.exists(key)) {
    return;
  }
  const size = defs[0]?.rows.length ?? 0;
  const canvas = textures.createCanvas(key, size * defs.length, size);
  if (!canvas) {
    throw new Error(`Tekstuurin luonti epäonnistui: ${key}`);
  }
  defs.forEach((def, index) => drawSprite(canvas.getContext(), def, index * size));
  canvas.refresh();
}

function drawSprite(ctx: CanvasRenderingContext2D, def: SpriteDef, offsetX: number): void {
  def.rows.forEach((row, y) => {
    [...row].forEach((char, x) => {
      const color = def.palette[char];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(offsetX + x, y, 1, 1);
      }
    });
  });
}
