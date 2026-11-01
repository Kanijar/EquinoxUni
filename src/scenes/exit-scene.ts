import Phaser from 'phaser';
import { BUTTON, GAME_HEIGHT, GAME_WIDTH, MENU_VIEW, SCENES } from '../config/game-config';
import { TEXT } from '../i18n/text';
import { TextButton } from '../ui/text-button';
import { addLabel, addTitle } from '../ui/title-text';

// LÄHDE-napin jälkeen: poistutaan koko näytön tilasta ja yritetään sulkea ikkuna.
// Selain sallii sulkemisen vain ikkunalle, jonka sivu on itse avannut, joten
// tavallisessa välilehdessä näytetään hyvästit ja ohje sulkea välilehti itse.

export class ExitScene extends Phaser.Scene {
  constructor() {
    super(SCENES.exit);
  }

  create(): void {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
    }
    this.sound.stopAll();
    window.close();
    addTitle(this, GAME_HEIGHT * 0.3, TEXT.exit.title);
    addLabel(this, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT * 0.48,
      text: TEXT.exit.hint,
      originX: 0.5,
    });
    new TextButton(this, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT * 0.72,
      width: MENU_VIEW.buttonWidth,
      height: BUTTON.height,
      label: TEXT.exit.back,
      onTap: () => this.scene.start(SCENES.menu),
    });
  }
}
