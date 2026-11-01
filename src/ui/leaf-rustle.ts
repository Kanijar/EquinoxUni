import type Phaser from 'phaser';
import { WORLD_VIEW } from '../config/game-config';
import { ensurePixelTexture } from './battle/battle-particles';

// Lehtien kahina: kun sankari kävelee metsässä, jalkojen juuresta pöllähtää pieniä
// lehtiä. Näin pelaaja näkee, miksi kulku on hitaampaa.

/** Lehtien liike: vähän sivuille ja ylös, sitten ne putoavat. */
const LEAF_MOTION = {
  speed: { min: 20, max: 45 },
  angle: { min: 200, max: 340 },
  gravityY: 60,
  footOffsetY: 6,
  spreadPx: 4,
  maxAlive: 12,
  /** Sankarin alla (sankari on syvyydellä 10). */
  depth: 9,
} as const;

export class LeafRustle {
  private readonly emitter: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, target: Phaser.GameObjects.Components.Transform) {
    const { colors, everyMs, lifeMs, scale } = WORLD_VIEW.leafRustle;
    const texture = ensurePixelTexture(scene);
    const motion = LEAF_MOTION;
    this.emitter = scene.add
      .particles(0, 0, texture, {
        emitting: false,
        frequency: everyMs,
        lifespan: lifeMs,
        speed: motion.speed,
        angle: motion.angle,
        gravityY: motion.gravityY,
        x: { min: -motion.spreadPx, max: motion.spreadPx },
        scale,
        alpha: { start: 1, end: 0 },
        tint: { onEmit: () => colors[Math.floor(Math.random() * colors.length)] ?? colors[0] },
        maxAliveParticles: motion.maxAlive,
      })
      .setDepth(motion.depth);
    this.emitter.startFollow(target, 0, motion.footOffsetY);
  }

  /** Lehdet lentävät vain, kun sankari liikkuu hidastavassa maastossa. */
  update(active: boolean): void {
    if (active && !this.emitter.emitting) {
      this.emitter.start();
    } else if (!active && this.emitter.emitting) {
      this.emitter.stop();
    }
  }
}
