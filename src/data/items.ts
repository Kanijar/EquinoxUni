import type { ItemDef } from './types';

export const ITEMS: readonly ItemDef[] = [
  {
    id: 'potion',
    name: 'Parannusjuoma',
    description: 'Palauttaa 10 elämäpistettä.',
    kind: 'heal',
    sprite: 'potion',
    value: 10,
  },
];
