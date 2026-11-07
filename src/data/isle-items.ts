import type { ItemDef } from './types';

// Pienten saarten esineet (data/isles.ts): vene, saarten vihollisten pudotukset,
// tehtäväesineet ja tehtävien palkinnot (data/isle-quests.ts). Jokaisen saaren varusteet
// ovat edellisen saaren varusteita parempia, ja ensimmäisen saaren varusteet ovat vähän
// parempia kuin lohikäärmeen ja Ossi Ketolan varusteet. Spritet: data/sprites-isle-items.ts.

export const ISLE_ITEMS: readonly ItemDef[] = [
  {
    // Venesataman venekaupasta (data/boat-shop.ts). Merellä kuljet 60 % nopeammin.
    id: 'sailboat',
    name: 'Purjevene',
    description: 'Vie saarille! Rannalla VENEESEEN tai V.',
    kind: 'boat',
    sprite: 'boat',
    price: 1500,
    speedMultiplier: 1.6,
    mapSprite: 'sailboat',
  },
  // --- Palmusaari ---
  {
    id: 'pirate-saber',
    name: 'Merirosvon sapeli',
    description: 'Kaareva ja terävä. Osut tarkemmin!',
    kind: 'gear',
    sprite: 'pirate-saber',
    price: 2600,
    slot: 'hand',
    bonus: { attack: 23, critPercent: 8 },
  },
  {
    id: 'snake-vest',
    name: 'Käärmenahkaliivi',
    description: 'Viidakkokäärmeen nahkaa. Kevyt ja sitkeä.',
    kind: 'gear',
    sprite: 'snake-vest',
    price: 2800,
    slot: 'body',
    bonus: { defense: 11, maxHp: 45 },
  },
  {
    // Tehtäväesine: putoaa merirosvoilta vain, kun Aarrekartta-tehtävä on kesken.
    id: 'map-piece',
    name: 'Aarrekartan pala',
    description: 'Revitty kartta. Vie se Kalle Kompassille.',
    kind: 'key',
    sprite: 'map-piece',
  },
  {
    id: 'compass-charm',
    name: 'Kompassikoru',
    description: 'Näyttää aina oikean suunnan iskulle.',
    kind: 'gear',
    sprite: 'compass-charm',
    price: 2800,
    slot: 'neck',
    bonus: { maxHp: 50, defense: 4, critPercent: 6 },
  },
  // --- Sumusaari ---
  {
    id: 'bone-sword',
    name: 'Luumiekka',
    description: 'Vanhan soturin miekka. Kova isku!',
    kind: 'gear',
    sprite: 'bone-sword',
    price: 3600,
    slot: 'hand',
    bonus: { attack: 27, critPercent: 8 },
  },
  {
    id: 'ghost-cloak',
    name: 'Haamuviitta',
    description: 'Sumusta kudottu. Suojaa ja vahvistaa tulta.',
    kind: 'gear',
    sprite: 'ghost-cloak',
    price: 3800,
    slot: 'body',
    bonus: { defense: 13, maxHp: 55, magic: 3 },
  },
  {
    // Tehtäväesine: putoaa sumuhaamuilta vain, kun Sumulyhdyt-tehtävä on kesken.
    id: 'fog-lantern',
    name: 'Sumulyhty',
    description: 'Hehkuu sinisenä. Vie se Veera Varjolle.',
    kind: 'key',
    sprite: 'fog-lantern',
  },
  {
    id: 'shadow-amulet',
    name: 'Varjoamuletti',
    description: 'Varjojen voima: sitkeyttä ja tulta.',
    kind: 'gear',
    sprite: 'shadow-amulet',
    price: 3800,
    slot: 'neck',
    bonus: { maxHp: 60, defense: 5, magic: 5 },
  },
  // --- Pakkassaari ---
  {
    id: 'frost-axe',
    name: 'Pakkaskirves',
    description: 'Ikijäästä taottu. Jäätävä isku!',
    kind: 'gear',
    sprite: 'frost-axe',
    price: 4800,
    slot: 'hand',
    bonus: { attack: 31, critPercent: 8 },
  },
  {
    id: 'crystal-armor',
    name: 'Kristallihaarniska',
    description: 'Kimaltaa ja kestää kovatkin iskut.',
    kind: 'gear',
    sprite: 'crystal-armor',
    price: 5000,
    slot: 'body',
    bonus: { defense: 15, maxHp: 65, magic: 3 },
  },
  {
    // Tehtäväesine: putoaa kristallihämähäkeiltä vain, kun Ikijään kiteet -tehtävä on kesken.
    id: 'frost-crystal',
    name: 'Ikijään kide',
    description: 'Ei sula koskaan. Vie se Pekka Pakkaselle.',
    kind: 'key',
    sprite: 'frost-crystal',
  },
  {
    id: 'snowflake-charm',
    name: 'Lumihiutalekoru',
    description: 'Pakkasen voima: sitkeyttä ja tarkkuutta.',
    kind: 'gear',
    sprite: 'snowflake-charm',
    price: 5000,
    slot: 'neck',
    bonus: { maxHp: 70, defense: 6, critPercent: 8, magic: 4 },
  },
  // --- Myrskysaari ---
  {
    id: 'storm-cloak',
    name: 'Ukkosviitta',
    description: 'Salamat rätisevät. Paras haarniska!',
    kind: 'gear',
    sprite: 'storm-cloak',
    price: 6500,
    slot: 'body',
    bonus: { defense: 18, maxHp: 80, magic: 4 },
  },
  {
    // Merikäärmeen pudotus: pelin paras ase.
    id: 'serpent-spear',
    name: 'Merikäärmeen keihäs',
    description: 'Merikäärmeen hampaasta. Paras ase!',
    kind: 'gear',
    sprite: 'serpent-spear',
    price: 7000,
    slot: 'hand',
    bonus: { attack: 36, critPercent: 10 },
  },
  {
    // Myrskysaaren viimeisen tehtävän palkinto: pelin paras koru.
    id: 'storm-heart',
    name: 'Myrskysydän',
    description: 'Ukkosen sydän. Paras koru!',
    kind: 'gear',
    sprite: 'storm-heart',
    price: 7000,
    slot: 'neck',
    bonus: { maxHp: 90, defense: 8, critPercent: 8, magic: 6 },
  },
];
