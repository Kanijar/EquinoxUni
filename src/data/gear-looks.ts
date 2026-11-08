import type {
  ArmorLook,
  ArmorShape,
  CharmLook,
  GearLook,
  WeaponLook,
  WeaponShape,
} from './types-gear-look';

// Miltä kukin varuste näyttää sankarin päällä (kartalla, taistelussa ja repussa).
// Avain on esineen tunniste (data/items.ts ym.), ja värit on otettu esineen omasta kuvasta.
// Uusi varuste: lisää rivi tähän. Jos riviä ei ole, ulkonäkö arvataan esineen kuvan
// väreistä (logic/hero-gear.ts), joten uusikin varuste näkyy aina jotenkin.

const weapon = (shape: WeaponShape, blade: string, accent: string, handle: string): WeaponLook => ({
  slot: 'hand',
  shape,
  blade,
  accent,
  handle,
});

const armor = (shape: ArmorShape, main: string, trim: string): ArmorLook => ({
  slot: 'body',
  shape,
  main,
  trim,
});

const charm = (chain: string, gem: string): CharmLook => ({
  slot: 'neck',
  shape: 'pendant',
  chain,
  gem,
});

export const GEAR_LOOKS: Readonly<Record<string, GearLook>> = {
  // Kädessä
  club: weapon('club', '#7a5230', '#c9c9c9', '#a8763e'),
  knife: weapon('knife', '#a8b0bc', '#c08a4a', '#7a4a20'),
  'stone-hammer': weapon('hammer', '#8a8f99', '#6b707a', '#7a5230'),
  'dragon-sword': weapon('sword', '#e0303a', '#ffd23f', '#7a4a20'),
  'jussi-sword': weapon('sword', '#a8b0bc', '#e0b040', '#7a4a20'),
  'fire-staff': weapon('staff', '#ffd23f', '#ff7a1a', '#a8763e'),
  'iron-sword': weapon('sword', '#c9d2dc', '#c9a46a', '#7a5230'),
  'rune-axe': weapon('axe', '#c9d2dc', '#3fd0ff', '#7a5230'),
  'pirate-saber': weapon('saber', '#c8d0dc', '#d4a017', '#7a4a20'),
  'bone-sword': weapon('sword', '#e8e4d8', '#8a8070', '#4a3a2a'),
  'frost-axe': weapon('axe', '#a8d8f0', '#3fd0ff', '#4a3a2a'),
  'serpent-spear': weapon('trident', '#9fffe0', '#3fb0a0', '#1a6a6a'),
  // Peikkokuninkaan luolan kivestä (data/cave-items.ts): kirkas terä ja kultainen kahva.
  excalibur: weapon('sword', '#e8f4ff', '#3a7aff', '#ffd23f'),
  // Ideaviestien palkinto (data/idea-items.ts): vaaleanpunainen terä ja punainen sydän.
  'like-sword': weapon('sword', '#ff7ab8', '#e0303a', '#ffd23f'),
  // Vartalolla
  'robber-clothes': armor('clothes', '#3a3f4a', '#5a3a1a'),
  'king-cloak': armor('cloak', '#6a3a86', '#ffd23f'),
  'crab-armor': armor('plate', '#d8442c', '#a92e1c'),
  'lizard-armor': armor('scale', '#d8441e', '#ff8a3a'),
  'leather-vest': armor('vest', '#8a5a2b', '#e0b040'),
  'ketola-armor': armor('plate', '#a8b0bc', '#c0392b'),
  'lava-armor': armor('plate', '#3d3534', '#e8641e'),
  'chain-mail': armor('scale', '#c9d2dc', '#7a8494'),
  'steel-armor': armor('plate', '#c9d2dc', '#2e4a7a'),
  'fish-scale-armor': armor('scale', '#3fa0a0', '#a8f0e8'),
  'snake-vest': armor('vest', '#4fc04a', '#1f6a2a'),
  'ghost-cloak': armor('cloak', '#c8d8ec', '#9fffe0'),
  'crystal-armor': armor('plate', '#c8a0ff', '#8a4ad0'),
  'storm-cloak': armor('cloak', '#2a3a8a', '#ffe066'),
  // Kaulassa
  'tooth-necklace': charm('#8a5a2a', '#f4f0e0'),
  'bog-stone': charm('#5a4a2a', '#4f9a4a'),
  'wisp-charm': charm('#a8b0bc', '#4fd6b0'),
  'dragon-charm': charm('#ffd23f', '#e0303a'),
  'lucky-charm': charm('#c9a46a', '#3fbf5f'),
  'ruby-amulet': charm('#c9a46a', '#e0303a'),
  'moon-charm': charm('#c9d2dc', '#cfe8ff'),
  'pearl-necklace': charm('#f4f0ff', '#d0c8ff'),
  'compass-charm': charm('#d4a017', '#d0302a'),
  'shadow-amulet': charm('#5a5a6a', '#8a4ad0'),
  'snowflake-charm': charm('#c8d0dc', '#bfe6ff'),
  'storm-heart': charm('#c8d0dc', '#ffe066'),
};

/** Arvatun ulkonäön oletukset, kun varusteella ei ole riviä GEAR_LOOKSissa. */
export const GEAR_LOOK_FALLBACK = {
  weaponShape: 'sword' as WeaponShape,
  armorShape: 'plate' as ArmorShape,
  /** Aseen varsi (puu). */
  handle: '#7a5230',
  /** Väri, jos esineen kuvassa ei ole yhtään sopivaa väriä. */
  color: '#a8b0bc',
  /** Tätä tummempia värejä (ääriviivat) ei käytetä arvaamiseen (kirkkaus 0–255). */
  minBrightness: 48,
} as const;
