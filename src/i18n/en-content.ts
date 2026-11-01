import type { EnemyDef, ItemDef, TownDef } from '../data/types';

// Vihollisten ja esineiden nimet englanniksi. Suomenkieliset nimet ovat data-tiedostoissa
// (data/enemies.ts, data/items.ts). Uusi vihollinen tai esine: lisää sen englanninkielinen
// nimi tänne samalla tunnisteella (id). Testi tests/i18n.test.ts tarkistaa, ettei mikään puutu.
// Paikkakuntien nimet ovat samat molemmilla kielillä.

/** Vihollisten nimet englanniksi tunnisteen (EnemyDef.id) mukaan. */
export const ENEMY_NAMES_EN: Readonly<Record<string, string>> = {
  slime: 'Slime',
  hiisi: 'Forest Goblin',
  wolf: 'Grey Wolf',
  troll: 'Mountain Troll',
  robber: 'Robber',
  'troll-king': 'Troll King',
  crab: 'Beach Crab',
  mud: 'Mud Monster',
  wisp: "Will-o'-the-Wisp",
  giant: 'Rock Giant',
  lizard: 'Fire Lizard',
  dragon: 'Dragon',
};

/** Esineiden nimet ja kuvaukset englanniksi tunnisteen (ItemDef.id) mukaan. */
export const ITEM_TEXTS_EN: Readonly<
  Record<string, { readonly name: string; readonly description: string }>
> = {
  potion: { name: 'Healing Potion', description: 'Restores 10 HP.' },
  club: { name: 'Troll Club', description: 'A heavy club. Hits hard!' },
  knife: { name: 'Knife', description: 'Sharp and light. You hit more accurately.' },
  'robber-clothes': {
    name: "Robber's Clothes",
    description: 'Nimble clothes. You hit more accurately.',
  },
  'tooth-necklace': {
    name: 'Tooth Necklace',
    description: "A necklace made of wolf teeth. The wolf's toughness!",
  },
  'king-cloak': { name: "King's Cloak", description: "The Troll King's cloak. Tough and warm!" },
  'crab-armor': { name: 'Crab Armor', description: 'A hard shell protects you from blows.' },
  'bog-stone': { name: 'Bog Stone Necklace', description: 'A heavy bog stone. You can take more!' },
  'wisp-charm': { name: 'Wisp Charm', description: 'A wisp glow. Your fireball burns hotter!' },
  'stone-hammer': { name: 'Stone Hammer', description: "The Rock Giant's hammer. Crushing!" },
  'lizard-armor': {
    name: 'Fire Scale Armor',
    description: 'Fire lizard scales. Strong and tough!',
  },
  'dragon-sword': {
    name: 'Dragon Sword',
    description: "Forged from a dragon's fang. Best weapon!",
  },
  'dragon-charm': { name: 'Dragon Charm', description: "A dragon's eye. Toughness and fire!" },
};

/** TEXT.names englanniksi. Jos käännös puuttuu, näytetään suomenkielinen nimi. */
export const EN_CONTENT = {
  /** Sankarin nimi (suomeksi data/player.ts). */
  player: 'Hero',
  enemy: (enemy: EnemyDef): string => ENEMY_NAMES_EN[enemy.id] ?? enemy.name,
  item: (item: ItemDef): string => ITEM_TEXTS_EN[item.id]?.name ?? item.name,
  itemDescription: (item: ItemDef): string =>
    ITEM_TEXTS_EN[item.id]?.description ?? item.description,
  town: (town: TownDef): string => town.name,
};
