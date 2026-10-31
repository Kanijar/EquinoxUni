import type Phaser from 'phaser';
import { BUTTON, SETTINGS_VIEW } from '../config/game-config';
import { TEXT } from '../i18n/fi';
import { TextButton } from './text-button';
import { addLabel } from './title-text';

// Asetusnäkymän säätörivi: nimi, [-] arvo [+].

export interface SettingRowOptions {
  readonly y: number;
  readonly label: string;
  readonly onStep: (direction: 1 | -1) => void;
}

export class SettingRow {
  private readonly value: Phaser.GameObjects.Text;
  private readonly less: TextButton;
  private readonly more: TextButton;

  constructor(scene: Phaser.Scene, options: SettingRowOptions) {
    const { y } = options;
    const { labelX, lessX, moreX, stepButtonWidth } = SETTINGS_VIEW;
    addLabel(scene, { x: labelX, y, text: options.label });
    this.value = addLabel(scene, { x: (lessX + moreX) / 2, y, text: '', originX: 0.5 });
    const button = (x: number, label: string, direction: 1 | -1): TextButton =>
      new TextButton(scene, {
        x,
        y,
        width: stepButtonWidth,
        height: BUTTON.height,
        label,
        onTap: () => options.onStep(direction),
      });
    this.less = button(lessX, TEXT.settings.less, -1);
    this.more = button(moreX, TEXT.settings.more, 1);
  }

  update(text: string, canLess: boolean, canMore: boolean): void {
    this.value.setText(text);
    this.less.setEnabled(canLess);
    this.more.setEnabled(canMore);
  }
}
