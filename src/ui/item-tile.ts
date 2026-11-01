import Phaser from 'phaser';
import { BACKPACK_VIEW, COLORS, FONT } from '../config/game-config';
import { TEXT } from '../i18n/text';
import { playSound } from '../systems/sound-fx';

// Repun kosketettava ruutu: esineen pikselikuva ja määrä (×3). Valittu ruutu saa
// keltaisen reunuksen. Leveämpi ruutu toimii varustepaikan rivinä (kuva vasemmassa reunassa).

export interface ItemTileOptions {
  /** Ruudun vasen reuna. */
  readonly left: number;
  /** Ruudun keskikohta pystysuunnassa. */
  readonly y: number;
  readonly width: number;
  readonly onTap: () => void;
}

const BORDER = 1;
const SELECTED_BORDER = 2;
const COUNT_INSET = 2;

export class ItemTile {
  private readonly box: Phaser.GameObjects.Rectangle;
  private readonly icon: Phaser.GameObjects.Image;
  private readonly countText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, options: ItemTileOptions) {
    const { left, y, width } = options;
    const size = BACKPACK_VIEW.tileSize;
    this.box = scene.add
      .rectangle(left + width / 2, y, width, size, COLORS.slotPanel)
      .setStrokeStyle(BORDER, COLORS.panelBorder)
      .setInteractive();
    this.icon = scene.add
      .image(left + size / 2, y, '__DEFAULT')
      .setScale(BACKPACK_VIEW.iconScale)
      .setVisible(false);
    this.countText = scene.add
      .text(left + size - COUNT_INSET, y + size / 2 - COUNT_INSET, '', {
        fontFamily: FONT.family,
        fontSize: FONT.small,
        color: COLORS.text,
      })
      .setOrigin(1, 1)
      .setStroke(COLORS.textShadow, 3);
    this.box.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      playSound('tap');
      options.onTap();
    });
  }

  /** Näyttää esineen kuvan (tai tyhjän ruudun, kun sprite on null) ja määrän, jos niitä on monta. */
  setItem(sprite: string | null, count = 1): void {
    if (sprite !== null) {
      this.icon.setTexture(sprite);
    }
    this.icon.setVisible(sprite !== null);
    this.countText.setText(sprite !== null && count > 1 ? TEXT.backpack.count(count) : '');
  }

  setSelected(selected: boolean): void {
    this.box.setStrokeStyle(
      selected ? SELECTED_BORDER : BORDER,
      selected ? COLORS.selected : COLORS.panelBorder,
    );
  }

  setVisible(visible: boolean): void {
    for (const part of [this.box, this.countText]) {
      part.setVisible(visible);
    }
    this.icon.setVisible(visible && this.icon.visible);
  }
}
