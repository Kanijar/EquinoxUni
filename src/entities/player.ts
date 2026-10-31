import type Phaser from 'phaser';
import { PLAYER } from '../data/player';
import type { Vec2 } from '../logic/vector';

// Pelaajahahmo kartalla. Ei syötteenkäsittelyä (se on systems/controls.ts:ssä)
// eikä taisteluarvoja (ne ovat logic/game-state.ts:ssä).

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;

  constructor(
    scene: Phaser.Scene,
    position: Vec2,
    private readonly speed: number,
  ) {
    this.sprite = scene.physics.add.sprite(position.x, position.y, PLAYER.sprite);
    this.sprite.setCollideWorldBounds(true).setDepth(10);
    this.sprite.body?.setSize(10, 10).setOffset(3, 6);
  }

  get position(): Vec2 {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /** direction on yksikkövektori tai lyhyempi (joystickin puolivälissä hitaampi). */
  move(direction: Vec2): void {
    this.sprite.setVelocity(direction.x * this.speed, direction.y * this.speed);
    if (direction.x !== 0) {
      this.sprite.setFlipX(direction.x < 0);
    }
  }
}
