import { describe, expect, it } from 'vitest';
import { LEADERBOARD } from '../src/config/leaderboard';
import { WORLD } from '../src/data';
import { HOUSE } from '../src/data/house';
import { createNewGame } from '../src/logic/game-state';
import { atHouseDoor } from '../src/logic/house';
import {
  isHeroId,
  leaderboardUrl,
  newHeroId,
  readReply,
  readSubmission,
  submissionFor,
} from '../src/logic/leaderboard';
import { hasBlockedWord, leaderboardName } from '../src/logic/leaderboard-name';
import { decodeSave, encodeSave } from '../src/logic/save-format';
import { createSeededRng } from '../src/logic/seeded-random';
import { buildWorldGrid, isWalkable, townAt } from '../src/logic/world-grid';
import { createLeaderboard, HttpLeaderboard, type Fetcher } from '../src/net/leaderboard';
import { isAdmin } from '../worker/presence/src/cors';

// Sankarin talo ja koko pelin 10 parhaan lista: viestit, nimimerkit, tunniste ja yhteys.

const ID = 'abcdefghij0123456789';

describe('sankaritunniste', () => {
  it('uusi tunniste on 20 merkkiä kirjaimia ja numeroita', () => {
    const id = newHeroId();
    expect(id).toHaveLength(LEADERBOARD.heroIdLength);
    expect(isHeroId(id)).toBe(true);
  });

  it('jokainen uusi peli saa oman tunnisteen', () => {
    expect(createNewGame().heroId).not.toBe(createNewGame().heroId);
    expect(newHeroId(createSeededRng(1))).toBe(newHeroId(createSeededRng(1)));
  });

  it('väärän muotoinen tunniste ei kelpaa', () => {
    for (const bad of ['', 'ABCDEFGHIJ0123456789', 'lyhyt', `${ID}x`, 'abcdefghij012345678!', 5]) {
      expect(isHeroId(bad)).toBe(false);
    }
  });

  it('tunniste säilyy tallennuksessa, ja vanha tallennus saa uuden', () => {
    const state = createNewGame();
    const loaded = decodeSave(encodeSave(state, { savedAt: 1, place: 'Kotiranta' }));
    expect(loaded?.state.heroId).toBe(state.heroId);
    const old = JSON.parse(encodeSave(state, { savedAt: 1, place: 'Kotiranta' })) as {
      state: Record<string, unknown>;
    };
    delete old.state['heroId'];
    const oldLoaded = decodeSave(JSON.stringify(old));
    expect(isHeroId(oldLoaded?.state.heroId)).toBe(true);
  });
});

describe('nimimerkki listalla', () => {
  it('tavallinen nimi näkyy sellaisenaan', () => {
    expect(leaderboardName('Väinö')).toBe('Väinö');
    expect(leaderboardName('Kalle 2')).toBe('Kalle 2');
  });

  it('nimi siistitään kuten hahmonluonnissa', () => {
    expect(leaderboardName('  <b>Väinö</b>  ')).toBe('bVäinöb');
    expect(leaderboardName('a'.repeat(30))).toHaveLength(12);
  });

  it('kirosana korvataan oletusnimellä, myös numeroilla ja väleillä kirjoitettuna', () => {
    for (const bad of ['vittu', 'V1TTU', 'xpaskax', 'p a s k a', 'Fuck-boi']) {
      expect(hasBlockedWord(bad)).toBe(true);
      expect(leaderboardName(bad)).toBe('');
    }
  });

  it('tavalliset nimet eivät jää suodattimeen', () => {
    for (const ok of ['Väinö', 'Kalle', 'Jussi Ketola', 'Sankari', 'Hero', 'Matti99']) {
      expect(hasBlockedWord(ok)).toBe(false);
    }
  });
});

describe('tuloksen lähetys', () => {
  it('kelvollinen tulos luetaan, nimi siistitään', () => {
    expect(readSubmission({ id: ID, name: ' Väinö! ', xp: 120 })).toEqual({
      id: ID,
      name: 'Väinö',
      xp: 120,
    });
    expect(readSubmission({ id: ID, xp: 0 })).toEqual({ id: ID, name: '', xp: 0 });
  });

  it('rikkinäinen tai liian iso tulos hylätään', () => {
    for (const bad of [
      null,
      'roskaa',
      [],
      { id: 'x', name: 'A', xp: 1 },
      { id: ID, name: 'A', xp: -1 },
      { id: ID, name: 'A', xp: 1.5 },
      { id: ID, name: 'A', xp: '5' },
      { id: ID, name: 'A', xp: LEADERBOARD.maxXp + 1 },
    ]) {
      expect(readSubmission(bad)).toBeNull();
    }
  });

  it('sankarin tulos: tunniste, siistitty nimi ja KP', () => {
    const state = { ...createNewGame(), name: 'Väinö', xp: 500 };
    expect(submissionFor(state)).toEqual({ id: state.heroId, name: 'Väinö', xp: 500 });
    expect(readSubmission(submissionFor(state))).toEqual(submissionFor(state));
  });
});

