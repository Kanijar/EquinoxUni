import type { CoinRules, MerchantDef, ShopRules } from './types';

// Kulkeva kauppias Kaapo. Hän kävelee teitä pitkin paikkakunnasta toiseen ja pysähtyy
// jokaiseen hetkeksi. Kun sankari kävelee hänen viereensä, kauppa aukeaa KAUPPA-napista
// tai Kaapoa napauttamalla. Kaapolta voi ostaa aseita, varusteita, juomia, voimia ja
// kalastustarvikkeita (onki, madot) ja myydä hänelle repun tavaroita (myös kalat).
// Säännöt: logic/shop.ts, kulku kartalla: logic/merchant-route.ts.

export const MERCHANT: MerchantDef = {
  id: 'merchant',
  name: 'Kaapo',
  sprite: 'merchant',
  // Kierros lounaan pelloilla ja keskisaaren metsän reunalla, joten hänet tapaa alkupelissä.
  // Kierros kestää noin kolme minuuttia (kävely + pysähdykset).
  route: ['kotiranta', 'peltola', 'myllykyla', 'havula', 'kuusela'],
  speed: 28,
  stopMs: 15_000,
  talkRangePx: 30,
  stock: [
    'potion',
    'big-potion',
    // Kalastus (data/fishing.ts): ensimmäisellä sivulla, jotta ne löytyvät helposti.
    'fishing-rod',
    'worm',
    'power-crystal',
    'iron-sword',
    'chain-mail',
    'ruby-amulet',
    'rune-axe',
    'steel-armor',
    'moon-charm',
  ],
};

/** Kauppias ostaa tavarat puoleen hintaan (esim. Peikon nuija 60 → 30 kolikkoa). */
export const SHOP_RULES: ShopRules = {
  sellFactor: 0.5,
};

/**
 * Kolikot voitosta: puolet vihollisen KP:stä ±25 %. Esimerkkejä: lima noin 3, susi 9,
 * tunturipeikko 17, kalliojätti 80, lohikäärme 350 kolikkoa.
 */
export const COIN_RULES: CoinRules = {
  perXp: 0.5,
  variance: 0.25,
};
