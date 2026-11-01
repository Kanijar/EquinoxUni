import { QUESTS } from '../data';
import type { DropDef, QuestDef } from '../data/types';

// Tehtäväkirja: mitkä tehtävät on otettu vastaan, paljonko niissä on edistytty ja montako
// kertaa ne on palautettu. Tämä tiedosto ei tunne muuta pelin tilaa kuin repun, joten
// säännöt on helppo testata. Kokemus ja palkinnot: logic/quests.ts.

/** Yhden tehtävän tila tehtäväkirjassa (GameState.quests). */
export interface QuestEntry {
  /** Onko tehtävä kesken (otettu vastaan, ei vielä palautettu). */
  active: boolean;
  /** Voitetut viholliset tai käynnit tehtävän ottamisen jälkeen. Tuotavat esineet ovat repussa. */
  progress: number;
  /** Montako kertaa tehtävä on palautettu (toistettava tehtävä voi olla yli 1). */
  completions: number;
}

/** Tehtäväkirja tehtävän tunnisteen mukaan. Puuttuva tehtävä = ei aloitettu. */
export type QuestLog = Record<string, QuestEntry>;

/** Repun esineiden määrät tunnisteittain (GameState.inventory). */
type Inventory = Record<string, number>;

/**
 * Tehtävän tila pelaajalle:
 * locked = ei vielä tarjolla (taso liian pieni tai edellinen tehtävä tekemättä),
 * available = tarjolla, active = kesken, ready = valmis palautettavaksi, done = palautettu.
 */
export type QuestStatus = 'locked' | 'available' | 'active' | 'ready' | 'done';

export interface QuestProgress {
  readonly have: number;
  readonly need: number;
}

/** Paljonko tavoitteesta on tehty, esim. 2/3 limaa. Tuotavat esineet lasketaan repusta. */
export function questProgress(log: QuestLog, inventory: Inventory, quest: QuestDef): QuestProgress {
  const goal = quest.goal;
  const progress = log[quest.id]?.progress ?? 0;
  if (goal.kind === 'bring') {
    return { have: Math.min(inventory[goal.item] ?? 0, goal.count), need: goal.count };
  }
  const need = goal.kind === 'visit' ? 1 : goal.count;
  return { have: Math.min(progress, need), need };
}

/** Onko tehtävä palautettu ainakin kerran. */
export function isQuestDone(log: QuestLog, questId: string): boolean {
  return (log[questId]?.completions ?? 0) > 0;
}

/** Onko tehtävä kesken. */
export function isQuestActive(log: QuestLog, questId: string): boolean {
  return log[questId]?.active === true;
}

/** Onko edellinen tehtävä (requires) tehty, jotta tämä voidaan tarjota. */
export function isQuestUnlocked(log: QuestLog, quest: QuestDef): boolean {
  return quest.requires === undefined || isQuestDone(log, quest.requires);
}

export function questStatus(
  log: QuestLog,
  inventory: Inventory,
  quest: QuestDef,
  level: number,
): QuestStatus {
  if (isQuestActive(log, quest.id)) {
    const { have, need } = questProgress(log, inventory, quest);
    return have >= need ? 'ready' : 'active';
  }
  if (isQuestDone(log, quest.id) && quest.repeatable !== true) {
    return 'done';
  }
  return isQuestUnlocked(log, quest) && level >= quest.minLevel ? 'available' : 'locked';
}

/** Ottaa tehtävän vastaan. Edistyminen alkaa nollasta (myös toistettavassa tehtävässä). */
export function startQuest(log: QuestLog, quest: QuestDef): void {
  const completions = log[quest.id]?.completions ?? 0;
  log[quest.id] = { active: true, progress: 0, completions };
}

/** Kasvattaa keskeneräisten tehtävien edistymistä. Palauttaa tehtävät, jotka edistyivät. */
function advance(log: QuestLog, matches: (quest: QuestDef) => boolean): QuestDef[] {
  const advanced: QuestDef[] = [];
  for (const quest of QUESTS) {
    const entry = log[quest.id];
    if (entry?.active && matches(quest)) {
      entry.progress += 1;
      advanced.push(quest);
    }
  }
  return advanced;
}

/** Vihollinen voitettiin: sitä koskevat keskeneräiset tehtävät edistyvät. */
export function recordQuestDefeat(log: QuestLog, enemyId: string): QuestDef[] {
  return advance(log, (quest) => quest.goal.kind === 'defeat' && quest.goal.enemy === enemyId);
}

/** Pelaaja saapui paikkakuntaan: sinne vievät keskeneräiset tehtävät tulevat valmiiksi. */
export function recordQuestVisit(log: QuestLog, townId: string): QuestDef[] {
  const toVisit = (quest: QuestDef): boolean =>
    quest.goal.kind === 'visit' && quest.goal.town === townId && log[quest.id]?.progress === 0;
  return advance(log, toVisit);
}

/** Keskeneräiset tuontitehtävät, jotka odottavat tätä esinettä. */
export function questsWanting(log: QuestLog, itemId: string): QuestDef[] {
  return QUESTS.filter(
    (quest) =>
      isQuestActive(log, quest.id) && quest.goal.kind === 'bring' && quest.goal.item === itemId,
  );
}

/**
 * Saako pudotus pudota. Tavallinen pudotus saa aina. Tehtävän pudotus (DropDef.quest) vain,
 * kun tehtävä on kesken ja esineitä tarvitaan vielä, jottei reppu täyty turhilla esineillä.
 */
export function canQuestDrop(log: QuestLog, inventory: Inventory, drop: DropDef): boolean {
  if (drop.quest === undefined) {
    return true;
  }
  const quest = QUESTS.find((entry) => entry.id === drop.quest);
  if (!quest || !isQuestActive(log, quest.id)) {
    return false;
  }
  const { have, need } = questProgress(log, inventory, quest);
  return have < need;
}

/**
 * Merkitsee tehtävän palautetuksi. Tuontitehtävän esineet otetaan repusta.
 * Palauttaa false, jos tehtävä ei ollut valmis.
 */
export function completeQuest(log: QuestLog, inventory: Inventory, quest: QuestDef): boolean {
  const entry = log[quest.id];
  const { have, need } = questProgress(log, inventory, quest);
  if (!entry?.active || have < need) {
    return false;
  }
  if (quest.goal.kind === 'bring') {
    inventory[quest.goal.item] = (inventory[quest.goal.item] ?? 0) - quest.goal.count;
  }
  log[quest.id] = { active: false, progress: 0, completions: entry.completions + 1 };
  return true;
}
