import { getEnemy, getItem, getTown } from '../data';
import type { ItemStack, NpcDef, QuestGoal } from '../data/types';
import { EN_CONTENT } from './en-content';
import type { FI_QUESTS } from './fi-quests';

// Tehtävien tekstit englanniksi (TEXT.quests). Samat avaimet kuin i18n/fi-quests.ts:ssä.
// Tehtävien nimet ja repliikit englanniksi: i18n/en-content.ts (QUEST_TEXTS_EN).

/** Esineet tekstinä, esim. "Leather Vest and Healing Potion x2". */
function itemList(items: readonly ItemStack[]): string {
  const names = items.map((stack) => {
    const name = EN_CONTENT.item(getItem(stack.id));
    return stack.count > 1 ? `${name} ×${stack.count}` : name;
  });
  return names.join(' and ');
}

function goalText(goal: QuestGoal): string {
  switch (goal.kind) {
    case 'defeat':
      return `Defeat ${goal.count} × ${EN_CONTENT.enemy(getEnemy(goal.enemy))}`;
    case 'bring':
      return `Bring ${goal.count} × ${EN_CONTENT.item(getItem(goal.item))}`;
    case 'visit':
      return `Visit ${EN_CONTENT.town(getTown(goal.town))}`;
  }
}

export const EN_QUESTS: typeof FI_QUESTS = {
  talkButton: (npc: NpcDef, marker: string): string =>
    `${npc.name.toUpperCase()}${marker ? ` ${marker}` : ''}`,
  markers: { available: '!', ready: '?' },
  greeting: 'Hi there, hero! I have some jobs for you.',
  hint: 'Tap a quest and I will tell you more.',
  tooFar: (npc: NpcDef): string => `Walk closer to talk to ${npc.name}.`,
  noQuests: 'No new quests right now.',
  nextLevel: (level: number): string => `Come back at level ${level} and I will have more!`,
  allDone: 'You have done all my quests. Thank you, hero!',
  goal: goalText,
  progress: (have: number, need: number): string => `${have}/${need}`,
  status: { available: 'NEW', active: 'ACTIVE', ready: 'DONE!' },
  reward: (xp: number, items: readonly ItemStack[]): string =>
    items.length > 0 ? `Reward: ${xp} XP and ${itemList(items)}` : `Reward: ${xp} XP`,
  accept: 'ACCEPT',
  turnIn: 'HAND IN',
  back: 'BACK',
  accepted: (title: string): string => `Quest accepted: ${title}!`,
  rewarded: (xp: number, items: readonly ItemStack[]): string =>
    items.length > 0 ? `You got ${xp} XP and ${itemList(items)}!` : `You got ${xp} XP!`,
  gearHint: 'Open the BACKPACK and equip your new gear!',
  hudActive: (title: string, have: number, need: number): string => `${title} ${have}/${need}`,
  hudReady: (title: string): string => `${title}: done!`,
  battleProgress: (title: string, have: number, need: number): string =>
    `Quest ${title}: ${have}/${need}.`,
  readyReturn: (title: string, npc: NpcDef): string =>
    `Quest ${title} done! Go back to ${npc.name}.`,
};
