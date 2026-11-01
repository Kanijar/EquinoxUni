import type Phaser from 'phaser';
import { BATTLE_VIEW } from '../config/game-config';
import { getItem } from '../data';
import { TEXT } from '../i18n/fi';
import type { BattleEvent } from '../logic/battle';
import type { VictoryReward } from '../logic/game-state';
import { xpToNextLevel } from '../logic/progression';
import type { BattleView } from '../ui/battle-view';
import { playSound } from './sound-fx';

// Muuttaa taistelun tapahtumat näytettäviksi askeliksi (teksti + animaatio)
// ja näyttää ne yksi kerrallaan.

export interface BattleStep {
  readonly text: string;
  readonly effect?: () => void;
}

export function eventStep(event: BattleEvent, view: BattleView, enemyName: string): BattleStep {
  switch (event.kind) {
    case 'hit':
      return {
        text: hitText(event, enemyName),
        effect: () => view.playHit(event),
      };
    case 'spell':
      return {
        text: spellText(event, enemyName),
        effect: () => view.playSpell(event.damage, event.crit),
      };
    case 'defend':
      return { text: TEXT.battle.defending, effect: () => view.playDefend() };
    case 'heal':
      return {
        text: TEXT.battle.heal(getItem(event.itemId).name, event.amount),
        effect: () => view.playHeal(event.amount),
      };
    case 'steal':
      return {
        text: TEXT.battle.stole(enemyName, getItem(event.itemId).name),
        effect: () => view.playSteal(getItem(event.itemId).sprite),
      };
    case 'flee':
      return {
        text: event.success ? TEXT.battle.fleeOk : TEXT.battle.fleeFail,
        effect: () => view.playFlee(event.success),
      };
  }
}

/** Voiton jälkeiset viestit. KP-palkki täyttyy samalla, kun voittoviesti näkyy. */
export function victorySteps(
  reward: VictoryReward,
  enemyName: string,
  view: BattleView,
): BattleStep[] {
  const steps: BattleStep[] = [
    {
      text: TEXT.battle.won(enemyName, reward.xp),
      effect: () => {
        view.updateXp(reward.totalXp);
        view.playVictory();
        playSound('victory');
      },
    },
  ];
  for (const stack of reward.recovered ?? []) {
    steps.push({ text: TEXT.battle.recovered(getItem(stack.id).name, stack.count) });
  }
  steps.push(...dropSteps(reward.drops ?? [], view));
  if (reward.leveledUp) {
    steps.push({
      text: TEXT.battle.levelUp(reward.level),
      effect: () => {
        view.playLevelUp();
        playSound('level-up');
      },
    });
  }
  if (reward.skillPoints > 0) {
    steps.push({ text: TEXT.battle.skillPoints(reward.skillPoints) });
  }
  const missing = xpToNextLevel(reward.totalXp);
  steps.push({ text: missing === null ? TEXT.battle.maxLevel : TEXT.battle.xpToNext(missing) });
  return steps;
}

/** "Löysit: Peikon nuija!" jokaisesta pudotuksesta ja vihje reppuun, jos joukossa oli varuste. */
function dropSteps(drops: readonly string[], view: BattleView): BattleStep[] {
  const steps: BattleStep[] = drops.map((id) => {
    const item = getItem(id);
    return {
      text: TEXT.battle.drop(item.name),
      effect: () => {
        view.showLoot(item.sprite);
        playSound('loot');
      },
    };
  });
  if (drops.some((id) => getItem(id).kind === 'gear')) {
    steps.push({ text: TEXT.battle.gearHint });
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

function spellText(event: Extract<BattleEvent, { kind: 'spell' }>, enemyName: string): string {
  const crit = event.crit ? TEXT.battle.crit : '';
  return crit + TEXT.battle.spellHit(TEXT.spells[event.spellId], enemyName, event.damage);
}
