import type Phaser from 'phaser';
import { WORLD_VIEW } from '../config/game-config';
import type { EnemyDef } from '../data/types';
import { decideIntent } from '../logic/enemy-ai';
import type { Vec2 } from '../logic/vector';

// Kartalla kulkeva vihollinen. Käyttäytyminen tulee logic/enemy-ai.ts:stä
// ja arvot data/enemies.ts:stä. Taistelu itse on BattleScenessä.

export class Enemy {
  readonly sprite: Phaser.Physics.Arcade.Sprite;

  constructor(
    scene: Phaser.Scene,
    position: Vec2,
    readonly def: EnemyDef,
    /** Järjestysnumero data/map-enemies.ts:n listassa. */
    readonly mapIndex: number,
  ) {
    this.sprite = scene.physics.add.sprite(position.x, position.y, def.sprite);
    this.sprite.body?.setSize(12, 9).setOffset(2, 5);
  }

  get position(): Vec2 {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /**
   * Päivittää liikkeen. Palauttaa true, jos vihollinen koskettaa pelaajaa.
   * Kun active on false, vihollinen seisoo paikallaan (esim. heti paon jälkeen).
   */
  update(playerPosition: Vec2, active: boolean): boolean {
    const intent = decideIntent({
      self: this.position,
      player: playerPosition,
      aggroRange: this.def.aggroRange,
      attackRange: WORLD_VIEW.encounterRange,
    });
    if (active && intent.kind === 'chase') {
      const speed = this.def.stats.speed;
      this.sprite.setVelocity(intent.direction.x * speed, intent.direction.y * speed);
      this.sprite.setFlipX(intent.direction.x > 0);
      return false;
    }
    this.sprite.setVelocity(0, 0);
    return active && intent.kind === 'attack';
  }
}
