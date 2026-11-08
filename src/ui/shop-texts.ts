import { getSpell } from '../data';
import { BOAT_SHOP } from '../data/boat-shop';
import { WITCH } from '../data/cave';
import type { ItemDef, ShopKeeperDef, SpellId } from '../data/types';
import { TEXT } from '../i18n/text';
import { spellPower } from '../logic/magic';
import { buyCount, type ShopMode } from '../logic/shop';
import { findRod } from '../logic/fishing-gear';

// Kaupan tekstit kauppiaan ja tavaran mukaan (scenes/shop-scene.ts): otsikko ja tervehdys
// (kulkeva kauppias, venekauppa tai Noita), keltainen lisätieto ja ostoviesti.

/** Kaupan otsikko. */
export function keeperTitle(keeper: ShopKeeperDef): string {
  if (keeper.id === BOAT_SHOP.id) {
    return TEXT.boat.shopTitle;
  }
  return keeper.id === WITCH.id ? TEXT.cave.shopTitle(keeper.name) : TEXT.shop.title(keeper.name);
}

/** Kauppiaan puhe: venekauppias kertoo saarista ja Noita loitsuista ostopuolella. */
export function keeperGreeting(keeper: ShopKeeperDef, mode: ShopMode): string {
  const name = keeper.name;
  if (mode === 'sell') {
    return TEXT.shop.greetSell(name);
  }
  if (keeper.id === BOAT_SHOP.id) {
    return TEXT.boat.shopGreet(name);
  }
  return keeper.id === WITCH.id ? TEXT.cave.shopGreet(name) : TEXT.shop.greetBuy(name);
}

/** Loitsun osuma (tai parannus) sankarin tulivoimalla ja odotus vuoroina. */
export function spellInfo(spellId: SpellId, magic: number): string {
  const spell = getSpell(spellId);
  const amount = spellPower(spell, magic);
  const wait = spell.cooldownTurns ?? 0;
  return spell.effect === 'heal'
    ? TEXT.magic.healInfo(amount, wait)
    : TEXT.magic.strikeInfo(amount, wait);
}

/**
 * Keltainen lisätieto: varusteen lisäykset, loitsun teho, erän koko (madot), ongen tiedot tai
 * voiman kykypisteet.
 */
export function itemDetail(item: ItemDef, mode: ShopMode, magic: number): string {
  if (item.kind === 'gear') {
    return TEXT.backpack.bonus(item.bonus);
  }
  if (item.kind === 'spell') {
    return spellInfo(item.spell, magic);
  }
  if (mode === 'buy' && buyCount(item) > 1) {
    return TEXT.shop.pack(buyCount(item));
  }
  const rod = findRod(item.id);
  if (rod) {
    return TEXT.fishing.rodStats(rod.biteWindowMs, rod.rareMultiplier);
  }
  return item.kind === 'power' ? TEXT.shop.powerBonus(item.skillPoints) : '';
}

/** Viesti onnistuneesta ostosta. */
export function boughtText(item: ItemDef): string {
  if (item.kind === 'power') {
    return TEXT.shop.boughtPower;
  }
  if (item.kind === 'spell') {
    return TEXT.magic.learned(TEXT.spells[item.spell]);
  }
  const name = TEXT.names.item(item);
  const count = buyCount(item);
  return count > 1 ? TEXT.shop.boughtMany(name, count) : TEXT.shop.bought(name);
}
