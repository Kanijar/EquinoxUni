// Tallennusten ja asetusten vakiot. Kaikki tallentuu selaimen localStorageen
// (ei palvelinta, ei henkilötietoja).

/** localStorage-avaimet. Etuliite erottaa pelin tiedot muista saman sivuston tiedoista. */
export const STORAGE_KEYS = {
  settings: 'vainon-seikkailu/asetukset',
  saveSlotPrefix: 'vainon-seikkailu/tallennus-',
} as const;

/** Tallennuspaikkojen määrä LATAA-näkymässä. */
export const SAVE_SLOT_COUNT = 3;

/**
 * Tallennusmuodon versio. Nosta tätä, kun GameStaten rakenne muuttuu niin,
 * ettei vanha tallennus enää kelpaa sellaisenaan, ja lisää muunnos
 * tiedostoon logic/save-format.ts (SAVE_MIGRATIONS).
 */
export const SAVE_VERSION = 1;

/** Säädettävän asetuksen rajat prosentteina. */
export interface SettingRange {
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly initial: number;
}

/** Valon määrä (kirkkaus) ja äänenvoimakkuus prosentteina. 100 % valoa = normaali. */
export const SETTING_RANGES = {
  brightness: { min: 50, max: 150, step: 10, initial: 100 },
  volume: { min: 0, max: 100, step: 10, initial: 70 },
} as const satisfies Record<string, SettingRange>;
