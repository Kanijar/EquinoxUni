import type Phaser from 'phaser';
import { COLORS, FONT } from '../config/game-config';
import { TEXT } from '../i18n/fi';
import type { Fighter } from '../logic/combat';

// Ruudun yläreunan tiedot: elämäpalkki ja kokemuspisteet.

const BAR_WIDTH = 80;
const BAR_HEIGHT = 6;
const MARGIN = 8;

export class Hud {
  private readonly bar: Phaser.GameObjects.Rectangle;
  private readonly hpText: Phaser.GameObjects.Text;
  private readonly xpText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const style = { fontFamily: FONT.family, fontSize: FONT.small, color: COLORS.text };
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
    this.hpText = scene.add
      .text(MARGIN, MARGIN + BAR_HEIGHT + 2, '', style)
      .setScrollFactor(0)
      .setDepth(901);
    this.xpText = scene.add
      .text(scene.scale.width - MARGIN, MARGIN, '', style)
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(901);
  }

  update(player: Fighter, xp: number): void {
    const ratio = Math.max(0, player.hp / player.maxHp);
    this.bar.setScale(ratio, 1);
    this.hpText.setText(TEXT.hud.hp(player.hp, player.maxHp));
    this.xpText.setText(TEXT.hud.xp(xp));
  }
}
