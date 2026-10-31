import Phaser from 'phaser';
import { COLORS, FONT } from '../config/game-config';
import { playSound } from '../systems/sound-fx';

// Suorakulmainen kosketusnappi tekstillä (esim. taistelun HYÖKKÄÄ).
// onTap kutsutaan, kun sormi nostetaan napin päältä. Napautus soittaa äänen.

export interface TextButtonOptions {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly label: string;
  readonly onTap: () => void;
}

const DISABLED_ALPHA = 0.4;

export class TextButton {
  private readonly box: Phaser.GameObjects.Rectangle;
  private readonly text: Phaser.GameObjects.Text;
  private enabled = true;

  constructor(scene: Phaser.Scene, options: TextButtonOptions) {
    this.box = scene.add
      .rectangle(options.x, options.y, options.width, options.height, COLORS.button)
      .setStrokeStyle(2, COLORS.panelBorder)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive();
    this.text = scene.add
      .text(options.x, options.y, options.label, {
        fontFamily: FONT.family,
        fontSize: FONT.medium,
        color: COLORS.text,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1001);
    this.box.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => this.setPressed(true));
    this.box.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => this.setPressed(false));
    this.box.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      this.setPressed(false);
      if (this.enabled) {
        playSound('tap');
        options.onTap();
      }
    });
  }

  setLabel(label: string): void {
    this.text.setText(label);
  }

  setVisible(visible: boolean): void {
    this.box.setVisible(visible);
    this.text.setVisible(visible);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.box.setAlpha(enabled ? 1 : DISABLED_ALPHA);
    this.text.setAlpha(enabled ? 1 : DISABLED_ALPHA);
  }

  private setPressed(pressed: boolean): void {
    this.box.setFillStyle(pressed && this.enabled ? COLORS.buttonPressed : COLORS.button);
  }
}
