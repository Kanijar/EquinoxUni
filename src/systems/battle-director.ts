import type Phaser from 'phaser';
import { MAGIC_RULES } from '../data/rules';
import type { EnemyDef } from '../data/types';
import { TEXT } from '../i18n/fi';
import {
  canChoose,
  takeTurn,
  type Battle,
  type BattleAction,
  type BattleOutcome,
} from '../logic/battle';
import { isBoss } from '../logic/boss';
import { applyBattleResult, type GameState, type VictoryReward } from '../logic/game-state';
import { burnTick } from '../logic/magic';
import { BattleMenu } from '../ui/battle-menu';
import type { BattleView } from '../ui/battle-view';
import { eventStep, playSteps, type BattleStep } from './battle-steps';
import { victorySteps } from './victory-steps';

// Ohjaa taistelun kulkua: pelaaja valitsee napista, logiikka laskee vuoron,
// tapahtumat näytetään järjestyksessä ja lopuksi tulos tallennetaan peliin.
// Tulipallon sytyttämä palaminen kulkee oikeassa ajassa (kerran sekunnissa).

export interface BattleSetup {
  readonly state: GameState;
  readonly battle: Battle;
  readonly enemy: EnemyDef;
  /** null = vihollinen hyökkäsi väijytyksestä eikä ollut kartalla. */
  readonly mapEnemyIndex: number | null;
  readonly view: BattleView;
}

export type FinishedOutcome = Exclude<BattleOutcome, 'ongoing'>;

export class BattleDirector {
  private readonly menu: BattleMenu;
  private busy = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly setup: BattleSetup,
    /** Kutsutaan taistelun lopuksi. reward on voiton palkinto, tai null. */
    private readonly onEnd: (outcome: FinishedOutcome, reward: VictoryReward | null) => void,
  ) {
    this.menu = new BattleMenu(scene, {
      onChoose: (action) => this.choose(action),
      onAttackMenu: (open) => setup.view.say(open ? TEXT.battle.chooseAttack : TEXT.battle.choose),
    });
    setup.view.syncHp(setup.battle, false);
    setup.view.intro();
    setup.view.say(introText(setup));
    this.menu.refresh(setup.battle, true);
    scene.time.addEvent({
      delay: MAGIC_RULES.burnTickMs,
      loop: true,
      callback: () => this.tickBurn(),
    });
  }

  /** Palava vihollinen menettää elämää. Jos se kaatuu kesken vuoron, voitto näytetään vuoron jälkeen. */
  private tickBurn(): void {
    const { battle, view } = this.setup;
    const tick = burnTick(battle);
    if (!tick) {
      return;
    }
    view.playBurn(tick.damage);
    view.syncHp(battle);
    view.setBurning(battle.enemyBurn !== null);
    if (battle.outcome === 'won' && !this.busy) {
      this.busy = true;
      this.menu.refresh(battle, false);
      this.finish('won');
    }
  }

  private choose(action: BattleAction): void {
    const { battle, view, enemy } = this.setup;
    if (this.busy || !canChoose(battle, action)) {
      return;
    }
    this.busy = true;
    this.menu.refresh(battle, false);
    const events = takeTurn(battle, action, Math.random);
    const steps = events.map((event) => eventStep(event, view, enemy.name));
    playSteps(this.scene, view, steps, () => this.afterTurn());
  }

  private afterTurn(): void {
    const { battle, view } = this.setup;
    view.syncHp(battle);
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
    const reward = applyBattleResult(state, battle, { enemy, mapEnemyIndex });
    let steps: BattleStep[] = [];
    if (reward) {
      view.playDefeat('enemy');
      steps = victorySteps(reward, enemy.name, view);
    } else if (outcome === 'lost') {
      view.playDefeat('player');
      steps = [{ text: TEXT.battle.lost }];
    }
    playSteps(this.scene, view, steps, () => this.onEnd(outcome, reward));
  }
}

/** Taistelun aloitusviesti: loppuboss, väijytys tai tavallinen kartan vihollinen. */
function introText(setup: BattleSetup): string {
  const { enemy, mapEnemyIndex } = setup;
  if (isBoss(enemy.id)) {
    return TEXT.battle.bossAppears(enemy.name);
  }
  const intro = mapEnemyIndex === null ? TEXT.battle.ambush : TEXT.battle.appears;
  return intro(enemy.name);
}
