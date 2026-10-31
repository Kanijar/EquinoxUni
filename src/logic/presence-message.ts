import { PRESENCE } from '../config/presence';

// Pelaajalaskurin viestit palvelimen ja pelin välillä. Palvelin lähettää {"count": 3}
// aina kun joku tulee peliin tai lähtee. Viesti ei sisällä mitään tietoa pelaajista.

export interface CountMessage {
  readonly count: number;
}

export function formatCountMessage(count: number): string {
  const message: CountMessage = { count };
  return JSON.stringify(message);
}

/** Palauttaa pelaajamäärän tai null, jos viesti ei ole kelvollinen laskuriviesti. */
export function parseCountMessage(data: unknown): number | null {
  if (typeof data !== 'string' || data === PRESENCE.pong) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(data);
    const count = (parsed as Partial<CountMessage> | null)?.count;
    return isValidCount(count) ? count : null;
  } catch {
    return null;
  }
}

function isValidCount(count: unknown): count is number {
  return typeof count === 'number' && Number.isInteger(count) && count >= 0;
}

/** Kuinka kauan odotetaan ennen uutta yhteysyritystä (attempt = 0 ensimmäisellä kerralla). */
export function retryDelayMs(attempt: number): number {
  const delay = PRESENCE.firstRetryMs * 2 ** Math.max(0, attempt);
  return Math.min(delay, PRESENCE.maxRetryMs);
}

/** Laskuri otetaan käyttöön vain, kun osoite on WebSocket-osoite (wss:// tai ws://). */
export function isPresenceUrl(url: string | undefined): url is string {
  return url !== undefined && /^wss?:\/\/[^\s/]+/.test(url.trim());
}
