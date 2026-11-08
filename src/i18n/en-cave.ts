// Spells and the Troll King's cave in English. Finnish: i18n/fi-cave.ts.
// Kommentit suomeksi: loitsut data/spells.ts, luola data/cave.ts.

export const EN_SPELLS = {
  fireball: 'Fireball',
  lightning: 'Lightning',
  'ice-arrow': 'Ice Arrow',
  healing: 'Healing',
};

export const EN_SPELL_BUTTONS = {
  fireball: 'FIREBALL',
  lightning: 'LIGHTNING',
  'ice-arrow': 'ICE ARROW',
  healing: 'HEAL',
};

export const EN_MAGIC = {
  spellsButton: 'SPELLS',
  chooseSpell: 'Which spell will you cast?',
  wait: (turns: number): string => `WAIT ${turns}`,
  spellStrike: (spell: string, enemy: string, damage: number): string =>
    `${spell}! ${enemy} lost ${damage}.`,
  freezeHit: (enemy: string, damage: number): string =>
    `Ice Arrow! ${enemy} lost ${damage} and froze!`,
  healed: (amount: number): string => `Healing! You got ${amount} health.`,
  frozen: (enemy: string): string => `${enemy} is frozen and cannot move!`,
  strikeInfo: (amount: number, wait: number): string => `Hits ${amount}, wait ${wait} turns`,
  healInfo: (amount: number, wait: number): string => `Heals ${amount}, wait ${wait} turns`,
  learned: (spell: string): string => `You learned ${spell}! In battle: ATTACK → SPELLS.`,
};

export const EN_CAVE = {
  button: 'CAVE',
  closed: 'A huge boulder blocks the cave.\nThe Troll King guards it...',
  opened: 'A rumble on the fells: the boulder rolled away from the cave!',
  title: "The Troll King's Cave",
  leave: 'LEAVE',
  pull: 'PULL SWORD',
  shop: "WITCH'S SHOP",
  swordReady: 'Excalibur is stuck in the stone. Can you pull it out?',
  swordLevel: (level: number): string =>
    `Excalibur is stuck in the stone. Only a level ${level} hero is strong enough to pull it.`,
  swordPulled: 'You pulled Excalibur from the stone! It is now in your hand.',
  swordTaken: 'The stone is empty. Excalibur is yours.',
  witchGreet: (name: string): string =>
    `${name}: Hee hee! You beat the Troll King. Want to learn some spells?`,
  shopTitle: (name: string): string => `${name} the Witch`,
  shopGreet: (name: string): string => `${name}: Spells and powers, my dear! What will it be?`,
  mystery: '???',
  comingSoon: 'Coming soon to the game!',
};

/** Luolan esineiden nimet englanniksi (data/cave-items.ts). */
export const CAVE_ITEM_TEXTS_EN: Readonly<
  Record<string, { readonly name: string; readonly description: string }>
> = {
  excalibur: { name: 'Excalibur', description: 'The legendary sword in the stone. The best!' },
  'spell-lightning': {
    name: 'Lightning Spell',
    description: 'Strike with lightning! Ignores armor.',
  },
  'spell-ice': { name: 'Ice Arrow Spell', description: 'Freezes the enemy for one turn.' },
  'spell-healing': { name: 'Healing Spell', description: 'Restores health during battle.' },
};
