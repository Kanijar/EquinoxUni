import Phaser from 'phaser';
import { COLORS, FONT } from '../config/game-config';
import { QUEST_VIEW } from '../config/quest-config';
import { TEXT } from '../i18n/text';
import type { QuestRow } from '../logic/quests';
import { playSound } from '../systems/sound-fx';

// Tehtävänäkymän kosketettava rivi: tehtävän nimi vasemmalla, tila ja edistyminen oikealla
// ("KESKEN 2/3", "VALMIS!" tai "UUSI"). Valittu rivi saa keltaisen reunuksen.

const BORDER = 1;
const SELECTED_BORDER = 2;

export class QuestRowView {
  private readonly box: Phaser.GameObjects.Rectangle;
  private readonly title: Phaser.GameObjects.Text;
  private readonly status: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, y: number, onTap: () => void) {
    const { rowLeft, rowWidth, rowHeight, rowTextInset } = QUEST_VIEW;
    this.box = scene.add
      .rectangle(rowLeft + rowWidth / 2, y, rowWidth, rowHeight, COLORS.slotPanel)
      .setStrokeStyle(BORDER, COLORS.panelBorder)
      .setInteractive();
    const style = { fontFamily: FONT.family, fontSize: FONT.medium, color: COLORS.text };
    this.title = scene.add.text(rowLeft + rowTextInset, y, '', style).setOrigin(0, 0.5);
    this.status = scene.add
      .text(rowLeft + rowWidth - rowTextInset, y, '', { ...style, color: COLORS.notice })
      .setOrigin(1, 0.5);
    this.box.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      playSound('tap');
      onTap();
    });
  }

  /** Näyttää tehtävän rivillä, tai piilottaa rivin (row = undefined). */
  set(row: QuestRow | undefined, selected: boolean): void {
    for (const part of [this.box, this.title, this.status]) {
      part.setVisible(row !== undefined);
    }
    if (!row) {
      return;
    }
    this.title.setText(TEXT.names.quest(row.quest).title);
    this.status.setText(statusText(row));
    this.box.setStrokeStyle(
      selected ? SELECTED_BORDER : BORDER,
      selected ? COLORS.selected : COLORS.panelBorder,
    );
  }
}

function statusText(row: QuestRow): string {
  const { have, need } = row.progress;
  switch (row.status) {
    case 'active':
      return `${TEXT.quests.status.active} ${TEXT.quests.progress(have, need)}`;
    case 'ready':
      return TEXT.quests.status.ready;
    default:
      return TEXT.quests.status.available;
  }
}
