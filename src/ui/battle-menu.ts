import type Phaser from 'phaser';
import { BATTLE_VIEW, GAME_HEIGHT, GAME_WIDTH } from '../config/game-config';
import { PLAYER } from '../data/player';
import { TEXT } from '../i18n/fi';
import {
  canChoose,
  firstHealItem,
  healItemCount,
  type Battle,
  type BattleAction,
} from '../logic/battle';
import { TextButton } from './text-button';

// Taistelun napit ruudun alareunassa: kaksi vasemmalle ja kaksi oikealle peukalolle.
// Päävalikko: HYÖKKÄÄ, PUOLUSTA | JUOMA, PAKENE.
// HYÖKKÄÄ avaa hyökkäysvalikon: LYÖNTI, TULIPALLO | TAKAISIN.

const NO_ITEM = 'none';

export interface BattleMenuCallbacks {
  readonly onChoose: (action: BattleAction) => void;
  /** Kutsutaan, kun hyökkäysvalikko avautuu (true) tai suljetaan TAKAISIN-napista (false). */
  readonly onAttackMenu: (open: boolean) => void;
}

type Slot = 0 | 1 | 2 | 3;

export class BattleMenu {
  private readonly main: readonly TextButton[];
  private readonly attackMenu: readonly TextButton[];
  private readonly item: TextButton;
  private itemId: string = NO_ITEM;
  private attackMenuOpen = false;
  private enabled = false;
  private battle: Battle | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    callbacks: BattleMenuCallbacks,
  ) {
    const { onChoose, onAttackMenu } = callbacks;
    this.item = this.button(2, TEXT.battle.item(0), () =>
      onChoose({ kind: 'item', itemId: this.itemId }),
    );
    this.main = [
      this.button(0, TEXT.battle.attack, () => this.showAttackMenu(true, onAttackMenu)),
      this.button(1, TEXT.battle.defend, () => onChoose({ kind: 'defend' })),
      this.item,
      this.button(3, TEXT.battle.flee, () => onChoose({ kind: 'flee' })),
    ];
    this.attackMenu = [
      this.button(0, TEXT.battle.punch, () => onChoose({ kind: 'attack' })),
      this.button(1, TEXT.spellButtons[PLAYER.spell], () =>
        onChoose({ kind: 'spell', spellId: PLAYER.spell }),
      ),
      this.button(3, TEXT.battle.back, () => this.showAttackMenu(false, onAttackMenu)),
    ];
    this.update();
  }

  /** Päivittää napit: enabled = false, kun vuoro on kesken. Palaa aina päävalikkoon. */
  refresh(battle: Battle, enabled: boolean): void {
    this.battle = battle;
    this.enabled = enabled && battle.outcome === 'ongoing';
    this.attackMenuOpen = false;
    this.itemId = firstHealItem(battle.inventory) ?? NO_ITEM;
    this.item.setLabel(TEXT.battle.item(healItemCount(battle.inventory)));
    this.update();
  }

  private showAttackMenu(open: boolean, onAttackMenu: (open: boolean) => void): void {
    this.attackMenuOpen = open;
    this.update();
    onAttackMenu(open);
  }

  private update(): void {
    for (const button of this.main) {
      button.setVisible(!this.attackMenuOpen);
      button.setEnabled(this.enabled && !this.attackMenuOpen);
    }
    for (const button of this.attackMenu) {
      button.setVisible(this.attackMenuOpen);
      button.setEnabled(this.enabled && this.attackMenuOpen);
    }
    const itemAction: BattleAction = { kind: 'item', itemId: this.itemId };
    const canUseItem =
      this.battle !== null && this.itemId !== NO_ITEM && canChoose(this.battle, itemAction);
    this.item.setEnabled(this.enabled && !this.attackMenuOpen && canUseItem);
  }

  private button(slot: Slot, label: string, onTap: () => void): TextButton {
    const { buttonWidth: w, buttonHeight: h, margin } = BATTLE_VIEW;
    const x =
      slot < 2
        ? margin + w / 2 + slot * (w + margin)
        : GAME_WIDTH - margin - w / 2 - (3 - slot) * (w + margin);
    return new TextButton(this.scene, {
      x,
      y: GAME_HEIGHT - margin - h / 2,
      width: w,
      height: h,
      label,
      onTap,
    });
  }
}
