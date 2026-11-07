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
  // Toinen lohikäärme kraatterin lounaispuolella (Jussi Ketolan tehtävä Lohikäärmeiden tuho).
  // Uudet viholliset lisätään listan loppuun, jotta tallennusten järjestysnumerot pysyvät.
  { enemy: 'dragon', x: 152, y: 46 },
  // --- Pienet saaret (data/isles.ts), joille pääsee vain veneellä ---
  // Palmusaari (taso 50–60)
  { enemy: 'pirate', x: 63, y: 135 },
  { enemy: 'pirate', x: 76, y: 129 },
  { enemy: 'pirate', x: 72, y: 138 },
  { enemy: 'jungle-snake', x: 59, y: 131 },
  { enemy: 'jungle-snake', x: 79, y: 135 },
  // Sumusaari (taso 60–75)
  { enemy: 'skeleton', x: 21, y: 140 },
  { enemy: 'skeleton', x: 30, y: 143 },
  { enemy: 'skeleton', x: 25, y: 146 },
  { enemy: 'ghost', x: 34, y: 139 },
  { enemy: 'ghost', x: 19, y: 136 },
  // Pakkassaari (taso 75–90)
  { enemy: 'ice-golem', x: 137, y: 140 },
  { enemy: 'ice-golem', x: 147, y: 139 },
  { enemy: 'ice-golem', x: 152, y: 144 },
  { enemy: 'crystal-spider', x: 142, y: 144 },
  { enemy: 'crystal-spider', x: 134, y: 137 },
  // Myrskysaari (taso 90–100): kolme ukkoslintua ja lahden rannalla Merikäärme
  { enemy: 'thunderbird', x: 225, y: 38 },
  { enemy: 'thunderbird', x: 230, y: 47 },
  { enemy: 'thunderbird', x: 216, y: 50 },
  { enemy: 'sea-serpent', x: 221, y: 48 },
];
