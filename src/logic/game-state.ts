import { MAP_ENEMIES } from '../data/map-enemies';
import { PLAYER } from '../data/player';
import { WORLD } from '../data/world';
import type { EnemyDef, EyeColor, ItemStack, PlayerStats, SkillId } from '../data/types';
import { recoverStolen, type Battle, type Rng } from './battle';
import type { Fighter } from './combat';
import { rollDrops } from './drops';
import { applyGear, ownsItem, type Equipped } from './equipment';
import { levelForXp } from './progression';
import { respawnDelayMs, startRespawn, type RespawnTimer } from './respawn';
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
// elämä, kokemus, kykypisteet, esineet ja varusteet, sijainti, voitetut viholliset ja niiden paluu.
// Tila tallennetaan selaimeen (logic/save-format.ts). Kun lisäät kentän, lisää se myös
// tallennuksen tarkistukseen (logic/save-validate.ts), jotta vanhat tallennukset latautuvat.

export interface GameState {
  hp: number;
  xp: number;
  /** Kuhunkin kykyyn käytetyt kykypisteet. Käyttämättömät: unspentSkillPoints(). */
  readonly skills: SkillPoints;
  /** Repun esineiden määrät tunnisteittain (käytössä olevat varusteet eivät ole täällä). */
  readonly inventory: Record<string, number>;
  /** Käytössä olevat varusteet paikoittain (logic/equipment.ts). */
  readonly equipped: Equipped;
  /** Sijainti kartalla pikseleinä. null = paikkakunnassa lastTown (esim. pelin alussa). */
  position: Vec2 | null;
  /**
   * Viimeisin paikkakunta, jossa pelaaja on käynyt (tunniste, data/towns.ts).
   * Pelin alussa aloituspaikkakunta. Taistelussa kaatunut sankari herää täällä.
   */
  lastTown: string;
  /**
   * Karttavihollisten järjestysnumerot (data/map-enemies.ts), jotka on voitettu ainakin kerran.
   * Kun kaikki on voitettu, peli on läpäisty.
   */
  readonly defeated: number[];
  /** Kartalta poissa olevat voitetut viholliset ja aika niiden paluuseen (logic/respawn.ts). */
  readonly respawning: RespawnTimer[];
  /** Sankarin silmien väri (data/player.ts eyeSprites). Alkuruudun lima muuttaa sen. */
  eyeColor: EyeColor;
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
    equipped: {},
    position: null,
    lastTown: WORLD.startTown,
    defeated: [],
    respawning: [],
    eyeColor: PLAYER.eyeColor,
  };
}

/** Sankarin sprite silmien värin mukaan (kartta ja taistelu). */
export function playerSprite(state: GameState): string {
  return PLAYER.eyeSprites[state.eyeColor];
}

/** Karttaviholliset, joita ei ole vielä voitettu kertaakaan. */
export function enemiesToBeat(state: GameState): number {
  return MAP_ENEMIES.length - state.defeated.length;
}

/** Merkitsee karttavihollisen voitetuksi: se lähtee kartalta ja palaa palautusajan jälkeen. */
function markDefeated(state: GameState, mapEnemyIndex: number, enemy: EnemyDef): void {
  if (!state.defeated.includes(mapEnemyIndex)) {
    state.defeated.push(mapEnemyIndex);
  }
  startRespawn(state.respawning, mapEnemyIndex, respawnDelayMs(enemy));
}

export function playerLevel(state: GameState): number {
  return levelForXp(state.xp);
}

/** Arvot kykypisteineen mutta ilman varusteita (kyvyn yläraja koskee näitä). */
export function skillStats(state: GameState): PlayerStats {
  return applySkillPoints(PLAYER.stats, state.skills);
}

/** Pelaajan arvot: perusarvot, kykypisteet ja käytössä olevat varusteet. */
export function playerStats(state: GameState): PlayerStats {
  return applyGear(skillStats(state), state.equipped);
}

/** Kykypisteet, joita pelaaja ei ole vielä käyttänyt. */
export function unspentSkillPoints(state: GameState): number {
  return skillPointsLeft(playerLevel(state), state.skills);
}

/** Voiko kykyyn laittaa pisteen: pisteitä on jäljellä eikä kyky ole ylärajallaan. */
export function canSpendSkillPoint(state: GameState, id: SkillId): boolean {
  return unspentSkillPoints(state) > 0 && !isSkillMaxed(getSkill(id), skillStats(state));
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
  /** Esineet, jotka vihollinen pudotti (logic/drops.ts). Puuttuu, jos mitään ei pudonnut. */
  readonly drops?: readonly string[];
  /** Esineet, jotka vihollinen oli varastanut ja jotka saatiin takaisin. */
  readonly recovered?: readonly ItemStack[];
}

/** Karttavihollinen tai väijyjä, jonka kanssa taisteltiin. */
export interface Foe {
  readonly enemy: EnemyDef;
  /** Järjestysnumero data/map-enemies.ts:ssä, tai null, kun vihollinen ei ollut kartalla. */
  readonly mapEnemyIndex: number | null;
}

/** Arpoo vihollisen pudotukset ja laittaa ne reppuun. */
function collectDrops(state: GameState, enemy: EnemyDef, rng: Rng): string[] {
  const owns = (id: string): boolean => ownsItem(state.inventory, state.equipped, id);
  const drops = rollDrops(enemy.drops ?? [], owns, rng);
  for (const id of drops) {
    state.inventory[id] = (state.inventory[id] ?? 0) + 1;
  }
  return drops;
}

/**
 * Voitto vihollisesta: kokemus, mahdolliset pudotukset ja tason nousu (ja siitä kykypisteet).
 * mapEnemyIndex on null, kun vihollinen ei ollut kartalla (esim. väijytys).
 */
export function grantVictory(
  state: GameState,
  mapEnemyIndex: number | null,
  enemy: EnemyDef,
  rng: Rng = Math.random,
): VictoryReward {
  const before = playerLevel(state);
  state.xp += enemy.xp;
  if (mapEnemyIndex !== null) {
    markDefeated(state, mapEnemyIndex, enemy);
  }
  const drops = collectDrops(state, enemy, rng);
  const level = playerLevel(state);
  const leveledUp = level > before;
  if (leveledUp) {
    restoreHp(state);
  }
  const skillPoints = skillPointsEarned(level) - skillPointsEarned(before);
  const reward = { xp: enemy.xp, totalXp: state.xp, leveledUp, level, skillPoints };
  return drops.length > 0 ? { ...reward, drops } : reward;
}

/**
 * Tallentaa taistelun lopputuloksen peliin: elämä talteen ja voitosta palkinto.
 * Voitosta saa takaisin myös varastetut esineet. Palauttaa palkinnon, jos taistelu voitettiin.
 */
export function applyBattleResult(
  state: GameState,
  battle: Battle,
  foe: Foe,
  rng: Rng = Math.random,
): VictoryReward | null {
  state.hp = Math.max(0, battle.player.hp);
  if (battle.outcome !== 'won') {
    return null;
  }
  const reward = grantVictory(state, foe.mapEnemyIndex, foe.enemy, rng);
  const recovered = recoverStolen(battle);
  return recovered.length > 0 ? { ...reward, recovered } : reward;
}
