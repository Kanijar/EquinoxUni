import type { QuestTexts } from './en-content';

// Pienten saarten (data/isles.ts) nimet ja sisältö englanniksi: saaret, viholliset,
// esineet ja tehtävät samoilla tunnisteilla kuin data-tiedostoissa. Kootaan i18n/en-content.ts:ään.

/** Saarten nimet englanniksi tunnisteen (IsleDef.id) mukaan. */
export const ISLE_NAMES_EN: Readonly<Record<string, string>> = {
  palm: 'Palm Isle',
  mist: 'Mist Isle',
  frost: 'Frost Isle',
  storm: 'Storm Isle',
};

/** Saarten vihollisten nimet englanniksi (data/isle-enemies.ts). */
export const ISLE_ENEMY_NAMES_EN: Readonly<Record<string, string>> = {
  pirate: 'Pirate',
  'jungle-snake': 'Jungle Snake',
  skeleton: 'Skeleton Warrior',
  ghost: 'Mist Ghost',
  'ice-golem': 'Ice Golem',
  'crystal-spider': 'Crystal Spider',
  thunderbird: 'Thunderbird',
  'sea-serpent': 'Sea Serpent',
};

/** Saarten esineet englanniksi (data/isle-items.ts). */
export const ISLE_ITEM_TEXTS_EN: Readonly<
  Record<string, { readonly name: string; readonly description: string }>
> = {
  // Venekaupan veneet (data/boat-items.ts).
  rowboat: { name: 'Rowboat', description: 'Really slow, but cheap. Off to the isles!' },
  sailboat: { name: 'Sailboat', description: 'The wind makes it a bit faster than rowing.' },
  motorboat: { name: 'Motorboat', description: 'Vroom! The second fastest boat.' },
  'luxury-boat': { name: 'Luxury Yacht', description: 'Really fast. You can fish at sea!' },
  'pirate-saber': {
    name: 'Pirate Saber',
    description: 'Curved and sharp. You hit more accurately!',
  },
  'snake-vest': { name: 'Snakeskin Vest', description: 'Jungle snake skin. Light and tough.' },
  'map-piece': {
    name: 'Treasure Map Piece',
    description: 'A torn map. Take it to Kalle Kompassi.',
  },
  'compass-charm': { name: 'Compass Charm', description: 'Always points your blow the right way.' },
  'bone-sword': { name: 'Bone Sword', description: 'An old warrior’s sword. Hits hard!' },
  'ghost-cloak': { name: 'Ghost Cloak', description: 'Woven from mist. Protects, boosts fire.' },
  'fog-lantern': { name: 'Fog Lantern', description: 'It glows blue. Take it to Veera Varjo.' },
  'shadow-amulet': { name: 'Shadow Amulet', description: 'Power of shadows: toughness and fire.' },
  'frost-axe': { name: 'Frost Axe', description: 'Forged from permafrost. A freezing blow!' },
  'crystal-armor': { name: 'Crystal Armor', description: 'It sparkles and takes hard blows.' },
  'frost-crystal': {
    name: 'Permafrost Crystal',
    description: 'Never melts. Take it to Pekka Pakkanen.',
  },
  'snowflake-charm': {
    name: 'Snowflake Charm',
    description: 'Power of frost: toughness and accuracy.',
  },
  'storm-cloak': { name: 'Thunder Cloak', description: 'Lightning crackles. Best armor!' },
  'serpent-spear': {
    name: 'Sea Serpent Spear',
    description: 'Made from a serpent’s fang. Best weapon!',
  },
  'storm-heart': { name: 'Storm Heart', description: 'The heart of thunder. Best charm!' },
};

/** Saarten tehtävät englanniksi (data/isle-quests.ts). */
export const ISLE_QUEST_TEXTS_EN: Readonly<Record<string, QuestTexts>> = {
  'pirate-raid': {
    title: 'Pirate Raid',
    story: 'Pirates are stealing our coconuts! Defeat three pirates, captain!',
    thanks: 'Ahoy, hero! The village thanks you. Take these potions for the voyage.',
  },
  'treasure-map': {
    title: 'The Treasure Map',
    story: 'The pirates tore my treasure map to pieces. Bring me three pieces back!',
    thanks: 'The map is whole again! The best part of the treasure is yours: a Compass Charm.',
  },
  'skeleton-night': {
    title: 'Night of the Skeletons',
    story: 'At night skeleton warriors march past the village. Defeat four skeletons!',
    thanks: 'Now we can sleep in peace. Take some potions, you need them in the mist.',
  },
  'fog-lanterns': {
    title: 'Fog Lanterns',
    story:
      'Mist ghosts stole the village lanterns. Bring three fog lanterns and the mist will lift!',
    thanks: 'The light is back in Sumula! This Shadow Amulet is yours now.',
  },
  'golem-thaw': {
    title: 'Ice Golems',
    story: 'Ice golems stomp the fishermen’s ice holes shut. Defeat three golems!',
    thanks: 'The ice holes are open again! Take some potions, it is cold here.',
  },
  'frost-crystals': {
    title: 'Permafrost Crystals',
    story: 'Crystal spiders hide permafrost crystals. Bring me three crystals!',
    thanks: 'Wonderful crystals! I made you a Snowflake Charm out of them.',
  },
  'thunder-birds': {
    title: 'Thunderbirds',
    story: 'Thunderbirds strike lightning on our roofs. Defeat three thunderbirds!',
    thanks: 'The sky is calm! Take some potions, the worst is still ahead.',
  },
  'sea-serpent': {
    title: 'The Sea Serpent’s Lair',
    story: 'The Sea Serpent stirs up storms from the bottom of the bay. Defeat it, if you dare!',
    thanks: 'Unbelievable, the storm is over! Take the Storm Heart, hero of the isles.',
  },
};
