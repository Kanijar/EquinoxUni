// Piirtää pikselikuvan suureksi neliökuvaksi (pelin kuvake, data/app-icon.ts). Jokainen
// pikseli suurennetaan kokonaislukukertoimella, jotta pikselit pysyvät terävinä.
// Tiedosto ei tuo mitään, jotta vite.config.ts voi käyttää sitä buildissa.

/** Pikselikuva merkkiriveinä, kuten spritet (data/types.ts SpriteDef). */
export interface PixelArt {
  readonly palette: Readonly<Record<string, string>>;
  readonly rows: readonly string[];
}

/** Kuva RGBA-tavuina: 4 tavua per pikseli, rivi kerrallaan ylhäältä alas. */
export interface RgbaImage {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8Array;
}

export interface PixelIconOptions {
  readonly size: number;
  /** Kuinka suuren osan kuvasta hahmo saa enintään viedä (0..1). */
  readonly fill: number;
  readonly background: string;
}

/** Spriten näkyvien pikselien alue (läpinäkyvät reunat poistettuna). */
export interface SpriteBounds {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

const CHANNELS = 4;
const OPAQUE = 255;
const HEX_COLOR = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;

/** '#1c2438' → [28, 36, 56]. */
export function hexToRgb(hex: string): [number, number, number] {
  const match = HEX_COLOR.exec(hex);
  if (!match) {
    throw new Error(`Väri ei ole muotoa #rrggbb: ${hex}`);
  }
  return [parseInt(match[1] ?? '', 16), parseInt(match[2] ?? '', 16), parseInt(match[3] ?? '', 16)];
}

export function spriteBounds(sprite: PixelArt): SpriteBounds {
  const xs: number[] = [];
  const ys: number[] = [];
  sprite.rows.forEach((row, y) => {
    [...row].forEach((char, x) => {
      if (sprite.palette[char]) {
        xs.push(x);
        ys.push(y);
      }
    });
  });
  if (xs.length === 0) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  return { left, top, width: Math.max(...xs) - left + 1, height: Math.max(...ys) - top + 1 };
}

/** Suurin kokonaislukukerroin, jolla hahmo mahtuu fill-osuuteen kuvasta (vähintään 1). */
export function iconScale(bounds: SpriteBounds, options: PixelIconOptions): number {
  const side = Math.max(bounds.width, bounds.height, 1);
  return Math.max(1, Math.floor((options.size * options.fill) / side));
}

export function renderPixelIcon(sprite: PixelArt, options: PixelIconOptions): RgbaImage {
  const { size } = options;
  const data = new Uint8Array(size * size * CHANNELS);
  fillRect(data, size, { x: 0, y: 0, w: size, h: size }, hexToRgb(options.background));
  const bounds = spriteBounds(sprite);
  const scale = iconScale(bounds, options);
  const originX = Math.floor((size - bounds.width * scale) / 2) - bounds.left * scale;
  const originY = Math.floor((size - bounds.height * scale) / 2) - bounds.top * scale;
  sprite.rows.forEach((row, y) => {
    [...row].forEach((char, x) => {
      const color = sprite.palette[char];
      if (color) {
        const rect = { x: originX + x * scale, y: originY + y * scale, w: scale, h: scale };
        fillRect(data, size, rect, hexToRgb(color));
      }
    });
  });
  return { width: size, height: size, data };
}

interface Rect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

function fillRect(data: Uint8Array, size: number, rect: Rect, rgb: [number, number, number]): void {
  for (let y = Math.max(0, rect.y); y < Math.min(size, rect.y + rect.h); y++) {
    for (let x = Math.max(0, rect.x); x < Math.min(size, rect.x + rect.w); x++) {
      data.set([...rgb, OPAQUE], (y * size + x) * CHANNELS);
    }
  }
}
