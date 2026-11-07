import { ITEMS } from '../data';
import { GEAR_SLOTS } from '../data/items';
import { BURGER_SECRET } from '../data/rules';
import type { BurgerSecretRules, GearItemDef, GearSlot, GearStat } from '../data/types';
import { TEXT } from '../i18n/text';
import { equipItem, isGear, ownsItem } from './equipment';
import { playerStats, type GameState } from './game-state';

// Alkuruudun salainen burgeri (data/rules.ts BURGER_SECRET). Burgeri antaa sankarille
// jokaiseen varustepaikkaan parhaan varusteen käyttöön, Bugattin avaimet ja miljoona kultakolikkoa.
// Kokemus ja taso eivät muutu. Esinettä, joka sankarilla jo on (repussa tai käytössä),
// ei anneta toista kertaa, ja kolikot nostetaan miljoonaan vain, jos niitä on vähemmän.
// Siksi burgerin voi syödä monta kertaa ilman että reppu tai kukkaro kasvaa loputtomiin.

/** Mitä burgeri antoi: uudet esineet (tunnisteet) ja lisätyt kolikot. */
export interface BurgerGift {
  readonly items: readonly string[];
  readonly coins: number;
}

/** Varusteen pisteet: jokaisen arvon lisäys kerrottuna arvon painolla. */
export function gearScore(gear: GearItemDef, rules: BurgerSecretRules = BURGER_SECRET): number {
  return Object.entries(gear.bonus).reduce(
    (sum, [stat, value]) => sum + (value ?? 0) * rules.gearWeights[stat as GearStat],
    0,
  );
}

/** Paikan paras varuste pisteiden mukaan. Tasapisteillä voittaa listassa ensimmäinen. */
export function bestGear(
  slot: GearSlot,
  rules: BurgerSecretRules = BURGER_SECRET,
): GearItemDef | null {
  let best: GearItemDef | null = null;
  for (const item of ITEMS) {
    if (
      isGear(item) &&
      item.slot === slot &&
      (!best || gearScore(item, rules) > gearScore(best, rules))
    ) {
      best = item;
    }
  }
  return best;
}

/** Antaa esineen yhden kappaleen, jos sitä ei vielä ole. Palauttaa true, jos esine oli uusi. */
function giveOnce(state: GameState, id: string): boolean {
  if (ownsItem(state.inventory, state.equipped, id)) {
    return false;
  }
  state.inventory[id] = (state.inventory[id] ?? 0) + 1;
  return true;
}

/**
 * Syö burgerin: parhaat varusteet käyttöön ja lisäesineet reppuun. Aiemmin käytössä olleet
 * varusteet palaavat reppuun. Elämä kasvaa yhtä paljon kuin maksimielämä kasvoi.
 * Kolikot nostetaan rules.coins-määrään, jos niitä on vähemmän.
 */
export function eatBurger(state: GameState, rules: BurgerSecretRules = BURGER_SECRET): BurgerGift {
  const maxHpBefore = playerStats(state).maxHp;
  const gained: string[] = [];
  for (const slot of GEAR_SLOTS) {
    const gear = bestGear(slot, rules);
    if (!gear || state.equipped[slot] === gear.id) {
      continue;
    }
    if (giveOnce(state, gear.id)) {
      gained.push(gear.id);
    }
    equipItem(state.inventory, state.equipped, gear.id);
  }
  for (const id of rules.extraItems) {
    if (giveOnce(state, id)) {
      gained.push(id);
    }
  }
  const maxHpAfter = playerStats(state).maxHp;
  state.hp = Math.min(maxHpAfter, state.hp + Math.max(0, maxHpAfter - maxHpBefore));
  const coins = Math.max(0, rules.coins - state.coins);
  state.coins += coins;
  return { items: gained, coins };
}

/** Syö burgerin ja palauttaa kartalla näytettävän viestin. */
export function burgerNews(state: GameState, rules: BurgerSecretRules = BURGER_SECRET): string {
  const gift = eatBurger(state, rules);
  return gift.items.length > 0 || gift.coins > 0 ? TEXT.world.burgerGift : TEXT.world.burgerAgain;
}
