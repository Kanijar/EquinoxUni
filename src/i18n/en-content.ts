import type { EnemyDef, IsleDef, ItemDef, NpcDef, QuestDef, TownDef } from '../data/types';
import { CAVE_ITEM_TEXTS_EN } from './en-cave';
import { IDEA_ITEM_TEXTS_EN } from './en-ideas';
import {
  ISLE_ENEMY_NAMES_EN,
  ISLE_ITEM_TEXTS_EN,
  ISLE_NAMES_EN,
  ISLE_QUEST_TEXTS_EN,
} from './en-isles';

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
  shark: 'Shark',
  octopus: 'Giant Octopus',
  // Pienet saaret (i18n/en-isles.ts)
  ...ISLE_ENEMY_NAMES_EN,
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
  'dragon-scale': { name: 'Dragon Scale', description: 'A hot scale. Take it to Ossi Ketola.' },
  'lava-armor': { name: 'Lava Armor', description: 'Forged by Ossi from lava. Fireproof!' },
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
  'bugatti-keys': { name: 'Bugatti Keys', description: 'Drive 80% faster! Press E or BUGATTI.' },
  // Kulkevan kauppiaan tavarat (data/merchant-items.ts)
  'big-potion': { name: 'Big Healing Potion', description: 'Restores 40 HP.' },
  'power-crystal': { name: 'Power Crystal', description: 'Gives you one skill point now!' },
  'iron-sword': { name: 'Iron Sword', description: 'A sturdy sword for a traveller.' },
  'chain-mail': { name: 'Chain Mail', description: 'A shirt woven from iron rings.' },
  'ruby-amulet': { name: 'Ruby Amulet', description: 'A glowing stone. Stronger fireballs!' },
  'rune-axe': { name: 'Rune Axe', description: 'Glowing runes. Hits hard and true!' },
  'steel-armor': { name: 'Steel Armor', description: 'Shiny armor. It takes a lot!' },
  'moon-charm': { name: 'Moonstone Charm', description: 'Moon silver protects and guides you.' },
  // Kalastus (data/fishing-items.ts)
  'fishing-rod': { name: 'Fishing Rod', description: 'Fish by the water. You need worms!' },
  worm: { name: 'Worm', description: 'Bait for the rod. Used up when a fish bites.' },
  perch: { name: 'Perch', description: 'A small fish. Eat: HP +12.' },
  pike: { name: 'Pike', description: 'A big fish. Eat: HP +25.' },
  salmon: { name: 'Salmon', description: 'A rare treat. Eat: HP +50.' },
  fly: { name: 'Fly', description: 'Trout and salmon love flies!' },
  shrimp: { name: 'Shrimp', description: 'Attracts sharks and goldfish.' },
  lure: { name: 'Shiny Lure', description: 'It shines! Giant octopus and treasures.' },
  'carbon-rod': { name: 'Carbon Rod', description: 'A light rod: more time to reel in.' },
  'golden-rod': { name: 'Golden Rod', description: 'Rare catches come more often!' },
  'sea-king-rod': { name: 'Sea King Rod', description: 'The best rod. Treasures and giant fish!' },
  trout: { name: 'Trout', description: 'A spotted fish. Eat: HP +35.' },
  'golden-fish': { name: 'Goldfish', description: 'A sparkling treasure! Eat: HP +80.' },
  'pearl-necklace': { name: 'Pearl Necklace', description: 'Sea pearls. Toughness and magic!' },
  'fish-scale-armor': {
    name: 'Fish Scale Armor',
    description: 'Shiny scales. Slippery and tough!',
  },
  // Pienet saaret (i18n/en-isles.ts)
  ...ISLE_ITEM_TEXTS_EN,
  // Peikkokuninkaan luola (i18n/en-cave.ts)
  ...CAVE_ITEM_TEXTS_EN,
  // Dev-varusteet, vain salaisesta burgerista (data/dev-items.ts)
  'dev-sword': { name: 'Dev Sword', description: 'The game makers’ sword. The mightiest weapon!' },
  'dev-armor': { name: 'Dev Armor', description: 'The game makers’ armor. Nothing gets through!' },
  'dev-amulet': { name: 'Dev Amulet', description: 'The game makers’ star. The mightiest charm!' },
  ...IDEA_ITEM_TEXTS_EN,
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
  'dragon-hunt': {
    title: 'Dragon Slayer',
    story: 'Dragons live on the volcano! Destroy two dragons and you get my greatest treasure.',
    thanks: 'You did it! Take the keys to my Bugatti. Press E or BUGATTI to drive fast!',
  },
  'ossi-greetings': {
    title: 'Greetings to Jussi',
    story: 'You saved me from the dragons! Go and tell my brother Jussi that I am fine.',
    thanks: 'Now Jussi knows! Take these potions. I have one more favour to ask...',
  },
  'dragon-scales': {
    title: 'Dragon Scales',
    story: 'I will forge you lava armor, but I need three dragon scales. Bring them to me!',
    thanks: 'Great scales! Here is your lava armor. Fire cannot burn it!',
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
  // Pienet saaret (i18n/en-isles.ts)
  ...ISLE_QUEST_TEXTS_EN,
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
  /** Pienen saaren nimi (suomeksi data/isles.ts). */
  isle: (isle: IsleDef): string => ISLE_NAMES_EN[isle.id] ?? isle.name,
  npc: (npc: NpcDef): string => npc.name,
  quest: (quest: QuestDef): QuestTexts => QUEST_TEXTS_EN[quest.id] ?? quest,
};
