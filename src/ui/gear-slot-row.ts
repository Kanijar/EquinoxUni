import type Phaser from 'phaser';
import { BACKPACK_VIEW, FONT } from '../config/game-config';
import type { GearSlot, ItemDef } from '../data/types';
import { TEXT } from '../i18n/text';
import { ItemTile } from './item-tile';
import { addLabel } from './title-text';

// Reppunäkymän varustepaikka (käsi, vartalo, koru): rivi, jossa on käytössä olevan
// varusteen kuva, paikan nimi ja varusteen nimi. Rivin napautus valitsee varusteen.

const NAME_OFFSET_Y = 7;
const EMPTY_ALPHA = 0.5;

export class GearSlotRow {
  private readonly tile: ItemTile;
  private readonly nameText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, slot: GearSlot, y: number, onTap: () => void) {
    const { slotX, slotTextX, slotRowWidth, tileSize } = BACKPACK_VIEW;
    const left = slotX - tileSize / 2;
    this.tile = new ItemTile(scene, { left, y, width: slotRowWidth, onTap });
    addLabel(scene, {
      x: slotTextX,
      y: y - NAME_OFFSET_Y,
      text: TEXT.backpack.slots[slot],
      size: FONT.small,
    });
    this.nameText = addLabel(scene, { x: slotTextX, y: y + NAME_OFFSET_Y, text: '' });
  }

  /** Näyttää paikan varusteen (null = paikka on tyhjä). */
  update(item: ItemDef | null, selected: boolean): void {
    this.tile.setItem(item?.sprite ?? null);
    this.tile.setSelected(selected);
    this.nameText.setText(item ? TEXT.names.item(item) : TEXT.backpack.emptySlot);
    this.nameText.setAlpha(item ? 1 : EMPTY_ALPHA);
  }
}
