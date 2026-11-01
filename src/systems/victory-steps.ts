import { getItem } from '../data';
import { TEXT } from '../i18n/text';
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
    ...lootSteps(reward, view),
    ...bossSteps(reward.boss),
    ...levelSteps(reward, view),
    { text: next },
  ];
}

/** Takaisin saadut (varastetut) esineet ja pudotukset. */
function lootSteps(reward: VictoryReward, view: BattleView): BattleStep[] {
  const recovered = (reward.recovered ?? []).map((stack) => ({
    text: TEXT.battle.recovered(TEXT.names.item(getItem(stack.id)), stack.count),
  }));
  return [...recovered, ...dropSteps(reward.drops ?? [], view)];
}

/** "Löysit: Peikon nuija!" jokaisesta pudotuksesta ja vihje reppuun, jos joukossa oli varuste. */
function dropSteps(drops: readonly string[], view: BattleView): BattleStep[] {
  const steps: BattleStep[] = drops.map((id) => {
    const item = getItem(id);
    return {
      text: TEXT.battle.drop(TEXT.names.item(item)),
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
