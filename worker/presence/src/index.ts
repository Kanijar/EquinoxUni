import { isAllowedOrigin } from './origins';
import type { PresenceRoom } from './presence-room';

// Pelaajalaskurin palvelin (Cloudflare Worker). Ottaa vastaan pelin WebSocket-yhteydet
// ja ohjaa ne yhteen PresenceRoom-huoneeseen, joka laskee pelaajat.
// Ei evästeitä, ei kirjautumista, ei tallennettua tietoa.

export { PresenceRoom } from './presence-room';

interface Env {
  readonly ROOM: DurableObjectNamespace<PresenceRoom>;
  readonly ALLOWED_ORIGINS: string;
}

const ROOM_NAME = 'kaikki-pelaajat';

export default {
  fetch(request: Request, env: Env): Response | Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Equinox Universe -pelaajalaskuri toimii.', { status: 426 });
    }
    if (!isAllowedOrigin(request.headers.get('Origin'), env.ALLOWED_ORIGINS)) {
      return new Response('Kielletty', { status: 403 });
    }
    return env.ROOM.get(env.ROOM.idFromName(ROOM_NAME)).fetch(request);
  },
} satisfies ExportedHandler<Env>;
