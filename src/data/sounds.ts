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
  /** Vihollinen pudotti esineen (voittoruudun "Löysit: ..."). */
  loot: {
    wave: 'square',
    gain: 0.18,
    notes: [
      { freq: 988, ms: 60 },
      { freq: 1319, ms: 60 },
      { freq: 1976, ms: 180 },
    ],
  },
} as const satisfies Record<string, SoundDef>;

/** Äänen tunniste, esim. playSound('hit'). Kirjoitusvirhe huomataan jo käännöksessä. */
export type SoundId = keyof typeof SOUNDS;
