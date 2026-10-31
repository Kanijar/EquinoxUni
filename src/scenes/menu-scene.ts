import Phaser from 'phaser';
import { COLORS, FONT, GAME_HEIGHT, GAME_WIDTH, SCENES } from '../config/game-config';
import { TEXT } from '../i18n/fi';
import { enterFullscreenLandscape } from '../systems/fullscreen';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENES.menu);
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    this.add
      .text(cx, GAME_HEIGHT * 0.35, TEXT.gameTitle, {
        fontFamily: FONT.family,
        fontSize: FONT.large,
        color: COLORS.text,
      })
      .setOrigin(0.5)
      .setShadow(2, 2, COLORS.textShadow);
    const hint = this.add
      .text(cx, GAME_HEIGHT * 0.65, TEXT.menu.hint, {
        fontFamily: FONT.family,
        fontSize: FONT.medium,
        color: COLORS.text,
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: hint, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });
    this.input.once(Phaser.Input.Events.POINTER_UP, () => {
      enterFullscreenLandscape(this);
      this.scene.start(SCENES.game);
    });
  }
}
