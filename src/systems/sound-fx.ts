import type Phaser from 'phaser';
import { SOUNDS, type SoundId } from '../data/sounds';
import type { SoundDef } from '../data/types';

// Koodilla tehdyt ääniefektit (data/sounds.ts). Äänet kulkevat Phaserin
// äänijärjestelmän läpi, joten pelin äänenvoimakkuus ja mykistys koskevat niitä
// (systems/game-settings.ts). Phaser myös "avaa" äänet ensimmäisestä kosketuksesta.

/** Lyhyt häivytys sävelen alkuun ja loppuun, ettei kuulu napsahdusta. */
const FADE_S = 0.01;

let manager: Phaser.Sound.WebAudioSoundManager | null = null;

export function initSoundFx(game: Phaser.Game): void {
  // Vain Web Audio osaa tehdä ääniä koodilla. Tunnistus ilman Phaserin luokkaa,
  // jotta tätä tiedostoa käyttävät osat voi testata ilman selainta.
  manager = 'context' in game.sound ? game.sound : null;
}

/** Soittaa ääniefektin tunnisteella. Ei tee mitään, jos selain ei tue ääntä. */
export function playSound(id: SoundId): void {
  if (!manager || manager.locked || manager.mute) {
    return;
  }
  const sound: SoundDef = SOUNDS[id];
  let start = manager.context.currentTime;
  for (const note of sound.notes) {
    playNote(manager, sound, note, start);
    start += note.ms / 1000;
  }
}

function playNote(
  audio: Phaser.Sound.WebAudioSoundManager,
  sound: SoundDef,
  note: SoundDef['notes'][number],
  start: number,
): void {
  const { context } = audio;
  const end = start + note.ms / 1000;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = sound.wave;
  oscillator.frequency.setValueAtTime(note.freq, start);
  if (note.slideTo !== undefined) {
    oscillator.frequency.linearRampToValueAtTime(note.slideTo, end);
  }
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(sound.gain, start + FADE_S);
  gain.gain.setValueAtTime(sound.gain, end - FADE_S);
  gain.gain.linearRampToValueAtTime(0, end);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(end);
}
