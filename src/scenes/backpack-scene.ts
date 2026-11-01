import Phaser from 'phaser';
import {
  BACKPACK_VIEW,
  COLORS,
  FONT,
  GAME_HEIGHT,
  GAME_WIDTH,
  SCENES,
} from '../config/game-config';
import { getItem } from '../data';
import { GEAR_SLOTS } from '../data/items';
import type { GearSlot } from '../data/types';
import { TEXT } from '../i18n/text';
import {
  canDrink,
  drinkFromBag,
  equipFromBag,
  selectedItemId,
  selectionAction,
  unequipToBag,
  type BackpackSelection,
} from '../logic/backpack';
import { bagItems, findGear } from '../logic/equipment';
import { playerStats, type GameState } from '../logic/game-state';
import { GearSlotRow } from '../ui/gear-slot-row';
import { ItemInfo, type ItemInfoContent } from '../ui/item-info';
import { ItemTile } from '../ui/item-tile';
import { TextButton } from '../ui/text-button';
import { addLabel, addTitle } from '../ui/title-text';

// Reppu. Avataan kartalta REPPU-napista. Vasemmalla käytössä olevat varusteet (käsi,
// vartalo, koru), oikealla repun esineet. Esinettä napauttamalla näkee, mitä se tekee,
// ja alareunan napista sen voi laittaa käyttöön, ottaa pois tai juoda (juoma).
// Kartta odottaa taustalla (nukkuu), kunnes reppu suljetaan VALMIS-napista.
// Säännöt: logic/backpack.ts ja logic/equipment.ts.

export interface BackpackSceneData {
  readonly state: GameState;
}

export class BackpackScene extends Phaser.Scene {
  private state!: GameState;
  private selection: BackpackSelection | null = null;
  /** Viimeisimmän toiminnon viesti (esim. "Peikon nuija on nyt käytössä!"). */
  private message: string | null = null;
  private slotRows: { readonly slot: GearSlot; readonly row: GearSlotRow }[] = [];
  private bagTiles: ItemTile[] = [];
  private statsTexts: Phaser.GameObjects.Text[] = [];
  private bagEmptyText!: Phaser.GameObjects.Text;
  private info!: ItemInfo;

  constructor() {
    super(SCENES.backpack);
  }

