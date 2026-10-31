import type Phaser from 'phaser';
import { WORLD_VIEW } from '../config/game-config';

// Loppubossin merkki kartalla: sykkivä punainen hehku bossin jalkojen alla.
// Hehku seuraa bossia, kun se lähtee pelaajan perään.

/** Boss piirretään muiden kartan hahmojen päälle ja hehku bossin alle (mutta kartan päälle). */
const BOSS_DEPTH = 2;
const AURA_DEPTH = 1;

export class BossAura {
  private readonly glow: Phaser.GameObjects.Ellipse;

  constructor(
    scene: Phaser.Scene,
    private readonly target: Phaser.GameObjects.Sprite,
  ) {
    const { radius, color, alpha, pulseScale, pulseMs } = WORLD_VIEW.bossAura;
    this.glow = scene.add
      .ellipse(target.x, this.footY(), radius * 2, radius, color, alpha)
      .setDepth(AURA_DEPTH);
    target.setDepth(BOSS_DEPTH);
    scene.tweens.add({
      targets: this.glow,
      scaleX: pulseScale,
      scaleY: pulseScale,
      alpha: alpha / 2,
      duration: pulseMs,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  update(): void {
    this.glow.setPosition(this.target.x, this.footY());
  }

  private footY(): number {
    return this.target.y + this.target.displayHeight / 2;
  }
}
