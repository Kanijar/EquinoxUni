import type { FishingRules } from './types';

// Kalastus. Kulkevalta kauppiaalta Kaapolta ostetaan onki ja matoja. Kun sankari seisoo
// meren tai järven rannalla, kartalle tulee KALASTA-nappi (tietokoneella F-näppäin). Koho
// lentää veteen, ja hetken päästä kala nappaa: silloin pitää nykäistä nopeasti (sama nappi).
// Liian aikaisin nykäisty säikäyttää kalan, liian myöhään kala vie madon.
// Saaliina tulee yleensä kalaa (syödään repusta, elämä palautuu, tai myydään kauppiaalle),
// joskus harvinainen Kalan suomupanssari ja joskus hai, joka hyökkää: taistelu alkaa.
// Säännöt: logic/fishing.ts, kartalla: systems/fishing-control.ts.
// Kalastuksen esineet: data/fishing-items.ts, hai: data/enemies.ts.

export const FISHING: FishingRules = {
  rodItem: 'fishing-rod',
  baitItem: 'worm',
  waterTerrains: ['sea', 'lake'],
  reachTiles: 1,
  biteDelayMs: { min: 1500, max: 4500 },
  biteWindowMs: 900,
  // Yhteensä 100, joten painot ovat prosentteja. Kun panssari on jo saatu, muut yleistyvät.
  catches: [
    { kind: 'item', item: 'perch', weight: 52 },
    { kind: 'item', item: 'pike', weight: 23 },
    { kind: 'item', item: 'salmon', weight: 10 },
    { kind: 'enemy', enemy: 'shark', weight: 10 },
    { kind: 'item', item: 'fish-scale-armor', weight: 5 },
  ],
};
