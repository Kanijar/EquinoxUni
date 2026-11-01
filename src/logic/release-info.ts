import { GAME_INFO } from '../data/game-info';
import { TEXT } from '../i18n/fi';

// Alkuruudun versioteksti: versionumero (0.PR-numero) ja julkaisuaika Suomen aikaa.
// Arvot tulevat buildista (vite.config.ts → import.meta.env), ks. logic/release-number.ts.

/** Buildin antamat tiedot julkaisusta. */
export interface ReleaseInfo {
  /** Uusimman PR:n numero tekstinä, esim. "25". Puuttuu, jos gitiä ei ollut. */
  readonly prNumber?: string | undefined;
  /** Buildin aika ISO-muodossa, esim. "2026-11-01T08:05:00.000Z". */
  readonly builtAt?: string | undefined;
  /** true omalla koneella (npm run dev): versiota ei ole julkaistu. */
  readonly dev: boolean;
}

/** Versionumero PR:n numerosta: PR #25 → "0.25". */
export function versionNumber(prNumber: number): string {
  return `${GAME_INFO.versionMajor}.${prNumber}`;
}

const timeFormat = new Intl.DateTimeFormat('fi-FI', {
  timeZone: GAME_INFO.timeZone,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hourCycle: 'h23',
});

/** Julkaisuaika Suomen aikaa: päivä "1.11.2026" ja kellonaika "10.05". null, jos aika on rikki. */
export function releaseTime(iso: string): { date: string; clock: string } | null {
  const time = new Date(iso);
  if (Number.isNaN(time.getTime())) return null;
  const parts = Object.fromEntries(timeFormat.formatToParts(time).map((p) => [p.type, p.value]));
  const minutes = String(parts['minute']).padStart(2, '0');
  return {
    date: `${parts['day']}.${parts['month']}.${parts['year']}`,
    clock: `${Number(parts['hour'])}.${minutes}`,
  };
}

/** Alkuruudun versiotekstin rivit: versionumero ja sen alla julkaisuaika. */
export function releaseLines(info: ReleaseInfo): string[] {
  const pr = Number(info.prNumber);
  const version =
    info.prNumber && Number.isInteger(pr) && pr > 0
      ? TEXT.menu.version(versionNumber(pr))
      : TEXT.menu.versionStageOnly;
  if (info.dev) return [version, TEXT.menu.devBuild];
  const time = info.builtAt === undefined ? null : releaseTime(info.builtAt);
  return time === null ? [version] : [version, TEXT.menu.released(time.date, time.clock)];
}
