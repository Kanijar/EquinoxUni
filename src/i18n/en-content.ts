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
