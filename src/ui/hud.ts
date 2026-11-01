import type Phaser from 'phaser';
import { COLORS, FONT } from '../config/game-config';
import { TEXT } from '../i18n/fi';
import { XpBar } from './xp-bar';

// Karttanäkymän yläreunan tiedot: elämäpalkki, KP-palkki ja taso, juomat, paikkakunta
// ja loppubossin tilanne (peikkolaskuri).

const BAR_WIDTH = 80;
const BAR_HEIGHT = 6;
const MARGIN = 8;
const LINE = 12;
const DEPTH = 900;

export interface HudInfo {
  readonly hp: number;
  readonly maxHp: number;
  readonly xp: number;
  readonly potions: number;
  readonly enemiesLeft: number;
  readonly townName: string;
  /** Loppubossin tilanne (esim. "Peikot 3/5"), tai tyhjä, kun boss on voitettu. */
  readonly bossText: string;
}

export class Hud {
  private readonly bar: Phaser.GameObjects.Rectangle;
  private readonly hpText: Phaser.GameObjects.Text;
  private readonly xpBar: XpBar;
  private readonly itemText: Phaser.GameObjects.Text;
  private readonly townText: Phaser.GameObjects.Text;
  private readonly bossText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const width = scene.scale.width;
    scene.add
      .rectangle(MARGIN, MARGIN, BAR_WIDTH, BAR_HEIGHT, COLORS.hpBarBack)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(DEPTH);
    this.bar = scene.add
      .rectangle(MARGIN, MARGIN, BAR_WIDTH, BAR_HEIGHT, COLORS.hpBar)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(DEPTH + 1);
    this.hpText = this.addText(scene, MARGIN, MARGIN + BAR_HEIGHT + 2, 0);
    this.xpBar = new XpBar(scene, {
      x: width - MARGIN,
      y: MARGIN,
      width: BAR_WIDTH,
      height: BAR_HEIGHT,
      originX: 1,
      depth: DEPTH,
      label: (progress) => TEXT.hud.levelAndXp(progress.level, progress.xp, progress.nextLevelXp),
    });
    this.itemText = this.addText(scene, width - MARGIN, MARGIN + BAR_HEIGHT + 2 + LINE, 1);
    this.townText = this.addText(scene, width / 2, MARGIN, 0.5).setFontSize(FONT.medium);
    const bossY = MARGIN + BAR_HEIGHT + 2 + LINE * 2;
    this.bossText = this.addText(scene, width - MARGIN, bossY, 1).setColor(COLORS.critText);
  }

  update(info: HudInfo): void {
    this.bar.setScale(Math.max(0, info.hp / info.maxHp), 1);
    this.hpText.setText(TEXT.hud.hp(info.hp, info.maxHp));
    this.xpBar.set(info.xp);
    this.itemText.setText(
      `${TEXT.hud.potions(info.potions)}  ${TEXT.hud.enemiesLeft(info.enemiesLeft)}`,
    );
    this.townText.setText(info.townName);
    this.bossText.setText(info.bossText);
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
      .setDepth(DEPTH + 1);
  }
}
