import { IDEAS } from '../../../src/config/ideas';
import { LEADERBOARD } from '../../../src/config/leaderboard';
import { corsHeaders, isAdmin, withCors } from './cors';
import type { IdeasRoom } from './ideas-room';
import type { LeaderboardRoom } from './leaderboard-room';
import { isAllowedOrigin } from './origins';
import type { PresenceRoom } from './presence-room';

// Pelaajalaskurin, 10 parhaan listan ja ideaviestien palvelin (Cloudflare Worker).
// - WebSocket-yhteydet ohjataan PresenceRoom-huoneeseen, joka laskee pelaajat.
// - Osoite /leaderboard ohjataan LeaderboardRoom-huoneeseen (10 parhaan lista).
// - Osoite /ideas ohjataan IdeasRoom-huoneeseen (ideaviestit).
// Ei evästeitä eikä kirjautumista.

export { IdeasRoom } from './ideas-room';
export { LeaderboardRoom } from './leaderboard-room';
export { PresenceRoom } from './presence-room';

interface Env {
  readonly ROOM: DurableObjectNamespace<PresenceRoom>;
  readonly BOARD: DurableObjectNamespace<LeaderboardRoom>;
  readonly IDEAS: DurableObjectNamespace<IdeasRoom>;
  readonly ALLOWED_ORIGINS: string;
  /** Ylläpidon salainen avain (wrangler secret put ADMIN_KEY). Ilman sitä poisto ei toimi. */
  readonly ADMIN_KEY?: string;
}

const ROOM_NAME = 'kaikki-pelaajat';
const BOARD_NAME = 'koko-peli';
const IDEAS_NAME = 'kaikki-ideat';

/**
 * HTTP-huone (lista tai ideat). Peli saa lukea ja lähettää vain sallitulta sivulta.
 * Ylläpito (avain otsakkeessa) saa poistaa ja lukea myös komentoriviltä ilman sivua.
 */
function httpRoom(
  request: Request,
  env: Env,
  room: DurableObjectStub,
): Response | Promise<Response> {
  const admin = isAdmin(request.headers.get('Authorization'), env.ADMIN_KEY);
  if (request.method === 'DELETE' || (admin && request.method === 'GET')) {
    return admin ? room.fetch(request) : new Response('Kielletty', { status: 403 });
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
  return room.fetch(request).then((response) => withCors(response, origin));
}

export default {
  fetch(request: Request, env: Env): Response | Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path === LEADERBOARD.path) {
      return httpRoom(request, env, env.BOARD.get(env.BOARD.idFromName(BOARD_NAME)));
    }
    if (path === IDEAS.path) {
      return httpRoom(request, env, env.IDEAS.get(env.IDEAS.idFromName(IDEAS_NAME)));
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
