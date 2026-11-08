import type { ItemDef } from './types';

// Ideaviestien palkinto (logic/like-reward.ts). Tykkäysmiekan saa pelaaja, jonka idea on
// saanut eniten tykkäyksiä (vähintään config/ideas.ts rewardMinLikes muilta pelaajilta).
// Vahva, mutta heikompi kuin Excalibur kokonaisuutena ja dev-miekka jokaisella arvolla:
// pelkkä hyökkäys 50, ei tarkkuutta eikä maagiaa. Hinta vain myyntiä varten: kukaan ei myy
// miekkaa, mutta kauppias ostaa sen puoleen hintaan kuten muutkin varusteet.
// Sprite: data/sprites-ideas.ts. Englanniksi: i18n/en-ideas.ts.

export const LIKE_SWORD_ID = 'like-sword';

export const IDEA_ITEMS: readonly ItemDef[] = [
  {
    id: LIKE_SWORD_ID,
    name: 'Tykkäysmiekka',
    description: 'Paras idea! Kaikki tykkäsivät.',
    kind: 'gear',
    sprite: LIKE_SWORD_ID,
    price: 6000,
    slot: 'hand',
    bonus: { attack: 50 },
  },
];
