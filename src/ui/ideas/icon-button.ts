import type Phaser from 'phaser';
import { IDEAS_VIEW } from '../../config/ideas-view';
import { TextButton } from '../text-button';

// Pieni nappi, jossa on ikoni (sydän tai puhekupla) ja luku: tykkäykset tai kommentit.
// Ikoni on napin vasemmalla puolella ja luku oikealla.

/** Ikoni napin päällä (TextButton on syvyydellä 1000–1001). */
const ICON_DEPTH = 1002;

export class IconButton {
  private readonly button: TextButton;
  private readonly icon: Phaser.GameObjects.Image;

  constructor(
    scene: Phaser.Scene,
    at: { x: number; y: number; sprite: string },
    onTap: () => void,
  ) {
    this.button = new TextButton(scene, {
      x: at.x,
      y: at.y,
      width: IDEAS_VIEW.iconButtonWidth,
      height: IDEAS_VIEW.buttonHeight,
      label: '',
      onTap,
    });
    this.icon = scene.add
      .image(at.x - IDEAS_VIEW.iconOffsetX, at.y, at.sprite)
      .setScale(IDEAS_VIEW.iconScale)
      .setDepth(ICON_DEPTH);
  }

  /** Luku ikonin oikealla puolella. selected = oma tykkäys (keltainen reunus). */
  show(count: number, selected: boolean): void {
    // Välilyönnit siirtävät keskitetyn luvun ikonin oikealle puolelle.
    this.button.setLabel(`   ${count}`);
    this.button.setSelected(selected);
  }

  setVisible(visible: boolean): void {
    this.button.setVisible(visible);
    this.icon.setVisible(visible);
  }

  setEnabled(enabled: boolean): void {
    this.button.setEnabled(enabled);
  }
}
