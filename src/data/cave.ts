import type { CaveDef, ShopKeeperDef } from './types';

// Peikkokuninkaan luola alkusaaren luoteisilla tuntureilla, juuri siinä, missä Peikkokuningas
// (data/boss.ts) vartioi. Suuaukon tukkii iso kivi, kunnes Peikkokuningas on voitettu
// (GameState.bossDefeated). Sen jälkeen suuaukolla näkyy LUOLA-nappi, josta luola avautuu
// (scenes/cave-scene.ts). Luolassa:
// - Excalibur on juuttunut kiveen. Sen saa vetää kerran, kun taso riittää (logic/cave.ts).
// - Noita Nokkonen myy loitsukirjoja (data/cave-items.ts) ja voimakristalleja. Kauppa on sama
//   näkymä kuin kulkevalla kauppiaalla (scenes/shop-scene.ts).

/** Noita ja hänen kauppansa. Henkilön nimi on sama molemmilla kielillä. */
export const WITCH: ShopKeeperDef = {
  id: 'witch',
  name: 'Nokkonen',
  sprite: 'witch',
  stock: ['spell-lightning', 'spell-ice', 'spell-healing', 'power-crystal'],
  // Jarin toive: "???"-nappi, joka lupaa lisää loitsuja myöhemmin. Nappi ei vielä tee mitään.
  comingSoon: true,
};

export const CAVE: CaveDef = {
  // Kolme ruutua pohjoiseen Peikkokuninkaan paikasta (30, 40), lumisella rinteellä.
  x: 30,
  y: 37,
  witch: WITCH,
  sword: 'excalibur',
  // Excalibur on niin vahva, että se odottaa kivessä tasolle 50 asti (saarten tasot 50–90).
  swordMinLevel: 50,
  enterTiles: 1,
};
