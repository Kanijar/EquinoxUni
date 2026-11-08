import type { FI_HOUSE } from './fi-house';

// Sankarin talon ja 10 parhaan listan tekstit englanniksi. Samat avaimet kuin i18n/fi-house.ts:ssä.

export const EN_HOUSE: typeof FI_HOUSE = {
  mapLabel: 'Your house',
  button: 'HOUSE',
  title: 'Your house',
  leave: 'LEAVE',
  listTitle: 'TOP 10 PLAYERS',
  rowName: (rank: number, name: string): string => `${rank}. ${name}`,
  rowLevel: (level: number): string => `Level ${level}`,
  rowXp: (xp: number): string => `${xp} XP`,
  loading: 'Loading the list...',
  empty: 'The list is still empty.',
  offline: 'Could not load the list.\nTry again later.',
  disabled: 'The list is not available yet.',
  yourRank: (rank: number): string => `You are number ${rank}!`,
  best: 'You are the best player in the game!',
  submit: 'ADD MY SCORE',
  privacy: 'Your nickname and XP are shown on the list to every player. Do not use your real name.',
};
