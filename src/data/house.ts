import type { HouseDef } from './types';

// Sankarin oma talo Kotirannan laidalla (Väinön toive). Kun sankari kävelee talon ovelle,
// oikeaan alakulmaan tulee TALO-nappi, josta talo avautuu (scenes/house-scene.ts).
// Talon seinällä on koko pelin 10 parhaan pelaajan lista (logic/leaderboard.ts).

export const HOUSE: HouseDef = {
  // Kolme ruutua Kotirannasta (80, 96) itään ja yksi pohjoiseen, pellolla. Jussi Ketola
  // seisoo paikkakunnan talon vieressä, joten oma talo on hieman kauempana hänestä.
  x: 83,
  y: 95,
  enterTiles: 1,
};
