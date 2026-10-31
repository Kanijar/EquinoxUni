import type Phaser from 'phaser';
import { BATTLE_VIEW } from '../config/game-config';
import { getItem } from '../data';
import { TEXT } from '../i18n/fi';
import type { BattleEvent } from '../logic/battle';
import type { VictoryReward } from '../logic/game-state';
import type { BattleView } from '../ui/battle-view';

// Muuttaa taistelun tapahtumat näytettäviksi askeliksi (teksti + animaatio)
// ja näyttää ne yksi kerrallaan.

export interface BattleStep {
  readonly text: string;
  readonly effect?: () => void;
}

export function eventStep(event: BattleEvent, view: BattleView, enemyName: string): BattleStep {
  switch (event.kind) {
    case 'hit':
      return { text: hitText(event, enemyName), effect: () => view.playHit(event.attacker) };
    case 'defend':
      return { text: TEXT.battle.defending };
    case 'heal':
      return { text: TEXT.battle.heal(getItem(event.itemId).name, event.amount) };
    case 'steal':
      return {
        text: TEXT.battle.stole(enemyName, getItem(event.itemId).name),
        effect: () => view.playLunge('enemy'),
      };
    case 'flee':
      return { text: event.success ? TEXT.battle.fleeOk : TEXT.battle.fleeFail };
  }
}

export function victorySteps(reward: VictoryReward, enemyName: string): BattleStep[] {
  const steps: BattleStep[] = [{ text: TEXT.battle.won(enemyName, reward.xp) }];
  for (const stack of reward.recovered ?? []) {
    steps.push({ text: TEXT.battle.recovered(getItem(stack.id).name, stack.count) });
  }
  if (reward.drop) {
    steps.push({ text: TEXT.battle.drop(getItem(reward.drop).name) });
  }
  if (reward.leveledUp) {
    steps.push({ text: TEXT.battle.levelUp(reward.level) });
  }
  return steps;
}

/** Näyttää askeleet järjestyksessä ja kutsuu lopuksi done(). */
export function playSteps(
  scene: Phaser.Scene,
  view: BattleView,
  steps: readonly BattleStep[],
  done: () => void,
): void {
  const [first, ...rest] = steps;
  if (!first) {
    done();
    return;
  }
  view.say(first.text);
  first.effect?.();
  scene.time.delayedCall(BATTLE_VIEW.messageMs, () => playSteps(scene, view, rest, done));
}

function hitText(event: Extract<BattleEvent, { kind: 'hit' }>, enemyName: string): string {
  const crit = event.crit ? TEXT.battle.crit : '';
  if (event.attacker === 'player') {
    return crit + TEXT.battle.playerHit(enemyName, event.damage);
  }
  const text = event.defended
    ? TEXT.battle.enemyHitDefended(enemyName, event.damage)
    : TEXT.battle.enemyHit(enemyName, event.damage);
  return crit + text;
}
