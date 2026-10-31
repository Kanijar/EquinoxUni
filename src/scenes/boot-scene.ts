import Phaser from 'phaser';
import { SCENES } from '../config/game-config';
import { SPRITES } from '../data';
import { createSpriteTexture } from '../systems/sprite-textures';

// Ensimmäinen scene: lataa/luo grafiikat ja siirtyy valikkoon.
// Oikeat kuvat ladataan myöhemmin preload()-metodissa: this.load.image('hero', 'assets/hero.png').

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.boot);
  }

  create(): void {
    for (const sprite of SPRITES) {
      createSpriteTexture(this.textures, sprite);
    }
    this.scene.start(SCENES.menu);
  }
}
