import type Phaser from 'phaser';
import { COLORS, FONT, GAME_WIDTH } from '../config/game-config';
import { QUEST_VIEW } from '../config/quest-config';
import { TextButton } from './text-button';
import { addLabel } from './title-text';

// Tehtävänäkymän alareuna: tehtävänantajan puhe, valitun tehtävän tavoite ja palkinto sekä
// toimintonappi (OTA TEHTÄVÄ tai PALAUTA).

export interface QuestInfoContent {
  readonly name: string;
  /** Tehtävänantajan repliikki (rivittyy). */
  readonly speech: string;
  /** Keltaiset rivit: tavoite ja palkinto (tai palkinnon saaminen). */
  readonly goal: string;
  readonly reward: string;
  /** Napin teksti, tai null, kun nappia ei näytetä. */
  readonly action: string | null;
}

export class QuestInfo {
  private readonly name: Phaser.GameObjects.Text;
  private readonly speech: Phaser.GameObjects.Text;
  private readonly goal: Phaser.GameObjects.Text;
  private readonly reward: Phaser.GameObjects.Text;
  private readonly button: TextButton;

  constructor(scene: Phaser.Scene, onAction: () => void) {
    const { textX, nameY, speechY, goalY, rewardY, wrapWidth } = QUEST_VIEW;
    this.name = addLabel(scene, { x: textX, y: nameY, text: '' });
    this.speech = scene.add
      .text(textX, speechY, '', {
        fontFamily: FONT.family,
        fontSize: FONT.small,
        color: COLORS.text,
        wordWrap: { width: wrapWidth },
      })
      .setOrigin(0, 0);
    this.goal = addLabel(scene, { x: textX, y: goalY, text: '', size: FONT.small });
    this.reward = addLabel(scene, { x: textX, y: rewardY, text: '', size: FONT.small });
    for (const line of [this.goal, this.reward]) {
      line.setColor(COLORS.notice).setWordWrapWidth(wrapWidth);
    }
    const { margin, actionButtonWidth, actionButtonY, buttonHeight } = QUEST_VIEW;
    this.button = new TextButton(scene, {
      x: GAME_WIDTH - margin - actionButtonWidth / 2,
      y: actionButtonY,
      width: actionButtonWidth,
      height: buttonHeight,
      label: '',
      onTap: onAction,
    });
  }

  update(content: QuestInfoContent): void {
    this.name.setText(content.name);
    this.speech.setText(content.speech);
    this.goal.setText(content.goal);
    this.reward.setText(content.reward);
    this.button.setVisible(content.action !== null);
    this.button.setLabel(content.action ?? '');
  }
}
