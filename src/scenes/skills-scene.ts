import Phaser from 'phaser';
import { COLORS, FONT, GAME_WIDTH, SCENES, SKILLS_VIEW, WORLD_VIEW } from '../config/game-config';
import { PROGRESSION } from '../data/rules';
import { SKILLS } from '../data/skills';
import type { SkillDef, SkillId } from '../data/types';
import { TEXT } from '../i18n/fi';
import {
  canSpendSkillPoint,
  playerStats,
  spendSkillPoint,
  unspentSkillPoints,
  type GameState,
} from '../logic/game-state';
import { SkillRow } from '../ui/skill-row';
import { TextButton } from '../ui/text-button';
import type { WorldSceneData } from './world-scene';

// Kykypisteiden jako. Avataan paikkakunnassa KYKYPISTEET-napista. Jokainen piste
// laitetaan hyökkäykseen, puolustukseen, elinvoimaan, tarkkuuteen tai maagiaan.
// Kyvyt tulevat data/skills.ts:stä, säännöt logic/skill-points.ts:stä.

export interface SkillsSceneData {
  readonly state: GameState;
}

export class SkillsScene extends Phaser.Scene {
  private state!: GameState;
  private rows: { readonly row: SkillRow; readonly skill: SkillDef }[] = [];
  private pointsLeftText!: Phaser.GameObjects.Text;

  constructor() {
    super(SCENES.skills);
  }

  create(data: SkillsSceneData): void {
    this.state = data.state;
    const style = { fontFamily: FONT.family, color: COLORS.text };
    this.add
      .text(GAME_WIDTH / 2, SKILLS_VIEW.titleY, TEXT.skills.title, {
        ...style,
        fontSize: FONT.large,
      })
      .setOrigin(0.5);
    this.pointsLeftText = this.add
      .text(GAME_WIDTH / 2, SKILLS_VIEW.pointsLeftY, '', { ...style, fontSize: FONT.medium })
      .setOrigin(0.5);
    this.rows = SKILLS.map((skill, index) => ({
      skill,
      row: new SkillRow(this, {
        skill,
        y: SKILLS_VIEW.firstRowY + index * SKILLS_VIEW.rowGap,
        onAdd: () => this.spend(skill.id),
      }),
    }));
    this.addFooter();
    this.refresh();
  }

  private spend(id: SkillId): void {
    spendSkillPoint(this.state, id);
    this.refresh();
  }

  /** Vihje alareunaan ja VALMIS-nappi oikeaan yläkulmaan (rivit vievät keskiosan). */
  private addFooter(): void {
    const { margin, buttonHeight, doneButtonWidth, hintY } = SKILLS_VIEW;
    this.add
      .text(margin * 2, hintY, TEXT.skills.hint(PROGRESSION.skillPointsPerLevel), {
        fontFamily: FONT.family,
        fontSize: FONT.small,
        color: COLORS.text,
      })
      .setOrigin(0, 0.5);
    new TextButton(this, {
      x: GAME_WIDTH - margin - doneButtonWidth / 2,
      y: margin + buttonHeight / 2,
      width: doneButtonWidth,
      height: buttonHeight,
      label: TEXT.skills.done,
      onTap: () => this.close(),
    });
  }

  private refresh(): void {
    const left = unspentSkillPoints(this.state);
    const stats = playerStats(this.state);
    this.pointsLeftText.setText(TEXT.skills.left(left));
    for (const { row, skill } of this.rows) {
      row.update(stats, canSpendSkillPoint(this.state, skill.id));
    }
  }

  private close(): void {
    const next: WorldSceneData = { state: this.state, graceMs: WORLD_VIEW.graceMs.afterBattle };
    this.scene.start(SCENES.world, next);
  }
}
