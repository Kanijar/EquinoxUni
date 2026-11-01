import type { ItemStack } from './types';

// Tehtävien ja tehtävänantajien (NPC) tyypit. Tehtävät: data/quests.ts,
// tehtävänantajat: data/npcs.ts, säännöt: logic/quest-log.ts ja logic/quests.ts.

/** Hahmo, joka seisoo paikkakunnassa ja antaa tehtäviä (esim. Jussi Ketola). */
export interface NpcDef {
  readonly id: string;
  /** Nimi pelaajalle. Henkilön nimi on sama molemmilla kielillä. */
  readonly name: string;
  /** Nimi suomeksi genetiivissä: "Palaa Jussi Ketolan luo". */
  readonly nameGenitive: string;
  readonly sprite: string;
  /** Paikkakunta, jossa hahmo asuu (data/towns.ts). Siellä hänen kanssaan voi puhua. */
  readonly town: string;
}

/**
 * Tehtävän tavoite: voita vihollisia, tuo esineitä tai käy paikkakunnassa.
 * Voitot ja käynnit lasketaan vasta, kun tehtävä on otettu vastaan.
 */
export type QuestGoal =
  | { readonly kind: 'defeat'; readonly enemy: string; readonly count: number }
  | { readonly kind: 'bring'; readonly item: string; readonly count: number }
  | { readonly kind: 'visit'; readonly town: string };

/** Palkinto, jonka saa, kun valmis tehtävä palautetaan tehtävänantajalle. */
export interface QuestRewardDef {
  /** Kokemuspisteet (KP). */
  readonly xp: number;
  /** Esineet ja varusteet reppuun (data/items.ts). */
  readonly items: readonly ItemStack[];
}

export interface QuestDef {
  readonly id: string;
  /** Tehtävänantaja (data/npcs.ts). */
  readonly giver: string;
  /** Tehtävän nimi suomeksi. Englanniksi i18n/en-quests.ts. */
  readonly title: string;
  /** Mitä tehtävänantaja sanoo tarjotessaan tehtävää. */
  readonly story: string;
  /** Mitä tehtävänantaja sanoo, kun tehtävä palautetaan. */
  readonly thanks: string;
  /** Tehtävä tarjotaan vasta tältä tasolta alkaen. */
  readonly minLevel: number;
  /** Tehtävä, joka pitää olla tehty ensin (valinnainen). Näin syntyy tehtäväketju. */
  readonly requires?: string;
  /** Voiko tehtävän tehdä uudelleen palauttamisen jälkeen (valinnainen, oletus ei). */
  readonly repeatable?: boolean;
  readonly goal: QuestGoal;
  readonly reward: QuestRewardDef;
}
