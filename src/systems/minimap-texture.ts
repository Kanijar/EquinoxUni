import type Phaser from 'phaser';
import { WORLD } from '../data';
import { MINIMAP_TERRAIN_COLORS } from '../data/minimap';
import { isHiddenIsle, minimapTerrain, type MinimapSize } from '../logic/minimap';
import type { GameState } from '../logic/game-state';
import { getWorldGrid } from './world-map';

// Piirtää minikartan maaston tekstuuriksi: yksi pikseli = yksi minikartan piste
// (logic/minimap.ts valitsee maaston, data/minimap.ts antaa värit). Sama tekstuuri piirretään
// uudelleen samalla avaimella, kun kartta muuttuu (löydetty saari, nousseet rappuset).

const OPAQUE = 255;

export function paintMinimapTexture(
  textures: Phaser.Textures.TextureManager,
  key: string,
  size: MinimapSize,
  state: Pick<GameState, 'isles'>,
): void {
  const found = [...state.isles];
  const cells = minimapTerrain(getWorldGrid(), size, (tile) => isHiddenIsle(WORLD, found, tile));
  const canvas = textures.exists(key)
    ? (textures.get(key) as Phaser.Textures.CanvasTexture)
    : textures.createCanvas(key, size.width, size.height);
  if (!canvas) {
    throw new Error(`Minikartan tekstuurin luonti epäonnistui: ${key}`);
  }
  const context = canvas.getContext();
  const image = context.createImageData(size.width, size.height);
  cells.flat().forEach((terrain, index) => {
    const color = MINIMAP_TERRAIN_COLORS[terrain];
    image.data.set([(color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff, OPAQUE], index * 4);
  });
  context.putImageData(image, 0, 0);
  canvas.refresh();
}
