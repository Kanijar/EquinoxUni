import type { IsleDef } from '../data/types';

// Veneen ja pienten saarten tekstit suomeksi (TEXT.boat). Vene: logic/sailing.ts,
// saaret: data/isles.ts. Sama englanniksi: i18n/en-boat.ts.

export const FI_BOAT = {
  /** Alarivin nappi rannalla, kun vene on repussa. */
  board: 'VENEESEEN',
  /** Alarivin nappi merellä, kun ranta on vieressä. */
  land: 'MAIHIN',
  /** Veneeseen noustessa (boat = veneen nimi). */
  boarded: (boat: string): string => `${boat} vesille! Rannan vieressä MAIHIN.`,
  /** Lisärivi, kun veneestä voi kalastaa (Luksusvene). */
  fishAtSea: 'Täältä voit kalastaa: KALASTA tai F.',
  landed: 'Nousit maihin.',
  /** Ensimmäinen rantautuminen saarelle. */
  isleFound: (isle: IsleDef, found: number, total: number): string =>
    `Löysit saaren: ${isle.name} (${found}/${total})!\nSuositeltu taso ${isle.level}+.`,
  /** Myöhemmät rantautumiset. */
  isleLanding: (isle: IsleDef): string =>
    `Rantauduit ${isle.nameTo}. Suositeltu taso ${isle.level}+.`,
  /** Venekaupan otsikko ja tervehdys (data/boat-shop.ts). */
  shopTitle: 'Venekauppa',
  shopGreet: (name: string): string =>
    `${name}: Ahoi! Mitä nopeampi vene, sitä nopeammin saarille. Ne ovat vaarallisia: tule tasolla 50!`,
  /** Veneen nopeus kaupassa (×1 = kävelyvauhti) ja voiko siitä kalastaa. */
  speedInfo: (multiplier: number, canFish: boolean): string =>
    `Nopeus merellä ×${String(multiplier).replace('.', ',')}${canFish ? ', voit kalastaa' : ''}`,
};

/** Bugattin avaimet kartalla (logic/vehicle.ts): nappi ja ilmoitukset. */
export const FI_VEHICLE = {
  button: 'BUGATTI',
  on: 'Brrrm! Vauhtia +80 %!',
  off: 'Bugatti sammui. Kävelet taas.',
};
