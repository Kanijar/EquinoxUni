import type { IsleDef } from '../data/types';
import { EN_CONTENT } from './en-content';
import type { FI_BOAT, FI_VEHICLE } from './fi-boat';

// Veneen ja pienten saarten tekstit englanniksi (TEXT.boat). Samat avaimet kuin i18n/fi-boat.ts:ssä.

export const EN_BOAT: typeof FI_BOAT = {
  board: 'SET SAIL',
  land: 'GO ASHORE',
  boarded: (boat: string): string => `${boat} afloat! Next to a shore: GO ASHORE.`,
  fishAtSea: 'You can fish from here: FISH or F.',
  landed: 'You went ashore.',
  isleFound: (isle: IsleDef, found: number, total: number): string =>
    `You found an isle: ${EN_CONTENT.isle(isle)} (${found}/${total})!\nRecommended level ${isle.level}+.`,
  isleLanding: (isle: IsleDef): string =>
    `You landed on ${EN_CONTENT.isle(isle)}. Recommended level ${isle.level}+.`,
  shopTitle: 'Boat Shop',
  shopGreet: (name: string): string =>
    `${name}: Ahoy! The faster the boat, the sooner you reach the isles. They are dangerous: come at level 50!`,
  speedInfo: (multiplier: number, canFish: boolean): string =>
    `Speed at sea x${multiplier}${canFish ? ', fishing allowed' : ''}`,
};

export const EN_VEHICLE: typeof FI_VEHICLE = {
  button: 'BUGATTI',
  on: 'Vroom! Speed +80%!',
  off: 'Bugatti off. Walking again.',
};
