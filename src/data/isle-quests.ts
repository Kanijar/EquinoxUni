import type { QuestDef } from './types';

// Pienten saarten tehtävät (data/isles.ts). Jokaisella saarella on oma tehtävänantaja
// kylänsä vieressä (data/npcs.ts) ja kaksi tehtävää: ensin voitetaan saaren vihollisia,
// sitten tuodaan saaren tehtäväesineet (tai voitetaan Merikäärme). Toisen tehtävän
// palkintona on saaren paras koru. Tasapaino: palkinnon KP on noin yhden tason verran
// tehtävän minLevel-tasolla (taso 50 → 51 vaatii noin 1800 KP, taso 90 → 91 noin 5400 KP).
// Englanninkieliset tekstit: i18n/en-isles.ts (samat tunnisteet).

export const ISLE_QUESTS: readonly QuestDef[] = [
  // --- Palmusaari: Kalle Kompassi ---
  {
    id: 'pirate-raid',
    giver: 'kalle',
    title: 'Merirosvojen maihinnousu',
    story: 'Merirosvot vievät kookospähkinämme! Voita kolme merirosvoa, kapteeni!',
    thanks: 'Ahoi, sankari! Kylä kiittää. Ota nämä juomat merimatkalle.',
    minLevel: 50,
    goal: { kind: 'defeat', enemy: 'pirate', count: 3 },
    reward: { xp: 2000, items: [{ id: 'big-potion', count: 3 }] },
  },
  {
    id: 'treasure-map',
    giver: 'kalle',
    title: 'Aarrekartta',
    story: 'Merirosvot repivät aarrekarttani palasiksi. Tuo minulle kolme palaa takaisin!',
    thanks: 'Kartta on taas ehjä! Aarteen paras osa kuuluu sinulle: Kompassikoru.',
    minLevel: 52,
    requires: 'pirate-raid',
    goal: { kind: 'bring', item: 'map-piece', count: 3 },
    reward: { xp: 3000, items: [{ id: 'compass-charm', count: 1 }] },
  },
  // --- Sumusaari: Veera Varjo ---
  {
    id: 'skeleton-night',
    giver: 'veera',
    title: 'Luurankojen yö',
    story: 'Öisin luurankosoturit marssivat kylän ohi. Voita neljä luurankoa!',
    thanks: 'Nyt saamme nukkua rauhassa. Ota juomia, sumussa niitä tarvitaan.',
    minLevel: 60,
    goal: { kind: 'defeat', enemy: 'skeleton', count: 4 },
    reward: { xp: 3500, items: [{ id: 'big-potion', count: 4 }] },
  },
  {
    id: 'fog-lanterns',
    giver: 'veera',
    title: 'Sumulyhdyt',
    story: 'Sumuhaamut varastivat kylän lyhdyt. Tuo kolme sumulyhtyä, niin sumu hälvenee!',
    thanks: 'Valo palasi Sumulaan! Tämä Varjoamuletti on nyt sinun.',
    minLevel: 63,
    requires: 'skeleton-night',
    goal: { kind: 'bring', item: 'fog-lantern', count: 3 },
    reward: { xp: 5000, items: [{ id: 'shadow-amulet', count: 1 }] },
  },
  // --- Pakkassaari: Pekka Pakkanen ---
  {
    id: 'golem-thaw',
    giver: 'pekka',
    title: 'Jäägolemit',
    story: 'Jäägolemit tallaavat kalastajien avannot umpeen. Voita kolme golemia!',
    thanks: 'Avannot ovat taas auki! Ota juomia, täällä on kylmä.',
    minLevel: 75,
    goal: { kind: 'defeat', enemy: 'ice-golem', count: 3 },
    reward: { xp: 6000, items: [{ id: 'big-potion', count: 5 }] },
  },
  {
    id: 'frost-crystals',
    giver: 'pekka',
    title: 'Ikijään kiteet',
    story: 'Kristallihämähäkit kätkevät ikijään kiteitä. Tuo minulle kolme kidettä!',
    thanks: 'Upeita kiteitä! Tein niistä sinulle Lumihiutalekorun.',
    minLevel: 78,
    requires: 'golem-thaw',
    goal: { kind: 'bring', item: 'frost-crystal', count: 3 },
    reward: { xp: 8000, items: [{ id: 'snowflake-charm', count: 1 }] },
  },
  // --- Myrskysaari: Matti Myrsky ---
  {
    id: 'thunder-birds',
    giver: 'matti',
    title: 'Ukkoslinnut',
    story: 'Ukkoslinnut iskevät salamoita kattoihimme. Voita kolme ukkoslintua!',
    thanks: 'Taivas rauhoittui! Ota juomia, pahin on vielä edessä.',
    minLevel: 88,
    goal: { kind: 'defeat', enemy: 'thunderbird', count: 3 },
    reward: { xp: 9000, items: [{ id: 'big-potion', count: 5 }] },
  },
  {
    // Saarten viimeinen tehtävä: Merikäärme (data/isle-enemies.ts), palkintona pelin paras koru.
    id: 'sea-serpent',
    giver: 'matti',
    title: 'Merikäärmeen pesä',
    story: 'Myrskyt nostattaa Merikäärme lahden pohjasta. Voita se, jos uskallat!',
    thanks: 'Uskomatonta, myrsky laantui! Ota Myrskysydän, olet saarten sankari.',
    minLevel: 92,
    requires: 'thunder-birds',
    goal: { kind: 'defeat', enemy: 'sea-serpent', count: 1 },
    reward: { xp: 14000, items: [{ id: 'storm-heart', count: 1 }] },
  },
];
