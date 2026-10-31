import { PLAYER } from '../data/player';
import { WORLD } from '../data/world';
import type { EnemyDef, ItemStack, PlayerStats, SkillId } from '../data/types';
import { recoverStolen, type Battle } from './battle';
import type { Fighter } from './combat';
import { levelForXp } from './progression';
import {
  applySkillPoints,
  getSkill,
  isSkillMaxed,
  noSkillPoints,
  skillPointsEarned,
  skillPointsLeft,
  type SkillPoints,
} from './skill-points';
import type { Vec2 } from './vector';

// Pelin eteneminen, joka säilyy kartan ja taistelun välillä:
// elämä, kokemus, kykypisteet, esineet, sijainti ja voitetut viholliset.
// Tila tallennetaan selaimeen (logic/save-format.ts). Kun lisäät kentän, lisää se myös
// tallennuksen tarkistukseen (logic/save-validate.ts), jotta vanhat tallennukset latautuvat.

export interface GameState {
  hp: number;
  xp: number;
  /** Kuhunkin kykyyn käytetyt kykypisteet. Käyttämättömät: unspentSkillPoints(). */
  readonly skills: SkillPoints;
  /** Esineiden määrät tunnisteittain. */
  readonly inventory: Record<string, number>;
  /** Sijainti kartalla pikseleinä. null = paikkakunnassa lastTown (esim. pelin alussa). */
  position: Vec2 | null;
  /**
   * Viimeisin paikkakunta, jossa pelaaja on käynyt (tunniste, data/towns.ts).
   * Pelin alussa aloituspaikkakunta. Taistelussa kaatunut sankari herää täällä.
   */
  lastTown: string;
  /** Voitettujen karttavihollisten järjestysnumerot (data/map-enemies.ts). */
  readonly defeated: number[];
}

/**
 * Uusi peli Valkeakoskelta. startXp antaa kokemusta heti alkuun (esim. alkuruudun
 * salaisuus, logic/menu-secret.ts): taso ja kykypisteet lasketaan kokemuksesta.
 */
export function createNewGame(startXp = 0): GameState {
  const inventory: Record<string, number> = {};
  for (const stack of PLAYER.startItems) {
    inventory[stack.id] = (inventory[stack.id] ?? 0) + stack.count;
  }
  return {
    hp: PLAYER.stats.maxHp,
    xp: Math.max(0, Math.floor(startXp)),
    skills: noSkillPoints(),
    inventory,
    position: null,
    lastTown: WORLD.startTown,
    defeated: [],
  };
}

export function playerLevel(state: GameState): number {
  return levelForXp(state.xp);
}

export function playerStats(state: GameState): PlayerStats {
  return applySkillPoints(PLAYER.stats, state.skills);
}

/** Kykypisteet, joita pelaaja ei ole vielä käyttänyt. */
export function unspentSkillPoints(state: GameState): number {
  return skillPointsLeft(playerLevel(state), state.skills);
}

/** Voiko kykyyn laittaa pisteen: pisteitä on jäljellä eikä kyky ole ylärajallaan. */
export function canSpendSkillPoint(state: GameState, id: SkillId): boolean {
  return unspentSkillPoints(state) > 0 && !isSkillMaxed(getSkill(id), playerStats(state));
}

/**
 * Laittaa yhden kykypisteen kykyyn. Elinvoima nostaa myös nykyistä elämää saman verran.
 * Palauttaa false, jos käyttämättömiä pisteitä ei ole tai kyky on ylärajallaan.
 */
export function spendSkillPoint(state: GameState, id: SkillId): boolean {
  if (!canSpendSkillPoint(state, id)) {
    return false;
  }
  const maxHpBefore = playerStats(state).maxHp;
  state.skills[id] += 1;
  state.hp += playerStats(state).maxHp - maxHpBefore;
  return true;
}

/** Taisteluhahmo pelaajan nykyisillä arvoilla (tarkkuus prosenteista todennäköisyydeksi). */
export function playerFighter(state: GameState): Fighter {
  const { maxHp, attack, defense, critPercent, magic } = playerStats(state);
  const hp = Math.min(state.hp, maxHp);
  return { hp, maxHp, attack, defense, critChance: critPercent / 100, magic };
}

/** Palauttaa elämän täyteen (esim. paikkakunnassa levätessä). */
export function restoreHp(state: GameState): void {
  state.hp = playerStats(state).maxHp;
}

export interface VictoryReward {
  readonly xp: number;
  /** Pelaajan kokemuspisteet yhteensä voiton jälkeen. */
  readonly totalXp: number;
  readonly leveledUp: boolean;
  readonly level: number;
  /** Tason noususta saadut uudet kykypisteet (0, jos taso ei noussut). */
  readonly skillPoints: number;
  readonly drop?: string;
  /** Esineet, jotka vihollinen oli varastanut ja jotka saatiin takaisin. */
  readonly recovered?: readonly ItemStack[];
}

/**
 * Voitto vihollisesta: kokemus, mahdollinen esine ja tason nousu (ja siitä kykypisteet).
 * mapEnemyIndex on null, kun vihollinen ei ollut kartalla (esim. väijytys).
 */
export function grantVictory(
  state: GameState,
  mapEnemyIndex: number | null,
  enemy: EnemyDef,
): VictoryReward {
  const before = playerLevel(state);
  state.xp += enemy.xp;
  if (mapEnemyIndex !== null) {
    state.defeated.push(mapEnemyIndex);
  }
  if (enemy.drop) {
    state.inventory[enemy.drop] = (state.inventory[enemy.drop] ?? 0) + 1;
  }
  const level = playerLevel(state);
  const leveledUp = level > before;
  if (leveledUp) {
    restoreHp(state);
  }
  const skillPoints = skillPointsEarned(level) - skillPointsEarned(before);
  const reward = { xp: enemy.xp, totalXp: state.xp, leveledUp, level, skillPoints };
  return enemy.drop ? { ...reward, drop: enemy.drop } : reward;
}

/**
 * Tallentaa taistelun lopputuloksen peliin: elämä talteen ja voitosta palkinto.
 * Voitosta saa takaisin myös varastetut esineet. Palauttaa palkinnon, jos taistelu voitettiin.
 */
export function applyBattleResult(
  state: GameState,
  battle: Battle,
  mapEnemyIndex: number | null,
  enemy: EnemyDef,
): VictoryReward | null {
  state.hp = Math.max(0, battle.player.hp);
  if (battle.outcome !== 'won') {
    return null;
  }
  const reward = grantVictory(state, mapEnemyIndex, enemy);
  const recovered = recoverStolen(battle);
  return recovered.length > 0 ? { ...reward, recovered } : reward;
}
