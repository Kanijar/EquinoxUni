import type { ItemDef } from './types';

// Kulkevan kauppiaan omat tavarat (data/merchant.ts myy nämä ja osan muista esineistä).
// Näitä ei pudota yksikään vihollinen: ne saa vain ostamalla kolikoilla.
// Hinnat: halvat aseet ja varusteet ovat alkupelin tasoa (muutaman kymmenen voiton
// kolikot), kalliit vastaavat kalliojätin ja tuliliskon pudotuksia.
// Sprite: data/sprites-merchant.ts. Englanninkieliset nimet: i18n/en-content.ts.

export const MERCHANT_ITEMS: readonly ItemDef[] = [
  {
    // Korkeilla tasoilla tavallinen juoma (10) on pieni, tämä auttaa enemmän.
    id: 'big-potion',
    name: 'Iso parannusjuoma',
    description: 'Palauttaa 40 elämäpistettä.',
    kind: 'heal',
    sprite: 'big-potion',
    price: 45,
    value: 40,
  },
  {
    // Voima: antaa heti kykypisteen. Hinta nousee joka ostolla (priceStep).
    id: 'power-crystal',
    name: 'Voimakristalli',
    description: 'Antaa heti yhden kykypisteen!',
    kind: 'power',
    sprite: 'power-crystal',
    price: 250,
    priceStep: 50,
    skillPoints: 1,
  },
  {
    id: 'iron-sword',
    name: 'Rautamiekka',
    description: 'Tukeva miekka matkalaiselle.',
    kind: 'gear',
    sprite: 'iron-sword',
    price: 80,
    slot: 'hand',
    bonus: { attack: 5 },
  },
  {
    id: 'chain-mail',
    name: 'Rengaspaita',
    description: 'Rautarenkaista punottu paita.',
    kind: 'gear',
    sprite: 'chain-mail',
    price: 90,
    slot: 'body',
    bonus: { defense: 3, maxHp: 8 },
  },
  {
    // Maagiaan panostavan pelaajan koru alkupeliin.
    id: 'ruby-amulet',
    name: 'Rubiiniamuletti',
    description: 'Hehkuva kivi. Tulipallo vahvistuu!',
    kind: 'gear',
    sprite: 'ruby-amulet',
    price: 100,
    slot: 'neck',
    bonus: { magic: 2, maxHp: 5 },
  },
  {
    // Vähän parempi kuin Kalliojätin Kivivasara, mutta maksaa paljon.
    id: 'rune-axe',
    name: 'Riimukirves',
    description: 'Riimut hehkuvat. Iskee kovaa ja tarkasti!',
    kind: 'gear',
    sprite: 'rune-axe',
    price: 900,
    slot: 'hand',
    bonus: { attack: 14, critPercent: 4 },
  },
  {
    id: 'steel-armor',
    name: 'Teräshaarniska',
    description: 'Kiiltävä haarniska. Kestää paljon!',
    kind: 'gear',
    sprite: 'steel-armor',
    price: 950,
    slot: 'body',
    bonus: { defense: 6, maxHp: 25 },
  },
  {
    id: 'moon-charm',
    name: 'Kuukivikoru',
    description: 'Kuun hopea suojaa ja tarkentaa iskut.',
    kind: 'gear',
    sprite: 'moon-charm',
    price: 850,
    slot: 'neck',
    bonus: { critPercent: 6, defense: 3, maxHp: 15 },
  },
];
