import type Phaser from 'phaser';
import { COLORS, FONT } from '../config/game-config';
import { TEXT } from '../i18n/fi';

// Karttanäkymän yläreunan tiedot: elämäpalkki, taso, juomat ja paikkakunta.

const BAR_WIDTH = 80;
const BAR_HEIGHT = 6;
const MARGIN = 8;
const LINE = 12;

export interface HudInfo {
  readonly hp: number;
  readonly maxHp: number;
  readonly level: number;
  readonly xp: number;
  readonly potions: number;
  readonly enemiesLeft: number;
  readonly townName: string;
}

export class Hud {
  private readonly bar: Phaser.GameObjects.Rectangle;
  private readonly hpText: Phaser.GameObjects.Text;
  private readonly levelText: Phaser.GameObjects.Text;
  private readonly itemText: Phaser.GameObjects.Text;
  private readonly townText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const width = scene.scale.width;
    scene.add
      .rectangle(MARGIN, MARGIN, BAR_WIDTH, BAR_HEIGHT, COLORS.hpBarBack)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(900);
    this.bar = scene.add
      .rectangle(MARGIN, MARGIN, BAR_WIDTH, BAR_HEIGHT, COLORS.hpBar)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(901);
    this.hpText = this.addText(scene, MARGIN, MARGIN + BAR_HEIGHT + 2, 0);
    this.levelText = this.addText(scene, width - MARGIN, MARGIN, 1);
    this.itemText = this.addText(scene, width - MARGIN, MARGIN + LINE, 1);
    this.townText = this.addText(scene, width / 2, MARGIN, 0.5).setFontSize(FONT.medium);
  }

  update(info: HudInfo): void {
    this.bar.setScale(Math.max(0, info.hp / info.maxHp), 1);
    this.hpText.setText(TEXT.hud.hp(info.hp, info.maxHp));
    this.levelText.setText(TEXT.hud.level(info.level, info.xp));
    this.itemText.setText(
      `${TEXT.hud.potions(info.potions)}  ${TEXT.hud.enemiesLeft(info.enemiesLeft)}`,
    );
    this.townText.setText(info.townName);
  }

  private addText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    originX: number,
  ): Phaser.GameObjects.Text {
    return scene.add
      .text(x, y, '', { fontFamily: FONT.family, fontSize: FONT.small, color: COLORS.text })
      .setOrigin(originX, 0)
      .setStroke(COLORS.textShadow, 3)
      .setScrollFactor(0)
      .setDepth(901);
  }
}
