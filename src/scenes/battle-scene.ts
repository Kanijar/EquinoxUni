import Phaser from 'phaser';
import { SCENES, WORLD_VIEW } from '../config/game-config';
import { getEnemy } from '../data';
import { PLAYER } from '../data/player';
import { createBattle } from '../logic/battle';
import { playerFighter, type GameState } from '../logic/game-state';
import { BattleDirector, type FinishedOutcome } from '../systems/battle-director';
import { BattleView } from '../ui/battle-view';
import type { WorldSceneData } from './world-scene';

// Vuoropohjainen taistelu. Alkaa, kun kartalla vihollinen koskettaa pelaajaa
// tai kun vihollinen hyökkää väijytyksestä (esim. ryöstäjä metsässä).
// Kulku on systems/battle-director.ts:ssä ja säännöt logic/battle.ts:ssä.

export interface BattleSceneData {
  readonly state: GameState;
  /** Vihollisen tunniste (data/enemies.ts). */
  readonly enemyId: string;
  /** Vihollisen järjestysnumero data/map-enemies.ts:ssä, tai null väijytyksessä. */
  readonly mapEnemyIndex: number | null;
}

export class BattleScene extends Phaser.Scene {
  constructor() {
    super(SCENES.battle);
  }

  create(data: BattleSceneData): void {
    const enemy = getEnemy(data.enemyId);
    const battle = createBattle(
      playerFighter(data.state),
      { hp: enemy.stats.maxHp, ...enemy.stats },
      data.state.inventory,
      enemy.stealChance,
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
