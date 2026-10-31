import Phaser from 'phaser';
import { ACTION_BUTTON, PIXEL_PANEL } from '../../config/battle-config';
import { COLORS, FONT } from '../../config/game-config';
import { playSound } from '../../systems/sound-fx';
import { drawPixelPanel } from './pixel-panel';

// Taistelun toimintonappi: pikselipaneeli, ikoni, teksti ja toiminnon korosteväri
// alareunassa. Painettaessa nappi painuu alas. Sama käyttö kuin TextButtonilla.

export type ActionKind = keyof typeof ACTION_BUTTON.icons;

export interface ActionButtonOptions {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly kind: ActionKind;
  readonly label: string;
  readonly onTap: () => void;
}

const DEPTH = 1000;
const DISABLED_ALPHA = 0.4;
const PRESSED_FILL = 0x2e4a7a;
const DISABLED_BORDER = 0x5a6078;

export class ActionButton {
  private readonly panel: Phaser.GameObjects.Graphics;
  private readonly icon: Phaser.GameObjects.Image;
  private readonly text: Phaser.GameObjects.Text;
  private readonly zone: Phaser.GameObjects.Zone;
  private enabled = true;
  private pressed = false;

  constructor(
    scene: Phaser.Scene,
    private readonly options: ActionButtonOptions,
  ) {
    const { x, y, width, height, kind } = options;
    this.panel = scene.add.graphics().setDepth(DEPTH);
    this.icon = scene.add
      .image(0, y, ACTION_BUTTON.icons[kind])
      .setScale(kind === 'item' ? 1 : ACTION_BUTTON.iconScale)
      .setDepth(DEPTH + 1);
    this.text = scene.add
      .text(0, y, options.label, {
        fontFamily: FONT.family,
        fontSize: FONT.medium,
        color: COLORS.text,
      })
      .setOrigin(0, 0.5)
      .setStroke(COLORS.textShadow, 3)
      .setDepth(DEPTH + 1);
    this.zone = scene.add.zone(x, y, width, height).setInteractive();
    this.zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => this.setPressed(true));
    this.zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => this.setPressed(false));
    this.zone.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      this.setPressed(false);
      if (this.enabled) {
        playSound('tap');
        options.onTap();
      }
    });
    this.layout();
  }

  setLabel(label: string): void {
    this.text.setText(label);
    this.layout();
  }

  setVisible(visible: boolean): void {
    for (const part of [this.panel, this.icon, this.text]) {
      part.setVisible(visible);
    }
    this.zone.setVisible(visible);
    if (this.zone.input) {
      this.zone.input.enabled = visible;
    }
  }

  /** Pois käytöstä oleva nappi pysyy peittävänä, mutta sen sisältö ja kehys himmenevät. */
  setEnabled(enabled: boolean): void {
    if (enabled === this.enabled) {
      return;
    }
    this.enabled = enabled;
    const alpha = enabled ? 1 : DISABLED_ALPHA;
    this.icon.setAlpha(alpha);
    this.text.setAlpha(alpha);
    this.layout();
  }

  private setPressed(pressed: boolean): void {
    this.pressed = pressed && this.enabled;
    this.layout();
  }

  /** Piirtää paneelin ja keskittää ikonin ja tekstin yhdessä napin keskelle. */
  private layout(): void {
    const { x, y, width, height, kind } = this.options;
    const offset = this.pressed ? ACTION_BUTTON.pressedOffsetPx : 0;
    this.panel.clear();
    drawPixelPanel(
      this.panel,
      { x: x - width / 2, y: y - height / 2 + offset, width, height },
      {
        fill: this.pressed ? PRESSED_FILL : PIXEL_PANEL.fill,
        border: this.enabled ? PIXEL_PANEL.border : DISABLED_BORDER,
        accent: this.enabled ? ACTION_BUTTON.accents[kind] : DISABLED_BORDER,
        accentHeight: ACTION_BUTTON.accentHeight,
      },
    );
    const contentWidth = this.icon.displayWidth + ACTION_BUTTON.iconGap + this.text.width;
    const left = x - contentWidth / 2;
    this.icon.setPosition(left + this.icon.displayWidth / 2, y + offset - 1);
    this.text.setPosition(left + this.icon.displayWidth + ACTION_BUTTON.iconGap, y + offset - 1);
  }
}
