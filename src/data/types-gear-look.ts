// Varusteiden ulkonäkö sankarin päällä (data/gear-looks.ts, data/gear-shapes.ts).
// Sankarin sprite on 16 × 16 pikseliä, ja varusteet piirretään sen päälle
// (logic/hero-gear.ts): ensin vartalon varuste, sitten koru ja viimeisenä ase kädessä.

/** Aseen muoto kädessä. Uusi muoto: lisää tähän ja kuvio WEAPON_SHAPES-listaan (data/gear-shapes.ts). */
export type WeaponShape =
  'sword' | 'saber' | 'knife' | 'axe' | 'club' | 'hammer' | 'staff' | 'spear' | 'trident';

/** Vartalon varusteen muoto: vaatteet, liivi, haarniska, suomupanssari tai viitta. */
export type ArmorShape = 'clothes' | 'vest' | 'plate' | 'scale' | 'cloak';

/** Korun muoto kaulassa. */
export type CharmShape = 'pendant';

/** Ase kädessä: terä (tai nuijan pää), koriste (kahva-suojus, liekki) ja varsi. */
export interface WeaponLook {
  readonly slot: 'hand';
  readonly shape: WeaponShape;
  readonly blade: string;
  readonly accent: string;
  readonly handle: string;
}

/** Vartalon varuste: pääväri ja reunus (olkapäät, vyö, kaulus). Peittää paidan. */
export interface ArmorLook {
  readonly slot: 'body';
  readonly shape: ArmorShape;
  readonly main: string;
  readonly trim: string;
}

/** Koru: ketju ja riipus. */
export interface CharmLook {
  readonly slot: 'neck';
  readonly shape: CharmShape;
  readonly chain: string;
  readonly gem: string;
}

export type GearLook = WeaponLook | ArmorLook | CharmLook;

/**
 * Kuvio, joka piirretään sankarin päälle. Rivit ovat 16 merkkiä leveitä ja alkavat riviltä
 * top. '.' = sankarin oma pikseli jää näkyviin. Kirjaimet (logic/hero-gear.ts):
 * ase W terä, G koriste, R varsi; vartalo A pääväri, T reunus; koru N ketju, P riipus.
 */
export interface GearShape {
  readonly top: number;
  readonly rows: readonly string[];
}
