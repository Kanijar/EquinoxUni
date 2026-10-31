import type Phaser from 'phaser';
import { COLORS, FONT, GAME_WIDTH } from '../config/game-config';

// Näkymän otsikko ja muut tekstit samalla tyylillä.

export function addTitle(scene: Phaser.Scene, y: number, text: string): Phaser.GameObjects.Text {
  return scene.add
    .text(GAME_WIDTH / 2, y, text, {
      fontFamily: FONT.family,
      fontSize: FONT.large,
      color: COLORS.text,
    })
    .setOrigin(0.5)
    .setShadow(2, 2, COLORS.textShadow);
}

export interface LabelOptions {
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly size?: string;
  readonly originX?: number;
}

export function addLabel(scene: Phaser.Scene, options: LabelOptions): Phaser.GameObjects.Text {
  return scene.add
    .text(options.x, options.y, options.text, {
      fontFamily: FONT.family,
      fontSize: options.size ?? FONT.medium,
      color: COLORS.text,
    })
    .setOrigin(options.originX ?? 0, 0.5);
}
