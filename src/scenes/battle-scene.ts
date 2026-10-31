import Phaser from 'phaser';
import { SCENES, WORLD_VIEW } from '../config/game-config';
import { getEnemy } from '../data';
import { PLAYER } from '../data/player';
import type { TerrainId } from '../data/types';
import { createBattle, enemyFighter } from '../logic/battle';
import { backdropForTerrain } from '../logic/battle-look';
import { playerFighter, type GameState } from '../logic/game-state';
import { reviveAtLastTown } from '../logic/town-visits';
import { BattleDirector, type FinishedOutcome } from '../systems/battle-director';
import { TEXT } from '../i18n/fi';
import { BattleView } from '../ui/battle-view';
import { coverScreen, revealScreen } from '../ui/screen-wipe';
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
      enemy.stealChance,
    );
    const view = new BattleView(this, {
      playerName: PLAYER.name,
      playerXp: data.state.xp,
      playerSprite: PLAYER.sprite,
      enemyName: enemy.name,
      enemySprite: enemy.sprite,
      backdrop: backdropForTerrain(data.terrain),
    });
    const setup = { state: data.state, battle, enemy, mapEnemyIndex: data.mapEnemyIndex, view };
    new BattleDirector(this, setup, (outcome) => this.end(data.state, outcome));
    revealScreen(this);
  }

  /** Taistelun jälkeen ruutu pikselöityy ja kartta palaa. */
  private end(state: GameState, outcome: FinishedOutcome): void {
    const next = outcome === 'lost' ? this.revive(state) : afterBattle(state, outcome);
    coverScreen(this, () => this.scene.start(SCENES.world, next));
  }

  /** Kaatunut sankari herää viimeisimmässä paikkakunnassa, jossa hän kävi. */
  private revive(state: GameState): WorldSceneData {
    const town = reviveAtLastTown(state);
    return {
      state,
      graceMs: WORLD_VIEW.graceMs.afterRevive,
      message: TEXT.world.revived(town.nameAt),
      fromBattle: true,
    };
  }
}

function afterBattle(state: GameState, outcome: FinishedOutcome): WorldSceneData {
  const graceMs =
    outcome === 'fled' ? WORLD_VIEW.graceMs.afterFlee : WORLD_VIEW.graceMs.afterBattle;
  return { state, graceMs, fromBattle: true };
}
