import type Phaser from 'phaser';
import { BATTLE_VIEW, GAME_HEIGHT, GAME_WIDTH } from '../config/game-config';
import { TEXT } from '../i18n/fi';
import {
  canChoose,
  firstHealItem,
  healItemCount,
  type Battle,
  type BattleAction,
} from '../logic/battle';
import { TextButton } from './text-button';

// Taistelun neljä nappia ruudun alareunassa: kaksi vasemmalle ja kaksi oikealle
// peukalolle. HYÖKKÄÄ, PUOLUSTA | JUOMA, PAKENE.

const NO_ITEM = 'none';

export class BattleMenu {
  private readonly attack: TextButton;
  private readonly defend: TextButton;
  private readonly item: TextButton;
  private readonly flee: TextButton;
  private itemId: string = NO_ITEM;

  constructor(scene: Phaser.Scene, onChoose: (action: BattleAction) => void) {
    const { buttonWidth: w, buttonHeight: h, margin } = BATTLE_VIEW;
    const y = GAME_HEIGHT - margin - h / 2;
    const slot = (index: number): number =>
      index < 2
        ? margin + w / 2 + index * (w + margin)
        : GAME_WIDTH - margin - w / 2 - (3 - index) * (w + margin);
    const button = (index: number, label: string, action: () => BattleAction): TextButton =>
      new TextButton(scene, {
        x: slot(index),
        y,
        width: w,
        height: h,
        label,
        onTap: () => onChoose(action()),
      });
    this.attack = button(0, TEXT.battle.attack, () => ({ kind: 'attack' }));
    this.defend = button(1, TEXT.battle.defend, () => ({ kind: 'defend' }));
    this.item = button(2, TEXT.battle.item(0), () => ({ kind: 'item', itemId: this.itemId }));
    this.flee = button(3, TEXT.battle.flee, () => ({ kind: 'flee' }));
  }

  /** Päivittää napit: enabled = false, kun vuoro on kesken. */
  refresh(battle: Battle, enabled: boolean): void {
    this.itemId = firstHealItem(battle.inventory) ?? NO_ITEM;
    this.item.setLabel(TEXT.battle.item(healItemCount(battle.inventory)));
    const itemAction: BattleAction = { kind: 'item', itemId: this.itemId };
    const usable = enabled && battle.outcome === 'ongoing';
    this.attack.setEnabled(usable);
    this.defend.setEnabled(usable);
    this.flee.setEnabled(usable);
    this.item.setEnabled(usable && this.itemId !== NO_ITEM && canChoose(battle, itemAction));
  }
}
