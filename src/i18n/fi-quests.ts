import { getEnemy, getItem, getTown } from '../data';
import type { ItemStack, NpcDef, QuestGoal } from '../data/types';

// Tehtävien tekstit suomeksi (TEXT.quests). Tehtävien nimet ja tehtävänantajan repliikit
// ovat data/quests.ts:ssä, englanniksi i18n/en-content.ts. Sama englanniksi: i18n/en-quests.ts.

/** Esineet tekstinä, esim. "Nahkaliivi ja Parannusjuoma ×2". */
function itemList(items: readonly ItemStack[]): string {
  const names = items.map((stack) => {
    const name = getItem(stack.id).name;
    return stack.count > 1 ? `${name} ×${stack.count}` : name;
  });
  return names.join(' ja ');
}

/** Tehtävän tavoite: "Voita 3 × Lima", "Tuo 3 × Sudenkarvatupsu" tai "Käy Tampereella". */
function goalText(goal: QuestGoal): string {
  switch (goal.kind) {
    case 'defeat':
      return `Voita ${goal.count} × ${getEnemy(goal.enemy).name}`;
    case 'bring':
      return `Tuo ${goal.count} × ${getItem(goal.item).name}`;
    case 'visit':
      return `Käy ${getTown(goal.town).nameAt}`;
  }
}

export const FI_QUESTS = {
  /** Kartan nappi paikkakunnassa, jossa tehtävänantaja asuu, esim. "JUSSI KETOLA !". */
  talkButton: (npc: NpcDef, marker: string): string =>
    `${npc.name.toUpperCase()}${marker ? ` ${marker}` : ''}`,
  /** Merkki tehtävänantajan pään päällä: uusi tehtävä (!) tai valmis tehtävä (?). */
  markers: { available: '!', ready: '?' },
  greeting: 'Hei, sankari! Minulla olisi sinulle hommia.',
  hint: 'Napauta tehtävää, niin kerron lisää.',
  /** Tehtävänantajaa napautettiin kartalla muualta kuin hänen paikkakunnastaan. */
  tooFar: (npc: NpcDef): string => `Kävele lähemmäs, niin voit jutella: ${npc.name}.`,
  noQuests: 'Ei uusia tehtäviä juuri nyt.',
  nextLevel: (level: number): string => `Tule takaisin tasolla ${level}, niin keksin lisää!`,
  allDone: 'Olet tehnyt kaikki tehtäväni. Kiitos, sankari!',
  goal: goalText,
  progress: (have: number, need: number): string => `${have}/${need}`,
  status: { available: 'UUSI', active: 'KESKEN', ready: 'VALMIS!' },
  reward: (xp: number, items: readonly ItemStack[]): string =>
    items.length > 0 ? `Palkinto: ${xp} KP ja ${itemList(items)}` : `Palkinto: ${xp} KP`,
  accept: 'OTA TEHTÄVÄ',
  turnIn: 'PALAUTA',
  back: 'TAKAISIN',
  accepted: (title: string): string => `Tehtävä otettu: ${title}!`,
  rewarded: (xp: number, items: readonly ItemStack[]): string =>
    items.length > 0 ? `Sait ${xp} KP ja ${itemList(items)}!` : `Sait ${xp} KP!`,
  /** Palkintona tuli varuste: kerrotaan, miten se laitetaan käyttöön. */
  gearHint: 'Avaa REPPU ja laita varuste käyttöön!',
  /** Kartan HUD: keskeneräinen tehtävä ja sen edistyminen. */
  hudActive: (title: string, have: number, need: number): string => `${title} ${have}/${need}`,
  hudReady: (title: string): string => `${title}: valmis!`,
  /** Taistelun voittoviestit. */
  battleProgress: (title: string, have: number, need: number): string =>
    `Tehtävä ${title}: ${have}/${need}.`,
  readyReturn: (title: string, npc: NpcDef): string =>
    `Tehtävä ${title} valmis! Palaa ${npc.nameGenitive} luo.`,
};
