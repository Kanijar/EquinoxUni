// Nopeusraja ideaviesteille ja tykkäyksille (palvelin worker/presence/src/ideas-room.ts).
// Sääntö: kahden tapahtuman välissä vähintään gapMs, ja aikaikkunassa (windowMs) enintään
// perWindow tapahtumaa. Puhdas logiikka, jotta sen voi testata ilman palvelinta.

export interface RateRule {
  /** Pienin väli kahden tapahtuman välillä millisekunteina (0 = ei väliä). */
  readonly gapMs: number;
  /** Enintään näin monta tapahtumaa ikkunassa. */
  readonly perWindow: number;
  readonly windowMs: number;
}

/** Ikkunan sisällä olevat aiemmat ajat (vanhemmat unohdetaan). */
export function recentTimes(times: readonly number[], now: number, rule: RateRule): number[] {
  return times.filter((time) => now - time < rule.windowMs);
}

/** Saako uuden tapahtuman tehdä nyt, kun aiemmat tapahtuivat hetkinä times. */
export function isAllowed(times: readonly number[], now: number, rule: RateRule): boolean {
  const recent = recentTimes(times, now, rule);
  if (recent.length >= rule.perWindow) {
    return false;
  }
  const latest = Math.max(-Infinity, ...recent);
  return now - latest >= rule.gapMs;
}

/**
 * Muistissa pidettävä nopeusraja avaimittain (esim. verkon osoite). Ei tallennu minnekään:
 * kun palvelin nukahtaa, kaikki unohtuu.
 */
export class RateLimiter {
  private readonly times = new Map<string, number[]>();

  constructor(
    private readonly rule: RateRule,
    private readonly maxKeys: number,
  ) {}

  /** Kirjaa tapahtuman, jos se on sallittu. Palauttaa false, jos raja tuli vastaan. */
  take(key: string, now: number): boolean {
    const recent = recentTimes(this.times.get(key) ?? [], now, this.rule);
    if (!isAllowed(recent, now, this.rule)) {
      this.times.set(key, recent);
      return false;
    }
    if (!this.times.has(key) && this.times.size >= this.maxKeys) {
      this.forgetOld(now);
    }
    this.times.set(key, [...recent, now]);
    return true;
  }

  private forgetOld(now: number): void {
    for (const [key, times] of this.times) {
      if (recentTimes(times, now, this.rule).length === 0) this.times.delete(key);
    }
    if (this.times.size >= this.maxKeys) this.times.clear();
  }
}
