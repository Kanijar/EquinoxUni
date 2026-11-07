import { buildXpTable } from './level-curve';
import type {
  BattleRules,
  BurgerSecretRules,
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
 * Tasot 1–100. KP-raja = 0,2 × n³ + 3,5 × n² + 5 × n, kun n = taso − 1.
 * Esimerkkejä: taso 2 = 9 KP, taso 10 = 474 KP, taso 20 = 2730 KP, taso 30 = 7966 KP,
 * taso 50 = 32178 KP, taso 75 = 100581 KP, taso 100 = 228858 KP.
 * Tasot 1–50 ovat samat kuin ennen huipputason nostoa 100:aan, ja tasot 1–10 ovat lähellä
 * vanhimpia rajoja (0, 12, 30, 55, 90, 140, 200, 280, 380, 500) eivätkä vaadi niitä enempää,
 * joten vanhan tallennuksen taso ei laske. Tasolla 50 yksi taso vaatii noin 1800 KP
 * (2–3 lohikäärmettä), tasolla 99 noin 6500 KP. Helpompi huipputaso: pienennä cubic-arvoa
 * (huom. se muuttaa myös tasojen 1–50 rajoja).
 */
export const LEVEL_CURVE: LevelCurve = {
  maxLevel: 100,
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
 * peli alkaa huipputasolta 100 (KP tason rajassa, 297 kykypistettä) ja kolmella
 * ylimääräisellä juomalla.
 * Alkuruudulla tästä ei kerrota, vasta kartalla näkyy "Susi siunasi sinut!".
 * Toinen salaisuus: alkuruudun liman napautus muuttaa sankarin silmät mustiksi (slimeEyeColor).
 */
export const MENU_SECRET: MenuSecretRules = {
  wolfStartLevel: 100,
  bonusItems: [{ id: 'potion', count: 3 }],
  spiritSprite: 'wolf-spirit',
  slimeEyeColor: 'black',
};

/**
 * Salaisuus: alkuruudun vasemmassa reunassa on pieni burgeri. Kun sitä napauttaa ja sitten
 * aloittaa uuden pelin tai lataa tallennuksen, sankari saa parhaat varusteet käyttöön
 * (jokaiseen paikkaan pisteiltään paras, gearWeights), Bugattin avaimet ja miljoona kultakolikkoa.
 * Tasot eivät nouse. Omistettua esinettä ei anneta toista kertaa, ja kolikot nostetaan
 * miljoonaan vain, jos niitä on vähemmän (logic/burger-secret.ts).
 */
export const BURGER_SECRET: BurgerSecretRules = {
  gearWeights: { attack: 1, defense: 2, maxHp: 0.5, critPercent: 1, magic: 2 },
  extraItems: ['bugatti-keys'],
  coins: 1_000_000,
};
