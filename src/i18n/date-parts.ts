// Päivämäärä ja kellonaika osina, jotta kukin kieli voi kirjoittaa ne omalla tavallaan
// (suomeksi "1.11.2026 klo 10.05", englanniksi "1 Nov 2026 at 10:05").

export interface DateParts {
  readonly year: number;
  /** Kuukausi 1–12. */
  readonly month: number;
  readonly day: number;
  /** Tunnit 0–23. */
  readonly hour: number;
  readonly minute: number;
}

/** Aikaleima (millisekunteina) selaimen paikallisena aikana osiksi. */
export function localDateParts(time: number): DateParts {
  const date = new Date(time);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
  };
}

/** Minuutit aina kahdella numerolla: 5 → "05". */
export const twoDigits = (value: number): string => String(value).padStart(2, '0');
