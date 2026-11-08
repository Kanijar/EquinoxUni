import Phaser from 'phaser';
import {
  BACKPACK_VIEW,
  COLORS,
  FONT,
  GAME_HEIGHT,
  GAME_WIDTH,
  SCENES,
} from '../config/game-config';
import { SHOP_VIEW } from '../config/shop-config';
import { getItem } from '../data';
import { MERCHANT } from '../data/merchant';
import type { ItemDef, ShopKeeperDef } from '../data/types';
import { TEXT } from '../i18n/text';
import { clampPage, pageCount, pageItems, turnPage } from '../logic/bag-pages';
import { playerStats, type GameState } from '../logic/game-state';
import {
  buyItem,
  sellItem,
  shopEntries,
  shopOffer,
  type ShopEntry,
  type ShopMode,
} from '../logic/shop';
import { playSound } from '../systems/sound-fx';
import { BagPager } from '../ui/bag-pager';
import { ComingSoonButton } from '../ui/coming-soon-button';
import { ItemInfo, type ItemInfoContent } from '../ui/item-info';
import { ItemTile } from '../ui/item-tile';
import { boughtText, itemDetail, keeperGreeting, keeperTitle } from '../ui/shop-texts';
import { TextButton } from '../ui/text-button';
import { addLabel, addTitle } from '../ui/title-text';

// Kulkevan kauppiaan kauppa. Avataan kartalta KAUPPA-napista tai kauppiasta napauttamalla.
// Sama näkymä on Venesataman venekauppa (data/boat-shop.ts) ja luolan Noita (data/cave.ts),
// kun keeper on annettu.
// Vasemmalla kauppias ja napit OSTA ja MYY, oikealla tavarat sivuittain (kuten repussa).
// OSTA-puolella näkyvät kauppiaan tavarat hintoineen, MYY-puolella repun tavarat.
// Tavaraa napauttamalla näkee, mitä se tekee, ja alareunan napista sen voi ostaa tai myydä.
// Varusteen myynti kysyy varmistuksen (VARMA?). Kartta nukkuu taustalla, kunnes kauppa
// suljetaan VALMIS-napista. Säännöt: logic/shop.ts.

export interface ShopSceneData {
  readonly state: GameState;
  /** Kenen kauppa: oletuksena kulkeva kauppias Kaapo, tai esim. Venesataman venekauppa. */
  readonly keeper?: ShopKeeperDef;
  /** Näkymä, joka herää kaupan sulkeutuessa (oletuksena kartta; Noidan kaupasta luola). */
  readonly returnTo?: string;
}

export class ShopScene extends Phaser.Scene {
  private state!: GameState;
  private keeper: ShopKeeperDef = MERCHANT;
  private returnTo: string = SCENES.world;
  private mode: ShopMode = 'buy';
  private selected: string | null = null;
  /** Viimeisimmän kaupan viesti (esim. "Ostit: Rautamiekka!"). */
  private message: string | null = null;
  /** Varuste, jonka myynti odottaa toista painallusta (VARMA?). */
  private armed: string | null = null;
  private page = 0;
  private tiles: ItemTile[] = [];
  private pager!: BagPager;
  private tabs!: Record<ShopMode, TextButton>;
  private coinText!: Phaser.GameObjects.Text;
  private speech!: Phaser.GameObjects.Text;
  private emptyText!: Phaser.GameObjects.Text;
  private info!: ItemInfo;
  /** Noidan kaupan "???"-nappi (vain kauppiaalla, jolla on comingSoon). */
  private comingSoon: ComingSoonButton | null = null;

  constructor() {
    super(SCENES.shop);
  }

