import type Phaser from 'phaser';
import { WORLD_VIEW } from '../config/game-config';
import { TEXT } from '../i18n/text';
import { cornerButton } from './corner-stack';
import { TextButton } from './text-button';

// BUGATTI-nappi kartan alareunassa REPPU-napin vasemmalla puolella (peukalon alla).
// Näkyy vain, kun Bugattin avaimet ovat repussa. Napautus kytkee auton päälle tai pois
// (sama kuin E-näppäin). Kun auto on päällä, napilla on keltainen reunus.

export class DriveButton {
  private readonly button: TextButton;

  constructor(scene: Phaser.Scene, onTap: () => void) {
    const { cornerButtons, backpackButton, driveButton } = WORLD_VIEW;
    const options = cornerButton(0, driveButton.width, TEXT.vehicle.button, onTap);
    // Oikea reuna REPPU-napin vasemman reunan viereen.
    const x = options.x - backpackButton.width - cornerButtons.gap;
    this.button = new TextButton(scene, { ...options, x });
    this.button.setVisible(false);
  }

  update(owned: boolean, driving: boolean): void {
    this.button.setVisible(owned);
    this.button.setSelected(driving);
  }
}
