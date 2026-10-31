import type Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, WORLD_VIEW } from '../config/game-config';
import { TEXT } from '../i18n/fi';
import { TextButton } from './text-button';

// KYKYPISTEET-nappi kartan oikeassa alakulmassa. Näkyy vain paikkakunnassa,
// ja napista avautuu kykypistenäkymä.

export class SkillButton {
  private readonly button: TextButton;

  constructor(scene: Phaser.Scene, onTap: () => void) {
    const { width, height, margin } = WORLD_VIEW.skillButton;
    this.button = new TextButton(scene, {
      x: GAME_WIDTH - margin - width / 2,
      y: GAME_HEIGHT - margin - height / 2,
      width,
      height,
      label: '',
      onTap,
    });
    this.button.setVisible(false);
  }

  update(inTown: boolean, points: number): void {
    this.button.setVisible(inTown);
    this.button.setLabel(TEXT.skills.button(points));
  }
}
