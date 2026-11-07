import type Phaser from 'phaser';
import { WORLD_VIEW } from '../config/game-config';
import { FISHING_VIEW } from '../config/fishing-config';
import { SHOP_BUTTON } from '../config/shop-config';
import { TEXT } from '../i18n/text';
import { cornerButton } from './corner-stack';
import { TextButton } from './text-button';

// KALASTA-nappi kartan alarivissä (peukalon alla): REPPU-napin vasemmalla, ja jos BUGATTI-
// tai KAUPPA-nappi näkyy, niiden vasemmalla. Näkyy, kun sankarilla on onki ja hän seisoo veden
// vieressä. Kun koho on vedessä, nappi on NYKÄISE, ja kun kala nappaa, NYKÄISE! keltaisella
// reunuksella.

/** Mitä nappi näyttää: KALASTA, NYKÄISE (odotetaan) tai NYKÄISE! (kala nappaa). */
export type FishButtonMode = 'fish' | 'reel' | 'bite';

/** Mitkä muut alarivin napit näkyvät (KALASTA siirtyy niiden vasemmalle). */
export interface BottomRow {
  readonly driveShown: boolean;
  readonly shopShown: boolean;
}

export class FishButton {
  private readonly button: TextButton;
  private readonly rightEdge: number;

  constructor(scene: Phaser.Scene, onTap: () => void) {
    const { buttonWidth } = FISHING_VIEW;
    const options = cornerButton(0, buttonWidth, TEXT.fishing.button, onTap);
    const { backpackButton, cornerButtons } = WORLD_VIEW;
    this.rightEdge = options.x + buttonWidth / 2 - backpackButton.width - cornerButtons.gap;
    this.button = new TextButton(scene, options);
    this.button.setVisible(false);
  }

  update(mode: FishButtonMode | null, row: BottomRow): void {
    this.button.setVisible(mode !== null);
    if (mode === null) {
      return;
    }
    const { cornerButtons, driveButton } = WORLD_VIEW;
    const gap = cornerButtons.gap;
    const drive = row.driveShown ? driveButton.width + gap : 0;
    const shop = row.shopShown ? SHOP_BUTTON.width + gap : 0;
    this.button.setX(this.rightEdge - drive - shop - FISHING_VIEW.buttonWidth / 2);
    const labels = { fish: TEXT.fishing.button, reel: TEXT.fishing.reel, bite: TEXT.fishing.bite };
    this.button.setLabel(labels[mode]);
    this.button.setSelected(mode === 'bite');
  }
}
