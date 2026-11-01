import type { GearSlot, ItemDef } from './types';

// Esineet. Parannusjuoma juodaan taistelussa tai repusta. Varusteet (kind: 'gear')
// laitetaan käyttöön repussa: yksi varuste kerrallaan kuhunkin paikkaan (käsi, vartalo, kaula).
// bonus lisätään pelaajan arvoihin, kun varuste on käytössä (logic/equipment.ts).
// Viholliset pudottavat varusteita (EnemyDef.drops, data/enemies.ts).
// Sprite: data/sprites-items.ts.

export const ITEMS: readonly ItemDef[] = [
  {
    id: 'potion',
    name: 'Parannusjuoma',
    description: 'Palauttaa 10 elämäpistettä.',
    kind: 'heal',
    sprite: 'potion',
    value: 10,
  },
  {
    // Tunturipeikon pudotus: raskas ase, paljon hyökkäystä.
    id: 'club',
    name: 'Peikon nuija',
    description: 'Raskas nuija. Kova isku!',
    kind: 'gear',
    sprite: 'club',
    slot: 'hand',
    bonus: { attack: 6 },
  },
  {
    // Ryöstäjän pudotus: kevyt ase, osuu heikkoon kohtaan (kriittinen osuma).
    id: 'knife',
    name: 'Puukko',
    description: 'Terävä ja kevyt. Osut tarkemmin.',
    kind: 'gear',
    sprite: 'knife',
    slot: 'hand',
    bonus: { critPercent: 8, attack: 1 },
  },
  {
    // Ryöstäjän pudotus: tummat vaatteet, joissa liikkuu ketterästi.
    id: 'robber-clothes',
    name: 'Ryöstäjän vaatteet',
    description: 'Ketterät vaatteet. Osut tarkemmin.',
    kind: 'gear',
    sprite: 'robber-clothes',
    slot: 'body',
    bonus: { critPercent: 6 },
  },
  {
    // Harmaasuden pudotus: suden hampaista tehty koru antaa suden sitkeyttä.
    id: 'tooth-necklace',
    name: 'Hammaskoru',
    description: 'Suden hampaista tehty koru. Suden sitkeys!',
    kind: 'gear',
    sprite: 'tooth-necklace',
    slot: 'neck',
    bonus: { defense: 2, maxHp: 5 },
  },
  {
    // Loppubossin (Peikkokuningas) pudotus: harvinainen, vain kerran saatava viitta.
    id: 'king-cloak',
    name: 'Kuninkaan viitta',
    description: 'Peikkokuninkaan viitta. Sitkeä ja lämmin!',
    kind: 'gear',
    sprite: 'king-cloak',
    slot: 'body',
    bonus: { defense: 4, maxHp: 20 },
  },
  // --- Saaren hirviöiden pudotukset ---
  {
    // Rantakravun pudotus.
    id: 'crab-armor',
    name: 'Rapupanssari',
    description: 'Kova kuori suojaa iskuilta.',
    kind: 'gear',
    sprite: 'crab-armor',
    slot: 'body',
    bonus: { defense: 3, maxHp: 10 },
  },
  {
    // Liejuhirviön pudotus: parempi puolustuskoru kuin Hammaskoru.
    id: 'bog-stone',
    name: 'Suokivikoru',
    description: 'Raskas suon kivi. Kestät enemmän!',
    kind: 'gear',
    sprite: 'bog-stone',
    slot: 'neck',
    bonus: { defense: 4, maxHp: 15 },
  },
  {
    // Virvatulen pudotus: taikakoru, vaihtoehto Suokivikorulle.
    id: 'wisp-charm',
    name: 'Virvatulikoru',
    description: 'Virvatulen hehku. Tulipallo polttaa kovemmin!',
    kind: 'gear',
    sprite: 'wisp-charm',
    slot: 'neck',
    bonus: { magic: 2, critPercent: 6 },
  },
  {
    // Kalliojätin pudotus: Peikon nuijaa kovempi ase.
    id: 'stone-hammer',
    name: 'Kivivasara',
    description: 'Kalliojätin vasara. Murskaava isku!',
    kind: 'gear',
    sprite: 'stone-hammer',
    slot: 'hand',
    bonus: { attack: 12 },
  },
  {
    // Tuliliskon pudotus.
    id: 'lizard-armor',
    name: 'Tulisuomupanssari',
    description: 'Tuliliskon suomut. Vahva ja sitkeä!',
    kind: 'gear',
    sprite: 'lizard-armor',
    slot: 'body',
    bonus: { defense: 7, maxHp: 30 },
  },
  {
    // Lohikäärmeen pudotus: saaren paras ase.
    id: 'dragon-sword',
    name: 'Lohikäärmemiekka',
    description: 'Lohikäärmeen hampaasta taottu. Paras ase!',
    kind: 'gear',
    sprite: 'dragon-sword',
    slot: 'hand',
    bonus: { attack: 20, critPercent: 6 },
  },
  {
    // Lohikäärmeen pudotus: saaren paras koru.
    id: 'dragon-charm',
    name: 'Lohikäärmekoru',
    description: 'Lohikäärmeen silmä. Sitkeyttä ja tulta!',
    kind: 'gear',
    sprite: 'dragon-charm',
    slot: 'neck',
    bonus: { maxHp: 40, defense: 3, magic: 3 },
  },
];

/** Varustepaikat repussa tässä järjestyksessä: käsi (ase), vartalo (vaatteet), kaula (koru). */
export const GEAR_SLOTS: readonly GearSlot[] = ['hand', 'body', 'neck'];