  create(data: ShopSceneData): void {
    this.state = data.state;
    this.keeper = data.keeper ?? MERCHANT;
    this.returnTo = data.returnTo ?? SCENES.world;
    this.mode = 'buy';
    this.selected = null;
    this.message = null;
    this.armed = null;
    this.page = 0;
    this.tiles = [];
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.panel).setOrigin(0);
    addTitle(this, BACKPACK_VIEW.titleY, keeperTitle(this.keeper));
    this.addDoneButton();
    this.addMerchant();
    this.addGrid();
    this.comingSoon = this.keeper.comingSoon ? new ComingSoonButton(this) : null;
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
      label: TEXT.shop.done,
      onTap: () => this.close(),
    });
  }

  /** Kolikot, kauppias, OSTA- ja MYY-napit ja kauppiaan puhe vasemmalla. */
  private addMerchant(): void {
    const { coinX, coinY, coinScale, coinTextX, merchantX, merchantY, merchantScale } = SHOP_VIEW;
    this.add.image(coinX, coinY, 'coin').setScale(coinScale);
    this.coinText = addLabel(this, { x: coinTextX, y: coinY, text: '' }).setColor(COLORS.notice);
    this.add.image(merchantX, merchantY, this.keeper.sprite).setScale(merchantScale);
    const { tabX, tabFirstY, tabGap, tabWidth } = SHOP_VIEW;
    const tab = (mode: ShopMode, index: number, label: string): TextButton =>
      new TextButton(this, {
        x: tabX,
        y: tabFirstY + index * tabGap,
        width: tabWidth,
        height: BACKPACK_VIEW.tileSize,
        label,
        onTap: () => this.setMode(mode),
      });
    this.tabs = { buy: tab('buy', 0, TEXT.shop.buyTab), sell: tab('sell', 1, TEXT.shop.sellTab) };
    const { speechX, speechY, speechWrap } = SHOP_VIEW;
    this.speech = addLabel(this, { x: speechX, y: speechY, text: '', size: FONT.small });
    this.speech.setWordWrapWidth(speechWrap);
  }

  /** Tavarat ruudukkona oikealla ja sivunvaihto niiden alla (samat mitat kuin repussa). */
  private addGrid(): void {
    const { bagX, bagFirstY, bagColumns, bagRows, bagGap, tileSize } = BACKPACK_VIEW;
    const left = bagX - tileSize / 2;
    this.emptyText = addLabel(this, { x: left, y: bagFirstY, text: TEXT.shop.nothingToSell });
    for (let index = 0; index < bagColumns * bagRows; index += 1) {
      const tile = new ItemTile(this, {
        left: left + (index % bagColumns) * bagGap,
        y: bagFirstY + Math.floor(index / bagColumns) * bagGap,
        width: tileSize,
        onTap: () => this.selectTile(index),
      });
      this.tiles.push(tile);
    }
    const right = left + (bagColumns - 1) * bagGap + tileSize;
    this.pager = new BagPager(this, { left, right, onTurn: (step) => this.turnPage(step) });
  }

  private get pageSize(): number {
    return BACKPACK_VIEW.bagColumns * BACKPACK_VIEW.bagRows;
  }

  private entries(): ShopEntry[] {
    return shopEntries(this.state, this.mode, this.keeper);
  }

  private setMode(mode: ShopMode): void {
    this.mode = mode;
    this.page = 0;
    this.select(null);
  }

  private turnPage(step: number): void {
    this.page = turnPage(this.page, step, this.entries().length, this.pageSize);
    this.refresh();
  }

  private selectTile(index: number): void {
    const entry = pageItems(this.entries(), this.page, this.pageSize)[index];
    if (entry) {
      this.select(entry.item.id);
    }
  }

  private select(itemId: string | null): void {
    this.selected = itemId;
    this.message = null;
    this.armed = null;
    this.refresh();
  }

  /** Alareunan nappi: osta tai myy valittu tavara. */
  private act(): void {
    const id = this.selected;
    if (id === null) {
      return;
    }
    if (this.mode === 'buy') {
      this.buy(getItem(id));
    } else {
      this.sell(getItem(id));
    }
    this.refresh();
  }

  private buy(item: ItemDef): void {
    if (!buyItem(this.state, item.id)) {
      return;
    }
    playSound(item.kind === 'power' || item.kind === 'spell' ? 'level-up' : 'coin');
    this.message = boughtText(item);
  }

  /** Varusteen myynti kysyy ensin varmistuksen: toinen painallus myy. */
  private sell(item: ItemDef): void {
    if (item.kind === 'gear' && this.armed !== item.id) {
      this.armed = item.id;
      return;
    }
    this.armed = null;
    const coins = sellItem(this.state, item.id);
    if (coins > 0) {
      playSound('coin');
      this.message = TEXT.shop.sold(TEXT.names.item(item), coins);
    }
    if ((this.state.inventory[item.id] ?? 0) <= 0) {
      this.selected = null;
    }
  }

  private refresh(): void {
    this.coinText.setText(String(this.state.coins));
    this.tabs.buy.setSelected(this.mode === 'buy');
    this.tabs.sell.setSelected(this.mode === 'sell');
    this.speech.setText(keeperGreeting(this.keeper, this.mode));
    const all = this.entries();
    this.page = clampPage(this.page, all.length, this.pageSize);
    this.pager.update(this.page, pageCount(all.length, this.pageSize));
    this.emptyText.setVisible(all.length === 0);
    const shown = pageItems(all, this.page, this.pageSize);
    this.tiles.forEach((tile, index) => this.showTile(tile, shown[index]));
    // "???" näkyy ostopuolella, kun ruudukon alempi rivi on tyhjä.
    this.comingSoon?.setVisible(this.mode === 'buy' && shown.length <= BACKPACK_VIEW.bagColumns);
    this.info.update(this.infoContent());
  }

  /** Ruudussa esineen kuva ja ostopuolella hinta, myyntipuolella määrä. */
  private showTile(tile: ItemTile, entry: ShopEntry | undefined): void {
    tile.setItem(entry?.item.sprite ?? null, entry?.count ?? 0);
    tile.setVisible(entry !== undefined);
    tile.setSelected(entry !== undefined && entry.item.id === this.selected);
    if (entry && this.mode === 'buy') {
      const price = shopOffer(this.state, 'buy', entry.item.id).price ?? 0;
      tile.setNote(TEXT.shop.tilePrice(price), COLORS.notice);
    } else {
      tile.setNote(entry && entry.count > 1 ? TEXT.backpack.count(entry.count) : '');
    }
  }

  private infoContent(): ItemInfoContent {
    const id = this.selected;
    if (id === null) {
      const buying = this.mode === 'buy';
      const text = this.message ?? (buying ? TEXT.shop.hintBuy : TEXT.shop.hintSell);
      const detail = buying ? '' : TEXT.shop.equippedNotSold;
      return { name: '', text, detail, action: null, actionEnabled: false };
    }
    const item = getItem(id);
    const { price, block } = shopOffer(this.state, this.mode, id);
    const label = this.mode === 'buy' ? TEXT.shop.buyButton : TEXT.shop.sellButton;
    return {
      name: TEXT.names.item(item),
      text: this.message ?? TEXT.names.itemDescription(item),
      detail: block ? this.blockText(block, item) : itemDetail(item, this.mode, this.magic()),
      action: this.armed === id ? TEXT.shop.confirm : label(price ?? 0),
      actionEnabled: block === null,
    };
  }

  private blockText(
    block: NonNullable<ReturnType<typeof shopOffer>['block']>,
    item: ItemDef,
  ): string {
    switch (block) {
      case 'noMoney':
        return TEXT.shop.noMoney;
      case 'owned':
        return TEXT.shop.owned;
      case 'level':
        return TEXT.shop.needLevel(item.minLevel ?? 1);
      case 'notBought':
        return TEXT.shop.notBought(this.keeper.name);
    }
  }

  private magic(): number {
    return playerStats(this.state).magic;
  }

  /** Kauppa sulkeutuu, ja kartta (tai luola) jatkuu siitä, mihin se jäi. */
  private close(): void {
    this.scene.stop();
    this.scene.wake(this.returnTo);
  }
}
