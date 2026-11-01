import { START_TOWN } from './towns';
import type { NpcDef } from './types';

// Hahmot, jotka antavat tehtäviä. Hahmo seisoo paikkakuntansa vieressä kartalla, ja kun
// pelaaja on siinä paikkakunnassa, hänen kanssaan voi puhua. Tehtävät: data/quests.ts.
// Uusi hahmo: lisää olio tähän listaan, sprite data/sprites-characters.ts ja tehtäviä
// (giver: hahmon id).

export const NPCS: readonly NpcDef[] = [
  {
    // Jussi Ketola asuu aloituspaikkakunnassa, joten hänet tapaa heti pelin alussa.
    // Paikkakunta luetaan aloituspaikkakunnasta, joten se pysyy oikeana, vaikka kartta muuttuu.
    id: 'jussi',
    name: 'Jussi Ketola',
    nameGenitive: 'Jussi Ketolan',
    sprite: 'jussi',
    town: START_TOWN,
  },
];
