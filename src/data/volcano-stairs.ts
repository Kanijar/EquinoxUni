import type { StairsDef } from './types';

// Rappuset tulivuoren kraatterin laavan yli Ossi Ketolan luo (data/npcs.ts). Jokainen voitettu
// lohikäärme nostaa laavasta yhden kiviaskelman lisää. Askelmat alkavat kraatterin länsireunalta
// (Tuhkalan puolelta) ja vievät kraatterin keskellä olevalle saarelle. Lohikäärmeitä on kartalla
// kaksi ja ne palaavat (data/map-enemies.ts), joten viisi askelmaa vaatii useamman käynnin.
// Säännöt: logic/volcano-stairs.ts. Kraatteri ja saari: data/island.ts.

export const VOLCANO_STAIRS: StairsDef = {
  enemy: 'dragon',
  steps: [
    { x: 154, y: 42 },
    { x: 155, y: 42 },
    { x: 156, y: 42 },
    { x: 157, y: 42 },
    { x: 158, y: 42 },
  ],
  terrain: 'stairs',
  goal: { x: 160, y: 42 },
};
