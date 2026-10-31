import type Phaser from 'phaser';
import { BATTLE_PANEL, PIXEL_PANEL } from '../../config/battle-config';
import { COLORS } from '../../config/game-config';
import { hpTier } from '../../logic/battle-look';

// Animoitu elämäpalkki: väri vaihtuu vihreästä keltaiseen ja punaiseen, menetetty
// elämä näkyy hetken vaaleana haamuna ennen kuin se valuu pois, ja vähäinen elämä sykkii.

export interface HpBarLayout {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly depth: number;
}

export class HpBar {
  private readonly ghost: Phaser.GameObjects.Rectangle;
  private readonly fill: Phaser.GameObjects.Rectangle;
  private fraction = 1;
  private pulse: Phaser.Tweens.Tween | null = null;
  private drain: Phaser.Tweens.Tween | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    layout: HpBarLayout,
  ) {
    const { x, y, width, height, depth } = layout;
    scene.add
      .rectangle(x - 1, y - 1, width + 2, height + 2, PIXEL_PANEL.outline)
      .setOrigin(0)
      .setDepth(depth);
    scene.add.rectangle(x, y, width, height, COLORS.hpBarBack).setOrigin(0).setDepth(depth);
    this.ghost = scene.add
      .rectangle(x, y, width, height, BATTLE_PANEL.ghostColor)
      .setOrigin(0)
      .setDepth(depth);
    this.fill = scene.add
      .rectangle(x, y, width, height, BATTLE_PANEL.hpColors.high)
      .setOrigin(0)
      .setDepth(depth);
    // Valoraita palkin yläreunassa tekee siitä pyöreämmän näköisen.
    scene.add
      .rectangle(x, y + 1, width, 1, 0xffffff, 0.35)
      .setOrigin(0)
      .setDepth(depth);
  }

  /** Asettaa elämän. animate = false asettaa suoraan (taistelun alussa). */
  set(hp: number, maxHp: number, animate = true): void {
    const next = Math.max(0, Math.min(1, hp / maxHp));
    if (next === this.fraction && animate) {
      return;
    }
    const { ghostDelayMs, drainMs } = BATTLE_PANEL;
    this.drain?.stop();
    this.fill.setFillStyle(BATTLE_PANEL.hpColors[hpTier(next, BATTLE_PANEL.hpLimits)]);
    if (!animate) {
      this.fill.setScale(next, 1);
      this.ghost.setScale(next, 1);
    } else if (next < this.fraction) {
      // Vahinko: palkki putoaa heti, haamu valuu perässä.
      this.fill.setScale(next, 1);
      this.scene.tweens.add({
        targets: this.ghost,
        scaleX: next,
        delay: ghostDelayMs,
        duration: drainMs,
      });
    } else {
      // Paraneminen: palkki täyttyy liukuen.
      this.ghost.setScale(next, 1);
      this.drain = this.scene.tweens.add({ targets: this.fill, scaleX: next, duration: drainMs });
    }
    this.fraction = next;
    this.updatePulse(next);
  }

  private updatePulse(fraction: number): void {
    const low = fraction > 0 && hpTier(fraction, BATTLE_PANEL.hpLimits) === 'low';
    if (low && !this.pulse) {
      this.pulse = this.scene.tweens.add({
        targets: this.fill,
        alpha: 0.45,
        duration: BATTLE_PANEL.lowPulseMs,
        yoyo: true,
        repeat: -1,
      });
    } else if (!low && this.pulse) {
      this.pulse.stop();
      this.pulse = null;
      this.fill.setAlpha(1);
    }
  }
}
