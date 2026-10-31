import type Phaser from 'phaser';
import { PLAYER } from '../data/player';
import type { Fighter } from '../logic/combat';
import { Cooldown } from '../logic/cooldown';
import { flash } from './effects';
import type { Vec2 } from '../logic/vector';

// Pelaajahahmo: Phaser-sprite + taisteluarvot. Ei syötteenkäsittelyä
// (se on systems/controls.ts:ssä), jotta hahmoa on helppo ohjata myös muuten.

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly fighter: Fighter;
  readonly attackCooldown = new Cooldown(PLAYER.attackCooldownMs);
  xp = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, PLAYER.sprite);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body?.setSize(10, 12).setOffset(3, 4);
    this.fighter = { hp: PLAYER.stats.maxHp, ...PLAYER.stats };
  }

  get position(): Vec2 {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /** direction on yksikkövektori tai lyhyempi (joystickin puolivälissä hitaampi). */
  move(direction: Vec2): void {
    const speed = PLAYER.stats.speed;
    this.sprite.setVelocity(direction.x * speed, direction.y * speed);
    if (direction.x !== 0) {
      this.sprite.setFlipX(direction.x < 0);
    }
  }

  flashHurt(): void {
    flash(this.sprite, 0xff4444, 120);
  }
}
