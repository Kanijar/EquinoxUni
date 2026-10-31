import type Phaser from 'phaser';
import { COLORS, FONT, SKILLS_VIEW } from '../config/game-config';
import type { SkillDef } from '../data/types';
import { TEXT } from '../i18n/fi';
import { TextButton } from './text-button';

// Kykypistenäkymän yksi rivi: kyvyn nimi, nykyinen arvo, mitä piste antaa ja +-nappi.

export interface SkillRowOptions {
  readonly skill: SkillDef;
  readonly y: number;
  readonly onAdd: () => void;
}

export class SkillRow {
  private readonly valueText: Phaser.GameObjects.Text;
  private readonly button: TextButton;

  constructor(scene: Phaser.Scene, options: SkillRowOptions) {
    const { skill, y } = options;
    const style = { fontFamily: FONT.family, color: COLORS.text };
    scene.add
      .text(SKILLS_VIEW.nameX, y, TEXT.skills.names[skill.id], { ...style, fontSize: FONT.medium })
      .setOrigin(0, 0.5);
    this.valueText = scene.add
      .text(SKILLS_VIEW.valueX, y, '', { ...style, fontSize: FONT.medium })
      .setOrigin(1, 0.5);
    const perPoint = TEXT.skills.perPoint(skill.perPoint, TEXT.skills.statNames[skill.stat]);
    scene.add
      .text(SKILLS_VIEW.perPointX, y, perPoint, { ...style, fontSize: FONT.small })
      .setOrigin(0, 0.5);
    this.button = new TextButton(scene, {
      x: SKILLS_VIEW.addButtonX,
      y,
      width: SKILLS_VIEW.addButtonWidth,
      height: SKILLS_VIEW.buttonHeight,
      label: TEXT.skills.add,
      onTap: options.onAdd,
    });
  }

  /** Näyttää arvon ja sallii +-napin vain, jos pisteitä on jäljellä. */
  update(value: number, canAdd: boolean): void {
    this.valueText.setText(String(value));
    this.button.setEnabled(canAdd);
  }
}
