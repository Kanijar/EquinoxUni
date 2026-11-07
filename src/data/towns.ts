import type { TownDef } from './types';

// Saaren kylät ja kaupungit. Uusi paikkakunta: lisää olio tähän listaan ja tie
// (ROADS) johonkin toiseen paikkakuntaan. Sijainti ruutuina (data/island.ts kertoo kartan
// koon ja alueet). Testit tarkistavat, että paikka on maalla ja sinne pääsee kävellen.
// Paikkakunnassa elämä palautuu täyteen.

export const TOWNS: readonly TownDef[] = [
  // Lounaan pellot: aloituskylä ja helpot viholliset
  { id: 'kotiranta', name: 'Kotiranta', nameAt: 'Kotirannassa', x: 80, y: 96 },
  { id: 'peltola', name: 'Peltola', nameAt: 'Peltolassa', x: 52, y: 88 },
  { id: 'lokkisatama', name: 'Lokkisatama', nameAt: 'Lokkisatamassa', x: 27, y: 98 },
  { id: 'myllykyla', name: 'Myllykylä', nameAt: 'Myllykylässä', x: 40, y: 70 },
  // Keskisaaren metsät ja järvet
  { id: 'havula', name: 'Havula', nameAt: 'Havulassa', x: 62, y: 58 },
  { id: 'susiniemi', name: 'Susiniemi', nameAt: 'Susiniemessä', x: 36, y: 50 },
  { id: 'kuusela', name: 'Kuusela', nameAt: 'Kuuselassa', x: 92, y: 60 },
  { id: 'kalaniemi', name: 'Kalaniemi', nameAt: 'Kalaniemessä', x: 112, y: 46 },
  // Idän suo
  { id: 'sammalkyla', name: 'Sammalkylä', nameAt: 'Sammalkylässä', x: 130, y: 76 },
  { id: 'usvala', name: 'Usvala', nameAt: 'Usvalassa', x: 150, y: 96 },
  { id: 'simpukkaranta', name: 'Simpukkaranta', nameAt: 'Simpukkarannassa', x: 106, y: 104 },
  // Pohjoisen tunturit
  { id: 'kuurala', name: 'Kuurala', nameAt: 'Kuuralassa', x: 56, y: 34 },
  { id: 'revontula', name: 'Revontula', nameAt: 'Revontulassa', x: 100, y: 20 },
  // Koillisen tulivuori
  { id: 'tuhkala', name: 'Tuhkala', nameAt: 'Tuhkalassa', x: 146, y: 40 },
  // Kotirannan eteläranta: Veikon venekauppa (data/boat-shop.ts). Täältä purjehditaan saarille.
  { id: 'venesatama', name: 'Venesatama', nameAt: 'Venesatamassa', x: 74, y: 108 },
  // Pienten saarten kylät (data/isles.ts): niihin pääsee vain veneellä, joten niihin ei ole teitä.
  { id: 'kookoskyla', name: 'Kookoskylä', nameAt: 'Kookoskylässä', x: 66, y: 126 },
  { id: 'sumula', name: 'Sumula', nameAt: 'Sumulassa', x: 27, y: 135 },
  { id: 'kidela', name: 'Kidelä', nameAt: 'Kidelässä', x: 141, y: 136 },
  { id: 'ukkola', name: 'Ukkola', nameAt: 'Ukkolassa', x: 213, y: 44 },
];

/** Tiet paikkakuntien välillä. Tie kulkee suoraan ja ylittää järvet siltana. */
export const ROADS: readonly (readonly [string, string])[] = [
  ['kotiranta', 'peltola'],
  ['peltola', 'lokkisatama'],
  ['peltola', 'myllykyla'],
  ['myllykyla', 'susiniemi'],
  ['myllykyla', 'havula'],
  ['kotiranta', 'kuusela'],
  ['havula', 'kuusela'],
  ['havula', 'kuurala'],
  ['susiniemi', 'kuurala'],
  ['kuurala', 'revontula'],
  ['kuusela', 'kalaniemi'],
  ['kalaniemi', 'revontula'],
  ['kalaniemi', 'tuhkala'],
  ['kuusela', 'sammalkyla'],
  ['sammalkyla', 'usvala'],
  ['sammalkyla', 'simpukkaranta'],
  ['usvala', 'simpukkaranta'],
  ['kotiranta', 'venesatama'],
];

export const START_TOWN = 'kotiranta';
