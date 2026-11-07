import type { FI_STAIRS } from './fi-stairs';

// Tulivuoren rappusten tekstit englanniksi (TEXT.stairs). Samat avaimet kuin i18n/fi-stairs.ts:ssä.

export const EN_STAIRS: typeof FI_STAIRS = {
  step: (count: number, needed: number): string =>
    `A stone step rose from the crater lava (${count}/${needed})!`,
  cry: '"Help! I am Ossi Ketola!" someone shouts.',
  complete: 'The stairs are ready! Walk into the crater to Ossi Ketola.',
};
