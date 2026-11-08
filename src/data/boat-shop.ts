import type { TownShopDef } from './types';

// Venesataman venekauppa Kotirannan etelärannalla. Veneveistäjä Veikko myy neljää venettä
// (data/boat-items.ts: soutuvene, purjevene, moottorivene ja luksusvene), joilla pääsee
// pienille saarille (data/isles.ts), ja juomia pitkälle matkalle. Kauppa aukeaa
// KAUPPA-napista, kun sankari on Venesatamassa (systems/boat-dock.ts), samanlaisena kuin
// kulkevan kauppiaan kauppa (scenes/shop-scene.ts, säännöt logic/shop.ts).

export const BOAT_SHOP: TownShopDef = {
  id: 'boat-shop',
  name: 'Veikko',
  sprite: 'veikko',
  town: 'venesatama',
  stock: ['rowboat', 'sailboat', 'motorboat', 'luxury-boat', 'big-potion', 'potion'],
};
