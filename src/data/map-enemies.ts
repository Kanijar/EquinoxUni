import type { MapEnemyDef } from './types';

// Viholliset saaren kartalla. Sijainti ruutuina (x itään, y etelään, data/island.ts).
// Aloituskylän lähellä on helpompia vihollisia, kauempana vaikeampia.
// Kun jokainen on voitettu ainakin kerran, saari on pelastettu (peli jatkuu).

export const MAP_ENEMIES: readonly MapEnemyDef[] = [
  // Lounaan pellot (tasot 1–5)
  { enemy: 'slime', x: 64, y: 82 },
  { enemy: 'slime', x: 46, y: 96 },
  { enemy: 'slime', x: 70, y: 70 },
  { enemy: 'slime', x: 36, y: 84 },
  { enemy: 'slime', x: 90, y: 84 },
  { enemy: 'hiisi', x: 28, y: 76 },
  // Rannat (tasot 5–8)
  { enemy: 'crab', x: 42, y: 110 },
  { enemy: 'crab', x: 18, y: 88 },
  { enemy: 'crab', x: 70, y: 111 },
  { enemy: 'crab', x: 120, y: 110 },
  // Keskisaaren metsät (tasot 3–8)
  { enemy: 'hiisi', x: 50, y: 62 },
  { enemy: 'hiisi', x: 76, y: 52 },
  { enemy: 'hiisi', x: 110, y: 62 },
  { enemy: 'hiisi', x: 84, y: 40 },
  { enemy: 'wolf', x: 42, y: 56 },
  { enemy: 'wolf', x: 70, y: 40 },
  { enemy: 'wolf', x: 120, y: 54 },
  { enemy: 'wolf', x: 98, y: 74 },
  // Idän suo (tasot 12–18)
  { enemy: 'mud', x: 124, y: 86 },
  { enemy: 'mud', x: 144, y: 72 },
  { enemy: 'mud', x: 118, y: 100 },
  { enemy: 'mud', x: 156, y: 84 },
  { enemy: 'wisp', x: 136, y: 98 },
  { enemy: 'wisp', x: 140, y: 64 },
  { enemy: 'wisp', x: 120, y: 74 },
  // Pohjoisen tunturit (peikot tasot 6–10, kalliojätit 20–26)
  { enemy: 'troll', x: 42, y: 36 },
  { enemy: 'troll', x: 70, y: 28 },
  { enemy: 'troll', x: 90, y: 16 },
  { enemy: 'troll', x: 114, y: 18 },
  { enemy: 'troll', x: 46, y: 30 },
  { enemy: 'giant', x: 62, y: 24 },
  { enemy: 'giant', x: 106, y: 12 },
  { enemy: 'giant', x: 120, y: 22 },
  // Koillisen tulivuori (tuliliskot tasot 28–34, lohikäärme 40–50)
  { enemy: 'lizard', x: 148, y: 32 },
  { enemy: 'lizard', x: 166, y: 52 },
  { enemy: 'lizard', x: 140, y: 30 },
  { enemy: 'dragon', x: 166, y: 34 },
];
