import type Phaser from 'phaser';
import { COLORS, FONT } from '../config/game-config';
import { HOUSE_MAP } from '../config/house-config';
import { HOUSE } from '../data/house';
import { TEXT } from '../i18n/text';
import { atHouseDoor } from '../logic/house';
import type { Vec2 } from '../logic/vector';
import { pointTile } from '../logic/world-grid';
import { cornerButton } from '../ui/corner-stack';
import { TextButton } from '../ui/text-button';
import { tileToWorld } from './world-map';

// Sankarin talo Kotirannan laidalla (data/house.ts). Kun sankari on talon ovella, oikeaan
// alakulmaan tulee TALO-nappi, josta talo ja sen 10 parhaan lista avautuvat
// (scenes/house-scene.ts).

export class HouseDoor {
  private readonly button: TextButton;
  private near = false;

  constructor(scene: Phaser.Scene, onOpen: () => void) {
    const pos = tileToWorld(pointTile(HOUSE));
    const { depth, scale, labelOffsetY } = HOUSE_MAP;
    scene.add.image(pos.x, pos.y, 'hero-house').setDepth(depth).setScale(scale);
    scene.add
      .text(pos.x, pos.y + labelOffsetY, TEXT.house.mapLabel, {
        fontFamily: FONT.family,
        fontSize: FONT.small,
        color: COLORS.notice,
      })
      .setOrigin(0.5, 0)
      .setStroke(COLORS.textShadow, 3)
      .setDepth(depth);
    const { buttonStackIndex, buttonWidth } = HOUSE_MAP;
    const options = cornerButton(buttonStackIndex, buttonWidth, TEXT.house.button, () => {
      if (this.near) {
        onOpen();
      }
    });
    this.button = new TextButton(scene, options);
    this.button.setVisible(false);
  }

  /** tile = sankarin ruutu. */
  update(tile: Vec2): void {
    this.near = atHouseDoor(tile);
    this.button.setVisible(this.near);
  }
}
