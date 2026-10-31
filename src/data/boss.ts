import type { BossDef } from './types';

// Loppuboss. Peikkokuningas herää, kun pelaaja on voittanut viisi tunturipeikkoa
// (sama peikko voi olla mukana monta kertaa, koska peikot palaavat kartalle).
// Se odottaa Käsivarren tuntureilla Kilpisjärven lähellä. Voitettu boss ei palaa,
// ja peli jatkuu tavallisesti. Säännöt: logic/boss.ts.

export const FINAL_BOSS: BossDef = {
  enemy: 'troll-king',
  unlockEnemy: 'troll',
  unlockCount: 5,
  // Käsivarren tunturi Kilpisjärven itäpuolella, tien ulkopuolella lumessa.
  lon: 21.5,
  lat: 69.0,
};
