import Phaser from 'phaser';
import { HERO_VIEW } from '../config/hero-config';
import { COLORS } from '../config/game-config';
import { TEXT } from '../i18n/text';
import { TextButton } from './text-button';
import { addLabel } from './title-text';

// Hahmonluonnin valintarivi: osan nimi, [<] väriruutu tai numero [>].
// Väriosassa näkyy valittu väri, hiustyylissä järjestysnumero (esim. "2/5").

export interface LookRowOptions {
  readonly y: number;
  readonly label: string;
  readonly onStep: (direction: 1 | -1) => void;
}

export class LookRow {
  private readonly swatch: Phaser.GameObjects.Rectangle;
  private readonly value: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, options: LookRowOptions) {
    const { y } = options;
    const { rowLabelX, lessX, moreX, stepButtonWidth, stepButtonHeight, swatchSize } = HERO_VIEW;
    addLabel(scene, { x: rowLabelX, y, text: options.label });
    const middleX = (lessX + moreX) / 2;
    this.swatch = scene.add
      .rectangle(middleX, y, swatchSize, swatchSize, COLORS.panel)
      .setStrokeStyle(2, COLORS.panelBorder);
    this.value = addLabel(scene, { x: middleX, y, text: '', originX: 0.5 });
    const button = (x: number, label: string, direction: 1 | -1): TextButton =>
      new TextButton(scene, {
        x,
        y,
        width: stepButtonWidth,
        height: stepButtonHeight,
        label,
        onTap: () => options.onStep(direction),
      });
    button(lessX, TEXT.hero.previous, -1);
    button(moreX, TEXT.hero.next, 1);
  }

  /** Näyttää valitun värin (#rrggbb). */
  showColor(color: string): void {
    this.swatch.setVisible(true).setFillStyle(Phaser.Display.Color.HexStringToColor(color).color);
    this.value.setVisible(false);
  }

  /** Näyttää tekstin (esim. hiustyylin numero) väriruudun sijaan. */
  showText(text: string): void {
    this.swatch.setVisible(false);
    this.value.setVisible(true).setText(text);
  }
}
