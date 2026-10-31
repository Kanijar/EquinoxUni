import Phaser from 'phaser';
import { SCENES } from '../config/game-config';
import { getEnemy, getLevel } from '../data';
import { Enemy } from '../entities/enemy';
import { Player } from '../entities/player';
import { isDefeated } from '../logic/combat';
import { CombatSystem } from '../systems/combat-system';
import { Controls } from '../systems/controls';
import { buildLevel, tileToWorld } from '../systems/level-builder';
import { spawnPickups } from '../systems/pickups';
import { Hud } from '../ui/hud';

// Varsinainen pelinäkymä. Tämä scene vain kokoaa osat yhteen:
// logiikka on systems/-, entities/- ja logic/-kansioissa.

export interface GameSceneData {
  readonly levelId?: string;
}

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private controls!: Controls;
  private combat!: CombatSystem;
  private hud!: Hud;

  constructor() {
    super(SCENES.game);
  }

  create(data: GameSceneData): void {
    const level = getLevel(data.levelId ?? 'forest-1');
    const built = buildLevel(this, level);
    const start = tileToWorld(level.playerStart.x, level.playerStart.y);
    this.player = new Player(this, start.x, start.y);
    const enemies = level.enemies.map(
      (spawn) => new Enemy(this, tileToWorld(spawn.x, spawn.y), getEnemy(spawn.id)),
    );
    this.physics.add.collider(this.player.sprite, built.walls);
    this.physics.add.collider(
      enemies.map((enemy) => enemy.sprite),
      built.walls,
    );
    spawnPickups(this, this.player, level.items);
    this.combat = new CombatSystem(this, this.player, enemies);
    this.cameras.main.setBounds(0, 0, built.widthPx, built.heightPx);
    this.cameras.main.startFollow(this.player.sprite, true);
    this.controls = new Controls(this);
    this.hud = new Hud(this);
  }

  override update(time: number): void {
    const input = this.controls.read();
    this.player.move(input.move);
    this.combat.update(time, input.attack);
    this.hud.update(this.player.fighter, this.player.xp);
    if (isDefeated(this.player.fighter)) {
      this.scene.start(SCENES.gameOver, { won: false });
    } else if (this.combat.enemiesLeft === 0) {
      this.scene.start(SCENES.gameOver, { won: true });
    }
  }
}
