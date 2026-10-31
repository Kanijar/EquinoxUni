import type Phaser from 'phaser';
import { BATTLE_VIEW, COLORS, FONT } from '../config/game-config';

// Tulipallo: hehkuva pallo lentää loitsijalta kohteeseen. onHit kutsutaan,
// kun pallo osuu, jolloin kohde voi välähtää. Palaminen näkyy nousevana vahinkona.

const FIREBALL_DEPTH = 800;
const GLOW_SCALE = 1.6;
const GLOW_ALPHA = 0.5;

export interface Point {
  readonly x: number;
  readonly y: number;
}

export function showFireball(scene: Phaser.Scene, from: Point, to: Point, onHit: () => void): void {
  const { radius, flightMs, color, glowColor, offsetY } = BATTLE_VIEW.fireball;
  const glow = scene.add
    .circle(from.x, from.y - offsetY, radius * GLOW_SCALE, glowColor, GLOW_ALPHA)
    .setDepth(FIREBALL_DEPTH);
  const ball = scene.add.circle(from.x, from.y - offsetY, radius, color).setDepth(FIREBALL_DEPTH);
  scene.tweens.add({
    targets: [glow, ball],
    x: to.x,
    y: to.y - offsetY,
    duration: flightMs,
    ease: 'Quad.easeIn',
    onComplete: () => {
      glow.destroy();
      ball.destroy();
      onHit();
    },
  });
}

/** Palamisen vahinko (esim. "-1") nousee kohteen yläpuolelta ja häviää. */
export function showBurnPopup(scene: Phaser.Scene, target: Point, text: string): void {
  const { popupMs, popupRisePx, popupOffsetY, stroke } = BATTLE_VIEW.burn;
  const popup = scene.add
    .text(target.x, target.y - popupOffsetY, text, {
      fontFamily: FONT.family,
      fontSize: FONT.medium,
      color: COLORS.burnText,
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setStroke(COLORS.textShadow, stroke)
    .setDepth(FIREBALL_DEPTH);
  scene.tweens.add({
    targets: popup,
    y: popup.y - popupRisePx,
    alpha: 0,
    duration: popupMs,
    onComplete: () => popup.destroy(),
  });
}
