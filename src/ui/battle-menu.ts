import type Phaser from 'phaser';
import { ACTION_BUTTON } from '../config/battle-config';
import { BATTLE_VIEW, GAME_HEIGHT, GAME_WIDTH } from '../config/game-config';
import { PLAYER } from '../data/player';
import type { SpellId } from '../data/types';
import { TEXT } from '../i18n/text';
import { canChoose, healItemCount, type Battle, type BattleAction } from '../logic/battle';
import { bestHealItem } from '../logic/heal-choice';
import { spellWait } from '../logic/spells';
import { ActionButton, type ActionKind } from './battle/action-button';

// Taistelun napit ruudun alareunassa: kaksi vasemmalle ja kaksi oikealle peukalolle.
// Päävalikko: HYÖKKÄÄ, PUOLUSTA | JUOMA, PAKENE.
// HYÖKKÄÄ avaa hyökkäysvalikon: LYÖNTI, TULIPALLO | LOITSUT, TAKAISIN. LOITSUT näkyy, kun
// sankari on oppinut loitsuja Noidalta (logic/spells.ts), ja avaa loitsuvalikon: enintään
// kolme loitsua ja TAKAISIN. Loitsu, jota pitää vielä odottaa, näyttää "ODOTA 2".

const NO_ITEM = 'none';
/** Loitsuvalikkoon mahtuu kolme loitsua (neljäs paikka on TAKAISIN). */
const SPELL_SLOTS = 3;

/** Mikä valikko on auki. */
export type MenuPage = 'main' | 'attack' | 'spells';

export interface BattleMenuCallbacks {
  readonly onChoose: (action: BattleAction) => void;
  /** Kutsutaan, kun valikko vaihtuu (esim. hyökkäysvalikko aukeaa tai TAKAISIN). */
  readonly onPage: (page: MenuPage) => void;
}

type Slot = 0 | 1 | 2 | 3;

interface SpellButton {
  readonly spellId: SpellId;
  readonly button: ActionButton;
}

export class BattleMenu {
  private readonly pages: Record<MenuPage, ActionButton[]>;
  private readonly item: ActionButton;
  private readonly spellButtons: SpellButton[];
  private itemId: string = NO_ITEM;
  private page: MenuPage = 'main';
  private enabled = false;
  private battle: Battle | null = null;

  /** learned = loitsukirjoista opitut loitsut (ilman tulipalloa), ks. learnedSpells(). */
  constructor(
    private readonly scene: Phaser.Scene,
    callbacks: BattleMenuCallbacks,
    learned: readonly SpellId[],
  ) {
    const { onChoose, onPage } = callbacks;
    const go = (page: MenuPage) => (): void => this.showPage(page, onPage);
    this.item = this.button(2, 'item', TEXT.battle.item(0), () =>
      onChoose({ kind: 'item', itemId: this.itemId }),
    );
    this.spellButtons = learned.slice(0, SPELL_SLOTS).map((spellId, index) => ({
      spellId,
      button: this.spellButton(index as Slot, spellId, onChoose),
    }));
    const attack = [
      this.button(0, 'punch', TEXT.battle.punch, () => onChoose({ kind: 'attack' })),
      this.spellButton(1, PLAYER.spell, onChoose),
      this.button(3, 'back', TEXT.battle.back, go('main')),
    ];
    if (this.spellButtons.length > 0) {
      attack.push(this.button(2, 'spells', TEXT.magic.spellsButton, go('spells')));
    }
    this.pages = {
      main: [
        this.button(0, 'attack', TEXT.battle.attack, go('attack')),
        this.button(1, 'defend', TEXT.battle.defend, () => onChoose({ kind: 'defend' })),
        this.item,
        this.button(3, 'flee', TEXT.battle.flee, () => onChoose({ kind: 'flee' })),
      ],
      attack,
      spells: [
        ...this.spellButtons.map((entry) => entry.button),
        this.button(3, 'back', TEXT.battle.back, go('attack')),
      ],
    };
    this.update();
  }

  /** Päivittää napit: enabled = false, kun vuoro on kesken. Palaa aina päävalikkoon. */
  refresh(battle: Battle, enabled: boolean): void {
    this.battle = battle;
    this.enabled = enabled && battle.outcome === 'ongoing';
    this.page = 'main';
    const missingHp = battle.player.maxHp - battle.player.hp;
    this.itemId = bestHealItem(battle.inventory, missingHp) ?? NO_ITEM;
    this.item.setLabel(TEXT.battle.item(healItemCount(battle.inventory)));
    for (const { spellId, button } of this.spellButtons) {
      const wait = spellWait(battle, spellId);
      button.setLabel(wait > 0 ? TEXT.magic.wait(wait) : TEXT.spellButtons[spellId]);
    }
    this.update();
  }

  private showPage(page: MenuPage, onPage: (page: MenuPage) => void): void {
    this.page = page;
    this.update();
    onPage(page);
  }

  private update(): void {
    for (const [page, buttons] of Object.entries(this.pages)) {
      const open = page === this.page;
      for (const button of buttons) {
        button.setVisible(open);
        button.setEnabled(this.enabled && open);
      }
    }
    const itemAction: BattleAction = { kind: 'item', itemId: this.itemId };
    this.item.setEnabled(this.enabled && this.page === 'main' && this.canUse(itemAction));
    for (const { spellId, button } of this.spellButtons) {
      const open = this.page === 'spells';
      button.setEnabled(this.enabled && open && this.canUse({ kind: 'spell', spellId }));
    }
  }

  private canUse(action: BattleAction): boolean {
    if (action.kind === 'item' && action.itemId === NO_ITEM) {
      return false;
    }
    return this.battle !== null && canChoose(this.battle, action);
  }

  private spellButton(
    slot: Slot,
    spellId: SpellId,
    onChoose: (action: BattleAction) => void,
  ): ActionButton {
    const kind: ActionKind = ACTION_BUTTON.spellKinds[spellId];
    return this.button(slot, kind, TEXT.spellButtons[spellId], () =>
      onChoose({ kind: 'spell', spellId }),
    );
  }

  private button(slot: Slot, kind: ActionKind, label: string, onTap: () => void): ActionButton {
    const { buttonWidth: w, buttonHeight: h, margin } = BATTLE_VIEW;
    const x =
      slot < 2
        ? margin + w / 2 + slot * (w + margin)
        : GAME_WIDTH - margin - w / 2 - (3 - slot) * (w + margin);
    return new ActionButton(this.scene, {
      x,
      y: GAME_HEIGHT - margin - h / 2,
      width: w,
      height: h,
      kind,
      label,
      onTap,
    });
  }
}
