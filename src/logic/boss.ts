import { getEnemy } from '../data';
import { FINAL_BOSS } from '../data/boss';
import type { BossDef } from '../data/types';
import { TEXT } from '../i18n/text';

// Loppubossin eteneminen. Boss herää, kun pelaaja on voittanut tarpeeksi monta kertaa
// bossin herättävän vihollisen (data/boss.ts: viisi tunturipeikkoa). Herännyt boss
// odottaa kartalla, kunnes se voitetaan. Voitettu boss ei palaa, eikä laskuri enää kasva.

/** Bossiin liittyvä osa pelin tilasta (GameState, logic/game-state.ts). */
export interface BossProgress {
  /** Voitot bossin herättävästä vihollisesta (0..unlockCount). */
  bossProgress: number;
  /** Onko boss voitettu. Voitettu boss ei palaa kartalle. */
  bossDefeated: boolean;
}

/** Mitä voitto kertoo bossista: laskuri kasvoi, boss heräsi tai boss voitettiin. */
export type BossNews =
  | { readonly kind: 'progress'; readonly count: number; readonly needed: number }
  | { readonly kind: 'awakened' }
  | { readonly kind: 'defeated' };

/** Bossin nimi pelaajalle (data/enemies.ts). */
export function bossName(boss: BossDef = FINAL_BOSS): string {
  return TEXT.names.enemy(getEnemy(boss.enemy));
}

export function isBoss(enemyId: string, boss: BossDef = FINAL_BOSS): boolean {
  return enemyId === boss.enemy;
}

/** Onko boss herännyt (laskuri täynnä). */
export function isBossAwake(state: BossProgress, boss: BossDef = FINAL_BOSS): boolean {
  return state.bossProgress >= boss.unlockCount;
}

/** Onko boss kartalla: herännyt eikä vielä voitettu. */
export function isBossOnMap(state: BossProgress, boss: BossDef = FINAL_BOSS): boolean {
  return isBossAwake(state, boss) && !state.bossDefeated;
}

/**
 * Kirjaa voiton bossin kannalta. Palauttaa uutisen, tai null, jos voitto ei liity bossiin
 * (muu vihollinen, tai laskuri on jo täynnä).
 */
export function recordBossVictory(
  state: BossProgress,
  enemyId: string,
  boss: BossDef = FINAL_BOSS,
): BossNews | null {
  if (isBoss(enemyId, boss)) {
    state.bossDefeated = true;
    state.bossProgress = Math.max(state.bossProgress, boss.unlockCount);
    return { kind: 'defeated' };
  }
  if (enemyId !== boss.unlockEnemy || isBossAwake(state, boss)) {
    return null;
  }
  state.bossProgress += 1;
  if (isBossAwake(state, boss)) {
    return { kind: 'awakened' };
  }
  return { kind: 'progress', count: state.bossProgress, needed: boss.unlockCount };
}

/** Kartan HUD:n bossirivi: peikkolaskuri, herännyt boss tai tyhjä, kun boss on voitettu. */
export function bossHudText(state: BossProgress, boss: BossDef = FINAL_BOSS): string {
  if (state.bossDefeated) {
    return '';
  }
  if (isBossAwake(state, boss)) {
    return TEXT.hud.bossAwake(bossName(boss));
  }
  return TEXT.hud.trolls(state.bossProgress, boss.unlockCount);
}
