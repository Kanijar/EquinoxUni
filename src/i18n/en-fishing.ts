// Fishing texts in English (TEXT.fishing). Same keys as i18n/fi-fishing.ts.

export const EN_FISHING = {
  button: 'FISH',
  reel: 'REEL',
  bite: 'REEL IN!',
  mark: '!',
  cast: 'You cast the float. Reel in when a fish bites!',
  noBait: (merchant: string): string => `No worms! Buy some from ${merchant} the merchant.`,
  early: 'Too early! The fish got scared.',
  escaped: 'Too late! The fish took the worm.',
  cancelled: 'You stopped fishing.',
  caught: (item: string): string => `You caught: ${item}!`,
  caughtGear: (item: string): string => `What a catch: ${item}!\nEquip it in your backpack.`,
  enemy: (enemy: string): string => `A ${enemy} took the bait and attacks!`,
  baitLeft: (count: number): string => `Worms left: ${count}.`,
  battleIntro: (enemy: string): string => `The ${enemy} leaps out of the water at you!`,
};
