import type Phaser from 'phaser';
import { PLAYER } from '../data/player';
import type { Enemy } from '../entities/enemy';
import type { Player } from '../entities/player';
import { isDefeated, strike } from '../logic/combat';
import { distance } from '../logic/vector';

// Hoitaa pelaajan ja vihollisten väliset hyökkäykset sekä kuolemat.

export class CombatSystem {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly enemies: Enemy[],
  ) {}

  get enemiesLeft(): number {
    return this.enemies.length;
  }

  update(now: number, playerAttacks: boolean): void {
    if (playerAttacks && this.player.attackCooldown.tryUse(now)) {
      this.playerAttack();
    }
    for (const enemy of this.enemies) {
      if (enemy.update(now, this.player.position)) {
        strike(enemy.fighter, this.player.fighter);
        this.player.flashHurt();
      }
    }
  }

  private playerAttack(): void {
    this.showSwing();
    const targets = this.enemies.filter(
      (enemy) => distance(enemy.position, this.player.position) <= PLAYER.attackRange,
    );
    for (const enemy of targets) {
      strike(this.player.fighter, enemy.fighter);
      enemy.flashHurt();
      if (isDefeated(enemy.fighter)) {
        this.defeat(enemy);
      }
    }
  }

  private defeat(enemy: Enemy): void {
    this.player.xp += enemy.def.xp;
    this.enemies.splice(this.enemies.indexOf(enemy), 1);
    this.scene.tweens.add({
      targets: enemy.sprite,
      alpha: 0,
      duration: 150,
      onComplete: () => enemy.sprite.destroy(),
    });
  }

  private showSwing(): void {
    const { x, y } = this.player.position;
    const swing = this.scene.add.circle(x, y, PLAYER.attackRange, 0xffffff, 0.25);
    this.scene.tweens.add({
      targets: swing,
      alpha: 0,
      duration: 120,
      onComplete: () => swing.destroy(),
    });
  }
}
