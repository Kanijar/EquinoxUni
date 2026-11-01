import type Phaser from 'phaser';
import { BACKPACK_VIEW, COLORS, FONT, GAME_WIDTH } from '../config/game-config';
import { TextButton } from './text-button';
import { addLabel } from './title-text';

// Reppunäkymän alareuna: valitun esineen nimi, kuvaus ja lisäykset sekä toimintonappi
// (LAITA KÄYTTÖÖN, OTA POIS tai JUO). Kun mitään ei ole valittu, näkyy vihje.

export interface ItemInfoContent {
  readonly name: string;
  readonly text: string;
  /** Varusteen lisäykset tai muu lisätieto (keltaisella). */
  readonly detail: string;
  /** Napin teksti, tai null, kun nappia ei näytetä. */
  readonly action: string | null;
  readonly actionEnabled: boolean;
}

export class ItemInfo {
  private readonly name: Phaser.GameObjects.Text;
  private readonly text: Phaser.GameObjects.Text;
  private readonly detail: Phaser.GameObjects.Text;
  private readonly button: TextButton;

  constructor(scene: Phaser.Scene, onAction: () => void) {
    const { infoX, infoNameY, infoTextY, infoBonusY, margin } = BACKPACK_VIEW;
    const { actionButtonWidth, actionButtonY, tileSize } = BACKPACK_VIEW;
    this.name = addLabel(scene, { x: infoX, y: infoNameY, text: '' });
    this.text = addLabel(scene, { x: infoX, y: infoTextY, text: '', size: FONT.small });
    this.detail = addLabel(scene, { x: infoX, y: infoBonusY, text: '', size: FONT.small });
    this.detail.setColor(COLORS.notice);
    this.button = new TextButton(scene, {
      x: GAME_WIDTH - margin - actionButtonWidth / 2,
      y: actionButtonY,
      width: actionButtonWidth,
      height: tileSize,
      label: '',
      onTap: onAction,
    });
  }

  update(content: ItemInfoContent): void {
    this.name.setText(content.name);
    this.text.setText(content.text);
    this.detail.setText(content.detail);
    this.button.setVisible(content.action !== null);
    this.button.setLabel(content.action ?? '');
    this.button.setEnabled(content.actionEnabled);
  }
}
