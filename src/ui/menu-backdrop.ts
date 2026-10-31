import type Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, MENU_VIEW, TILE_SIZE } from '../config/game-config';
import { PLAYER } from '../data/player';

// Alkuruudun pixelart-tausta: metsää ja peltoa ruudun alareunassa,
// sankari vasemmalla ja viholliset oikealla. Hahmot keinuvat hiljaa.
// Palauttaa vihollishahmot tunnisteittain (esim. susi, jota voi napauttaa).

const GROUND_TILES = ['tile-forest', 'tile-field'] as const;

export interface MenuCharacters {
  readonly slime: Phaser.GameObjects.Image;
  readonly wolf: Phaser.GameObjects.Image;
}

export function drawMenuBackdrop(scene: Phaser.Scene): MenuCharacters {
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
  const [slimeX, wolfX] = MENU_VIEW.enemyXs;
  return {
    slime: addCharacter(scene, slimeX, feetY, 'slime'),
    wolf: addCharacter(scene, wolfX, feetY, 'wolf'),
  };
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
