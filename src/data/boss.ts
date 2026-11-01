import type { BossDef } from './types';

// Loppuboss. Peikkokuningas herää, kun pelaaja on voittanut viisi tunturipeikkoa
// (sama peikko voi olla mukana monta kertaa, koska peikot palaavat kartalle).
// Se odottaa saaren luoteiskulman tuntureilla. Voitettu boss ei palaa,
// ja peli jatkuu tavallisesti. Säännöt: logic/boss.ts.

export const FINAL_BOSS: BossDef = {
  enemy: 'troll-king',
  unlockEnemy: 'troll',
  unlockCount: 5,
  // Luoteisen tunturin rinne Kuuralan länsipuolella, tien ulkopuolella lumessa.
  x: 30,
  y: 40,
};
