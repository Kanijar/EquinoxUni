// Tekee RGBA-kuvasta PNG-tiedoston (pelin kuvakkeet buildissa). Pakkaus annetaan
// parametrina (buildissa Noden zlib), jotta tämä tiedosto pysyy puhtaana TypeScriptinä.
// Tiedosto ei tuo mitään, jotta vite.config.ts voi käyttää sitä buildissa.
// PNG-muoto: allekirjoitus + palat IHDR (koko ja värityyppi), IDAT (pakatut rivit) ja IEND.

/** Kuva RGBA-tavuina (logic/pixel-icon.ts PngImage). */
export interface PngImage {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8Array;
}

/** zlib-muotoinen pakkaus (esim. node:zlib deflateSync). */
export type Deflate = (data: Uint8Array) => Uint8Array;

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const BIT_DEPTH = 8;
/** Värityyppi 6 = RGBA. */
const COLOR_TYPE_RGBA = 6;
const CHANNELS = 4;
/** Rivisuodatin 0 = ei suodatusta. */
const FILTER_NONE = 0;
const IHDR_LENGTH = 13;
const CRC_POLYNOMIAL = 0xedb88320;
const BYTE = 0xff;

const CRC_TABLE = buildCrcTable();

export function encodePng(image: PngImage, deflate: Deflate): Uint8Array {
  return concat([
    Uint8Array.from(PNG_SIGNATURE),
    chunk('IHDR', header(image)),
    chunk('IDAT', deflate(scanlines(image))),
    chunk('IEND', new Uint8Array(0)),
  ]);
}

/** CRC-32, jolla PNG tarkistaa jokaisen palan. */
export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = (CRC_TABLE[(crc ^ byte) & BYTE] ?? 0) ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function header(image: PngImage): Uint8Array {
  const bytes = new Uint8Array(IHDR_LENGTH);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, image.width);
  view.setUint32(4, image.height);
  bytes.set([BIT_DEPTH, COLOR_TYPE_RGBA, 0, 0, 0], 8);
  return bytes;
}

/** Jokaisen kuvarivin eteen tulee suodatintavu. */
function scanlines(image: PngImage): Uint8Array {
  const rowBytes = image.width * CHANNELS;
  const out = new Uint8Array(image.height * (rowBytes + 1));
  for (let y = 0; y < image.height; y++) {
    out[y * (rowBytes + 1)] = FILTER_NONE;
    out.set(image.data.subarray(y * rowBytes, (y + 1) * rowBytes), y * (rowBytes + 1) + 1);
  }
  return out;
}

/** Pala: pituus (4 tavua), tyyppi (4 kirjainta), sisältö ja CRC tyypistä ja sisällöstä. */
function chunk(type: string, body: Uint8Array): Uint8Array {
  const typed = concat([new TextEncoder().encode(type), body]);
  const out = new Uint8Array(4 + typed.length + 4);
  const view = new DataView(out.buffer);
  view.setUint32(0, body.length);
  out.set(typed, 4);
  view.setUint32(4 + typed.length, crc32(typed));
  return out;
}

function concat(parts: readonly Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function buildCrcTable(): number[] {
  return Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? CRC_POLYNOMIAL ^ (c >>> 1) : c >>> 1;
    }
    return c >>> 0;
  });
}
