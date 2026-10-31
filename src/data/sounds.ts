import type { SoundDef } from './types';

// Pelin ääniefektit. Äänet tehdään koodilla (systems/sound-fx.ts), joten
// tiedostoja ei tarvita. Uusi ääni = uusi rivi tähän ja playSound('tunniste').
// Myöhemmin oikeat äänitiedostot voi ladata BootScenessä Phaserin this.load.audio()-metodilla.

export const SOUNDS = {
  tap: { wave: 'square', gain: 0.15, notes: [{ freq: 660, ms: 40 }] },
  hit: { wave: 'square', gain: 0.25, notes: [{ freq: 300, ms: 90, slideTo: 120 }] },
  hurt: { wave: 'sawtooth', gain: 0.2, notes: [{ freq: 180, ms: 140, slideTo: 70 }] },
  crit: {
    wave: 'square',
    gain: 0.3,
    notes: [
      { freq: 900, ms: 50 },
      { freq: 400, ms: 120, slideTo: 100 },
    ],
  },
  spell: {
    wave: 'sawtooth',
    gain: 0.2,
    notes: [
      { freq: 200, ms: 120, slideTo: 700 },
      { freq: 500, ms: 140, slideTo: 90 },
    ],
  },
  victory: {
    wave: 'triangle',
    gain: 0.35,
    notes: [
      { freq: 523, ms: 100 },
      { freq: 659, ms: 100 },
      { freq: 784, ms: 180 },
    ],
  },
  'level-up': {
    wave: 'square',
    gain: 0.2,
    notes: [
      { freq: 523, ms: 80 },
      { freq: 784, ms: 80 },
      { freq: 1047, ms: 200 },
    ],
  },
  howl: {
    wave: 'triangle',
    gain: 0.3,
    notes: [
      { freq: 330, ms: 120, slideTo: 620 },
      { freq: 620, ms: 380, slideTo: 440 },
    ],
  },
  'wolf-magic': {
    wave: 'triangle',
    gain: 0.3,
    notes: [
      { freq: 784, ms: 70 },
      { freq: 988, ms: 70 },
      { freq: 1175, ms: 70 },
      { freq: 1568, ms: 260, slideTo: 1760 },
    ],
  },
  save: {
    wave: 'triangle',
    gain: 0.35,
    notes: [
      { freq: 784, ms: 80 },
      { freq: 1047, ms: 160 },
    ],
  },
  // --- Taistelun efektit ---
  /** Taistelu alkaa: kartta hajoaa pikseleiksi. */
  'battle-start': {
    wave: 'square',
    gain: 0.22,
    notes: [
      { freq: 220, ms: 70 },
      { freq: 330, ms: 70 },
      { freq: 440, ms: 70 },
      { freq: 660, ms: 160, slideTo: 880 },
    ],
  },
  /** Lyönnin sujahdus ennen osumaa. */
  swing: { wave: 'triangle', gain: 0.18, notes: [{ freq: 900, ms: 70, slideTo: 300 }] },
  /** Tulipallo räjähtää vihollisen päällä. */
  boom: {
    wave: 'sawtooth',
    gain: 0.25,
    notes: [
      { freq: 160, ms: 60, slideTo: 90 },
      { freq: 90, ms: 220, slideTo: 40 },
    ],
  },
  /** Kilpi nousee. */
  shield: {
    wave: 'triangle',
    gain: 0.28,
    notes: [
      { freq: 440, ms: 60 },
      { freq: 880, ms: 140, slideTo: 760 },
    ],
  },
  /** Juoma parantaa. */
  heal: {
    wave: 'triangle',
    gain: 0.3,
    notes: [
      { freq: 523, ms: 70 },
      { freq: 784, ms: 70 },
      { freq: 1047, ms: 70 },
      { freq: 1319, ms: 160 },
    ],
  },
  /** Vihollinen kaatuu ja hajoaa pölyksi. */
  'enemy-down': {
    wave: 'square',
    gain: 0.2,
    notes: [
      { freq: 440, ms: 80, slideTo: 330 },
      { freq: 330, ms: 80, slideTo: 220 },
      { freq: 220, ms: 220, slideTo: 60 },
    ],
  },
  /** Pakeneminen: nopeat askeleet. */
  flee: {
    wave: 'square',
    gain: 0.15,
    notes: [
      { freq: 300, ms: 50 },
      { freq: 360, ms: 50 },
      { freq: 300, ms: 50 },
      { freq: 420, ms: 90 },
    ],
  },
} as const satisfies Record<string, SoundDef>;

/** Äänen tunniste, esim. playSound('hit'). Kirjoitusvirhe huomataan jo käännöksessä. */
export type SoundId = keyof typeof SOUNDS;
