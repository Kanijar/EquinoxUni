import type Phaser from 'phaser';
import { WORLD_VIEW } from '../config/game-config';
import { TEXT } from '../i18n/fi';
import { cornerButton } from './corner-stack';
import { TextButton } from './text-button';

// KYKYPISTEET-nappi kartan oikeassa alakulmassa REPPU-napin yläpuolella. Näkyy vain
// paikkakunnassa, ja napista avautuu kykypistenäkymä.

export class SkillButton {
  private readonly button: TextButton;

  constructor(scene: Phaser.Scene, onTap: () => void) {
    this.button = new TextButton(scene, cornerButton(1, WORLD_VIEW.skillButton.width, '', onTap));
    this.button.setVisible(false);
  }

  update(inTown: boolean, points: number): void {
    this.button.setVisible(inTown);
    this.button.setLabel(TEXT.skills.button(points));
  }
}
