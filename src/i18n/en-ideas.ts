import type { IdeaResult } from '../logic/ideas';
import type { FI_IDEAS } from './fi-ideas';

// Ideaviestien tekstit englanniksi. Samat avaimet kuin i18n/fi-ideas.ts:ssä.

const RESULTS: Readonly<Record<IdeaResult, string>> = {
  ok: 'Thanks! Message sent.',
  empty: 'Write something first.',
  tooLong: 'The message is too long.',
  blocked: 'The message has a word that is not allowed.\nPlease be nice.',
  contact:
    'The message seems to have contact details.\nDo not share numbers, addresses or usernames.',
  tooFast: 'Wait a moment before the next message.',
  gone: 'The idea has been removed.',
  full: 'This idea cannot take more comments.',
  own: 'You cannot like your own idea.',
  notBest: 'Your idea is no longer the best.',
  claimed: 'You have already claimed the Like Sword.',
  error: 'No connection. Try again later.',
};

export const EN_IDEAS: typeof FI_IDEAS = {
  menuButton: 'IDEAS',
  title: 'Ideas',
  back: 'BACK',
  sortNew: 'NEWEST',
  sortTop: 'MOST LIKED',
  reminder: 'Everything is anonymous. Do not write your name or other personal details.',
  newIdea: 'NEW IDEA',
  comment: 'COMMENT',
  send: 'SEND',
  cancel: 'CANCEL',
  ideaTitle: (id: number): string => `Idea #${id}`,
  writeIdea: 'New idea',
  writeComment: 'Comment',
  placeholderIdea: 'What could be added to the game?',
  placeholderComment: 'What do you think of the idea?',
  writeReminder:
    'Everyone sees the message without a name. Do not write your real name, address, ' +
    'phone number, school or other personal details. Be nice.',
  rewardInfo: (min: number): string =>
    `The author of the most liked idea gets the Like Sword! (at least ${min} likes from others)`,
  counter: (used: number, max: number): string => `${used}/${max}`,
  number: (id: number): string => `#${id}`,
  best: '★',
  mine: 'YOURS',
  /** Avatun idean kommenttien otsikko ja yksi kommentti. */
  commentsTitle: (count: number): string => `COMMENTS (${count})`,
  commentRow: (id: number, text: string): string => `#${id}  ${text}`,
  loading: 'Loading ideas...',
  empty: 'No ideas yet.\nWrite the first one!',
  noComments: 'No comments yet.',
  offline: 'Could not load the ideas.\nTry again later.',
  disabled: 'Ideas are not available yet.',
  sending: 'Sending...',
  results: RESULTS,
  claim: 'CLAIM SWORD',
  claimedNow:
    'The Like Sword is yours!\nIt appears in your backpack when you start or load a game.',
  delivered: 'The Like Sword appeared in your backpack!',
};

/** Ideaviestien palkinnon nimi englanniksi (data/idea-items.ts). */
export const IDEA_ITEM_TEXTS_EN: Readonly<
  Record<string, { readonly name: string; readonly description: string }>
> = {
  'like-sword': { name: 'Like Sword', description: 'The best idea! Everyone liked it.' },
};
