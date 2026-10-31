import type Phaser from 'phaser';
import type { EnemyDef } from '../data/types';
import type { Fighter } from '../logic/combat';
import { Cooldown } from '../logic/cooldown';
import { flash } from './effects';
import { decideIntent } from '../logic/enemy-ai';
import type { Vec2 } from '../logic/vector';

// Vihollinen. Käyttäytyminen tulee logic/enemy-ai.ts:stä ja arvot data/enemies.ts:stä.

export class Enemy {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly fighter: Fighter;
  private readonly attackCooldown: Cooldown;

  constructor(
    scene: Phaser.Scene,
    position: Vec2,
    readonly def: EnemyDef,
  ) {
    this.sprite = scene.physics.add.sprite(position.x, position.y, def.sprite);
    this.sprite.body?.setSize(12, 9).setOffset(2, 5);
    this.fighter = { hp: def.stats.maxHp, ...def.stats };
    this.attackCooldown = new Cooldown(def.attackCooldownMs);
  }

  get position(): Vec2 {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /** Päivittää liikkeen. Palauttaa true, jos vihollinen hyökkää tällä hetkellä. */
  update(now: number, playerPosition: Vec2): boolean {
    const intent = decideIntent({
      self: this.position,
      player: playerPosition,
      aggroRange: this.def.aggroRange,
      attackRange: this.def.attackRange,
    });
    if (intent.kind === 'chase') {
      const speed = this.def.stats.speed;
      this.sprite.setVelocity(intent.direction.x * speed, intent.direction.y * speed);
      return false;
    }
    this.sprite.setVelocity(0, 0);
    return intent.kind === 'attack' && this.attackCooldown.tryUse(now);
  }

  flashHurt(): void {
    flash(this.sprite, 0xffffff, 80);
  }
}
