import type Phaser from 'phaser';
import { WORLD_VIEW } from '../config/game-config';
import { TEXT } from '../i18n/text';
import { cornerButton } from './corner-stack';
import { TextButton } from './text-button';

// Kulkuneuvonappi kartan alareunassa REPPU-napin vasemmalla puolella (peukalon alla):
// BUGATTI (auto päälle tai pois, sama kuin E), rannalla VENEESEEN ja merellä MAIHIN
// (sama kuin V). Teksti tulee systems/vehicle-control.ts:stä. Kun auto on päällä tai sankari
// on veneessä, napilla on keltainen reunus.

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

  /** label = napin teksti, tai null, jolloin nappi on piilossa. */
  update(label: string | null, selected: boolean): void {
    this.button.setVisible(label !== null);
    if (label !== null) {
      this.button.setLabel(label);
      this.button.setSelected(selected);
    }
  }
}
