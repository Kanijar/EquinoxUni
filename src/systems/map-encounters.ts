import type Phaser from 'phaser';
import { getEnemy, MAP_ENEMIES, WORLD } from '../data';
import { Enemy } from '../entities/enemy';
import type { GameState } from '../logic/game-state';
import { geoToTile } from '../logic/geo';
import type { Vec2 } from '../logic/vector';
import { tileToWorld } from './world-map';

// Kartan viholliset: luo voittamattomat viholliset ja kertoo, kun joku koskettaa pelaajaa.

export class MapEncounters {
  private readonly enemies: Enemy[];

  constructor(scene: Phaser.Scene, state: GameState, layer: Phaser.Tilemaps.TilemapLayer) {
    this.enemies = MAP_ENEMIES.flatMap((spawn, index) => {
      if (state.defeated.includes(index)) {
        return [];
      }
      const pos = tileToWorld(geoToTile(spawn, WORLD.projection));
      return [new Enemy(scene, pos, getEnemy(spawn.enemy), index)];
    });
    scene.physics.add.collider(
      this.enemies.map((enemy) => enemy.sprite),
      layer,
    );
  }

  get enemiesLeft(): number {
    return this.enemies.length;
  }

  /** Liikuttaa vihollisia. Palauttaa pelaajaa koskettavan vihollisen, tai null. */
  update(playerPosition: Vec2, active: boolean): Enemy | null {
    let touching: Enemy | null = null;
    for (const enemy of this.enemies) {
      if (enemy.update(playerPosition, active) && !touching) {
        touching = enemy;
      }
    }
    return touching;
  }
}
