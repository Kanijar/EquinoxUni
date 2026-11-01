import type Phaser from 'phaser';
import type { Vec2 } from '../logic/vector';

// Pelaajahahmo kartalla. Ei syötteenkäsittelyä (se on systems/controls.ts:ssä)
// eikä taisteluarvoja (ne ovat logic/game-state.ts:ssä).

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;

  constructor(
    scene: Phaser.Scene,
    position: Vec2,
    private readonly speed: number,
    texture: string,
  ) {
    this.sprite = scene.physics.add.sprite(position.x, position.y, texture);
    this.sprite.setCollideWorldBounds(true).setDepth(10);
    this.sprite.body?.setSize(10, 10).setOffset(3, 6);
  }

  get position(): Vec2 {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /**
   * direction on yksikkövektori tai lyhyempi (joystickin puolivälissä hitaampi).
   * speedFactor tulee maastosta: metsässä alle 1 (logic/terrain-speed.ts).
   */
  move(direction: Vec2, speedFactor = 1): void {
    const speed = this.speed * speedFactor;
    this.sprite.setVelocity(direction.x * speed, direction.y * speed);
    if (direction.x !== 0) {
      this.sprite.setFlipX(direction.x < 0);
    }
  }
}
