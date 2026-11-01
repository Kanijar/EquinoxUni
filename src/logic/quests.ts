import { getQuest, NPCS, QUESTS } from '../data';
import type { ItemStack, NpcDef, QuestDef } from '../data/types';
import { gainXp, playerLevel, type GameState, type XpGain } from './game-state';
import {
  completeQuest,
  isQuestUnlocked,
  questProgress,
  questStatus,
  startQuest,
  type QuestProgress,
  type QuestStatus,
} from './quest-log';

// Tehtävät pelaajan kannalta: mitä tehtävänantaja (esim. Jussi Ketola) tarjoaa, tehtävän
// ottaminen ja palauttaminen palkintoineen. Tehtäväkirjan säännöt: logic/quest-log.ts.

/** Tehtävä tehtävälistassa: tila ja edistyminen (esim. 2/3). */
export interface QuestRow {
  readonly quest: QuestDef;
  readonly status: QuestStatus;
  readonly progress: QuestProgress;
}

/** Tehtävänantajan pään yläpuolella: ! = uusi tehtävä, ? = valmis tehtävä palautettavaksi. */
export type NpcMarker = 'available' | 'ready' | null;

/** Palautetun tehtävän palkinto: kokemus (ja tason nousu) sekä esineet. */
export interface QuestTurnIn extends XpGain {
  readonly quest: QuestDef;
  readonly items: readonly ItemStack[];
}

export function statusOf(state: GameState, quest: QuestDef): QuestStatus {
  return questStatus(state.quests, state.inventory, quest, playerLevel(state));
}

export function progressOf(state: GameState, quest: QuestDef): QuestProgress {
  return questProgress(state.quests, state.inventory, quest);
}

function rowOf(state: GameState, quest: QuestDef): QuestRow {
  return { quest, status: statusOf(state, quest), progress: progressOf(state, quest) };
}

/** Järjestys listassa: valmiit ensin, sitten keskeneräiset, sitten uudet. */
const STATUS_ORDER: readonly QuestStatus[] = ['ready', 'active', 'available'];

/** Tehtävänantajan tehtävät, jotka näytetään listassa (valmiit, kesken ja tarjolla). */
export function questRows(state: GameState, npcId: string): QuestRow[] {
  const rows = QUESTS.filter((quest) => quest.giver === npcId).map((quest) => rowOf(state, quest));
  return STATUS_ORDER.flatMap((status) => rows.filter((row) => row.status === status));
}

/** Keskeneräiset ja valmiit tehtävät kaikilta tehtävänantajilta (kartan HUD). */
export function trackedQuests(state: GameState): QuestRow[] {
  const rows = QUESTS.map((quest) => rowOf(state, quest));
  return rows.filter((row) => row.status === 'active' || row.status === 'ready');
}

/**
 * Pienin taso, jolla tehtävänantajalla on seuraava tehtävä (edellinen tehtävä on jo tehty,
 * mutta taso on vielä liian pieni). null, jos sellaista ei ole.
 */
export function nextQuestLevel(state: GameState, npcId: string): number | null {
  const waiting = QUESTS.filter(
    (quest) =>
      quest.giver === npcId &&
      statusOf(state, quest) === 'locked' &&
      isQuestUnlocked(state.quests, quest),
  );
  const levels = waiting.map((quest) => quest.minLevel);
  return levels.length > 0 ? Math.min(...levels) : null;
}

/** Merkki tehtävänantajan päällä: valmis tehtävä (?) on tärkeämpi kuin uusi tehtävä (!). */
export function npcMarker(state: GameState, npcId: string): NpcMarker {
  const statuses = questRows(state, npcId).map((row) => row.status);
  if (statuses.includes('ready')) {
    return 'ready';
  }
  return statuses.includes('available') ? 'available' : null;
}

/** Tehtävänantaja, joka asuu tässä paikkakunnassa, tai null. */
export function npcInTown(townId: string | undefined): NpcDef | null {
  return NPCS.find((npc) => npc.town === townId) ?? null;
}

/** Ottaa tarjolla olevan tehtävän vastaan. Palauttaa false, jos tehtävä ei ole tarjolla. */
export function acceptQuest(state: GameState, questId: string): boolean {
  const quest = getQuest(questId);
  if (statusOf(state, quest) !== 'available') {
    return false;
  }
  startQuest(state.quests, quest);
  return true;
}

/**
 * Palauttaa valmiin tehtävän: tuotavat esineet lähtevät repusta, ja palkinnoksi saa KP:tä
 * ja esineitä reppuun. Palauttaa null, jos tehtävä ei ollut valmis.
 */
export function turnInQuest(state: GameState, questId: string): QuestTurnIn | null {
  const quest = getQuest(questId);
  if (statusOf(state, quest) !== 'ready') {
    return null;
  }
  completeQuest(state.quests, state.inventory, quest);
  for (const stack of quest.reward.items) {
    state.inventory[stack.id] = (state.inventory[stack.id] ?? 0) + stack.count;
  }
  const gain = gainXp(state, quest.reward.xp);
  return { ...gain, quest, items: quest.reward.items };
}
