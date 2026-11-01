import type Phaser from 'phaser';
import { BATTLE_PANEL } from '../../config/battle-config';
import { COLORS, FONT, GAME_WIDTH } from '../../config/game-config';
import { TEXT } from '../../i18n/text';
import type { Side } from '../../logic/battle';
import { XpBar } from '../xp-bar';
import { HpBar } from './hp-bar';
import { drawPixelPanel } from './pixel-panel';

// Nimikyltti ruudun yläkulmassa: nimi, animoitu elämäpalkki ja elämä numeroina.
// Pelaajan kyltissä on lisäksi KP-palkki ja taso. Palavan vihollisen nimen vieressä
// lepattaa liekki-ikoni.

const PANEL_DEPTH = 500;
const BURN_ICON = 'icon-fire';
const BURN_FLICKER_MS = 160;

export class StatusPanel {
  private readonly hpBar: HpBar;
  private readonly hpText: Phaser.GameObjects.Text;
  private readonly burnIcon: Phaser.GameObjects.Image;
  readonly xpBar: XpBar | null = null;

  constructor(scene: Phaser.Scene, side: Side, name: string) {
    const { margin, width, padding, barY, barHeight } = BATTLE_PANEL;
    const height = side === 'player' ? BATTLE_PANEL.playerHeight : BATTLE_PANEL.enemyHeight;
    const x = side === 'player' ? margin : GAME_WIDTH - margin - width;
    const y = margin;
    drawPixelPanel(scene.add.graphics().setDepth(PANEL_DEPTH), { x, y, width, height });
    const inner = { x: x + padding, width: width - padding * 2 };
    const style = { fontFamily: FONT.family, fontSize: FONT.medium, color: COLORS.text };
    const nameText = scene.add
      .text(inner.x, y + padding - 1, name, style)
      .setStroke(COLORS.textShadow, 3)
      .setDepth(PANEL_DEPTH + 2);
    this.burnIcon = scene.add
      .image(nameText.x + nameText.width + 8, nameText.y + nameText.height / 2, BURN_ICON)
      .setScale(BATTLE_PANEL.burnIconScale)
      .setDepth(PANEL_DEPTH + 2)
      .setVisible(false);
    scene.tweens.add({
      targets: this.burnIcon,
      scaleY: BATTLE_PANEL.burnIconScale * 1.2,
      duration: BURN_FLICKER_MS,
      yoyo: true,
      repeat: -1,
    });
    const bar = { x: inner.x, y: y + barY, width: inner.width, height: barHeight };
    this.hpBar = new HpBar(scene, { ...bar, depth: PANEL_DEPTH + 1 });
    this.hpText = scene.add
      .text(inner.x + inner.width, bar.y + barHeight + 2, '', { ...style, fontSize: FONT.small })
      .setOrigin(1, 0)
      .setStroke(COLORS.textShadow, 3)
      .setDepth(PANEL_DEPTH + 2);
    if (side === 'player') {
      this.xpBar = new XpBar(scene, {
        ...inner,
        y: y + BATTLE_PANEL.xpBarY,
        height: BATTLE_PANEL.xpBarHeight,
        originX: 0,
        depth: PANEL_DEPTH + 1,
        label: (p) => TEXT.hud.levelAndXp(p.level, p.xp, p.nextLevelXp),
      });
    }
  }

  setHp(hp: number, maxHp: number, animate = true): void {
    this.hpBar.set(hp, maxHp, animate);
    this.hpText.setText(TEXT.hud.hp(Math.max(0, hp), maxHp));
  }

  setBurning(burning: boolean): void {
    this.burnIcon.setVisible(burning);
  }
}
