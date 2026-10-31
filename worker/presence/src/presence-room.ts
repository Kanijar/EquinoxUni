import { DurableObject } from 'cloudflare:workers';
import { PRESENCE } from '../../../src/config/presence';
import { formatCountMessage } from '../../../src/logic/presence-message';

// Yksi yhteinen "huone", johon jokainen peli avaa WebSocket-yhteyden. Avoimien yhteyksien
// määrä on pelaajamäärä. Kun joku tulee tai lähtee, uusi määrä lähetetään kaikille.
// Huone ei tallenna mitään eikä tunnista pelaajia: se vain laskee avoimet yhteydet.
// Hibernaatio: huone nukkuu yhteyksien välillä, ja pingeihin vastataan herättämättä sitä.

export class PresenceRoom extends DurableObject<unknown> {
  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env);
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair(PRESENCE.ping, PRESENCE.pong));
  }

  override fetch(): Response {
    if (this.ctx.getWebSockets().length >= PRESENCE.maxPlayers) {
      return new Response('Laskuri on täynnä', { status: 503 });
    }
    const [client, server] = Object.values(new WebSocketPair()) as [WebSocket, WebSocket];
    this.ctx.acceptWebSocket(server);
    this.broadcast(null);
    return new Response(null, { status: 101, webSocket: client });
  }

  override webSocketClose(ws: WebSocket, code: number, reason: string): void {
    try {
      ws.close(code, reason);
    } catch {
      // Jo suljettu tai koodi ei kelpaa uudelleen lähetettäväksi.
    }
    this.broadcast(ws);
  }

  override webSocketError(ws: WebSocket): void {
    this.broadcast(ws);
  }

  /** Lähettää uuden pelaajamäärän kaikille. leaving = juuri katkennut yhteys (ei lasketa). */
  private broadcast(leaving: WebSocket | null): void {
    const sockets = this.ctx.getWebSockets().filter((socket) => socket !== leaving);
    const message = formatCountMessage(sockets.length);
    for (const socket of sockets) {
      try {
        socket.send(message);
      } catch {
        // Yhteys on sulkeutumassa; sen oma webSocketClose lähettää uuden määrän.
      }
    }
  }
}
