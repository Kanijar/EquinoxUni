// Tallennusten ja asetusten vakiot. Kaikki tallentuu selaimen localStorageen
// (ei palvelinta, ei henkilötietoja).

/** localStorage-avaimet. Etuliite erottaa pelin tiedot muista saman sivuston tiedoista. */
export const STORAGE_KEYS = {
  settings: 'equinox-universe/asetukset',
  saveSlotPrefix: 'equinox-universe/tallennus-',
} as const;

/** Tallennuspaikkojen määrä LATAA-näkymässä. */
export const SAVE_SLOT_COUNT = 3;

/**
 * Tallennusmuodon versio. Nosta tätä, kun GameStaten rakenne muuttuu niin,
 * ettei vanha tallennus enää kelpaa sellaisenaan, ja lisää muunnos
 * tiedostoon logic/save-format.ts (SAVE_MIGRATIONS).
 * Versio 2: voitetut viholliset palaavat kartalle (GameState.respawning).
 * Versio 3: sankarin silmien väri (GameState.eyeColor).
 * Versio 4: reppu ja varusteet (GameState.equipped).
 * Versio 5: loppuboss (GameState.bossProgress, bossDefeated) ja läpäisyn voittoruutu (completed).
 * Versio 6: Suomen kartta vaihtui saareksi (sijainti, paikkakunta ja voitetut viholliset alusta).
 */
export const SAVE_VERSION = 6;

/**
 * Vanhan Suomen kartan (tallennusversiot 1–5) tunturipeikkojen järjestysnumerot
 * vihollislistassa. Muunnos 4 → 5 laskee niistä peikkolaskurin.
 */
export const FINLAND_MAP_TROLLS: readonly number[] = [13, 14, 15, 16];

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
