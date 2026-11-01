import type Phaser from 'phaser';
import {
  brightnessFactor,
  effectiveVolume,
  loadSettings,
  saveSettings,
  type Settings,
} from '../logic/settings';
import { setLanguage } from '../i18n/text';
import { browserStore } from './browser-storage';
import { initSoundFx } from './sound-fx';

// Pelaajan asetukset koko pelissä: ladataan käynnistyksessä, tallennetaan muutettaessa.
// Valon määrä säädetään pelin canvasin CSS-suodattimella (koskee kaikkia näkymiä),
// äänet Phaserin äänijärjestelmän voimakkuudella. Kieli vaihtaa TEXT-tekstit (i18n/text.ts).

let current: Settings | null = null;

/** Lataa tallennetut asetukset ja ottaa ne käyttöön. Kutsutaan BootScenessä. */
export function initSettings(game: Phaser.Game): void {
  initSoundFx(game);
  current = loadSettings(browserStore());
  applySettings(game, current);
}

export function currentSettings(): Settings {
  current ??= loadSettings(browserStore());
  return current;
}

/** Ottaa uudet asetukset käyttöön heti ja tallentaa ne selaimeen. */
export function changeSettings(game: Phaser.Game, next: Settings): void {
  current = next;
  applySettings(game, next);
  saveSettings(browserStore(), next);
}

function applySettings(game: Phaser.Game, settings: Settings): void {
  // Suodatin suoraan canvasiin: koko näytön tilassa Phaser siirtää canvasin uuteen elementtiin.
  game.canvas.style.filter = `brightness(${brightnessFactor(settings)})`;
  const volume = effectiveVolume(settings);
  game.sound.setVolume(volume);
  game.sound.setMute(volume === 0);
  setLanguage(settings.language);
  document.documentElement.lang = settings.language;
}
