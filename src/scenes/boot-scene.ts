import Phaser from 'phaser';
import { SCENES } from '../config/game-config';
import { SPRITES } from '../data';
import { initSettings } from '../systems/game-settings';
import { createSpriteTexture } from '../systems/sprite-textures';
import { createWorldTileset } from '../systems/world-map';

// Ensimmäinen scene: lataa/luo grafiikat, ottaa tallennetut asetukset käyttöön
// ja siirtyy alkuruutuun.
// Oikeat kuvat ladataan myöhemmin preload()-metodissa: this.load.image('hero', 'assets/hero.png').

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.boot);
  }

  create(): void {
    for (const sprite of SPRITES) {
      createSpriteTexture(this.textures, sprite);
    }
    createWorldTileset(this.textures);
    initSettings(this.game);
    this.scene.start(SCENES.menu);
  }
}
