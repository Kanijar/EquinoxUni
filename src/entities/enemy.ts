import type Phaser from 'phaser';
import { WORLD_VIEW } from '../config/game-config';
import type { EnemyDef } from '../data/types';
import { decideIntent } from '../logic/enemy-ai';
import type { Vec2 } from '../logic/vector';

/** Törmäyslaatikko jalkojen kohdalla: leveys, korkeus ja etäisyys spriten alareunasta. */
const BODY = { width: 12, height: 9, bottomGap: 2 } as const;

// Kartalla kulkeva vihollinen. Käyttäytyminen tulee logic/enemy-ai.ts:stä
// ja arvot data/enemies.ts:stä. Taistelu itse on BattleScenessä.

export class Enemy {
  readonly sprite: Phaser.Physics.Arcade.Sprite;

  constructor(
    scene: Phaser.Scene,
    position: Vec2,
    readonly def: EnemyDef,
    /** Järjestysnumero data/map-enemies.ts:n listassa, tai null (loppuboss, data/boss.ts). */
    readonly mapIndex: number | null,
  ) {
    this.sprite = scene.physics.add.sprite(position.x, position.y, def.sprite);
    // Laatikko on jalkojen kohdalla myös isommalla (24 px) bossilla.
    const { width, height } = this.sprite;
    this.sprite.body
      ?.setSize(BODY.width, BODY.height)
      .setOffset((width - BODY.width) / 2, height - BODY.height - BODY.bottomGap);
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
