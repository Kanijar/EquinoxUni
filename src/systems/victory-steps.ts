import { getItem } from '../data';
import { TEXT } from '../i18n/fi';
import { bossName, type BossNews } from '../logic/boss';
import type { VictoryReward } from '../logic/game-state';
import { xpToNextLevel } from '../logic/progression';
import type { BattleView } from '../ui/battle-view';
import type { BattleStep } from './battle-steps';
import { playSound } from './sound-fx';

// Voiton jälkeiset viestit: KP, saadut esineet, loppubossin eteneminen (peikkolaskuri),
// tason nousu ja kykypisteet. KP-palkki täyttyy samalla, kun voittoviesti näkyy.

export function victorySteps(
  reward: VictoryReward,
  enemyName: string,
  view: BattleView,
): BattleStep[] {
  const won: BattleStep = {
    text: TEXT.battle.won(enemyName, reward.xp),
    effect: () => {
      view.updateXp(reward.totalXp);
      view.playVictory();
      playSound('victory');
    },
  };
  const missing = xpToNextLevel(reward.totalXp);
  const next = missing === null ? TEXT.battle.maxLevel : TEXT.battle.xpToNext(missing);
  return [
    won,
    ...lootSteps(reward),
    ...bossSteps(reward.boss),
    ...levelSteps(reward, view),
    { text: next },
  ];
}

/** Takaisin saadut (varastetut) ja löydetyt esineet. */
function lootSteps(reward: VictoryReward): BattleStep[] {
  const steps = (reward.recovered ?? []).map((stack) => ({
    text: TEXT.battle.recovered(getItem(stack.id).name, stack.count),
  }));
  if (reward.drop) {
    const name = getItem(reward.drop).name;
    const count = reward.dropCount ?? 1;
    steps.push({ text: count > 1 ? TEXT.battle.dropMany(name, count) : TEXT.battle.drop(name) });
  }
  return steps;
}

/** Peikkolaskuri, bossin herääminen tai bossin kukistuminen. */
function bossSteps(news: BossNews | undefined): BattleStep[] {
  switch (news?.kind) {
    case 'progress':
      return [{ text: TEXT.boss.progress(news.count, news.needed) }];
    case 'awakened':
      return [{ text: TEXT.boss.awakenedBattle(bossName()), effect: () => playSound('roar') }];
    case 'defeated':
      return [{ text: TEXT.boss.defeatedBattle(bossName()) }];
    default:
      return [];
  }
}

function levelSteps(reward: VictoryReward, view: BattleView): BattleStep[] {
  const steps: BattleStep[] = [];
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
  return steps;
}
