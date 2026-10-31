import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PRESENCE } from '../src/config/presence';
import { formatCountMessage } from '../src/logic/presence-message';
import type { PlayerCount, PresenceService } from '../src/net/presence';
import { WebSocketPresence, type PresenceSocket } from '../src/net/websocket-presence';
import { PlayerCounter } from '../src/systems/player-count';

// Pelaajalaskurin yhteys testataan valeyhteydellä (ei oikeaa palvelinta).

class FakeSocket implements PresenceSocket {
  onopen: PresenceSocket['onopen'] = null;
  onmessage: PresenceSocket['onmessage'] = null;
  onclose: PresenceSocket['onclose'] = null;
  readonly sent: string[] = [];
  closed = false;

  send(data: string): void {
    this.sent.push(data);
  }

  close(): void {
    this.closed = true;
  }

  serverOpens(): void {
    this.onopen?.call(this as unknown as WebSocket, new Event('open'));
  }

  serverSends(data: string): void {
    this.onmessage?.call(this as unknown as WebSocket, { data } as MessageEvent);
  }

  serverCloses(): void {
    this.onclose?.call(this as unknown as WebSocket, {} as CloseEvent);
  }
}

function setup(): { presence: WebSocketPresence; sockets: FakeSocket[]; counts: PlayerCount[] } {
  const sockets: FakeSocket[] = [];
  const presence = new WebSocketPresence('wss://testi', () => {
    const socket = new FakeSocket();
    sockets.push(socket);
    return socket;
  });
  const counts: PlayerCount[] = [];
  presence.connect((count) => counts.push(count));
  return { presence, sockets, counts };
}

describe('WebSocket-laskuri', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('näyttää palvelimen kertoman pelaajamäärän', () => {
    const { sockets, counts } = setup();
    sockets[0]?.serverOpens();
    sockets[0]?.serverSends(formatCountMessage(2));
    sockets[0]?.serverSends(formatCountMessage(3));
    expect(counts).toEqual([2, 3]);
  });

  it('pitää yhteyden hengissä pingillä', () => {
    const { sockets } = setup();
    sockets[0]?.serverOpens();
    vi.advanceTimersByTime(PRESENCE.pingIntervalMs * 2);
    expect(sockets[0]?.sent).toEqual([PRESENCE.ping, PRESENCE.ping]);
  });

  it('katkennut yhteys piilottaa laskurin ja yritetään uudelleen', () => {
    const { sockets, counts } = setup();
    sockets[0]?.serverOpens();
    sockets[0]?.serverSends(formatCountMessage(4));
    sockets[0]?.serverCloses();
    expect(counts).toEqual([4, null]);
    vi.advanceTimersByTime(PRESENCE.firstRetryMs);
    expect(sockets).toHaveLength(2);
    sockets[1]?.serverOpens();
    sockets[1]?.serverSends(formatCountMessage(4));
    expect(counts).toEqual([4, null, 4]);
  });

  it('epäonnistuneiden yritysten väli kasvaa', () => {
    const { sockets } = setup();
    sockets[0]?.serverCloses();
    vi.advanceTimersByTime(PRESENCE.firstRetryMs);
    sockets[1]?.serverCloses();
    vi.advanceTimersByTime(PRESENCE.firstRetryMs);
    expect(sockets).toHaveLength(2);
    vi.advanceTimersByTime(PRESENCE.firstRetryMs);
    expect(sockets).toHaveLength(3);
  });

  it('lähtiessä yhteys suljetaan eikä uutta yritetä', () => {
    const { presence, sockets, counts } = setup();
    sockets[0]?.serverOpens();
    presence.disconnect();
    expect(sockets[0]?.closed).toBe(true);
    expect(counts).toEqual([null]);
    vi.advanceTimersByTime(PRESENCE.maxRetryMs * 2);
    expect(sockets).toHaveLength(1);
  });

  it('yhteyden avaamisen virhe ei kaada peliä', () => {
    const presence = new WebSocketPresence('wss://testi', () => {
      throw new Error('ei verkkoa');
    });
    const counts: PlayerCount[] = [];
    expect(() => presence.connect((count) => counts.push(count))).not.toThrow();
    expect(counts).toEqual([null]);
    presence.disconnect();
  });
});

class MockPresence implements PresenceService {
  listener: ((count: PlayerCount) => void) | null = null;
  connect(onChange: (count: PlayerCount) => void): void {
    this.listener = onChange;
  }
  disconnect(): void {
    this.listener = null;
  }
}

describe('pelin yhteinen laskuri', () => {
  it('on aluksi piilossa ja kertoo muutokset kuuntelijoille', () => {
    const mock = new MockPresence();
    const counter = new PlayerCounter(mock);
    const seen: PlayerCount[] = [];
    counter.subscribe((count) => seen.push(count));
    counter.start();
    mock.listener?.(2);
    mock.listener?.(2);
    mock.listener?.(5);
    expect(seen).toEqual([null, 2, 5]);
    expect(counter.current).toBe(5);
  });

  it('pysäytys piilottaa laskurin ja lopetettu kuuntelija ei saa enää tietoja', () => {
    const mock = new MockPresence();
    const counter = new PlayerCounter(mock);
    const seen: PlayerCount[] = [];
    const stop = counter.subscribe((count) => seen.push(count));
    counter.start();
    mock.listener?.(3);
    counter.stop();
    expect(mock.listener).toBeNull();
    stop();
    counter.start();
    mock.listener?.(7);
    expect(seen).toEqual([null, 3, null]);
  });
});
