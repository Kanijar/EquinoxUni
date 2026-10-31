import type Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, MENU_VIEW, TILE_SIZE } from '../config/game-config';
import { PLAYER } from '../data/player';

// Alkuruudun pixelart-tausta: metsää ja peltoa ruudun alareunassa,
// sankari vasemmalla ja viholliset oikealla. Hahmot keinuvat hiljaa.

const GROUND_TILES = ['tile-forest', 'tile-field'] as const;
const ENEMY_SPRITES = ['slime', 'wolf'] as const;

export function drawMenuBackdrop(scene: Phaser.Scene): void {
  const tile = TILE_SIZE * MENU_VIEW.groundScale;
  const groundTop = GAME_HEIGHT - tile * GROUND_TILES.length;
  GROUND_TILES.forEach((key, row) => {
    for (let x = 0; x < GAME_WIDTH; x += tile) {
      scene.add
        .image(x, groundTop + row * tile, key)
        .setOrigin(0)
        .setScale(MENU_VIEW.groundScale);
    }
  });
  const feetY = groundTop + tile / 2;
  addCharacter(scene, MENU_VIEW.heroX, feetY, PLAYER.sprite);
  ENEMY_SPRITES.forEach((key, index) => {
    const x = MENU_VIEW.enemyXs[index] ?? GAME_WIDTH;
    addCharacter(scene, x, feetY, key);
  });
}

function addCharacter(
  scene: Phaser.Scene,
  x: number,
  feetY: number,
  key: string,
): Phaser.GameObjects.Image {
  const image = scene.add.image(x, feetY, key).setOrigin(0.5, 1).setScale(MENU_VIEW.characterScale);
  scene.tweens.add({
    targets: image,
    y: feetY - MENU_VIEW.bobPx,
    duration: MENU_VIEW.bobMs,
    yoyo: true,
    repeat: -1,
    delay: x,
  });
  return image;
}
