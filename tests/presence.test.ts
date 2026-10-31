import { describe, expect, it } from 'vitest';
import { PRESENCE } from '../src/config/presence';
import {
  formatCountMessage,
  isPresenceUrl,
  parseCountMessage,
  retryDelayMs,
} from '../src/logic/presence-message';
import { createPresence } from '../src/net/create-presence';
import { NoPresence } from '../src/net/presence';
import { WebSocketPresence } from '../src/net/websocket-presence';
import { isAllowedOrigin } from '../worker/presence/src/origins';

// Pelaajalaskurin viestit, asetukset ja palvelimen sallitut sivut.

describe('laskuriviesti', () => {
  it('palvelimen viesti luetaan pelissä samaksi luvuksi', () => {
    expect(parseCountMessage(formatCountMessage(3))).toBe(3);
    expect(parseCountMessage(formatCountMessage(0))).toBe(0);
  });

  it('viestissä on vain määrä, ei tietoja pelaajista', () => {
    expect(JSON.parse(formatCountMessage(5))).toEqual({ count: 5 });
  });

  it('rikkinäinen tai outo viesti ei muuta laskuria', () => {
    for (const bad of [
      '',
      'roskaa',
      '{}',
      'null',
      '{"count":-1}',
      '{"count":1.5}',
      '{"count":"3"}',
    ]) {
      expect(parseCountMessage(bad)).toBeNull();
    }
    expect(parseCountMessage(PRESENCE.pong)).toBeNull();
    expect(parseCountMessage(new ArrayBuffer(4))).toBeNull();
  });
});

describe('uusi yhteysyritys', () => {
  it('odotus tuplaantuu joka kerta', () => {
    expect(retryDelayMs(0)).toBe(PRESENCE.firstRetryMs);
    expect(retryDelayMs(1)).toBe(PRESENCE.firstRetryMs * 2);
    expect(retryDelayMs(2)).toBe(PRESENCE.firstRetryMs * 4);
  });

  it('odotus ei kasva yli ylärajan', () => {
    expect(retryDelayMs(50)).toBe(PRESENCE.maxRetryMs);
  });
});

describe('laskurin osoite', () => {
  it('vain WebSocket-osoite kelpaa', () => {
    expect(isPresenceUrl('wss://equinox-presence.esimerkki.workers.dev')).toBe(true);
    expect(isPresenceUrl('ws://localhost:8787')).toBe(true);
    expect(isPresenceUrl(undefined)).toBe(false);
    expect(isPresenceUrl('')).toBe(false);
    expect(isPresenceUrl('https://esimerkki.fi')).toBe(false);
  });

  it('ilman osoitetta laskuri on pois päältä', () => {
    expect(createPresence(undefined)).toBeInstanceOf(NoPresence);
    expect(createPresence('')).toBeInstanceOf(NoPresence);
  });

  it('osoitteen kanssa käytetään WebSocket-laskuria', () => {
    expect(createPresence(' wss://laskuri.esimerkki.dev ')).toBeInstanceOf(WebSocketPresence);
  });
});

describe('palvelimen sallitut sivut', () => {
  const allowed = 'https://kanijar.github.io, http://localhost:5173';

  it('pelin oma sivu pääsee laskuriin', () => {
    expect(isAllowedOrigin('https://kanijar.github.io', allowed)).toBe(true);
    expect(isAllowedOrigin('http://localhost:5173', allowed)).toBe(true);
  });

  it('muut sivut ja puuttuva osoite torjutaan', () => {
    expect(isAllowedOrigin('https://huijaus.example', allowed)).toBe(false);
    expect(isAllowedOrigin(null, allowed)).toBe(false);
    expect(isAllowedOrigin('', ',,')).toBe(false);
  });
});
