import { PRESENCE } from '../config/presence';
import { parseCountMessage, retryDelayMs } from '../logic/presence-message';
import type { PlayerCount, PresenceService } from './presence';

// Pelaajalaskuri WebSocket-yhteydellä (palvelin: worker/presence, Cloudflare).
// Avoin yhteys = yksi pelaaja. Kun yhteys katkeaa, laskuri piiloutuu ja yhteyttä
// yritetään uudelleen yhä harvemmin. Mikään virhe ei pysäytä peliä.

export type PresenceSocket = Pick<WebSocket, 'onopen' | 'onmessage' | 'onclose' | 'send' | 'close'>;
export type SocketFactory = (url: string) => PresenceSocket;

const browserSocket: SocketFactory = (url) => new WebSocket(url);

export class WebSocketPresence implements PresenceService {
  private socket: PresenceSocket | null = null;
  private onChange: ((count: PlayerCount) => void) | null = null;
  private attempt = 0;
  private retryTimer: ReturnType<typeof setTimeout> | undefined;
  private pingTimer: ReturnType<typeof setInterval> | undefined;

  constructor(
    private readonly url: string,
    private readonly createSocket: SocketFactory = browserSocket,
  ) {}

  connect(onChange: (count: PlayerCount) => void): void {
    this.disconnect();
    this.onChange = onChange;
    this.attempt = 0;
    this.open();
  }

  disconnect(): void {
    const listener = this.onChange;
    this.onChange = null;
    clearTimeout(this.retryTimer);
    this.closeSocket();
    listener?.(null);
  }

  private open(): void {
    try {
      const socket = this.createSocket(this.url);
      socket.onopen = () => this.opened();
      socket.onmessage = (event) => this.received(event.data);
      socket.onclose = () => this.lost();
      this.socket = socket;
    } catch {
      this.lost();
    }
  }

  private opened(): void {
    this.attempt = 0;
    clearInterval(this.pingTimer);
    this.pingTimer = setInterval(() => this.ping(), PRESENCE.pingIntervalMs);
  }

  private received(data: unknown): void {
    const count = parseCountMessage(data);
    if (count !== null) {
      this.onChange?.(count);
    }
  }

  private ping(): void {
    try {
      this.socket?.send(PRESENCE.ping);
    } catch {
      // Yhteys on jo katkeamassa: onclose hoitaa uuden yrityksen.
    }
  }

  /** Yhteys katkesi tai ei auennut: piilotetaan laskuri ja yritetään myöhemmin uudelleen. */
  private lost(): void {
    this.closeSocket();
    if (!this.onChange) {
      return;
    }
    this.onChange(null);
    clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => this.open(), retryDelayMs(this.attempt));
    this.attempt += 1;
  }

  private closeSocket(): void {
    clearInterval(this.pingTimer);
    const socket = this.socket;
    this.socket = null;
    if (!socket) {
      return;
    }
    socket.onopen = null;
    socket.onmessage = null;
    socket.onclose = null;
    try {
      socket.close();
    } catch {
      // Jo suljettu.
    }
  }
}
