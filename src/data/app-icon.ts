// Pelin kuvake puhelimen aloitusnäytöllä, kun peli asennetaan Chromen kautta (PWA).
// Buildi (vite.config.ts) piirtää kuvakkeen alla olevasta pikselikuvasta PNG-tiedostoiksi.
// Chrome vaatii asennukseen kuvakkeet 192 ja 512 px. Kuvakkeen voi piirtää uudelleen
// muuttamalla rivejä ja värejä samaan tapaan kuin muut spritet (data/sprites-characters.ts).
// Tiedosto ei tuo mitään, jotta vite.config.ts voi lukea sen suoraan.

/**
 * Kuvakkeen käyttötapa PWA-manifestissa:
 * - any: kuva näytetään sellaisenaan
 * - maskable: Android saa rajata kuvan ympyräksi tai pyöristetyksi neliöksi, joten
 *   hahmo pidetään keskellä kuvaa turva-alueella
 */
export type AppIconPurpose = 'any' | 'maskable';

/** Yksi buildissa tehtävä PNG-kuvake. */
export interface AppIconVariant {
  /** Tiedoston polku julkaisussa, suhteessa pelin osoitteeseen (esim. icons/icon-192.png). */
  readonly file: string;
  /** Kuvan leveys ja korkeus pikseleinä. */
  readonly size: number;
  readonly purpose: AppIconPurpose;
  /** Kuinka suuren osan kuvan leveydestä tai korkeudesta hahmo saa enintään viedä (0..1). */
  readonly fill: number;
}

export interface AppIconDef {
  /** Kuvakkeen pikselikuva: merkki = väri paletista, '.' = taustaväri. */
  readonly palette: Readonly<Record<string, string>>;
  readonly rows: readonly string[];
  /** Taustaväri hahmon ympärillä. */
  readonly background: string;
  readonly variants: readonly AppIconVariant[];
}

/** Sankari kultaisilla silmillä nurmikon vihreällä taustalla, kuten alkuruudulla. */
export const APP_ICON: AppIconDef = {
  palette: {
    h: '#5a3a1a',
    s: '#f2c38f',
    e: '#ffd700',
    b: '#2e6fd8',
    l: '#22355e',
    k: '#3b2a1a',
  },
  rows: [
    '................',
    '.....hhhhhh.....',
    '....hhhhhhhh....',
    '....hssssssh....',
    '....sesssses....',
    '....ssssssss....',
    '.....ssssss.....',
    '....bbbbbbbb....',
    '...bbbbbbbbbb...',
    '...sbbbbbbbbs...',
    '...sbbbbbbbbs...',
    '....llllllll....',
    '....lll..lll....',
    '....lll..lll....',
    '....kkk..kkk....',
    '................',
  ],
  background: '#4f8c34',
  variants: [
    { file: 'icons/icon-192.png', size: 192, purpose: 'any', fill: 0.85 },
    { file: 'icons/icon-512.png', size: 512, purpose: 'any', fill: 0.85 },
    // Turva-alue on keskellä oleva ympyrä, jonka halkaisija on 80 % kuvasta.
    { file: 'icons/icon-maskable-512.png', size: 512, purpose: 'maskable', fill: 0.6 },
  ],
};

/** Kuvakkeen rivi PWA-manifestin icons-listaan (data/game-info.ts webManifest). */
export function manifestIcon(variant: AppIconVariant): {
  readonly src: string;
  readonly sizes: string;
  readonly type: string;
  readonly purpose: string;
} {
  return {
    src: variant.file,
    sizes: `${variant.size}x${variant.size}`,
    type: 'image/png',
    purpose: variant.purpose,
  };
}
