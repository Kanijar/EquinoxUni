import Phaser from 'phaser';
import { BATTLE_VIEW } from '../../config/game-config';
import type { BattleParticles } from './battle-particles';

// Tulipallo: hehkuva pallo lentää kaarena loitsijalta kohteeseen ja jättää perään
// liekkivanan. Osuessa pallo räjähtää kipinöiksi ja savuksi, ja onHit kutsutaan.

const FIREBALL_DEPTH = 800;
const GLOW_SCALE = 1.8;
const GLOW_ALPHA = 0.45;
const FLICKER_SCALE = 1.25;

export interface Point {
  readonly x: number;
  readonly y: number;
}

export function showFireball(
  scene: Phaser.Scene,
  particles: BattleParticles,
  path: { readonly from: Point; readonly to: Point },
  onHit: () => void,
): void {
  const { radius, flightMs, color, glowColor, coreColor, arcPx, flickerMs } = BATTLE_VIEW.fireball;
  const { from, to } = path;
  const glow = scene.add
    .circle(from.x, from.y, radius * GLOW_SCALE, glowColor, GLOW_ALPHA)
    .setDepth(FIREBALL_DEPTH);
  const ball = scene.add.circle(from.x, from.y, radius, color).setDepth(FIREBALL_DEPTH);
  const core = scene.add.circle(from.x, from.y, radius / 2, coreColor).setDepth(FIREBALL_DEPTH);
  const trail = particles.flame(ball);
  scene.tweens.add({
    targets: [glow, core],
    scale: FLICKER_SCALE,
    duration: flickerMs,
    yoyo: true,
    repeat: -1,
  });
  scene.tweens.addCounter({
    from: 0,
    to: 1,
    duration: flightMs,
    ease: 'Sine.easeIn',
    onUpdate: (tween) => {
      const t = tween.getValue() ?? 0;
      const x = Phaser.Math.Linear(from.x, to.x, t);
      const y = Phaser.Math.Linear(from.y, to.y, t) - Math.sin(t * Math.PI) * arcPx;
      for (const part of [glow, ball, core]) {
        part.setPosition(x, y);
      }
    },
    onComplete: () => {
      trail.stop();
      scene.time.delayedCall(flightMs * 2, () => trail.destroy());
      for (const part of [glow, ball, core]) {
        scene.tweens.killTweensOf(part);
        part.destroy();
      }
      particles.burst('explosion', to.x, to.y);
      particles.burst('smoke', to.x, to.y);
      onHit();
    },
  });
}
