import type { ParticleBurstDef } from './types';

// Taistelun hiukkasefektit datana. Määrät on pidetty pieninä, jotta peli pyörii
// sulavasti myös keskitason Android-puhelimella. Uusi efekti = uusi rivi tähän ja
// kutsu view.burst('tunniste', x, y) (ui/battle/battle-particles.ts).

export const PARTICLE_BURSTS = {
  /** Lyönnin kipinät. */
  hit: {
    count: 8,
    colors: [0xffffff, 0xffe9a8],
    speed: { min: 50, max: 130 },
    lifeMs: 260,
    size: 2,
    gravity: 180,
  },
  /** Kriittinen osuma: isompi ja kultainen. */
  crit: {
    count: 16,
    colors: [0xffd23f, 0xffffff, 0xff9a3c],
    speed: { min: 80, max: 200 },
    lifeMs: 420,
    size: 3,
    gravity: 160,
  },
  /** Torjuttu isku: siniset kipinät kilvestä. */
  block: {
    count: 10,
    colors: [0x8fd3ff, 0xffffff],
    speed: { min: 60, max: 140 },
    lifeMs: 300,
    size: 2,
    gravity: 120,
  },
  /** Tulipallon räjähdys. */
  explosion: {
    count: 18,
    colors: [0xfff2a8, 0xffb43c, 0xff6a1a, 0xc8321e],
    speed: { min: 40, max: 160 },
    lifeMs: 460,
    size: 3,
    gravity: -40,
  },
  /** Savu räjähdyksen jälkeen. */
  smoke: {
    count: 6,
    colors: [0x5a5a64, 0x7a7a84],
    speed: { min: 10, max: 30 },
    lifeMs: 800,
    size: 4,
    gravity: -30,
    angle: { min: -120, max: -60 },
  },
  /** Juoman parannus: vihreät tähdet nousevat. */
  heal: {
    count: 12,
    colors: [0x7dff8a, 0xd4ffd8, 0xffffff],
    speed: { min: 20, max: 60 },
    lifeMs: 700,
    size: 2,
    gravity: -60,
    angle: { min: -150, max: -30 },
  },
  /** Voitetun vihollisen pöly (värit tulevat vihollisen omasta spritestä). */
  defeat: {
    count: 24,
    colors: [0xffffff],
    speed: { min: 30, max: 120 },
    lifeMs: 650,
    size: 3,
    gravity: 60,
  },
  /** Voitto ja tason nousu: kultaiset tähdet. */
  victory: {
    count: 20,
    colors: [0xffe066, 0xffffff, 0x8fd3ff],
    speed: { min: 50, max: 140 },
    lifeMs: 800,
    size: 2,
    gravity: 80,
    angle: { min: -160, max: -20 },
  },
  /** Juoksupöly paetessa. */
  dust: {
    count: 8,
    colors: [0xc8b088, 0xa89068],
    speed: { min: 15, max: 45 },
    lifeMs: 400,
    size: 3,
    gravity: -20,
    angle: { min: -170, max: -100 },
  },
} as const satisfies Record<string, ParticleBurstDef>;

export type ParticleBurstId = keyof typeof PARTICLE_BURSTS;

/** Palavan vihollisen kipinät ja tulipallon vana (jatkuva virta, ei räjähdys). */
export const FLAME_STREAM = {
  colors: [0xfff2a8, 0xffb43c, 0xff6a1a, 0xc8321e],
  /** Uusi kipinä näin monen millisekunnin välein. */
  everyMs: 60,
  lifeMs: 520,
  speed: { min: 10, max: 30 },
  size: 2,
  rise: -70,
} as const;
