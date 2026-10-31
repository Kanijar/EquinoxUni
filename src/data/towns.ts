import type { TownDef } from './types';

// Paikkakunnat kartalla. Uusi paikkakunta: lisää olio tähän listaan ja tie
// (ROADS) johonkin toiseen paikkakuntaan. Testit tarkistavat, että paikka on maalla.
// Paikkakunnassa elämä palautuu täyteen.

export const TOWNS: readonly TownDef[] = [
  { id: 'valkeakoski', name: 'Valkeakoski', nameAt: 'Valkeakoskella', lon: 24.03, lat: 61.27 },
  { id: 'tampere', name: 'Tampere', nameAt: 'Tampereella', lon: 23.76, lat: 61.5 },
  { id: 'hameenlinna', name: 'Hämeenlinna', nameAt: 'Hämeenlinnassa', lon: 24.46, lat: 61.0 },
  { id: 'helsinki', name: 'Helsinki', nameAt: 'Helsingissä', lon: 24.94, lat: 60.2 },
  { id: 'turku', name: 'Turku', nameAt: 'Turussa', lon: 22.27, lat: 60.45 },
  { id: 'pori', name: 'Pori', nameAt: 'Porissa', lon: 21.8, lat: 61.48 },
  { id: 'lahti', name: 'Lahti', nameAt: 'Lahdessa', lon: 25.66, lat: 60.98 },
  { id: 'kotka', name: 'Kotka', nameAt: 'Kotkassa', lon: 26.95, lat: 60.47 },
  { id: 'lappeenranta', name: 'Lappeenranta', nameAt: 'Lappeenrannassa', lon: 28.19, lat: 61.06 },
  { id: 'mikkeli', name: 'Mikkeli', nameAt: 'Mikkelissä', lon: 27.27, lat: 61.69 },
  { id: 'jyvaskyla', name: 'Jyväskylä', nameAt: 'Jyväskylässä', lon: 25.75, lat: 62.24 },
  { id: 'kuopio', name: 'Kuopio', nameAt: 'Kuopiossa', lon: 27.68, lat: 62.89 },
  { id: 'joensuu', name: 'Joensuu', nameAt: 'Joensuussa', lon: 29.76, lat: 62.6 },
  { id: 'seinajoki', name: 'Seinäjoki', nameAt: 'Seinäjoella', lon: 22.84, lat: 62.79 },
  { id: 'vaasa', name: 'Vaasa', nameAt: 'Vaasassa', lon: 21.62, lat: 63.1 },
  { id: 'kokkola', name: 'Kokkola', nameAt: 'Kokkolassa', lon: 23.13, lat: 63.84 },
  { id: 'kajaani', name: 'Kajaani', nameAt: 'Kajaanissa', lon: 27.73, lat: 64.23 },
  { id: 'oulu', name: 'Oulu', nameAt: 'Oulussa', lon: 25.47, lat: 65.01 },
  { id: 'kuusamo', name: 'Kuusamo', nameAt: 'Kuusamossa', lon: 29.19, lat: 65.96 },
  { id: 'rovaniemi', name: 'Rovaniemi', nameAt: 'Rovaniemellä', lon: 25.73, lat: 66.5 },
  { id: 'kittila', name: 'Kittilä', nameAt: 'Kittilässä', lon: 24.91, lat: 67.66 },
  { id: 'kilpisjarvi', name: 'Kilpisjärvi', nameAt: 'Kilpisjärvellä', lon: 20.8, lat: 69.04 },
  { id: 'inari', name: 'Inari', nameAt: 'Inarissa', lon: 27.03, lat: 68.91 },
  { id: 'utsjoki', name: 'Utsjoki', nameAt: 'Utsjoella', lon: 27.03, lat: 69.88 },
];

/** Tiet paikkakuntien välillä. Tie kulkee suoraan ja ylittää järvet siltana. */
export const ROADS: readonly (readonly [string, string])[] = [
  ['valkeakoski', 'tampere'],
  ['valkeakoski', 'hameenlinna'],
  ['hameenlinna', 'helsinki'],
  ['hameenlinna', 'lahti'],
  ['tampere', 'turku'],
  ['tampere', 'pori'],
  ['tampere', 'jyvaskyla'],
  ['tampere', 'seinajoki'],
  ['lahti', 'kotka'],
  ['lahti', 'mikkeli'],
  ['kotka', 'lappeenranta'],
  ['mikkeli', 'kuopio'],
  ['jyvaskyla', 'kuopio'],
  ['kuopio', 'joensuu'],
  ['kuopio', 'kajaani'],
  ['seinajoki', 'vaasa'],
  ['vaasa', 'kokkola'],
  ['kokkola', 'oulu'],
  ['kajaani', 'oulu'],
  ['oulu', 'rovaniemi'],
  ['kuusamo', 'rovaniemi'],
  ['rovaniemi', 'kittila'],
  ['kittila', 'kilpisjarvi'],
  ['kittila', 'inari'],
  ['inari', 'utsjoki'],
];

export const START_TOWN = 'valkeakoski';