  create(data: BackpackSceneData): void {
    this.state = data.state;
    this.selection = null;
    this.message = null;
    this.bagTiles = [];
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.panel).setOrigin(0);
    addTitle(this, BACKPACK_VIEW.titleY, TEXT.backpack.title);
    this.addDoneButton();
    this.addSlots();
    this.addBag();
    this.info = new ItemInfo(this, () => this.act());
    this.refresh();
  }

  private addDoneButton(): void {
    const { margin, doneButtonWidth, tileSize } = BACKPACK_VIEW;
    new TextButton(this, {
      x: GAME_WIDTH - margin - doneButtonWidth / 2,
      y: margin + tileSize / 2,
      width: doneButtonWidth,
      height: tileSize,
      label: TEXT.backpack.done,
      onTap: () => this.close(),
    });
  }

  private addSlots(): void {
    const { infoX, headingY, slotFirstY, slotGap } = BACKPACK_VIEW;
    addLabel(this, { x: infoX, y: headingY, text: TEXT.backpack.equipped, size: FONT.small });
    this.slotRows = GEAR_SLOTS.map((slot, index) => ({
      slot,
      row: new GearSlotRow(this, slot, slotFirstY + index * slotGap, () =>
        this.select({ kind: 'slot', slot }),
      ),
    }));
  }

  private addBag(): void {
    const { bagX, headingY, bagFirstY, bagColumns, bagRows, bagGap, tileSize } = BACKPACK_VIEW;
    const left = bagX - tileSize / 2;
    addLabel(this, { x: left, y: headingY, text: TEXT.backpack.bag, size: FONT.small });
    this.bagEmptyText = addLabel(this, { x: left, y: bagFirstY, text: TEXT.backpack.bagEmpty });
    for (let index = 0; index < bagColumns * bagRows; index += 1) {
      const column = index % bagColumns;
      const row = Math.floor(index / bagColumns);
      const tile = new ItemTile(this, {
        left: left + column * bagGap,
        y: bagFirstY + row * bagGap,
        width: tileSize,
        onTap: () => this.selectBagTile(index),
      });
      this.bagTiles.push(tile);
    }
    const { statsFirstY, statsGap } = BACKPACK_VIEW;
    this.statsTexts = [0, 1].map((line) =>
      addLabel(this, { x: left, y: statsFirstY + line * statsGap, text: '' }),
    );
  }

  private selectBagTile(index: number): void {
    const entry = bagItems(this.state.inventory)[index];
    if (entry) {
      this.select({ kind: 'bag', itemId: entry.item.id });
    }
  }

  private select(selection: BackpackSelection): void {
    this.selection = selection;
    this.message = null;
    this.refresh();
  }

  /** Alareunan napin toiminto valitulle esineelle. Valinta seuraa esinettä uuteen paikkaan. */
  private act(): void {
    const selection = this.selection;
    const id = selection && selectedItemId(this.state, selection);
    if (!selection || !id) {
      return;
    }
    const name = TEXT.names.item(getItem(id));
    const action = selectionAction(this.state, selection);
    const gear = findGear(id);
    if (action === 'equip' && gear && equipFromBag(this.state, id)) {
      this.selection = { kind: 'slot', slot: gear.slot };
      this.message = TEXT.backpack.equippedNow(name);
    } else if (action === 'unequip' && selection.kind === 'slot') {
      unequipToBag(this.state, selection.slot);
      this.selection = { kind: 'bag', itemId: id };
      this.message = TEXT.backpack.unequippedNow(name);
    } else if (action === 'drink') {
      this.message = TEXT.backpack.drank(drinkFromBag(this.state, id));
    }
    this.refresh();
  }

  private refresh(): void {
    const stats = TEXT.backpack.stats(playerStats(this.state), this.state.hp);
    this.statsTexts.forEach((text, line) => text.setText(stats[line] ?? ''));
    const selected = this.selection;
    for (const { slot, row } of this.slotRows) {
      const id = this.state.equipped[slot];
      const isSelected = selected?.kind === 'slot' && selected.slot === slot;
      row.update(id === undefined ? null : getItem(id), isSelected);
    }
    const items = bagItems(this.state.inventory);
    this.bagEmptyText.setVisible(items.length === 0);
    this.bagTiles.forEach((tile, index) => {
      const entry = items[index];
      tile.setItem(entry?.item.sprite ?? null, entry?.count ?? 0);
      tile.setVisible(entry !== undefined);
      tile.setSelected(selected?.kind === 'bag' && selected.itemId === entry?.item.id);
    });
    this.info.update(this.infoContent());
  }

  private infoContent(): ItemInfoContent {
    const selection = this.selection;
    const id = selection && selectedItemId(this.state, selection);
    if (!selection || !id) {
      const text = this.message ?? TEXT.backpack.hint;
      return { name: '', text, detail: '', action: null, actionEnabled: false };
    }
    const item = getItem(id);
    const action = selectionAction(this.state, selection);
    const drinkBlocked = action === 'drink' && !canDrink(this.state, id);
    let detail = item.kind === 'gear' ? TEXT.backpack.bonus(item.bonus) : '';
    if (drinkBlocked) {
      detail = TEXT.backpack.fullHp;
    }
    return {
      name: TEXT.names.item(item),
      text: this.message ?? TEXT.names.itemDescription(item),
      detail,
      action: action === null ? null : TEXT.backpack[action],
      actionEnabled: !drinkBlocked,
    };
  }

  /** Reppu sulkeutuu ja kartta jatkuu siitä, mihin se jäi. */
  private close(): void {
    this.scene.stop();
    this.scene.wake(SCENES.world);
  }
}
