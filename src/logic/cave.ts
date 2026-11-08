import { CAVE } from '../data/cave';
import type { CaveDef } from '../data/types';
import { equipItem, ownsItem } from './equipment';
import { playerLevel, type GameState } from './game-state';
import type { Vec2 } from './vector';

// Peikkokuninkaan luola (data/cave.ts). Luola on auki, kun loppuboss on voitettu
// (GameState.bossDefeated), joten vanhoissa tallennuksissa voitetun bossin luola on heti auki.
// Luolassa Excalibur on juuttunut kiveen: sen saa vetää kerran, kun taso riittää. Vedetty miekka
// laitetaan heti käteen. Tieto vedetystä miekasta tallentuu (swordTaken), joten miekkaa ei saa
// toista kertaa, vaikka sen myisi kauppiaalle.

/** Tallentuva tieto luolasta. Puuttuu vanhasta tallennuksesta = miekka on vielä kivessä. */
export interface CaveProgress {
  /** Onko Excalibur jo vedetty kivestä. */
  swordTaken: boolean;
}

/** Miekan tila kivessä: vedettävissä, taso ei riitä, tai jo sankarilla. */
export type SwordStatus = 'ready' | 'level' | 'taken';

/** Onko luola auki (Peikkokuningas voitettu). */
export function isCaveOpen(state: Pick<GameState, 'bossDefeated'>): boolean {
  return state.bossDefeated;
}

/** Onko sankari luolan suulla (enintään cave.enterTiles ruudun päässä). */
export function atCaveMouth(tile: Vec2, cave: CaveDef = CAVE): boolean {
  const reach = cave.enterTiles;
  return Math.abs(tile.x - cave.x) <= reach && Math.abs(tile.y - cave.y) <= reach;
}

/**
 * Miekan tila. Jos sankarilla on jo Excalibur muualta (esim. alkuruudun salainen burgeri),
 * kivi on tyhjä.
 */
export function swordStatus(state: GameState, cave: CaveDef = CAVE): SwordStatus {
  if (state.swordTaken || ownsItem(state.inventory, state.equipped, cave.sword)) {
    return 'taken';
  }
  return playerLevel(state) < cave.swordMinLevel ? 'level' : 'ready';
}

/** Vetää miekan kivestä ja laittaa sen käteen. Palauttaa false, jos se ei onnistu. */
export function pullSword(state: GameState, cave: CaveDef = CAVE): boolean {
  if (!isCaveOpen(state) || swordStatus(state, cave) !== 'ready') {
    return false;
  }
  state.inventory[cave.sword] = (state.inventory[cave.sword] ?? 0) + 1;
  equipItem(state.inventory, state.equipped, cave.sword);
  state.swordTaken = true;
  return true;
}
