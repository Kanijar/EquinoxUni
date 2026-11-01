import { describe, expect, it } from 'vitest';
import indexHtml from '../index.html?raw';
import { APP_ICON, manifestIcon } from '../src/data/app-icon';
import { webManifest } from '../src/data/game-info';
import { hexToRgb, iconScale, renderPixelIcon, spriteBounds } from '../src/logic/pixel-icon';
import { crc32, encodePng } from '../src/logic/png-encode';

// Asennettava peli (PWA): Chrome vaatii manifestiin nimen, aloitusosoitteen, näyttötavan
// ja kuvakkeet 192 ja 512 px. Kuvakkeet piirretään buildissa pikselispritestä.

const manifest = webManifest('#10141f', APP_ICON.variants.map(manifestIcon));

describe('PWA-manifesti', () => {
  it('sisältää Chromen asennukseen vaaditut kentät', () => {
    expect(manifest.name.length).toBeGreaterThan(0);
    expect(manifest.start_url).toBe('./');
    expect(manifest.display).toBe('fullscreen');
    expect(manifest.orientation).toBe('landscape');
  });

  it('id ja scope ovat suhteellisia, jotta ne toimivat osoitteessa /EquinoxUni/', () => {
    expect(manifest.id).toBe('./');
    expect(manifest.scope).toBe('./');
    for (const icon of manifest.icons) {
      expect(icon.src.startsWith('/')).toBe(false);
    }
  });

  it('kuvakkeissa on koot 192 ja 512 sekä rajattava (maskable) kuvake', () => {
    const sizes = manifest.icons.map((icon) => icon.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
    expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true);
    expect(manifest.icons.every((icon) => icon.type === 'image/png')).toBe(true);
  });

  it('index.html käyttää manifestia ja olemassa olevaa kuvaketta', () => {
    expect(indexHtml).toContain('href="./manifest.webmanifest"');
    const links = [...indexHtml.matchAll(/href="\.\/(icons\/[^"]+)"/g)].map((m) => m[1]);
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(APP_ICON.variants.map((variant) => variant.file)).toContain(link);
    }
  });
});

describe('pelin kuvake', () => {
  it('kuvake on suorakaide ja käyttää vain palettinsa värejä', () => {
    const width = APP_ICON.rows[0]?.length ?? 0;
    for (const row of APP_ICON.rows) {
      expect(row.length).toBe(width);
      for (const char of row) {
        expect(char === '.' || char in APP_ICON.palette, `merkki "${char}"`).toBe(true);
      }
    }
  });

  it('hahmo mahtuu maskable-kuvakkeen turva-alueeseen (ympyrä, halkaisija 80 %)', () => {
    const bounds = spriteBounds(APP_ICON);
    for (const variant of APP_ICON.variants.filter((v) => v.purpose === 'maskable')) {
      const options = { ...variant, background: APP_ICON.background };
      const scale = iconScale(bounds, options);
      const halfDiagonal = Math.hypot(bounds.width * scale, bounds.height * scale) / 2;
      expect(halfDiagonal).toBeLessThanOrEqual(variant.size * 0.4);
    }
  });

  it('piirtää taustan ja spriten pikselit oikean kokoisiksi neliöiksi', () => {
    const sprite = { palette: { a: '#ff0000' }, rows: ['..', '.a'] };
    const image = renderPixelIcon(sprite, { size: 8, fill: 0.5, background: '#0000ff' });
    expect(image.width).toBe(8);
    expect(image.data.length).toBe(8 * 8 * 4);
    const pixel = (x: number, y: number): number[] => [
      ...image.data.subarray((y * 8 + x) * 4, (y * 8 + x) * 4 + 4),
    ];
    // Yhden pikselin sprite, kerroin 4, keskitetty: pikselit 2..5.
    expect(pixel(0, 0)).toEqual([0, 0, 255, 255]);
    expect(pixel(2, 2)).toEqual([255, 0, 0, 255]);
    expect(pixel(5, 5)).toEqual([255, 0, 0, 255]);
    expect(pixel(6, 6)).toEqual([0, 0, 255, 255]);
  });

  it('muuntaa värin #rrggbb numeroiksi ja hylkää väärän muodon', () => {
    expect(hexToRgb('#1c2438')).toEqual([28, 36, 56]);
    expect(() => hexToRgb('punainen')).toThrow();
  });
});

describe('PNG-tiedosto', () => {
  const image = { width: 2, height: 1, data: Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]) };
  const png = encodePng(image, (bytes) => bytes);
  const view = new DataView(png.buffer);
  const text = (from: number, to: number): string => new TextDecoder().decode(png.slice(from, to));

  it('alkaa PNG-allekirjoituksella ja IHDR-palalla, jossa on koko ja RGBA-värityyppi', () => {
    expect([...png.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(text(12, 16)).toBe('IHDR');
    expect(view.getUint32(16)).toBe(2);
    expect(view.getUint32(20)).toBe(1);
    expect(png[24]).toBe(8);
    expect(png[25]).toBe(6);
  });

  it('IDAT sisältää rivit suodatintavun kanssa ja tiedosto päättyy IEND-palaan', () => {
    expect(text(37, 41)).toBe('IDAT');
    expect([...png.slice(41, 50)]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(text(png.length - 8, png.length - 4)).toBe('IEND');
    expect(view.getUint32(png.length - 4)).toBe(0xae426082);
  });

  it('CRC-32 laskee standardin mukaisen tarkistussumman', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
  });
});
