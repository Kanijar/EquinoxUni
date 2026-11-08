import type Phaser from 'phaser';
import { COLORS, FONT } from '../config/game-config';
import { COMING_SOON_VIEW } from '../config/shop-config';
import { TEXT } from '../i18n/text';
import { addLabel } from './title-text';
import { TextButton } from './text-button';

// "???"-nappi kauppanäkymässä (scenes/shop-scene.ts), ja sen päällä keltainen teksti
// "Tulee pian peliin!". Vihje tulevista loitsuista Noidan kaupassa (data/cave.ts, comingSoon).
// Nappia voi napauttaa (se naksahtaa), mutta se ei vielä tee mitään.

export class ComingSoonButton {
  private readonly label: Phaser.GameObjects.Text;
  private readonly button: TextButton;

  constructor(scene: Phaser.Scene) {
    const { x, labelY, buttonY, width, height } = COMING_SOON_VIEW;
    this.label = addLabel(scene, {
      x,
      y: labelY,
      text: TEXT.cave.comingSoon,
      size: FONT.small,
      originX: 0.5,
    }).setColor(COLORS.notice);
    this.button = new TextButton(scene, {
      x,
      y: buttonY,
      width,
      height,
      label: TEXT.cave.mystery,
      onTap: () => undefined,
    });
  }

  setVisible(visible: boolean): void {
    this.label.setVisible(visible);
    this.button.setVisible(visible);
  }
}
