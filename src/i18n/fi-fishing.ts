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
  cast: (bait: string): string =>
    `Heitit kohon veteen. Syötti: ${bait}.\nNykäise, kun kala nappaa!`,
  noBait: (merchant: string): string => `Ei syöttiä! Osta matoja kauppias ${merchant}lta.`,
  early: 'Liian aikaisin! Kala säikähti.',
  escaped: 'Liian myöhään! Kala vei syötin.',
  cancelled: 'Lopetit kalastuksen.',
  caught: (item: string): string => `Sait saaliin: ${item}!`,
  /** Harvinainen varuste (Kalan suomupanssari). */
  caughtGear: (item: string): string => `Mikä saalis: ${item}!\nLaita se käyttöön repussa.`,
  /** Hai tai jättimustekala tarttui onkeen: taistelu alkaa. */
  enemy: (enemy: string): string => `${enemy} tarttui onkeen ja hyökkää!`,
  baitLeft: (bait: string, count: number): string => `${bait}: jäljellä ${count}.`,
  /** Taistelun aloitus, kun hai tarttui onkeen. */
  battleIntro: (enemy: string): string => `${enemy} loikkaa vedestä kimppuusi!`,
  baitChosen: (bait: string): string => `${bait} on nyt syöttinä.`,
  baitInUse: 'Tämä on nyt syöttinä.',
  /** Ongen ominaisuudet repussa ja kaupassa. */
  rodStats: (windowMs: number, rare: number): string =>
    `Nykäisyaika ${(windowMs / 1000).toFixed(1).replace('.', ',')} s, harvinaiset ×${String(rare).replace('.', ',')}`,
  /** Ongen ominaisuudet, kun sankarilla on parempi onki. */
  rodWorse: 'Sinulla on parempi onki.',
};
