import { describe, expect, it } from 'vitest';
import indexHtml from '../index.html?raw';
import { GAME_INFO, webManifest } from '../src/data/game-info';
import { TEXT } from '../src/i18n/fi';

// Pelin nimi on määritelty vain tiedostossa src/data/game-info.ts.

describe('pelin nimi', () => {
  it('peli on nimeltään Equinox Universe', () => {
    expect(GAME_INFO.name).toBe('Equinox Universe');
  });

  it('alkuruudun otsikko tulee pelin nimestä', () => {
    expect(TEXT.gameTitle).toBe(GAME_INFO.name);
  });

  it('manifestissa on pelin nimi ja lyhyt nimi mahtuu kuvakkeen alle', () => {
    const manifest = webManifest('#000000');
    expect(manifest.name).toBe(GAME_INFO.name);
    expect(manifest.short_name).toBe(GAME_INFO.shortName);
    expect(GAME_INFO.shortName.length).toBeLessThanOrEqual(12);
  });

  it('index.html ei kovakoodaa nimeä vaan käyttää paikkamerkkiä', () => {
    expect(indexHtml).toContain('<title>%GAME_NAME%</title>');
    expect(indexHtml).not.toContain(GAME_INFO.name);
  });
});
