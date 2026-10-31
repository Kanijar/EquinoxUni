import type Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, WORLD_VIEW } from '../config/game-config';
import { TEXT } from '../i18n/fi';
import { TextButton } from './text-button';

// TALLENNA-nappi kartan oikeassa alakulmassa KYKYPISTEET-napin yläpuolella.
// Näkyy vain paikkakunnassa, ja napista avautuu tallennusnäkymä.

export class SaveButton {
  private readonly button: TextButton;

  constructor(scene: Phaser.Scene, onTap: () => void) {
    const { width, height, gap } = WORLD_VIEW.saveButton;
    const below = WORLD_VIEW.skillButton;
    this.button = new TextButton(scene, {
      x: GAME_WIDTH - below.margin - width / 2,
      y: GAME_HEIGHT - below.margin - below.height - gap - height / 2,
      width,
      height,
      label: TEXT.saves.save,
      onTap,
    });
    this.button.setVisible(false);
  }

  update(inTown: boolean): void {
    this.button.setVisible(inTown);
  }
}
