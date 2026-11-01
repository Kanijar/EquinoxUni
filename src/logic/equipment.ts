import { ITEMS } from '../data';
import type { GearItemDef, GearSlot, GearStat, ItemDef, PlayerStats } from '../data/types';

// Varusteet: repussa olevan varusteen voi laittaa käyttöön, ja käytössä olevan voi ottaa pois.
// Jokaisessa paikassa (käsi, vartalo, kaula) on enintään yksi varuste. Käytössä olevat
// varusteet eivät ole repussa (inventory), vaan omassa paikassaan (Equipped).
// Varusteiden lisäykset lasketaan pelaajan arvoihin vain tässä tiedostossa (applyGear).

/** Käytössä olevat varusteet paikoittain: esineen tunniste, tai puuttuu/undefined = tyhjä. */
export type Equipped = Partial<Record<GearSlot, string | undefined>>;

/** Esineiden määrät tunnisteittain (GameState.inventory). */
export type Inventory = Record<string, number>;

export function isGear(item: ItemDef): item is GearItemDef {
  return item.kind === 'gear';
}

/** Varusteen tiedot, tai null, jos esine ei ole varuste tai sitä ei ole olemassa. */
export function findGear(id: string): GearItemDef | null {
  const item = ITEMS.find((entry) => entry.id === id);
  return item && isGear(item) ? item : null;
}

/** Kaikkien käytössä olevien varusteiden lisäykset yhteensä yhdelle arvolle. */
export function gearBonus(equipped: Equipped, stat: GearStat): number {
  return Object.values(equipped).reduce((sum, id) => {
    const gear = id === undefined ? null : findGear(id);
    return sum + (gear?.bonus[stat] ?? 0);
  }, 0);
}

/** Arvot, joihin on lisätty käytössä olevien varusteiden lisäykset. */
export function applyGear(stats: PlayerStats, equipped: Equipped): PlayerStats {
  return {
    ...stats,
    attack: stats.attack + gearBonus(equipped, 'attack'),
    defense: stats.defense + gearBonus(equipped, 'defense'),
    maxHp: stats.maxHp + gearBonus(equipped, 'maxHp'),
    critPercent: stats.critPercent + gearBonus(equipped, 'critPercent'),
    magic: stats.magic + gearBonus(equipped, 'magic'),
  };
}

/** Onko pelaajalla esine repussa tai käytössä. */
export function ownsItem(inventory: Inventory, equipped: Equipped, id: string): boolean {
  return (inventory[id] ?? 0) > 0 || Object.values(equipped).includes(id);
}

/**
 * Laittaa repussa olevan varusteen käyttöön. Jos paikassa oli jo varuste, se palaa reppuun.
 * Palauttaa false, jos esine ei ole varuste tai sitä ei ole repussa.
 */
export function equipItem(inventory: Inventory, equipped: Equipped, id: string): boolean {
  const gear = findGear(id);
  if (!gear || (inventory[id] ?? 0) <= 0) {
    return false;
  }
  unequipSlot(inventory, equipped, gear.slot);
  inventory[id] = (inventory[id] ?? 0) - 1;
  equipped[gear.slot] = id;
  return true;
}

/** Ottaa paikan varusteen pois ja laittaa sen reppuun. Palauttaa false, jos paikka oli tyhjä. */
export function unequipSlot(inventory: Inventory, equipped: Equipped, slot: GearSlot): boolean {
  const id = equipped[slot];
  if (id === undefined) {
    return false;
  }
  equipped[slot] = undefined;
  inventory[id] = (inventory[id] ?? 0) + 1;
  return true;
}

/** Repun esineet (määrä yli 0) esineiden listan järjestyksessä (data/items.ts). */
export function bagItems(
  inventory: Inventory,
): { readonly item: ItemDef; readonly count: number }[] {
  return ITEMS.filter((item) => (inventory[item.id] ?? 0) > 0).map((item) => ({
    item,
    count: inventory[item.id] ?? 0,
  }));
}
