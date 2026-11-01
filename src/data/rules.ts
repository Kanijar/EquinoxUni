import { buildXpTable } from './level-curve';
import type {
  BattleRules,
  LevelCurve,
  MagicRules,
  MenuSecretRules,
  Progression,
  RespawnRules,
} from './types';

// Taistelun ja kokemustasojen säännöt. Muuta näitä, kun haluat pelistä
// helpomman tai vaikeamman.

export const BATTLE_RULES: BattleRules = {
  damageVariance: 0.2,
  critChance: 0.08,
  critMultiplier: 2,
  defendMultiplier: 0.5,
  fleeChance: 0.6,
};

/** Palava vihollinen menettää elämää kerran sekunnissa (data/spells.ts). */
export const MAGIC_RULES: MagicRules = {
  burnTickMs: 1000,
};

/**
 * Voitettu karttavihollinen palaa alkuperäiselle paikalleen minuutin kuluttua.
 * Aika kuluu vain kartalla (ei taistelussa eikä valikoissa). Viholliskohtainen aika:
 * EnemyDef.respawnMs (data/enemies.ts). 160 px = 10 ruutua, yli vihollisten huomausetäisyyden.
 */
export const RESPAWN_RULES: RespawnRules = {
  delayMs: 60_000,
  minPlayerDistancePx: 160,
};

/**
 * Tasot 1–50. KP-raja = 0,2 × n³ + 3,5 × n² + 5 × n, kun n = taso − 1.
 * Esimerkkejä: taso 2 = 9 KP, taso 10 = 474 KP, taso 20 = 2730 KP, taso 30 = 7966 KP,
 * taso 50 = 32178 KP. Tasot 1–10 ovat lähellä vanhoja rajoja (0, 12, 30, 55, 90, 140, 200,
 * 280, 380, 500) eivätkä missään kohtaa vaadi niitä enempää, joten vanhan tallennuksen
 * taso ei laske. Helpompi huipputaso: pienennä cubic-arvoa (0,1 → taso 50 = noin 20 400 KP).
 */
export const LEVEL_CURVE: LevelCurve = {
  maxLevel: 50,
  cubic: 0.2,
  quadratic: 3.5,
  linear: 5,
};

export const PROGRESSION: Progression = {
  xpForLevel: buildXpTable(LEVEL_CURVE),
  skillPointsPerLevel: 3,
};

/**
 * Salaisuus: napauta alkuruudun sutta ja sitten PELAA. Susi muuttuu henkisudeksi, ja uusi
 * peli alkaa huipputasolta 50 (KP tason rajassa, 147 kykypistettä) ja kolmella
 * ylimääräisellä juomalla.
 * Alkuruudulla tästä ei kerrota, vasta kartalla näkyy "Susi siunasi sinut!".
 * Toinen salaisuus: alkuruudun liman napautus muuttaa sankarin silmät mustiksi (slimeEyeColor).
 */
export const MENU_SECRET: MenuSecretRules = {
  wolfStartLevel: 50,
  bonusItems: [{ id: 'potion', count: 3 }],
  spiritSprite: 'wolf-spirit',
  slimeEyeColor: 'black',
};
