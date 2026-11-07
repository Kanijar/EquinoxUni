// Fishing texts in English (TEXT.fishing). Same keys as i18n/fi-fishing.ts.

export const EN_FISHING = {
  button: 'FISH',
  reel: 'REEL',
  bite: 'REEL IN!',
  mark: '!',
  cast: (bait: string): string => `You cast the float. Bait: ${bait}.\nReel in when a fish bites!`,
  noBait: (merchant: string): string => `No bait! Buy worms from ${merchant} the merchant.`,
  early: 'Too early! The fish got scared.',
  escaped: 'Too late! The fish took the bait.',
  cancelled: 'You stopped fishing.',
  caught: (item: string): string => `You caught: ${item}!`,
  caughtGear: (item: string): string => `What a catch: ${item}!\nEquip it in your backpack.`,
  enemy: (enemy: string): string => `A ${enemy} took the bait and attacks!`,
  baitLeft: (bait: string, count: number): string => `${bait} left: ${count}.`,
  battleIntro: (enemy: string): string => `The ${enemy} leaps out of the water at you!`,
  baitChosen: (bait: string): string => `${bait} is now your bait.`,
  baitInUse: 'This is your bait now.',
  rodStats: (windowMs: number, rare: number): string =>
    `Reel time ${(windowMs / 1000).toFixed(1)} s, rare catches x${rare}`,
  rodWorse: 'You have a better rod.',
};
