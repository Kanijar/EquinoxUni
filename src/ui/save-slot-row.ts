import type Phaser from 'phaser';
import { BUTTON, COLORS, FONT, GAME_WIDTH, SAVES_VIEW } from '../config/game-config';
import { TEXT } from '../i18n/text';
import type { SlotInfo } from '../logic/save-slots';
import { ConfirmButton } from './confirm-button';
import { addLabel } from './title-text';

// Tallennusnäkymän yksi paikka: nimi ja tiedot vasemmalla, napit oikealla.
// TALLENNA näkyy vain pelin aikana. Täyden paikan korvaus, poisto ja lataus
// kesken pelin kysyvät varmistuksen (VARMA?).

export interface SaveSlotRowOptions {
  readonly slot: number;
  readonly y: number;
  /** true = avattu pelin aikana, jolloin peliä voi tallentaa. */
  readonly inGame: boolean;
  readonly onSave: (slot: number) => void;
  readonly onLoad: (slot: number) => void;
  readonly onRemove: (slot: number) => void;
}

const LINE_OFFSET = 9;

export class SaveSlotRow {
  private readonly title: Phaser.GameObjects.Text;
  private readonly details: Phaser.GameObjects.Text;
  private readonly save: ConfirmButton;
  private readonly load: ConfirmButton;
  private readonly remove: ConfirmButton;
  private info: SlotInfo;

  constructor(scene: Phaser.Scene, options: SaveSlotRowOptions) {
    const { slot, y, inGame } = options;
    this.info = { slot, kind: 'empty' };
    const panelWidth = GAME_WIDTH - BUTTON.margin * 2;
    scene.add.rectangle(GAME_WIDTH / 2, y, panelWidth, SAVES_VIEW.rowHeight, COLORS.slotPanel);
    this.title = addLabel(scene, { x: SAVES_VIEW.textX, y: y - LINE_OFFSET, text: '' });
    this.details = addLabel(scene, {
      x: SAVES_VIEW.textX,
      y: y + LINE_OFFSET,
      text: '',
      size: FONT.small,
    });
    const { save, load, remove } = SAVES_VIEW.buttonWidths;
    const removeX = GAME_WIDTH - BUTTON.margin * 2 - remove / 2;
    const loadX = removeX - remove / 2 - BUTTON.margin - load / 2;
    const saveX = loadX - load / 2 - BUTTON.margin - save / 2;
    const button = (x: number, width: number, label: string) => ({
      x,
      y,
      width,
      height: BUTTON.height,
      label,
      confirmLabel: TEXT.saves.confirm,
    });
    this.save = new ConfirmButton(scene, {
      ...button(saveX, save, TEXT.saves.save),
      needsConfirm: () => this.info.kind !== 'empty',
      onConfirm: () => options.onSave(slot),
    });
    this.load = new ConfirmButton(scene, {
      ...button(loadX, load, TEXT.saves.load),
      // Kesken pelin lataus hävittää tallentamattoman etenemisen.
      needsConfirm: () => inGame,
      onConfirm: () => options.onLoad(slot),
    });
    this.remove = new ConfirmButton(scene, {
      ...button(removeX, remove, TEXT.saves.remove),
      needsConfirm: () => true,
      onConfirm: () => options.onRemove(slot),
    });
    this.save.setVisible(inGame);
  }

  update(info: SlotInfo): void {
    this.info = info;
    this.title.setText(this.titleText(info));
    this.details.setText(this.detailText(info));
    this.load.setEnabled(info.kind === 'saved');
    this.remove.setEnabled(info.kind !== 'empty');
  }

  private titleText(info: SlotInfo): string {
    const name = TEXT.saves.slot(info.slot);
    return info.kind === 'saved' ? `${name}  ${TEXT.saves.level(info.level)}` : name;
  }

  private detailText(info: SlotInfo): string {
    switch (info.kind) {
      case 'empty':
        return TEXT.saves.empty;
      case 'broken':
        return TEXT.saves.broken;
      case 'saved':
        return TEXT.saves.details(info.place, info.savedAt);
    }
  }
}
