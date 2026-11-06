import { ITEMS } from '../data';
import type { ItemDef, VehicleItemDef } from '../data/types';

// Kulkuneuvot kartalla (esim. Bugattin avaimet, Jussi Ketolan viimeisen tehtävän palkinto).
// Kun kulkuneuvo on repussa, sen voi kytkeä päälle ja pois (E-näppäin tai BUGATTI-nappi).
// Päällä ollessaan sankari kulkee nopeammin (VehicleItemDef.speedMultiplier). Kerroin
// kerrotaan maaston kertoimella, joten metsä hidastaa autoakin (logic/terrain-speed.ts).
// Taisteluun kulkuneuvo ei vaikuta.

/** Tämän verran tilaa kulkuneuvo tarvitsee: repun esineet ja onko auto päällä. */
export interface DriverState {
  readonly inventory: Readonly<Record<string, number>>;
  driving: boolean;
}

export function isVehicle(item: ItemDef): item is VehicleItemDef {
  return item.kind === 'vehicle';
}

/** Repussa oleva kulkuneuvo, tai null, jos pelaajalla ei ole sellaista. */
export function ownedVehicle(state: DriverState): VehicleItemDef | null {
  const vehicles = ITEMS.filter(isVehicle);
  return vehicles.find((item) => (state.inventory[item.id] ?? 0) > 0) ?? null;
}

/** Ajaako sankari nyt (kulkuneuvo on päällä ja se on yhä repussa). */
export function isDriving(state: DriverState): boolean {
  return state.driving && ownedVehicle(state) !== null;
}

/**
 * Kytkee kulkuneuvon päälle tai pois. Palauttaa uuden tilan (true = päällä),
 * tai null, jos pelaajalla ei ole kulkuneuvoa (silloin mikään ei muutu).
 */
export function toggleDriving(state: DriverState): boolean | null {
  if (ownedVehicle(state) === null) {
    return null;
  }
  state.driving = !isDriving(state);
  return state.driving;
}

/** Nopeuskerroin kulkuneuvosta: päällä esim. 1,8, muuten 1. */
export function vehicleSpeedFactor(state: DriverState): number {
  const vehicle = ownedVehicle(state);
  return vehicle && state.driving ? vehicle.speedMultiplier : 1;
}
