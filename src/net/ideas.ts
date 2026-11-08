import { IDEAS } from '../config/ideas';
import {
  ideasUrl,
  listQuery,
  readComments,
  readIdeaList,
  readResult,
  type IdeaAction,
  type IdeaComment,
  type IdeaList,
  type IdeaResult,
  type IdeaSort,
} from '../logic/ideas';
import type { Fetcher } from './leaderboard';

// Ideaviestien yhteys palvelimeen (worker/presence, sama palvelin kuin pelaajalaskurilla ja
// 10 parhaan listalla). Osoite johdetaan pelaajalaskurin osoitteesta (VITE_PRESENCE_URL).
// Ilman osoitetta ideat ovat pois päältä, ja näkymä kertoo sen. Mikään virhe ei kaada peliä.

export interface IdeasService {
  /** Ovatko ideat käytössä (palvelimen osoite on määritetty). */
  readonly enabled: boolean;
  /** Hakee ideat. null = ei saatu (ei yhteyttä). */
  list(sort: IdeaSort, device: string): Promise<IdeaList | null>;
  /** Hakee idean kommentit. null = ei saatu. */
  comments(idea: number): Promise<IdeaComment[] | null>;
  /** Lähettää idean, kommentin, tykkäyksen tai miekan lunastuksen. */
  act(action: IdeaAction): Promise<IdeaResult>;
}

/** Ideat pois päältä: palvelinta ei ole määritetty. */
export class NoIdeas implements IdeasService {
  readonly enabled = false;

  list(): Promise<IdeaList | null> {
    return Promise.resolve(null);
  }

  comments(): Promise<IdeaComment[] | null> {
    return Promise.resolve(null);
  }

  act(): Promise<IdeaResult> {
    return Promise.resolve('error');
  }
}

const browserFetch: Fetcher = (url, init) => fetch(url, init);

export class HttpIdeas implements IdeasService {
  readonly enabled = true;

  constructor(
    private readonly url: string,
    private readonly fetcher: Fetcher = browserFetch,
  ) {}

  async list(sort: IdeaSort, device: string): Promise<IdeaList | null> {
    const body = await this.request(this.url + listQuery(sort, device), { method: 'GET' });
    return body === undefined ? null : readIdeaList(body);
  }

  async comments(idea: number): Promise<IdeaComment[] | null> {
    const body = await this.request(`${this.url}?comments=${idea}`, { method: 'GET' });
    return body === undefined ? null : readComments(body);
  }

  async act(action: IdeaAction): Promise<IdeaResult> {
    // text/plain: selain ei tee erillistä esikyselyä (CORS preflight).
    const body = await this.request(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(action),
    });
    return body === undefined ? 'error' : readResult(body);
  }

  /** Palauttaa vastauksen JSONina tai undefined, jos yhteys tai vastaus epäonnistui. */
  private async request(url: string, init: RequestInit): Promise<unknown> {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), IDEAS.timeoutMs);
    try {
      const response = await this.fetcher(url, { ...init, signal: abort.signal });
      return response.ok ? ((await response.json()) as unknown) : undefined;
    } catch {
      return undefined;
    } finally {
      clearTimeout(timer);
    }
  }
}

/** Valitsee toteutuksen pelaajalaskurin osoitteen perusteella. */
export function createIdeas(presenceUrl: string | undefined): IdeasService {
  const url = ideasUrl(presenceUrl);
  return url ? new HttpIdeas(url) : new NoIdeas();
}
