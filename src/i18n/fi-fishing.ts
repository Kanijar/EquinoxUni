// Kalastuksen tekstit suomeksi (TEXT.fishing, data/fishing.ts). Sama englanniksi:
// i18n/en-fishing.ts.

export const FI_FISHING = {
  /** Kartan nappi, kun sankarilla on onki ja hän seisoo veden vieressä. */
  button: 'KALASTA',
  /** Sama nappi, kun koho on vedessä: napautus nykäisee. */
  reel: 'NYKÄISE',
  /** Kala nappaa: nyt pitää nykäistä nopeasti! */
  bite: 'NYKÄISE!',
  /** Huutomerkki kohon päällä, kun kala nappaa. */
  mark: '!',
  cast: 'Heitit kohon veteen. Nykäise, kun kala nappaa!',
  noBait: (merchant: string): string => `Ei matoja! Osta niitä kauppias ${merchant}lta.`,
  early: 'Liian aikaisin! Kala säikähti.',
  escaped: 'Liian myöhään! Kala vei madon.',
  cancelled: 'Lopetit kalastuksen.',
  caught: (item: string): string => `Sait saaliin: ${item}!`,
  /** Harvinainen varuste (Kalan suomupanssari). */
  caughtGear: (item: string): string => `Mikä saalis: ${item}!\nLaita se käyttöön repussa.`,
  /** Hai tarttui onkeen: taistelu alkaa. */
  enemy: (enemy: string): string => `${enemy} tarttui onkeen ja hyökkää!`,
  baitLeft: (count: number): string => `Matoja jäljellä ${count}.`,
  /** Taistelun aloitus, kun hai tarttui onkeen. */
  battleIntro: (enemy: string): string => `${enemy} loikkaa vedestä kimppuusi!`,
};
