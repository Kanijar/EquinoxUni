import type Phaser from 'phaser';
import { COLORS, FONT } from '../config/game-config';
import { QUEST_HUD } from '../config/quest-config';
import { TEXT } from '../i18n/text';
import type { GameState } from '../logic/game-state';
import { trackedQuests } from '../logic/quests';

// Kartan vasemman yläkulman tehtävärivit elämän alla: keskeneräiset tehtävät edistymisineen
// ("Limat kuriin 2/3") ja valmiit tehtävät ("Limat kuriin: valmis!").

const DEPTH = 901;

export class QuestTracker {
  private readonly lines: Phaser.GameObjects.Text[];

  constructor(scene: Phaser.Scene) {
    this.lines = Array.from({ length: QUEST_HUD.maxLines }, (_, index) =>
      scene.add
        .text(QUEST_HUD.x, QUEST_HUD.firstY + index * QUEST_HUD.lineGap, '', {
          fontFamily: FONT.family,
          fontSize: FONT.small,
          color: COLORS.notice,
        })
        .setStroke(COLORS.textShadow, 3)
        .setScrollFactor(0)
        .setDepth(DEPTH),
    );
  }

  update(state: GameState): void {
    const rows = trackedQuests(state);
    this.lines.forEach((line, index) => {
      const row = rows[index];
      if (!row) {
        line.setText('');
        return;
      }
      const title = TEXT.names.quest(row.quest).title;
      const { have, need } = row.progress;
      line.setText(
        row.status === 'ready'
          ? TEXT.quests.hudReady(title)
          : TEXT.quests.hudActive(title, have, need),
      );
    });
  }
}
