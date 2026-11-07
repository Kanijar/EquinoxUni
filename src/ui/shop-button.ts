import type Phaser from 'phaser';
import { WORLD_VIEW } from '../config/game-config';
import { SHOP_BUTTON } from '../config/shop-config';
import { TEXT } from '../i18n/text';
import { cornerButton } from './corner-stack';
import { TextButton } from './text-button';

// KAUPPA-nappi kartan alareunassa REPPU-napin vasemmalla puolella (peukalon alla). Jos
// BUGATTI-nappi näkyy, KAUPPA siirtyy sen vasemmalle puolelle. Näkyy vain, kun sankari on
// kulkevan kauppiaan vieressä. Napista avautuu kauppa (scenes/shop-scene.ts).

export class ShopButton {
  private readonly backpackLeft: TextButton;
  private readonly driveLeft: TextButton;

  constructor(scene: Phaser.Scene, onTap: () => void) {
    const { cornerButtons, backpackButton, driveButton } = WORLD_VIEW;
    const options = cornerButton(0, SHOP_BUTTON.width, TEXT.shop.button, onTap);
    const nextToBackpack = options.x - backpackButton.width - cornerButtons.gap;
    const nextToDrive = nextToBackpack - driveButton.width - cornerButtons.gap;
    this.backpackLeft = new TextButton(scene, { ...options, x: nextToBackpack });
    this.driveLeft = new TextButton(scene, { ...options, x: nextToDrive });
    this.update(false, false);
  }

  /** near = sankari on kauppiaan vieressä, driveShown = BUGATTI-nappi näkyy. */
  update(near: boolean, driveShown: boolean): void {
    this.backpackLeft.setVisible(near && !driveShown);
    this.driveLeft.setVisible(near && driveShown);
  }
}
