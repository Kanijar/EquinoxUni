import type Phaser from 'phaser';
import { PARTICLE_LIMITS } from '../../config/battle-config';
import { FLAME_STREAM, PARTICLE_BURSTS, type ParticleBurstId } from '../../data/battle-effects';
import type { ParticleBurstDef } from '../../data/types';

// Taistelun hiukkaset. Jokaiselle efektille on yksi valmiiksi luotu emitteri, joka
// "räjäytetään" tarvittaessa. Hiukkasten määrällä on katto (PARTICLE_LIMITS), jotta
// puhelin pysyy sulavana. Hiukkasen kuva on pieni valkoinen neliö, jonka väri vaihtuu.

const PIXEL_TEXTURE = 'fx-pixel';
const PIXEL_SIZE = 2;

/** Luo hiukkasten kuvan (2 × 2 valkoinen neliö), jos sitä ei vielä ole. */
export function ensurePixelTexture(scene: Phaser.Scene): string {
  if (!scene.textures.exists(PIXEL_TEXTURE)) {
    const canvas = scene.textures.createCanvas(PIXEL_TEXTURE, PIXEL_SIZE, PIXEL_SIZE);
    if (canvas) {
      canvas.getContext().fillStyle = '#ffffff';
      canvas.getContext().fillRect(0, 0, PIXEL_SIZE, PIXEL_SIZE);
      canvas.refresh();
    }
  }
  return PIXEL_TEXTURE;
}

export class BattleParticles {
  private readonly emitters = new Map<
    ParticleBurstId,
    Phaser.GameObjects.Particles.ParticleEmitter
  >();

  constructor(private readonly scene: Phaser.Scene) {
    ensurePixelTexture(scene);
  }

  /** Räjäyttää efektin kohdassa (x, y). colors korvaa efektin omat värit (esim. vihollisen värit). */
  burst(id: ParticleBurstId, x: number, y: number, colors?: readonly number[]): void {
    const def: ParticleBurstDef = PARTICLE_BURSTS[id];
    const emitter = this.emitter(id, def);
    emitter.setParticleTint({ onEmit: () => pick(colors ?? def.colors) });
    emitter.explode(def.count, x, y);
  }

  /** Jatkuva liekkivirta, joka seuraa kohdetta (palava vihollinen, tulipallon vana). */
  flame(target: Phaser.GameObjects.Components.Transform, offsetY = 0): FlameStream {
    return new FlameStream(this.scene, target, offsetY);
  }

  private emitter(
    id: ParticleBurstId,
    def: ParticleBurstDef,
  ): Phaser.GameObjects.Particles.ParticleEmitter {
    const existing = this.emitters.get(id);
    if (existing) {
      return existing;
    }
    const emitter = this.scene.add
      .particles(0, 0, PIXEL_TEXTURE, {
        emitting: false,
        speed: def.speed,
        angle: def.angle ?? { min: 0, max: 360 },
        lifespan: def.lifeMs,
        scale: { start: def.size / PIXEL_SIZE, end: 0 },
        alpha: { start: 1, end: 0.3 },
        gravityY: def.gravity,
        maxAliveParticles: PARTICLE_LIMITS.perBurstEmitter,
      })
      .setDepth(PARTICLE_LIMITS.depth);
    this.emitters.set(id, emitter);
    return emitter;
  }
}

/** Liekkivirta: kipinät nousevat kohteesta, kunnes stop() kutsutaan. */
export class FlameStream {
  private readonly emitter: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.Components.Transform,
    offsetY: number,
  ) {
    const { colors, everyMs, lifeMs, speed, size, rise } = FLAME_STREAM;
    this.emitter = scene.add
      .particles(0, 0, ensurePixelTexture(scene), {
        frequency: everyMs,
        speed,
        lifespan: lifeMs,
        scale: { start: size / PIXEL_SIZE, end: 0 },
        alpha: { start: 1, end: 0 },
        gravityY: rise,
        x: { min: -10, max: 10 },
        y: { min: -6, max: 6 },
        tint: { onEmit: () => pick(colors) },
        maxAliveParticles: PARTICLE_LIMITS.flame,
      })
      .setDepth(PARTICLE_LIMITS.depth);
    this.emitter.startFollow(target, 0, offsetY);
  }

  get running(): boolean {
    return this.emitter.emitting;
  }

  start(): void {
    this.emitter.start();
  }

  /** Lopettaa uudet kipinät. Ilmassa olevat sammuvat itsestään. */
  stop(): void {
    this.emitter.stop();
  }

  destroy(): void {
    this.emitter.destroy();
  }
}

function pick(colors: readonly number[]): number {
  return colors[Math.floor(Math.random() * colors.length)] ?? 0xffffff;
}
