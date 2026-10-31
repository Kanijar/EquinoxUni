import type Phaser from 'phaser';
import { COLORS, FONT, GAME_WIDTH, WORLD_VIEW } from '../config/game-config';

// Lyhyt ilmoitus ruudun yläosassa (esim. "Lepäsit Tampereella").

const TOAST_Y = 44;
const FADE_MS = 400;

export class Toast {
  private readonly text: Phaser.GameObjects.Text;

  constructor(private readonly scene: Phaser.Scene) {
    this.text = scene.add
      .text(GAME_WIDTH / 2, TOAST_Y, '', {
        fontFamily: FONT.family,
        fontSize: FONT.medium,
        color: COLORS.text,
        align: 'center',
      })
      .setOrigin(0.5)
      .setStroke(COLORS.textShadow, 4)
      .setScrollFactor(0)
      .setDepth(950)
      .setAlpha(0);
  }

  show(message: string): void {
    this.scene.tweens.killTweensOf(this.text);
    this.text.setText(message).setAlpha(1);
    this.scene.tweens.add({
      targets: this.text,
      alpha: 0,
      delay: WORLD_VIEW.toastMs,
      duration: FADE_MS,
    });
  }
}
