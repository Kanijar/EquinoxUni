import type { IsleDef } from '../data/types';
import { EN_CONTENT } from './en-content';
import type { FI_BOAT, FI_VEHICLE } from './fi-boat';

// Veneen ja pienten saarten tekstit englanniksi (TEXT.boat). Samat avaimet kuin i18n/fi-boat.ts:ssä.

export const EN_BOAT: typeof FI_BOAT = {
  board: 'SET SAIL',
  land: 'GO ASHORE',
  boarded: 'Off you go! Sail to the isles. Next to a shore: GO ASHORE.',
  landed: 'You went ashore.',
  isleFound: (isle: IsleDef, found: number, total: number): string =>
    `You found an isle: ${EN_CONTENT.isle(isle)} (${found}/${total})!\nRecommended level ${isle.level}+.`,
  isleLanding: (isle: IsleDef): string =>
    `You landed on ${EN_CONTENT.isle(isle)}. Recommended level ${isle.level}+.`,
  shopTitle: 'Boat Shop',
  shopGreet: (name: string): string =>
    `${name}: Ahoy! A boat takes you to four isles. They are dangerous: come at level 50!`,
};

export const EN_VEHICLE: typeof FI_VEHICLE = {
  button: 'BUGATTI',
  on: 'Vroom! Speed +80%!',
  off: 'Bugatti off. Walking again.',
};
