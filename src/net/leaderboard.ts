import { LEADERBOARD } from '../config/leaderboard';
import {
  leaderboardUrl,
  readReply,
  type LeaderboardReply,
  type ScoreSubmission,
} from '../logic/leaderboard';

// 10 parhaan listan yhteys palvelimeen (worker/presence, sama palvelin kuin pelaajalaskurilla).
// Osoite johdetaan pelaajalaskurin osoitteesta (VITE_PRESENCE_URL), joten uutta asetusta ei
// tarvita. Ilman osoitetta lista on pois päältä, ja talo kertoo sen. Mikään virhe ei kaada peliä.

export interface LeaderboardService {
  /** Onko lista käytössä (palvelimen osoite on määritetty). */
  readonly enabled: boolean;
  /** Hakee listan lähettämättä mitään (oma sija null). null = listaa ei saatu. */
  top(): Promise<LeaderboardReply | null>;
  /** Lähettää oman tuloksen ja hakee listan. null = listaa ei saatu (ei yhteyttä). */
  submit(score: ScoreSubmission): Promise<LeaderboardReply | null>;
}

/** Lista pois päältä: palvelinta ei ole määritetty. */
export class NoLeaderboard implements LeaderboardService {
  readonly enabled = false;

  top(): Promise<LeaderboardReply | null> {
    return Promise.resolve(null);
  }

  submit(): Promise<LeaderboardReply | null> {
    return Promise.resolve(null);
  }
}

export type Fetcher = (url: string, init: RequestInit) => Promise<Pick<Response, 'ok' | 'json'>>;

const browserFetch: Fetcher = (url, init) => fetch(url, init);

export class HttpLeaderboard implements LeaderboardService {
  readonly enabled = true;

  constructor(
    private readonly url: string,
    private readonly fetcher: Fetcher = browserFetch,
  ) {}

  top(): Promise<LeaderboardReply | null> {
    return this.request({ method: 'GET' });
  }

  submit(score: ScoreSubmission): Promise<LeaderboardReply | null> {
    // text/plain: selain ei tee erillistä esikyselyä (CORS preflight), joten kutsu on nopeampi.
    return this.request({
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(score),
    });
  }

  private async request(init: RequestInit): Promise<LeaderboardReply | null> {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), LEADERBOARD.timeoutMs);
    try {
      const response = await this.fetcher(this.url, { ...init, signal: abort.signal });
      return response.ok ? readReply(await response.json()) : null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
}

/** Valitsee toteutuksen pelaajalaskurin osoitteen perusteella. */
export function createLeaderboard(presenceUrl: string | undefined): LeaderboardService {
  const url = leaderboardUrl(presenceUrl);
  return url ? new HttpLeaderboard(url) : new NoLeaderboard();
}
