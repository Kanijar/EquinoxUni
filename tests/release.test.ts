import { describe, expect, it } from 'vitest';
import { releaseLines, releaseTime, versionNumber } from '../src/logic/release-info';
import { latestPrNumber, prNumberFromSubject } from '../src/logic/release-number';

// Alkuruudun versionumero (0.PR-numero) ja julkaisuaika Suomen aikaa.

describe('PR:n numero commitin otsikosta', () => {
  it('merge-napin otsikosta löytyy numero', () => {
    expect(prNumberFromSubject('Merge pull request #25 from Kanijar/claude/haara')).toBe(25);
  });

  it('squash-mergen otsikosta löytyy numero', () => {
    expect(prNumberFromSubject('Loppuboss Peikkokuningas (#24)')).toBe(24);
  });

  it('tavallisessa commitissa ei ole PR:n numeroa', () => {
    expect(prNumberFromSubject('Reppu, varusteet ja vihollisten pudotukset')).toBeNull();
    expect(prNumberFromSubject('Korjattu bugi #12 taistelussa')).toBeNull();
  });

  it('uusin PR löytyy, vaikka mainiin olisi tehty commit suoraan', () => {
    const subjects = [
      'Korjattu kirjoitusvirhe',
      'Merge pull request #31 from x/y',
      'Merge pull request #30 from x/y',
    ];
    expect(latestPrNumber(subjects)).toBe(31);
  });

  it('ilman PR:iä numeroa ei ole', () => {
    expect(latestPrNumber([])).toBeNull();
    expect(latestPrNumber(['Ensimmäinen commit'])).toBeNull();
  });
});

describe('versionumero', () => {
  it('PR #25 on versio 0.25', () => {
    expect(versionNumber(25)).toBe('0.25');
  });

  it('PR #100 on versio 0.100', () => {
    expect(versionNumber(100)).toBe('0.100');
  });
});

describe('julkaisuaika Suomen aikaa', () => {
  it('talviaika on UTC + 2 tuntia', () => {
    expect(releaseTime('2026-11-01T08:05:00.000Z')).toEqual({ date: '1.11.2026', clock: '10.05' });
  });

  it('kesäaika on UTC + 3 tuntia', () => {
    expect(releaseTime('2026-07-01T08:05:00.000Z')).toEqual({ date: '1.7.2026', clock: '11.05' });
  });

  it('päivä vaihtuu Suomen ajan mukaan, ja keskiyö on 0.00', () => {
    expect(releaseTime('2026-12-31T22:00:00.000Z')).toEqual({ date: '1.1.2027', clock: '0.00' });
  });

  it('rikkinäinen aika ei kaada peliä', () => {
    expect(releaseTime('ei aika')).toBeNull();
  });
});

describe('alkuruudun versioteksti', () => {
  const builtAt = '2026-11-01T08:05:00.000Z';

  it('julkaistussa pelissä näkyy versio ja julkaisuaika', () => {
    expect(releaseLines({ prNumber: '25', builtAt, dev: false })).toEqual([
      'Versio: 0.25 (alfa)',
      'Julkaistu 1.11.2026 klo 10.05',
    ]);
  });

  it('omalla koneella näkyy kehitysversio eikä julkaisuaikaa', () => {
    expect(releaseLines({ prNumber: '24', builtAt, dev: true })).toEqual([
      'Versio: 0.24 (alfa)',
      'Kehitysversio',
    ]);
  });

  it('ilman PR:n numeroa näkyy pelkkä kehitysvaihe', () => {
    expect(releaseLines({ builtAt, dev: false })).toEqual([
      'Versio: alfa',
      'Julkaistu 1.11.2026 klo 10.05',
    ]);
    expect(releaseLines({ prNumber: 'x', dev: false })).toEqual(['Versio: alfa']);
  });
});
