import type Phaser from 'phaser';
import { WORLD_VIEW } from '../config/game-config';
import { getEnemy, MAP_ENEMIES } from '../data';
import { FINAL_BOSS } from '../data/boss';
import { Enemy } from '../entities/enemy';
import { isBossOnMap } from '../logic/boss';
import type { GameState } from '../logic/game-state';
import { isFarEnough, isRespawning, tickRespawns } from '../logic/respawn';
import type { Vec2 } from '../logic/vector';
import { pointTile } from '../logic/world-grid';
import { BossAura } from '../ui/boss-aura';
import { tileToWorld } from './world-map';

// Kartan viholliset: luo kartalla olevat viholliset, palauttaa voitetut viholliset
// paikoilleen palautusajan jälkeen (logic/respawn.ts) ja kertoo, kun joku koskettaa pelaajaa.
// Herännyt loppuboss (logic/boss.ts) on kartalla omalla paikallaan, kunnes se voitetaan.

export class MapEncounters {
  private readonly enemies: Enemy[] = [];
  /** Vihollisten alkuperäiset paikat pikseleinä, samassa järjestyksessä kuin MAP_ENEMIES. */
  private readonly spawnPoints: readonly Vec2[];
  /** Loppuboss kartalla, tai null (ei vielä herännyt tai jo voitettu). */
  readonly boss: Enemy | null;
  private readonly bossAura: BossAura | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly state: GameState,
    private readonly layer: Phaser.Tilemaps.TilemapLayer,
  ) {
    this.spawnPoints = MAP_ENEMIES.map((spawn) => tileToWorld(pointTile(spawn)));
    MAP_ENEMIES.forEach((_, index) => {
      if (!isRespawning(state.respawning, index)) {
        this.spawn(index);
      }
    });
    this.boss = isBossOnMap(state) ? this.spawnBoss() : null;
    if (this.boss) {
      this.bossAura = new BossAura(scene, this.boss.sprite);
    }
  }

  /**
   * Liikuttaa vihollisia ja palauttaa voitettuja kartalle (elapsedMs = kulunut aika).
   * Palauttaa pelaajaa koskettavan vihollisen, tai null.
   */
  update(playerPosition: Vec2, active: boolean, elapsedMs: number): Enemy | null {
    this.respawn(playerPosition, elapsedMs);
    this.bossAura?.update();
    let touching: Enemy | null = null;
    for (const enemy of this.enemies) {
      if (enemy.update(playerPosition, active) && !touching) {
        touching = enemy;
      }
    }
    return touching;
  }

  private respawn(playerPosition: Vec2, elapsedMs: number): void {
    const back = tickRespawns(this.state.respawning, elapsedMs, (index) => {
      const point = this.spawnPoints[index];
      return point !== undefined && isFarEnough(point, playerPosition);
    });
    const sprites = back.flatMap((index) => this.spawn(index)?.sprite.setAlpha(0) ?? []);
    if (sprites.length > 0) {
      this.scene.tweens.add({ targets: sprites, alpha: 1, duration: WORLD_VIEW.respawnFadeMs });
    }
  }

  private spawnBoss(): Enemy {
    const point = tileToWorld(pointTile(FINAL_BOSS));
    const boss = new Enemy(this.scene, point, getEnemy(FINAL_BOSS.enemy), null);
    this.scene.physics.add.collider(boss.sprite, this.layer);
    this.enemies.push(boss);
    return boss;
  }

  private spawn(index: number): Enemy | null {
    const spawn = MAP_ENEMIES[index];
    const point = this.spawnPoints[index];
    if (!spawn || !point) {
      return null;
    }
    const enemy = new Enemy(this.scene, point, getEnemy(spawn.enemy), index);
    this.scene.physics.add.collider(enemy.sprite, this.layer);
    this.enemies.push(enemy);
    return enemy;
  }
}
