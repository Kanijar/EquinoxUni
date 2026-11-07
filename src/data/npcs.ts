import { START_TOWN } from './towns';
import type { NpcDef } from './types';
import { VOLCANO_STAIRS } from './volcano-stairs';

// Hahmot, jotka antavat tehtäviä. Hahmo seisoo paikkakuntansa vieressä kartalla, ja kun
// pelaaja on siinä paikkakunnassa, hänen kanssaan voi puhua. Hahmolla voi olla paikkakunnan
// sijaan oma paikka kartalla (tile): silloin puhutaan vieressä. Tehtävät: data/quests.ts.
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
  {
    // Jussin veli Ossi Ketola on jumissa tulivuoren kraatterin saarella laavan keskellä.
    // Hänen luokseen pääsee, kun lohikäärmeiden voitot ovat nostaneet rappuset laavasta.
    id: 'ossi',
    name: 'Ossi Ketola',
    nameGenitive: 'Ossi Ketolan',
    sprite: 'ossi',
    tile: VOLCANO_STAIRS.goal,
  },
  // Pienten saarten tehtävänantajat (data/isles.ts) asuvat saarten kylissä (data/isle-quests.ts).
  {
    id: 'kalle',
    name: 'Kalle Kompassi',
    nameGenitive: 'Kalle Kompassin',
    sprite: 'kalle',
    town: 'kookoskyla',
  },
  {
    id: 'veera',
    name: 'Veera Varjo',
    nameGenitive: 'Veera Varjon',
    sprite: 'veera',
    town: 'sumula',
  },
  {
    id: 'pekka',
    name: 'Pekka Pakkanen',
    nameGenitive: 'Pekka Pakkasen',
    sprite: 'pekka',
    town: 'kidela',
  },
  {
    id: 'matti',
    name: 'Matti Myrsky',
    nameGenitive: 'Matti Myrskyn',
    sprite: 'matti',
    town: 'ukkola',
  },
];

/** Paikkansa (tile) omaavan hahmon kanssa voi puhua näin monen ruudun päästä. */
export const NPC_TALK_TILES = 1;
