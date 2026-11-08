import type Phaser from 'phaser';
import { COLORS, FONT, GAME_WIDTH, WORLD_VIEW } from '../config/game-config';

// Lyhyt ilmoitus ruudun yläosassa (esim. "Lepäsit Kuuselassa").

const TOAST_Y = 44;
const FADE_MS = 400;

/** Paikka ja tausta muualla kuin kartalla (esim. ideanäkymä, jossa ylhäällä on nappeja). */
export interface ToastOptions {
  readonly y?: number;
  /** Tumma tausta tekstin alle, kun ilmoitus on muiden osien päällä. */
  readonly background?: string;
}

/** Ilmoitus on kartan ja HUDin yllä. Taustallinen ilmoitus on myös nappien (1000–1002) yllä. */
const DEPTH = 950;
const DEPTH_ABOVE_BUTTONS = 1100;
const PADDING = 6;

export class Toast {
  private readonly text: Phaser.GameObjects.Text;

  constructor(
    private readonly scene: Phaser.Scene,
    options: ToastOptions = {},
  ) {
    this.text = scene.add
      .text(GAME_WIDTH / 2, options.y ?? TOAST_Y, '', {
        fontFamily: FONT.family,
        fontSize: FONT.medium,
        color: COLORS.text,
        align: 'center',
      })
      .setOrigin(0.5)
      .setStroke(COLORS.textShadow, 4)
      .setScrollFactor(0)
      .setDepth(options.background ? DEPTH_ABOVE_BUTTONS : DEPTH)
      .setAlpha(0);
    if (options.background) {
      this.text.setBackgroundColor(options.background).setPadding(PADDING);
    }
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
