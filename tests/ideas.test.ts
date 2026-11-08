import { describe, expect, it } from 'vitest';
import { IDEAS } from '../src/config/ideas';
import {
  cleanIdeaText,
  hasBlockedText,
  hasContactInfo,
  ideaTextProblem,
} from '../src/logic/idea-text';
import {
  ideasUrl,
  isDeviceId,
  listQuery,
  newDeviceId,
  readAction,
  readComments,
  readCommentsQuery,
  readIdeaList,
  readListQuery,
  readResult,
} from '../src/logic/ideas';
import { isAllowed, RateLimiter, type RateRule } from '../src/logic/rate-limit';
import { createSeededRng } from '../src/logic/seeded-random';
import { createIdeas, HttpIdeas, NoIdeas } from '../src/net/ideas';
import type { Fetcher } from '../src/net/leaderboard';

// Ideaviestit: tekstin siistiminen ja tarkistus, nopeusraja, viestit ja yhteys palvelimeen.

const DEVICE = 'abcdefghij0123456789';

describe('idean teksti', () => {
  it('rivinvaihdot, ylimääräiset välit ja oudot merkit siistitään pois', () => {
    expect(cleanIdeaText('  Lisää\n\nlohikäärme   <b>saarelle</b>!  ')).toBe(
      'Lisää lohikäärme bsaarelle/b!',
    );
    expect(cleanIdeaText('Uusi ase 🗡️ ja kilpi')).toBe('Uusi ase ja kilpi');
  });

  it('tyhjä, liian pitkä ja kelvollinen teksti', () => {
    expect(ideaTextProblem('', IDEAS.ideaMaxLength)).toBe('empty');
    expect(ideaTextProblem('a'.repeat(IDEAS.ideaMaxLength + 1), IDEAS.ideaMaxLength)).toBe(
      'tooLong',
    );
    expect(ideaTextProblem('a'.repeat(IDEAS.ideaMaxLength), IDEAS.ideaMaxLength)).toBeNull();
    expect(ideaTextProblem('Lisää peliin lentävä hevonen!', IDEAS.ideaMaxLength)).toBeNull();
  });

  it('kirosanat huomataan, myös numeroilla ja väleillä kirjoitettuina', () => {
    for (const bad of ['tämä on vittu huono', 'V1TTU', 'p a s k a peli', 'shit game']) {
      expect(hasBlockedText(bad), bad).toBe(true);
      expect(ideaTextProblem(bad, IDEAS.ideaMaxLength)).toBe('blocked');
    }
  });

  it('kirosanaa ei etsitä sanojen rajojen yli (super seikkailu ei ole kirosana)', () => {
    for (const ok of ['super seikkailu', 'ruoho moottori', 'kana zipline', 'Lisää kissa tänne']) {
      expect(hasBlockedText(ok), ok).toBe(false);
    }
  });

  it('puhelinnumero, sähköposti, linkki ja sovellustunnus ovat yhteystietoja', () => {
    for (const bad of [
      'soita 040 123 4567',
      'numero +358401234567',
      'kalle@esimerkki.fi',
      'katso www.sivu.com',
      'https://esimerkki',
      'lisää mut discordissa',
      'laita snäppiin',
      'insta: kalle',
    ]) {
      expect(hasContactInfo(bad), bad).toBe(true);
      expect(ideaTextProblem(bad, IDEAS.ideaMaxLength)).toBe('contact');
    }
  });

  it('tavalliset numerot ja sanat eivät ole yhteystietoja', () => {
    for (const ok of [
      'miljoona kolikkoa 1000000',
      'taso 100 ja 2000 KP',
      'wanha linna',
      'lohikäärme jolla on 50 voimaa',
      'esim. uusi saari',
    ]) {
      expect(hasContactInfo(ok), ok).toBe(false);
    }
  });
});

describe('nopeusraja', () => {
  const rule: RateRule = { gapMs: 1000, perWindow: 3, windowMs: 10_000 };

  it('vaatii välin ja rajoittaa määrän ikkunassa', () => {
    expect(isAllowed([], 0, rule)).toBe(true);
    expect(isAllowed([0], 500, rule)).toBe(false);
    expect(isAllowed([0], 1000, rule)).toBe(true);
    expect(isAllowed([0, 2000, 4000], 6000, rule)).toBe(false);
    expect(isAllowed([0, 2000, 4000], 10_000, rule)).toBe(true);
  });

  it('muistissa oleva raja koskee vain samaa avainta', () => {
    const limiter = new RateLimiter({ gapMs: 0, perWindow: 2, windowMs: 1000 }, 10);
    expect(limiter.take('a', 0)).toBe(true);
    expect(limiter.take('a', 1)).toBe(true);
    expect(limiter.take('a', 2)).toBe(false);
    expect(limiter.take('b', 2)).toBe(true);
    expect(limiter.take('a', 1001)).toBe(true);
  });

  it('muisti ei kasva loputtomasti', () => {
    const limiter = new RateLimiter({ gapMs: 0, perWindow: 1, windowMs: 1000 }, 2);
    expect(limiter.take('a', 0)).toBe(true);
    expect(limiter.take('b', 0)).toBe(true);
    expect(limiter.take('c', 5000)).toBe(true);
    expect(limiter.take('a', 5000)).toBe(true);
  });
});

