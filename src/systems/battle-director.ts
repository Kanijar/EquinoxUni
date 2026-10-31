import type Phaser from 'phaser';
import type { EnemyDef } from '../data/types';
import { TEXT } from '../i18n/fi';
import {
  canChoose,
  takeTurn,
  type Battle,
  type BattleAction,
  type BattleOutcome,
} from '../logic/battle';
import { applyBattleResult, type GameState } from '../logic/game-state';
import { BattleMenu } from '../ui/battle-menu';
import type { BattleView } from '../ui/battle-view';
import { eventStep, playSteps, victorySteps, type BattleStep } from './battle-steps';

// Ohjaa taistelun kulkua: pelaaja valitsee napista, logiikka laskee vuoron,
// tapahtumat näytetään järjestyksessä ja lopuksi tulos tallennetaan peliin.

export interface BattleSetup {
  readonly state: GameState;
  readonly battle: Battle;
  readonly enemy: EnemyDef;
  readonly mapEnemyIndex: number;
  readonly view: BattleView;
}

export type FinishedOutcome = Exclude<BattleOutcome, 'ongoing'>;

export class BattleDirector {
  private readonly menu: BattleMenu;
  private busy = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly setup: BattleSetup,
    private readonly onEnd: (outcome: FinishedOutcome) => void,
  ) {
    this.menu = new BattleMenu(scene, (action) => this.choose(action));
    setup.view.updateHp(setup.battle);
    setup.view.say(TEXT.battle.appears(setup.enemy.name));
    this.menu.refresh(setup.battle, true);
  }

  private choose(action: BattleAction): void {
    const { battle, view, enemy } = this.setup;
    if (this.busy || !canChoose(battle, action)) {
      return;
    }
    this.busy = true;
    this.menu.refresh(battle, false);
    const events = takeTurn(battle, action, Math.random);
    const steps: BattleStep[] = events.map((event) => {
      const step = eventStep(event, view, enemy.name);
      return { ...step, effect: () => this.showStep(step) };
    });
    playSteps(this.scene, view, steps, () => this.afterTurn());
  }

  private showStep(step: BattleStep): void {
    step.effect?.();
    this.setup.view.updateHp(this.setup.battle);
  }

  private afterTurn(): void {
    const { battle, view } = this.setup;
    if (battle.outcome === 'ongoing') {
      this.busy = false;
      view.say(TEXT.battle.choose);
      this.menu.refresh(battle, true);
      return;
    }
    this.finish(battle.outcome);
  }

  private finish(outcome: FinishedOutcome): void {
    const { state, battle, enemy, mapEnemyIndex, view } = this.setup;
    const reward = applyBattleResult(state, battle, mapEnemyIndex, enemy);
    let steps: BattleStep[] = [];
    if (reward) {
      view.playDefeat('enemy');
      steps = victorySteps(reward, enemy.name);
    } else if (outcome === 'lost') {
      view.playDefeat('player');
      steps = [{ text: TEXT.battle.lost }];
    }
    playSteps(this.scene, view, steps, () => this.onEnd(outcome));
  }
}
