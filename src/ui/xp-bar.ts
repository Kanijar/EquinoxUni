import type Phaser from 'phaser';
import { COLORS, FONT } from '../config/game-config';
import { xpProgress, type XpProgress } from '../logic/progression';

// Kokemuspistepalkki: näyttää, kuinka paljon KP:tä on kerätty kohti seuraavaa
// tasoa. Käytössä kartan HUDissa ja taistelunäkymässä.

const TEXT_GAP = 2;

export interface XpBarLayout {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** 0 = palkki kasvaa vasemmalta, 1 = palkki on kiinni oikeassa reunassa. */
  readonly originX: number;
  readonly depth: number;
  /** Palkin alla näkyvä teksti, esim. "Taso 2  KP 15/30". */
  readonly label: (progress: XpProgress) => string;
}

export class XpBar {
  private readonly fill: Phaser.GameObjects.Rectangle;
  private readonly text: Phaser.GameObjects.Text;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly layout: XpBarLayout,
  ) {
    const { x, y, width, height, originX, depth } = layout;
    scene.add
      .rectangle(x, y, width, height, COLORS.xpBarBack)
      .setOrigin(originX, 0)
      .setScrollFactor(0)
      .setDepth(depth);
    this.fill = scene.add
      .rectangle(x, y, width, height, COLORS.xpBar)
      .setOrigin(originX, 0)
      .setScrollFactor(0)
      .setDepth(depth + 1);
    this.text = scene.add
      .text(x, y + height + TEXT_GAP, '', {
        fontFamily: FONT.family,
        fontSize: FONT.small,
        color: COLORS.text,
      })
      .setOrigin(originX, 0)
      .setStroke(COLORS.textShadow, 3)
      .setScrollFactor(0)
      .setDepth(depth + 1);
  }

  /**
   * Päivittää palkin. Kun fillMs on annettu, palkki täyttyy liukuen. Jos taso
   * nousi, palkki täyttyy ensin loppuun ja alkaa sitten alusta.
   */
  set(xp: number, fillMs?: number): void {
    const progress = xpProgress(xp);
    this.text.setText(this.layout.label(progress));
    const target = progress.fraction;
    if (fillMs === undefined) {
      this.fill.setScale(target, 1);
      return;
    }
    if (target >= this.fill.scaleX) {
      this.tweenTo(target, fillMs);
      return;
    }
    this.tweenTo(1, fillMs / 2, () => {
      this.fill.setScale(0, 1);
      this.tweenTo(target, fillMs / 2);
    });
  }

  private tweenTo(scaleX: number, duration: number, onComplete: () => void = () => {}): void {
    this.scene.tweens.add({ targets: this.fill, scaleX, duration, onComplete });
  }
}
