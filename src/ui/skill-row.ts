import type Phaser from 'phaser';
import { COLORS, FONT, SKILLS_VIEW } from '../config/game-config';
import type { SkillDef } from '../data/types';
import { TEXT } from '../i18n/fi';
import { TextButton } from './text-button';

// Kykypistenäkymän yksi rivi: kyvyn nimi, nykyinen arvo, mitä piste antaa ja +-nappi.
// Kun kyky on ylärajallaan (esim. tarkkuus), napissa lukee MAKS.

export interface SkillRowOptions {
  readonly skill: SkillDef;
  readonly y: number;
  readonly onAdd: () => void;
}

export class SkillRow {
  private readonly valueText: Phaser.GameObjects.Text;
  private readonly button: TextButton;

  constructor(
    scene: Phaser.Scene,
    private readonly options: SkillRowOptions,
  ) {
    const { skill, y } = options;
    const style = { fontFamily: FONT.family, color: COLORS.text };
    scene.add
      .text(SKILLS_VIEW.nameX, y, TEXT.skills.names[skill.id], { ...style, fontSize: FONT.medium })
      .setOrigin(0, 0.5);
    this.valueText = scene.add
      .text(SKILLS_VIEW.valueX, y, '', { ...style, fontSize: FONT.medium })
      .setOrigin(1, 0.5);
    scene.add
      .text(SKILLS_VIEW.perPointX, y, TEXT.skills.perPoint(skill.perPoint, skill.stat), {
        ...style,
        fontSize: FONT.small,
      })
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

  /** Näyttää arvon ja sallii +-napin vain, jos pisteen voi laittaa tähän kykyyn. */
  update(value: number, canAdd: boolean, maxed: boolean): void {
    this.valueText.setText(TEXT.skills.value(this.options.skill.stat, value));
    this.button.setLabel(maxed ? TEXT.skills.maxed : TEXT.skills.add);
    this.button.setEnabled(canAdd);
  }
}