describe('palvelimen vastaus', () => {
  it('lista ja oma sija luetaan', () => {
    const reply = {
      top: [
        { name: 'A', xp: 30 },
        { name: '', xp: 10 },
      ],
      rank: 2,
    };
    expect(readReply(reply)).toEqual(reply);
    expect(readReply({ top: [], rank: null })).toEqual({ top: [], rank: null });
  });

  it('listalla on enintään 10 riviä', () => {
    const top = Array.from({ length: 15 }, (_, index) => ({ name: `P${index}`, xp: 100 - index }));
    expect(readReply({ top, rank: null })?.top).toHaveLength(LEADERBOARD.topCount);
  });

  it('palvelimelta tullut kirosana ei näy pelissä', () => {
    expect(readReply({ top: [{ name: 'vittu', xp: 1 }], rank: 1 })?.top[0]?.name).toBe('');
  });

  it('rikkinäinen vastaus hylätään', () => {
    for (const bad of [null, {}, { top: 'x' }, { top: [{ name: 'A', xp: -5 }] }]) {
      expect(readReply(bad)).toBeNull();
    }
    expect(readReply({ top: [], rank: 0 })?.rank).toBeNull();
  });
});

describe('listan osoite', () => {
  it('johdetaan pelaajalaskurin osoitteesta', () => {
    expect(leaderboardUrl('wss://equinox-presence.kanijar.workers.dev')).toBe(
      'https://equinox-presence.kanijar.workers.dev/leaderboard',
    );
    expect(leaderboardUrl(' ws://127.0.0.1:8787/ ')).toBe('http://127.0.0.1:8787/leaderboard');
  });

  it('ilman laskuria listaa ei ole', () => {
    for (const bad of [undefined, '', 'https://x.dev', 'roskaa']) {
      expect(leaderboardUrl(bad)).toBeNull();
    }
    expect(createLeaderboard(undefined).enabled).toBe(false);
    expect(createLeaderboard('wss://x.workers.dev').enabled).toBe(true);
  });
});

describe('yhteys palvelimeen', () => {
  const score = { id: ID, name: 'Väinö', xp: 50 };
  const reply = { top: [{ name: 'Väinö', xp: 50 }], rank: 1 };

  it('lähettää tuloksen ja palauttaa listan', async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const fetcher: Fetcher = (url, init) => {
      calls.push({ url, init });
      return Promise.resolve({ ok: true, json: () => Promise.resolve(reply) });
    };
    const board = new HttpLeaderboard('https://x.dev/leaderboard', fetcher);
    await expect(board.submit(score)).resolves.toEqual(reply);
    expect(calls[0]?.url).toBe('https://x.dev/leaderboard');
    expect(calls[0]?.init.method).toBe('POST');
    expect(JSON.parse(String(calls[0]?.init.body))).toEqual(score);
  });

  it('pelkkä listan haku ei lähetä mitään', async () => {
    const calls: RequestInit[] = [];
    const fetcher: Fetcher = (_url, init) => {
      calls.push(init);
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ top: [], rank: null }) });
    };
    await expect(new HttpLeaderboard('u', fetcher).top()).resolves.toEqual({ top: [], rank: null });
    expect(calls[0]?.method).toBe('GET');
    expect(calls[0]?.body).toBeUndefined();
  });

  it('virhe tai katkos antaa null eikä kaada peliä', async () => {
    const failing: Fetcher = () => Promise.reject(new Error('ei verkkoa'));
    const refused: Fetcher = () => Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    await expect(new HttpLeaderboard('u', failing).submit(score)).resolves.toBeNull();
    await expect(new HttpLeaderboard('u', refused).submit(score)).resolves.toBeNull();
    await expect(createLeaderboard(undefined).submit(score)).resolves.toBeNull();
    await expect(createLeaderboard(undefined).top()).resolves.toBeNull();
  });

  it('ylläpidon poisto vaatii oikean avaimen', () => {
    expect(isAdmin('Bearer salainen', 'salainen')).toBe(true);
    expect(isAdmin('Bearer väärä', 'salainen')).toBe(false);
    expect(isAdmin('Bearer ', undefined)).toBe(false);
    expect(isAdmin('Bearer ', '')).toBe(false);
  });
});

describe('sankarin talo kartalla', () => {
  it('talo on Kotirannan vieressä kävelykelpoisella maalla, ei paikkakunnan ruudussa', () => {
    const grid = buildWorldGrid(WORLD);
    expect(isWalkable(grid, HOUSE)).toBe(true);
    expect(townAt(WORLD, HOUSE)).toBeUndefined();
    const home = WORLD.towns.find((town) => town.id === 'kotiranta');
    expect(Math.abs((home?.x ?? 0) - HOUSE.x)).toBeLessThanOrEqual(4);
    expect(Math.abs((home?.y ?? 0) - HOUSE.y)).toBeLessThanOrEqual(4);
  });

  it('TALO-nappi näkyy vain talon ovella', () => {
    expect(atHouseDoor({ x: HOUSE.x, y: HOUSE.y + 1 })).toBe(true);
    expect(atHouseDoor({ x: HOUSE.x + 2, y: HOUSE.y })).toBe(false);
    expect(atHouseDoor({ x: 80, y: 96 })).toBe(false);
  });
});
