import type Phaser from 'phaser';
import { WORLD_VIEW } from '../config/game-config';
import { TEXT } from '../i18n/fi';
import { cornerButton } from './corner-stack';
import { TextButton } from './text-button';

// TALLENNA-nappi kartan oikeassa alakulmassa KYKYPISTEET-napin yläpuolella.
// Näkyy vain paikkakunnassa, ja napista avautuu tallennusnäkymä.

export class SaveButton {
  private readonly button: TextButton;

  constructor(scene: Phaser.Scene, onTap: () => void) {
    const options = cornerButton(2, WORLD_VIEW.saveButton.width, TEXT.saves.save, onTap);
    this.button = new TextButton(scene, options);
    this.button.setVisible(false);
  }

  update(inTown: boolean): void {
    this.button.setVisible(inTown);
  }
}
