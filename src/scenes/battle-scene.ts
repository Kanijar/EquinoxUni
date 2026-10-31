import Phaser from 'phaser';
import { SCENES, WORLD_VIEW } from '../config/game-config';
import { getEnemy } from '../data';
import { PLAYER } from '../data/player';
import { createBattle, enemyFighter } from '../logic/battle';
import { playerFighter, playerSprite, type GameState } from '../logic/game-state';
import { reviveAtLastTown } from '../logic/town-visits';
import { BattleDirector, type FinishedOutcome } from '../systems/battle-director';
import { TEXT } from '../i18n/fi';
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
      enemyFighter(enemy),
      data.state.inventory,
      enemy.stealChance,
    );
    const view = new BattleView(this, {
      playerName: PLAYER.name,
      playerXp: data.state.xp,
      playerSprite: playerSprite(data.state),
      enemyName: enemy.name,
      enemySprite: enemy.sprite,
    });
    const setup = { state: data.state, battle, enemy, mapEnemyIndex: data.mapEnemyIndex, view };
    new BattleDirector(this, setup, (outcome) => this.end(data.state, outcome));
  }

  private end(state: GameState, outcome: FinishedOutcome): void {
    if (outcome === 'lost') {
      this.revive(state);
      return;
    }
    const graceMs =
      outcome === 'fled' ? WORLD_VIEW.graceMs.afterFlee : WORLD_VIEW.graceMs.afterBattle;
    const next: WorldSceneData = { state, graceMs };
    this.scene.start(SCENES.world, next);
  }

  /** Kaatunut sankari herää viimeisimmässä paikkakunnassa, jossa hän kävi. */
  private revive(state: GameState): void {
    const town = reviveAtLastTown(state);
    const next: WorldSceneData = {
      state,
      graceMs: WORLD_VIEW.graceMs.afterRevive,
      message: TEXT.world.revived(town.nameAt),
    };
    this.scene.start(SCENES.world, next);
  }
}
