import type { GearSlot, ItemDef } from './types';

// Esineet. Parannusjuoma juodaan taistelussa tai repusta. Varusteet (kind: 'gear')
// laitetaan käyttöön repussa: yksi varuste kerrallaan kuhunkin paikkaan (käsi, vartalo, kaula).
// bonus lisätään pelaajan arvoihin, kun varuste on käytössä (logic/equipment.ts).
// Viholliset pudottavat varusteita (EnemyDef.drops, data/enemies.ts).
// Sprite: data/sprites-items.ts.

export const ITEMS: readonly ItemDef[] = [
  {
    id: 'potion',
    name: 'Parannusjuoma',
    description: 'Palauttaa 10 elämäpistettä.',
    kind: 'heal',
    sprite: 'potion',
    value: 10,
  },
  {
    // Tunturipeikon pudotus: raskas ase, paljon hyökkäystä.
    id: 'club',
    name: 'Peikon nuija',
    description: 'Raskas nuija. Kova isku!',
    kind: 'gear',
    sprite: 'club',
    slot: 'hand',
    bonus: { attack: 6 },
  },
  {
    // Ryöstäjän pudotus: kevyt ase, osuu heikkoon kohtaan (kriittinen osuma).
    id: 'knife',
    name: 'Puukko',
    description: 'Terävä ja kevyt. Osut tarkemmin.',
    kind: 'gear',
    sprite: 'knife',
    slot: 'hand',
    bonus: { critPercent: 8, attack: 1 },
  },
  {
    // Ryöstäjän pudotus: tummat vaatteet, joissa liikkuu ketterästi.
    id: 'robber-clothes',
    name: 'Ryöstäjän vaatteet',
    description: 'Ketterät vaatteet. Osut tarkemmin.',
    kind: 'gear',
    sprite: 'robber-clothes',
    slot: 'body',
    bonus: { critPercent: 6 },
  },
  {
    // Harmaasuden pudotus: suden hampaista tehty koru antaa suden sitkeyttä.
    id: 'tooth-necklace',
    name: 'Hammaskoru',
    description: 'Suden hampaista tehty koru. Suden sitkeys!',
    kind: 'gear',
    sprite: 'tooth-necklace',
    slot: 'neck',
    bonus: { defense: 2, maxHp: 5 },
  },
];

/** Varustepaikat repussa tässä järjestyksessä: käsi (ase), vartalo (vaatteet), kaula (koru). */
export const GEAR_SLOTS: readonly GearSlot[] = ['hand', 'body', 'neck'];
