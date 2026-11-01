import { describe, expect, it } from 'vitest';
import { SETTING_RANGES, STORAGE_KEYS } from '../src/config/persistence';
import { MemoryStore } from '../src/logic/key-value-store';
import {
  brightnessFactor,
  canStep,
  chooseLanguage,
  decodeSettings,
  defaultSettings,
  effectiveVolume,
  loadSettings,
  saveSettings,
  stepSetting,
  toggleMute,
} from '../src/logic/settings';

describe('asetukset', () => {
  it('oletuksena normaali valo ja äänet päällä', () => {
    const settings = defaultSettings();
    expect(brightnessFactor(settings)).toBe(1);
    expect(settings.muted).toBe(false);
    expect(effectiveVolume(settings)).toBe(SETTING_RANGES.volume.initial / 100);
  });

  it('valoa ja ääntä säädetään askelittain rajojen sisällä', () => {
    let settings = defaultSettings();
    settings = stepSetting(settings, 'brightness', 1);
    expect(settings.brightness).toBe(110);
    for (let i = 0; i < 50; i++) {
      settings = stepSetting(settings, 'brightness', -1);
    }
    expect(settings.brightness).toBe(SETTING_RANGES.brightness.min);
    expect(canStep(settings, 'brightness', -1)).toBe(false);
    expect(canStep(settings, 'brightness', 1)).toBe(true);
  });

  it('mykistys hiljentää äänet mutta muistaa voimakkuuden', () => {
    const muted = toggleMute(defaultSettings());
    expect(effectiveVolume(muted)).toBe(0);
    expect(toggleMute(muted).volume).toBe(SETTING_RANGES.volume.initial);
  });

  it('asetukset säilyvät varastossa', () => {
    const store = new MemoryStore();
    const settings = { brightness: 80, volume: 30, muted: true, language: 'en' as const };
    expect(saveSettings(store, settings)).toBe(true);
    expect(loadSettings(store)).toEqual(settings);
  });

  it('virheelliset tai puuttuvat asetukset korvataan oletuksilla', () => {
    expect(loadSettings(new MemoryStore())).toEqual(defaultSettings());
    expect(decodeSettings('rikki')).toEqual(defaultSettings());
    expect(decodeSettings('{"brightness":"kirkas","volume":999,"muted":"joo"}')).toEqual({
      brightness: SETTING_RANGES.brightness.initial,
      volume: SETTING_RANGES.volume.max,
      muted: false,
      language: 'fi',
    });
    expect(decodeSettings('{"brightness":83}').brightness).toBe(80);
  });

  it('oletuskieli on suomi, ja vanhat asetukset ilman kieltä ovat suomeksi', () => {
    expect(defaultSettings().language).toBe('fi');
    expect(decodeSettings('{"brightness":80,"volume":30,"muted":false}').language).toBe('fi');
    expect(decodeSettings('{"language":"klingon"}').language).toBe('fi');
  });

  it('kielen voi vaihtaa englanniksi ja takaisin, ja valinta säilyy', () => {
    const store = new MemoryStore();
    const english = chooseLanguage(defaultSettings(), 'en');
    saveSettings(store, english);
    expect(loadSettings(store).language).toBe('en');
    expect(loadSettings(store).volume).toBe(SETTING_RANGES.volume.initial);
    expect(chooseLanguage(english, 'fi').language).toBe('fi');
  });

  it('asetusten avain ei ole sama kuin tallennusten', () => {
    expect(STORAGE_KEYS.settings.startsWith(STORAGE_KEYS.saveSlotPrefix)).toBe(false);
  });
});
