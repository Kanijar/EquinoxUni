import type { EnemyDef, ItemDef, NpcDef, QuestDef, TownDef } from '../data/types';

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
  'jussi-sword': { name: "Jussi's Old Sword", description: 'A bit rusty, but sharp.' },
  'leather-vest': { name: 'Leather Vest', description: 'A thick vest that softens blows.' },
  'lucky-charm': {
    name: 'Lucky Charm',
    description: "Jussi's lucky charm. You hit more accurately!",
  },
  'fire-staff': { name: 'Fire Staff', description: 'A flame glows at the tip of the staff.' },
  'ketola-armor': {
    name: 'Ketola Armor',
    description: 'Old family armor. It can take a hard hit!',
  },
  'wolf-tuft': { name: 'Wolf Fur Tuft', description: 'Soft fur. Take it to Jussi Ketola.' },
};

/** Tehtävän tekstit: nimi, tarjous (story) ja kiitos palautettaessa. */
export interface QuestTexts {
  readonly title: string;
  readonly story: string;
  readonly thanks: string;
}

/** Tehtävien tekstit englanniksi tunnisteen (QuestDef.id) mukaan (suomeksi data/quests.ts). */
export const QUEST_TEXTS_EN: Readonly<Record<string, QuestTexts>> = {
  'slime-hunt': {
    title: 'Slime Trouble',
    story: 'Slimes have made a mess of my whole yard! Can you defeat three slimes?',
    thanks: 'Thanks! The yard is clean again. Take these potions.',
  },
  'goblin-trouble': {
    title: 'Goblins in the Forest',
    story: 'Forest goblins keep hiding the berry buckets. Defeat four goblins!',
    thanks: 'Now we can pick berries again. This leather vest will protect you.',
  },
  'robber-chase': {
    title: 'On the Robbers’ Trail',
    story: 'Robbers lurk in the forest. Defeat two robbers to make the roads safe.',
    thanks: 'Great! Traders dare to travel again. Here are potions for the road.',
  },
  'troll-trouble': {
    title: 'Troll Trouble',
    story: 'The mountain trolls of the north throw rocks at the roads. Defeat three trolls!',
    thanks: 'Unbelievable! Take this fire staff, it makes your fireball stronger.',
  },
  'wisp-lights': {
    title: 'Lights in the Bog',
    story: 'Wisps float over the eastern bog and lead travellers astray. Defeat three wisps!',
    thanks: 'The bog is safe to cross again. Here are potions, and thank you!',
  },
  'rock-giants': {
    title: 'Rock Giants',
    story: 'Rock giants walk the fells and the ground shakes. Defeat three rock giants!',
    thanks: 'You are a true hero! Take my old family armor.',
  },
  'fire-lizards': {
    title: 'Volcano Lizards',
    story: 'Fire lizards are crawling from the volcano towards the villages. Defeat four!',
    thanks: 'Phew, the villages are safe! Take some potions, you will need them.',
  },
  'lizard-watch': {
    title: 'Lizard Watch',
    story: 'The fire lizards always come back. Defeat five lizards again and I will pay well!',
    thanks: 'Peaceful again. Come back tomorrow if you feel like it!',
  },
  'letter-peltola': {
    title: 'A Letter to Peltola',
    story: 'Could someone take this letter to Peltola? Go there and the letter is delivered.',
    thanks: 'The letter arrived! Take my old sword, I do not need it any more.',
  },
  'wolf-fur': {
    title: 'Wolf Fur',
    story: 'I need wolf fur for warm mittens. Bring me three fur tufts from wolves.',
    thanks: 'Lovely and warm! This lucky charm will bring you luck.',
  },
  'kuurala-message': {
    title: 'A Message to Kuurala',
    story: 'My cousin lives on the fells in Kuurala. Go and tell my cousin I am doing fine.',
    thanks: 'My cousin must be happy! Here are potions for the long journey.',
  },
  'northern-lights': {
    title: 'The Northernmost Village',
    story: 'Have you been to Revontula, the northernmost village on the island? Go there!',
    thanks: 'What a trip! Did you see the northern lights? Here are some potions.',
  },
  'volcano-trip': {
    title: 'At the Foot of the Volcano',
    story: 'Tuhkala is a village at the foot of the volcano. Do you dare to go there?',
    thanks: 'A mighty trip! You have travelled across the whole island.',
  },
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
  npc: (npc: NpcDef): string => npc.name,
  quest: (quest: QuestDef): QuestTexts => QUEST_TEXTS_EN[quest.id] ?? quest,
};
