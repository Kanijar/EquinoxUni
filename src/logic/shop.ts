import { getItem } from '../data';
import { MERCHANT, SHOP_RULES } from '../data/merchant';
import type { ItemDef } from '../data/types';
import { bagItems, findGear, ownsItem } from './equipment';
import type { GameState } from './game-state';

// Kulkevan kauppiaan kauppa: tavaroita ostetaan kolikoilla ja repun tavaroita myydään
// kauppiaalle. Hinta on esineen price (data/items.ts), ja kauppias ostaa esineen
// pienemmällä hinnalla (SHOP_RULES.sellFactor). Voima (esim. Voimakristalli) otetaan käyttöön
// heti ostaessa, eikä se mene reppuun. Varustetta, joka pelaajalla jo on, ei osteta toista kertaa.
// Käytössä olevaa varustetta ei voi myydä: se pitää ensin ottaa pois repussa.

/** Miksi esinettä ei voi ostaa: kolikot eivät riitä tai varuste on jo pelaajalla. */
export type BuyBlock = 'noMoney' | 'owned';

/** Kauppiaan tavarat järjestyksessä (MERCHANT.stock). */
export function shopStock(): ItemDef[] {
  return MERCHANT.stock.map(getItem);
}

/**
 * Ostohinta kolikkoina. Voiman hinta nousee jokaisesta jo ostetusta voimasta.
 * null = esinettä ei voi ostaa (sillä ei ole hintaa).
 */
export function buyPrice(state: GameState, item: ItemDef): number | null {
  if (item.kind === 'power') {
    const bought = Math.floor(state.bonusSkillPoints / item.skillPoints);
    return item.price + bought * item.priceStep;
  }
  return item.price ?? null;
}

/** Myyntihinta kolikkoina (vähintään 1), tai null, jos kauppias ei osta esinettä. */
export function sellPrice(item: ItemDef): number | null {
  if (item.price === undefined || item.kind === 'power') {
    return null;
  }
  return Math.max(1, Math.floor(item.price * SHOP_RULES.sellFactor));
}

/** Miksi esinettä ei voi ostaa nyt, tai null, kun ostaminen onnistuu. */
export function buyBlock(state: GameState, itemId: string): BuyBlock | null {
  const item = getItem(itemId);
  if (findGear(itemId) && ownsItem(state.inventory, state.equipped, itemId)) {
    return 'owned';
  }
  const price = buyPrice(state, item);
  return price === null || state.coins < price ? 'noMoney' : null;
}

/** Ostaa esineen: kolikot vähenevät ja esine menee reppuun (voima käyttöön heti). */
export function buyItem(state: GameState, itemId: string): boolean {
  const item = getItem(itemId);
  const price = buyPrice(state, item);
  if (price === null || buyBlock(state, itemId) !== null) {
    return false;
  }
  state.coins -= price;
  if (item.kind === 'power') {
    state.bonusSkillPoints += item.skillPoints;
  } else {
    state.inventory[itemId] = (state.inventory[itemId] ?? 0) + 1;
  }
  return true;
}

/** Voiko repun esineen myydä: sitä on repussa ja kauppias ostaa sen. */
export function canSell(state: GameState, itemId: string): boolean {
  return (state.inventory[itemId] ?? 0) > 0 && sellPrice(getItem(itemId)) !== null;
}

/** Myy yhden esineen repusta. Palauttaa saadut kolikot (0, jos myyminen ei onnistunut). */
export function sellItem(state: GameState, itemId: string): number {
  const price = sellPrice(getItem(itemId));
  if (price === null || !canSell(state, itemId)) {
    return 0;
  }
  state.inventory[itemId] = (state.inventory[itemId] ?? 0) - 1;
  state.coins += price;
  return price;
}

/** Kaupan puoli: OSTA (kauppiaan tavarat) tai MYY (repun tavarat). */
export type ShopMode = 'buy' | 'sell';

/** Kaupan ruudukon esine: myyntipuolella määrä repussa, ostopuolella 0. */
export interface ShopEntry {
  readonly item: ItemDef;
  readonly count: number;
}

/** Kaupan ruudukon esineet järjestyksessä. */
export function shopEntries(state: GameState, mode: ShopMode): ShopEntry[] {
  if (mode === 'buy') {
    return shopStock().map((item) => ({ item, count: 0 }));
  }
  return bagItems(state.inventory);
}

/** Valitun esineen kauppa: hinta ja miksi kauppa ei onnistu (null = onnistuu). */
export interface ShopOffer {
  readonly price: number | null;
  readonly block: BuyBlock | 'notBought' | null;
}

export function shopOffer(state: GameState, mode: ShopMode, itemId: string): ShopOffer {
  const item = getItem(itemId);
  if (mode === 'buy') {
    return { price: buyPrice(state, item), block: buyBlock(state, itemId) };
  }
  const price = sellPrice(item);
  return { price, block: price === null ? 'notBought' : null };
}
