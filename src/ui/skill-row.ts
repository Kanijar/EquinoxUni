import type Phaser from 'phaser';
import { COLORS, FONT, SKILLS_VIEW } from '../config/game-config';
import type { PlayerStats, SkillDef } from '../data/types';
import { TEXT } from '../i18n/text';
import { isSkillMaxed } from '../logic/skill-points';
import { skillDetail } from './skill-detail';
import { TextButton } from './text-button';

// Kykypistenäkymän yksi rivi: kyvyn nimi, nykyinen arvo, mitä piste antaa ja +-nappi.
// Kun kyky on ylärajallaan (esim. tarkkuus), napissa lukee MAKS. Jos kyvyllä on
// lisätieto (Maagia: polttovoima), se näkyy pienellä "mitä piste antaa" -tekstin alla.

export interface SkillRowOptions {
  readonly skill: SkillDef;
  readonly y: number;
  readonly onAdd: () => void;
}

export class SkillRow {
  private readonly valueText: Phaser.GameObjects.Text;
  private readonly perPointText: Phaser.GameObjects.Text;
  private readonly detailText: Phaser.GameObjects.Text;
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
    const small = { ...style, fontSize: FONT.small };
    this.perPointText = scene.add
      .text(SKILLS_VIEW.perPointX, y, TEXT.skills.perPoint(skill.perPoint, skill.stat), small)
      .setOrigin(0, 0.5);
    this.detailText = scene.add
      .text(SKILLS_VIEW.perPointX, y + SKILLS_VIEW.detailOffsetY, '', small)
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

  /** Näyttää arvon ja lisätiedon ja sallii +-napin vain, jos pisteen voi laittaa tähän kykyyn. */
  update(stats: PlayerStats, canAdd: boolean): void {
    const { skill, y } = this.options;
    this.valueText.setText(TEXT.skills.value(skill.stat, stats[skill.stat]));
    const detail = skillDetail(skill, stats);
    this.detailText.setText(detail ?? '');
    this.perPointText.setY(detail === null ? y : y - SKILLS_VIEW.detailOffsetY);
    this.button.setLabel(isSkillMaxed(skill, stats) ? TEXT.skills.maxed : TEXT.skills.add);
    this.button.setEnabled(canAdd);
  }
}
