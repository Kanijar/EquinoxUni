import Phaser from 'phaser';
import { SCENES, WORLD_VIEW } from '../config/game-config';
import { getEnemy } from '../data';
import type { TerrainId } from '../data/types';
import { createBattle, enemyFighter } from '../logic/battle';
import { backdropForBattle } from '../logic/battle-look';
import { bossName } from '../logic/boss';
import {
  playerFighter,
  playerSprite,
  type GameState,
  type VictoryReward,
} from '../logic/game-state';
import { reviveAtLastTown } from '../logic/town-visits';
import { BattleDirector, type FinishedOutcome } from '../systems/battle-director';
import { TEXT } from '../i18n/text';
import { BattleView } from '../ui/battle-view';
import { coverScreen, revealScreen } from '../ui/screen-wipe';
import type { VictorySceneData } from './victory-scene';
import type { WorldSceneData } from './world-scene';

// Vuoropohjainen taistelu. Alkaa, kun kartalla vihollinen koskettaa pelaajaa
// tai kun vihollinen hyökkää väijytyksestä (esim. ryöstäjä metsässä).
// Kulku on systems/battle-director.ts:ssä, säännöt logic/battle.ts:ssä ja
// grafiikka ui/battle-view.ts:ssä. Tausta valitaan maaston mukaan (data/battle-backdrops.ts).

export interface BattleSceneData {
  readonly state: GameState;
  /** Vihollisen tunniste (data/enemies.ts). */
  readonly enemyId: string;
  /** Vihollisen järjestysnumero data/map-enemies.ts:ssä, tai null väijytyksessä. */
  readonly mapEnemyIndex: number | null;
  /** Maasto, jossa taistelu alkoi (valitsee taustan). Puuttuu = oletustausta. */
  readonly terrain?: TerrainId;
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
      enemy,
    );
    const view = new BattleView(this, {
      playerName: TEXT.names.player,
      playerXp: data.state.xp,
      playerSprite: playerSprite(data.state),
      enemyName: TEXT.names.enemy(enemy),
      enemySprite: enemy.sprite,
      backdrop: backdropForBattle(data.terrain, enemy),
    });
    const setup = { state: data.state, battle, enemy, mapEnemyIndex: data.mapEnemyIndex, view };
    new BattleDirector(this, setup, (outcome, reward) => this.end(data.state, outcome, reward));
    revealScreen(this);
  }

  /**
   * Taistelun jälkeen ruutu pikselöityy ja kartta palaa. Loppubossin voiton jälkeen
   * näytetään ensin voittoruutu, josta peli jatkuu kartalle.
   */
  private end(state: GameState, outcome: FinishedOutcome, reward: VictoryReward | null): void {
    if (reward?.boss?.kind === 'defeated') {
      const victory: VictorySceneData = { state, kind: 'boss' };
      coverScreen(this, () => this.scene.start(SCENES.victory, victory));
      return;
    }
    const next = outcome === 'lost' ? this.revive(state) : afterBattle(state, outcome, reward);
    coverScreen(this, () => this.scene.start(SCENES.world, next));
  }

  /** Kaatunut sankari herää viimeisimmässä paikkakunnassa, jossa hän kävi. */
  private revive(state: GameState): WorldSceneData {
    const town = reviveAtLastTown(state);
    return {
      state,
      graceMs: WORLD_VIEW.graceMs.afterRevive,
      message: TEXT.world.revived(town),
      fromBattle: true,
    };
  }
}

function afterBattle(
  state: GameState,
  outcome: FinishedOutcome,
  reward: VictoryReward | null,
): WorldSceneData {
  const graceMs =
    outcome === 'fled' ? WORLD_VIEW.graceMs.afterFlee : WORLD_VIEW.graceMs.afterBattle;
  // Viides tunturipeikko herätti bossin: kartalla kerrotaan, missä se odottaa.
  if (reward?.boss?.kind === 'awakened') {
    return {
      state,
      graceMs,
      fromBattle: true,
      message: TEXT.boss.awakenedMap(bossName()),
      bossAwakened: true,
    };
  }
  return { state, graceMs, fromBattle: true };
}
