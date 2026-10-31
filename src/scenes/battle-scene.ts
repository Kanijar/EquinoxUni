import Phaser from 'phaser';
import { SCENES, WORLD_VIEW } from '../config/game-config';
import { getEnemy, MAP_ENEMIES } from '../data';
import { PLAYER } from '../data/player';
import { createBattle } from '../logic/battle';
import { playerFighter, type GameState } from '../logic/game-state';
import { BattleDirector, type FinishedOutcome } from '../systems/battle-director';
import { BattleView } from '../ui/battle-view';
import type { WorldSceneData } from './world-scene';

// Vuoropohjainen taistelu. Alkaa, kun kartalla vihollinen koskettaa pelaajaa.
// Kulku on systems/battle-director.ts:ssä ja säännöt logic/battle.ts:ssä.

export interface BattleSceneData {
  readonly state: GameState;
  /** Vihollisen järjestysnumero data/map-enemies.ts:ssä. */
  readonly mapEnemyIndex: number;
}

export class BattleScene extends Phaser.Scene {
  constructor() {
    super(SCENES.battle);
  }

  create(data: BattleSceneData): void {
    const spawn = MAP_ENEMIES[data.mapEnemyIndex];
    if (!spawn) {
      throw new Error(`Tuntematon karttavihollinen: ${data.mapEnemyIndex}`);
    }
    const enemy = getEnemy(spawn.enemy);
    const battle = createBattle(
      playerFighter(data.state),
      { hp: enemy.stats.maxHp, ...enemy.stats },
      data.state.inventory,
    );
    const view = new BattleView(this, {
      playerName: PLAYER.name,
      playerSprite: PLAYER.sprite,
      enemyName: enemy.name,
      enemySprite: enemy.sprite,
    });
    const setup = { state: data.state, battle, enemy, mapEnemyIndex: data.mapEnemyIndex, view };
    new BattleDirector(this, setup, (outcome) => this.end(data.state, outcome));
  }

  private end(state: GameState, outcome: FinishedOutcome): void {
    if (outcome === 'lost') {
      this.scene.start(SCENES.gameOver, { won: false });
      return;
    }
    const graceMs =
      outcome === 'fled' ? WORLD_VIEW.graceMs.afterFlee : WORLD_VIEW.graceMs.afterBattle;
    const next: WorldSceneData = { state, graceMs };
    this.scene.start(SCENES.world, next);
  }
}
