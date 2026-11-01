import { afterEach, describe, expect, it } from 'vitest';
import { ENEMIES, getEnemy, getItem, getTown, ITEMS } from '../src/data';
import { EN } from '../src/i18n/en';
import { ENEMY_NAMES_EN, ITEM_TEXTS_EN } from '../src/i18n/en-content';
import { FI } from '../src/i18n/fi';
import { LANGUAGES, parseLanguage } from '../src/i18n/language';
import { currentLanguage, setLanguage, TEXT, textsFor } from '../src/i18n/text';
import { releaseLines } from '../src/logic/release-info';

// Kielivalinta: suomi ja englanti. Molemmilla kielillä pitää olla täsmälleen samat tekstit.

/** Tekstipuun muoto: avaimet ja jokaisen arvon tyyppi (funktioilla myös parametrien määrä). */
function shape(value: unknown): unknown {
  if (typeof value === 'function') return `funktio/${value.length}`;
  if (typeof value !== 'object' || value === null) return typeof value;
  if (Array.isArray(value)) return value.map(shape);
  return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, shape(inner)]));
}

/** Kaikki tekstipuun tavalliset tekstit (ei funktioita). */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (typeof value !== 'object' || value === null) return [];
  return Object.values(value).flatMap(strings);
}

afterEach(() => setLanguage('fi'));

describe('kielet', () => {
  it('suomella ja englannilla on samat avaimet ja samanlaiset tekstit', () => {
    expect(shape(EN)).toEqual(shape(FI));
  });

  it('englanninkielisissä teksteissä ei ole unohtunutta suomea', () => {
    for (const text of strings(EN)) {
      expect(text, text).not.toMatch(/[äöÄÖ]/);
    }
  });

  it('jokaisella vihollisella ja esineellä on englanninkielinen nimi', () => {
    for (const enemy of ENEMIES) {
      expect(ENEMY_NAMES_EN[enemy.id], enemy.id).toBeTruthy();
    }
    for (const item of ITEMS) {
      expect(ITEM_TEXTS_EN[item.id]?.name, item.id).toBeTruthy();
      expect(ITEM_TEXTS_EN[item.id]?.description, item.id).toBeTruthy();
    }
  });

  it('englanninkieliset nimet kuuluvat olemassa oleville vihollisille ja esineille', () => {
    for (const id of Object.keys(ENEMY_NAMES_EN)) expect(getEnemy(id).id).toBe(id);
    for (const id of Object.keys(ITEM_TEXTS_EN)) expect(getItem(id).id).toBe(id);
  });

  it('peli alkaa suomeksi', () => {
    expect(currentLanguage()).toBe('fi');
    expect(TEXT.menu.play).toBe('PELAA');
  });

  it('kielen vaihto vaihtaa kaikki tekstit heti', () => {
    setLanguage('en');
    expect(TEXT.menu.play).toBe('PLAY');
    expect(TEXT.settings.title).toBe('Settings');
    expect(TEXT.names.enemy(getEnemy('wolf'))).toBe('Grey Wolf');
    expect(TEXT.names.item(getItem('potion'))).toBe('Healing Potion');
    expect(TEXT.names.player).toBe('Hero');
    setLanguage('fi');
    expect(TEXT.menu.play).toBe('PELAA');
    expect(TEXT.names.enemy(getEnemy('wolf'))).toBe('Harmaasusi');
    expect(TEXT.names.player).toBe('Sankari');
  });

  it('paikkakunnan nimi taipuu suomeksi, englanniksi se on sama', () => {
    const tampere = getTown('tampere');
    expect(textsFor('fi').world.rest(tampere)).toBe('Lepäsit Tampereella. Elämä palautui!');
    expect(textsFor('en').world.rest(tampere)).toBe('You rested in Tampere. HP restored!');
  });

  it('kielinapit ovat aina omalla kielellään', () => {
    for (const language of LANGUAGES) {
      expect(textsFor(language).settings.languageNames).toEqual({ fi: 'SUOMI', en: 'ENGLISH' });
    }
  });

  it('tuntematon kieli on suomi', () => {
    expect(parseLanguage('en')).toBe('en');
    expect(parseLanguage('sv')).toBe('fi');
    expect(parseLanguage(undefined)).toBe('fi');
  });

  it('versioteksti ja julkaisuaika englanniksi', () => {
    setLanguage('en');
    const builtAt = '2026-11-01T08:05:00.000Z';
    expect(releaseLines({ prNumber: '25', builtAt, dev: false })).toEqual([
      'Version: 0.25 (alpha)',
      'Released 1 Nov 2026 at 10:05',
    ]);
    expect(releaseLines({ prNumber: '25', dev: true })).toEqual([
      'Version: 0.25 (alpha)',
      'Development build',
    ]);
  });
});
