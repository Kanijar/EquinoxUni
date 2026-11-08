import { LEADERBOARD } from '../../../src/config/leaderboard';
import { corsHeaders, isAdmin, withCors } from './cors';
import type { LeaderboardRoom } from './leaderboard-room';
import { isAllowedOrigin } from './origins';
import type { PresenceRoom } from './presence-room';

// Pelaajalaskurin ja 10 parhaan listan palvelin (Cloudflare Worker).
// - WebSocket-yhteydet ohjataan PresenceRoom-huoneeseen, joka laskee pelaajat.
// - Osoite /leaderboard ohjataan LeaderboardRoom-huoneeseen (10 parhaan lista).
// Ei evästeitä eikä kirjautumista.

export { LeaderboardRoom } from './leaderboard-room';
export { PresenceRoom } from './presence-room';

interface Env {
  readonly ROOM: DurableObjectNamespace<PresenceRoom>;
  readonly BOARD: DurableObjectNamespace<LeaderboardRoom>;
  readonly ALLOWED_ORIGINS: string;
  /** Ylläpidon salainen avain (wrangler secret put ADMIN_KEY). Ilman sitä poisto ei toimi. */
  readonly ADMIN_KEY?: string;
}

const ROOM_NAME = 'kaikki-pelaajat';
const BOARD_NAME = 'koko-peli';

function leaderboard(request: Request, env: Env): Response | Promise<Response> {
  const board = env.BOARD.get(env.BOARD.idFromName(BOARD_NAME));
  if (request.method === 'DELETE') {
    const allowed = isAdmin(request.headers.get('Authorization'), env.ADMIN_KEY);
    return allowed ? board.fetch(request) : new Response('Kielletty', { status: 403 });
  }
  const origin = request.headers.get('Origin');
  if (!origin || !isAllowedOrigin(origin, env.ALLOWED_ORIGINS)) {
    return new Response('Kielletty', { status: 403 });
  }
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (request.method !== 'GET' && request.method !== 'POST') {
    return new Response('Ei sallittu', { status: 405 });
  }
  return board.fetch(request).then((response) => withCors(response, origin));
}

export default {
  fetch(request: Request, env: Env): Response | Promise<Response> {
    if (new URL(request.url).pathname === LEADERBOARD.path) {
      return leaderboard(request, env);
    }
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Equinox Universe -pelaajalaskuri toimii.', { status: 426 });
    }
    if (!isAllowedOrigin(request.headers.get('Origin'), env.ALLOWED_ORIGINS)) {
      return new Response('Kielletty', { status: 403 });
    }
    return env.ROOM.get(env.ROOM.idFromName(ROOM_NAME)).fetch(request);
  },
} satisfies ExportedHandler<Env>;
