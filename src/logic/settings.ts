import { SETTING_RANGES, STORAGE_KEYS, type SettingRange } from '../config/persistence';
import { parseJson, safeRead, safeWrite, type KeyValueStore } from './key-value-store';

// Pelaajan asetukset: valon määrä (kirkkaus) ja äänet. Säilyvät selaimessa.

export interface Settings {
  /** Valon määrä prosentteina (100 = normaali). */
  readonly brightness: number;
  /** Äänenvoimakkuus prosentteina. */
  readonly volume: number;
  readonly muted: boolean;
}

export type AdjustableSetting = keyof typeof SETTING_RANGES;

export function defaultSettings(): Settings {
  return {
    brightness: SETTING_RANGES.brightness.initial,
    volume: SETTING_RANGES.volume.initial,
    muted: false,
  };
}

/** Pyöristää arvon lähimpään sallittuun askeleeseen rajojen sisälle. */
function snap(value: number, range: SettingRange): number {
  const steps = Math.round((value - range.min) / range.step);
  const snapped = range.min + steps * range.step;
  return Math.min(range.max, Math.max(range.min, snapped));
}

function readNumber(value: unknown, range: SettingRange): number {
  return typeof value === 'number' && Number.isFinite(value) ? snap(value, range) : range.initial;
}

/** Lukee asetukset tekstistä. Puuttuvat tai virheelliset arvot korvataan oletuksilla. */
export function decodeSettings(text: string | null): Settings {
  const raw = text === null ? null : parseJson(text);
  if (typeof raw !== 'object' || raw === null) {
    return defaultSettings();
  }
  const record = raw as Record<string, unknown>;
  return {
    brightness: readNumber(record['brightness'], SETTING_RANGES.brightness),
    volume: readNumber(record['volume'], SETTING_RANGES.volume),
    muted: record['muted'] === true,
  };
}

/** Kasvattaa (direction 1) tai pienentää (-1) asetusta yhden askeleen. */
export function stepSetting(
  settings: Settings,
  key: AdjustableSetting,
  direction: 1 | -1,
): Settings {
  const range = SETTING_RANGES[key];
  return { ...settings, [key]: snap(settings[key] + direction * range.step, range) };
}

export function canStep(settings: Settings, key: AdjustableSetting, direction: 1 | -1): boolean {
  return stepSetting(settings, key, direction)[key] !== settings[key];
}

export function toggleMute(settings: Settings): Settings {
  return { ...settings, muted: !settings.muted };
}

/** Äänenvoimakkuus välillä 0..1. Mykistettynä 0. */
export function effectiveVolume(settings: Settings): number {
  return settings.muted ? 0 : settings.volume / 100;
}

/** Kirkkauskerroin (1 = normaali). */
export function brightnessFactor(settings: Settings): number {
  return settings.brightness / 100;
}

export function loadSettings(store: KeyValueStore): Settings {
  return decodeSettings(safeRead(store, STORAGE_KEYS.settings));
}

export function saveSettings(store: KeyValueStore, settings: Settings): boolean {
  return safeWrite(store, STORAGE_KEYS.settings, JSON.stringify(settings));
}