describe('ideaviestit palvelimelle ja takaisin', () => {
  it('laitetunniste on satunnainen eikä paljasta mitään', () => {
    expect(isDeviceId(newDeviceId())).toBe(true);
    expect(newDeviceId(createSeededRng(3))).toBe(newDeviceId(createSeededRng(3)));
    expect(isDeviceId('LYHYT')).toBe(false);
  });

  it('toiminnot luetaan ja teksti siistitään', () => {
    expect(readAction({ type: 'idea', device: DEVICE, text: ' Uusi\nsaari ' })).toEqual({
      type: 'idea',
      device: DEVICE,
      text: 'Uusi saari',
    });
    expect(readAction({ type: 'comment', device: DEVICE, idea: 4, text: 'Hyvä!' })).toEqual({
      type: 'comment',
      device: DEVICE,
      idea: 4,
      text: 'Hyvä!',
    });
    expect(readAction({ type: 'like', device: DEVICE, idea: 2 })).toEqual({
      type: 'like',
      device: DEVICE,
      idea: 2,
    });
    expect(readAction({ type: 'claim', device: DEVICE })).toEqual({
      type: 'claim',
      device: DEVICE,
    });
  });

  it('vialliset toiminnot hylätään', () => {
    for (const bad of [
      null,
      { type: 'idea', device: 'x', text: 'hei' },
      { type: 'like', device: DEVICE },
      { type: 'like', device: DEVICE, idea: 0 },
      { type: 'comment', device: DEVICE, idea: 1.5, text: 'hei' },
      { type: 'delete', device: DEVICE },
    ]) {
      expect(readAction(bad)).toBeNull();
    }
  });

  it('lista ja kommentit luetaan, rikkinäinen vastaus hylätään', () => {
    const idea = {
      id: 3,
      text: 'Lisää lohikäärme',
      likes: 5,
      comments: 1,
      liked: true,
      mine: false,
    };
    expect(readIdeaList({ ideas: [idea], best: 3, reward: 'claimable' })).toEqual({
      ideas: [idea],
      best: 3,
      reward: 'claimable',
    });
    expect(readIdeaList({ ideas: [idea], best: null, reward: 'outo' })?.reward).toBe('none');
    expect(readIdeaList({ ideas: [{ ...idea, likes: -1 }] })).toBeNull();
    expect(readIdeaList({})).toBeNull();
    expect(readComments({ comments: [{ id: 9, text: 'Hyvä idea' }] })).toEqual([
      { id: 9, text: 'Hyvä idea' },
    ]);
    expect(readComments({ comments: [{ id: 'x' }] })).toBeNull();
  });

  it('tuntematon tulos on virhe', () => {
    expect(readResult({ result: 'ok' })).toBe('ok');
    expect(readResult({ result: 'tooFast' })).toBe('tooFast');
    expect(readResult({ result: 'jotain' })).toBe('error');
    expect(readResult(null)).toBe('error');
  });

  it('kyselyt osoitteessa', () => {
    const params = new URLSearchParams(listQuery('top', DEVICE));
    expect(readListQuery(params)).toEqual({ sort: 'top', device: DEVICE });
    expect(readListQuery(new URLSearchParams('device=huono'))).toEqual({
      sort: 'new',
      device: null,
    });
    expect(readCommentsQuery(new URLSearchParams('comments=12'))).toBe(12);
    expect(readCommentsQuery(new URLSearchParams('sort=new'))).toBeNull();
  });

  it('osoite johdetaan pelaajalaskurin osoitteesta', () => {
    expect(ideasUrl('wss://equinox-presence.kanijar.workers.dev')).toBe(
      'https://equinox-presence.kanijar.workers.dev/ideas',
    );
    expect(ideasUrl('ws://127.0.0.1:8787')).toBe('http://127.0.0.1:8787/ideas');
    expect(ideasUrl(undefined)).toBeNull();
  });
});

describe('yhteys ideapalvelimeen', () => {
  function fakeFetcher(reply: unknown, calls: { url: string; init: RequestInit }[]): Fetcher {
    return (url, init) => {
      calls.push({ url, init });
      return Promise.resolve({ ok: true, json: () => Promise.resolve(reply) });
    };
  }

  it('ilman palvelinta ideat ovat pois päältä', async () => {
    const service = createIdeas(undefined);
    expect(service).toBeInstanceOf(NoIdeas);
    expect(service.enabled).toBe(false);
    expect(await service.list('new', DEVICE)).toBeNull();
    expect(await service.act({ type: 'claim', device: DEVICE })).toBe('error');
    expect(createIdeas('wss://x.workers.dev')).toBeInstanceOf(HttpIdeas);
  });

  it('lista haetaan GETillä ja toiminto lähetetään tekstinä', async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const list = new HttpIdeas('https://x/ideas', fakeFetcher({ ideas: [], best: null }, calls));
    expect(await list.list('top', DEVICE)).toEqual({ ideas: [], best: null, reward: 'none' });
    expect(calls[0]?.url).toBe(`https://x/ideas?sort=top&device=${DEVICE}`);
    const act = new HttpIdeas('https://x/ideas', fakeFetcher({ result: 'ok' }, calls));
    expect(await act.act({ type: 'like', device: DEVICE, idea: 2 })).toBe('ok');
    expect(calls[1]?.init.method).toBe('POST');
    expect(calls[1]?.init.headers).toEqual({ 'Content-Type': 'text/plain' });
    expect(JSON.parse(String(calls[1]?.init.body))).toEqual({
      type: 'like',
      device: DEVICE,
      idea: 2,
    });
  });

  it('katkennut yhteys ei kaada peliä', async () => {
    const broken = new HttpIdeas('https://x/ideas', () => Promise.reject(new Error('ei verkkoa')));
    expect(await broken.list('new', DEVICE)).toBeNull();
    expect(await broken.comments(1)).toBeNull();
    expect(await broken.act({ type: 'claim', device: DEVICE })).toBe('error');
  });
});
