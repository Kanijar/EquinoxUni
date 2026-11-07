import { getItem } from '../data';

// Mikä parannusjuoma juodaan taistelun JUOMA-napista, kun juomia on monta kokoa
// (Parannusjuoma 10 ja kauppiaan Iso parannusjuoma 40). Juodaan pienin juoma, joka
// parantaa puuttuvan elämän kokonaan, jotta isoja ei tuhlata pieniin naarmuihin. Jos mikään
// ei riitä, juodaan isoin.

/** Paras parannusjuoma puuttuvalle elämälle, tai null, jos juomia ei ole. */
export function bestHealItem(
  inventory: Readonly<Record<string, number>>,
  missingHp: number,
): string | null {
  const heals = Object.entries(inventory)
    .filter(([, count]) => count > 0)
    .map(([id]) => getItem(id))
    .flatMap((item) => (item.kind === 'heal' ? [item] : []))
    .sort((a, b) => a.value - b.value);
  const enough = heals.find((item) => item.value >= missingHp);
  return (enough ?? heals.at(-1))?.id ?? null;
}
