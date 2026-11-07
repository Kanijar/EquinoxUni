import type { EnemyDef } from './types';

// Pienten saarten viholliset (data/isles.ts). Jokaisella saarella on kaksi omaa vihollista,
// ja jokainen saari on edellistä vaarallisempi: saaret ovat tasojen 50–100 seikkailu.
// Tasapaino on arvioitu kuten pääsaaren hirviöillä (kykypisteet jaettu tasaisesti, edellisen
// saaren varusteet päällä): "taso" = millä tasolla vihollinen on reilu vastus. Taistelun
// tausta on aina saaren oma (backdrop), myös hiekkarannalla.
// Tehtäväesineet putoavat vain, kun saaren tehtävä on kesken (data/isle-quests.ts).

export const ISLE_ENEMIES: readonly EnemyDef[] = [
  // --- Palmusaari (taso 50–60) ---
  {
    // Varastaa juomia kuten ryöstäjä: voitto palauttaa ne.
    id: 'pirate',
    name: 'Merirosvo',
    sprite: 'pirate',
    stats: { maxHp: 470, attack: 62, defense: 30, speed: 55 },
    aggroRange: 80,
    xp: 800,
    stealChance: 0.15,
    drops: [
      { item: 'pirate-saber', chance: 0.3 },
      { item: 'big-potion', chance: 0.5 },
      { item: 'map-piece', chance: 0.6, quest: 'treasure-map' },
    ],
    backdrop: 'jungle',
  },
  {
    // Nopea ja huomaa pelaajan kaukaa. Myrkkyhampaat: kriittinen osuma tavallista useammin.
    id: 'jungle-snake',
    name: 'Viidakkokäärme',
    sprite: 'jungle-snake',
    stats: { maxHp: 420, attack: 67, defense: 24, speed: 72 },
    aggroRange: 95,
    xp: 780,
    critChance: 0.15,
    drops: [{ item: 'snake-vest', chance: 0.3 }],
    backdrop: 'jungle',
  },
  // --- Sumusaari (taso 60–75) ---
  {
    id: 'skeleton',
    name: 'Luurankosoturi',
    sprite: 'skeleton',
    stats: { maxHp: 480, attack: 77, defense: 40, speed: 45 },
    aggroRange: 75,
    xp: 1200,
    drops: [
      { item: 'bone-sword', chance: 0.3 },
      { item: 'big-potion', chance: 0.5 },
    ],
    backdrop: 'grave',
  },
  {
    // Leijuu nopeasti ja huomaa pelaajan kaukaa.
    id: 'ghost',
    name: 'Sumuhaamu',
    sprite: 'ghost',
    stats: { maxHp: 380, attack: 82, defense: 32, speed: 66 },
    aggroRange: 100,
    xp: 1150,
    critChance: 0.12,
    drops: [
      { item: 'ghost-cloak', chance: 0.3 },
      { item: 'fog-lantern', chance: 0.6, quest: 'fog-lanterns' },
    ],
    backdrop: 'grave',
  },
  // --- Pakkassaari (taso 75–90) ---
  {
    // Hidas mutta jäinen kuori kestää lyöntejä.
    id: 'ice-golem',
    name: 'Jäägolemi',
    sprite: 'ice-golem',
    stats: { maxHp: 600, attack: 96, defense: 50, speed: 32 },
    aggroRange: 70,
    xp: 1800,
    drops: [
      { item: 'frost-axe', chance: 0.3 },
      { item: 'big-potion', chance: 0.6 },
    ],
    respawnMs: 120_000,
    backdrop: 'ice',
  },
  {
    id: 'crystal-spider',
    name: 'Kristallihämähäkki',
    sprite: 'crystal-spider',
    stats: { maxHp: 470, attack: 101, defense: 42, speed: 70 },
    aggroRange: 90,
    xp: 1750,
    critChance: 0.14,
    drops: [
      { item: 'crystal-armor', chance: 0.3 },
      { item: 'frost-crystal', chance: 0.6, quest: 'frost-crystals' },
    ],
    backdrop: 'ice',
  },
  // --- Myrskysaari (taso 90–100) ---
  {
    // Nopein vihollinen: huomaa pelaajan kaukaa ja iskee kuin salama.
    id: 'thunderbird',
    name: 'Ukkoslintu',
    sprite: 'thunderbird',
    stats: { maxHp: 700, attack: 111, defense: 58, speed: 78 },
    aggroRange: 110,
    xp: 2500,
    critChance: 0.12,
    drops: [
      { item: 'storm-cloak', chance: 0.3 },
      { item: 'big-potion', chance: 0.7 },
    ],
    respawnMs: 120_000,
    backdrop: 'storm',
  },
  {
    // Saarten vahvin vihollinen, vain yksi. Valmistelee voimaiskua (×2,5) kuten lohikäärme:
    // PUOLUSTA puolittaa sen. Palaa hitaasti (5 min).
    id: 'sea-serpent',
    name: 'Merikäärme',
    sprite: 'sea-serpent',
    stats: { maxHp: 1600, attack: 115, defense: 62, speed: 40 },
    aggroRange: 80,
    xp: 6000,
    critChance: 0.1,
    drops: [
      { item: 'serpent-spear', chance: 0.35 },
      { item: 'big-potion', chance: 1 },
    ],
    moves: { chargeChance: 0.25, chargeMultiplier: 2.5, specialChance: 0, specialPower: 0 },
    respawnMs: 300_000,
    backdrop: 'storm',
  },
];
