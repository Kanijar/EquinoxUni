import { DEFAULT_LOOK, HERO_LOOKS } from '../data/hero-looks';
import { PLAYER } from '../data/player';
import type {
  EyeColor,
  HeroLook,
  HeroLookOptions,
  LookColorPart,
  LookPart,
  SpriteDef,
} from '../data/types';
import type { Rng } from './battle';

// Sankarin ulkonäkö: pelaaja valitsee uuden pelin alussa ihon, hiukset ja vaatteiden värit
// (data/hero-looks.ts). Valinnat ovat järjestysnumeroita, ja niistä kootaan sankarin sprite
// kartalle, taisteluun ja voittoruutuun. Phaser-tekstuuri tehdään systems/hero-texture.ts:ssä.

/** Sankarin nimi ja ulkonäkö pelin tilassa (logic/game-state.ts). */
export interface HeroAppearance {
  /** Pelaajan kirjoittama nimi. Tyhjä = oletusnimi valitulla kielellä (TEXT.names.player). */
  name: string;
  look: HeroLook;
  /** Sankarin silmien väri (data/player.ts eyeColors). Alkuruudun lima muuttaa sen. */
  eyeColor: EyeColor;
}

/** Uuden pelin sankari: ei omaa nimeä, oletusulkonäkö. */
export function newAppearance(): HeroAppearance {
  return { name: '', look: DEFAULT_LOOK, eyeColor: PLAYER.eyeColor };
}

/** Montako vaihtoehtoa osassa on. */
export function lookChoices(part: LookPart, options: HeroLookOptions = HERO_LOOKS): number {
  return part === 'hairStyle' ? options.hairStyles.length : options.colors[part].length;
}

/** Seuraava (1) tai edellinen (-1) vaihtoehto. Viimeisestä eteenpäin pääsee ensimmäiseen. */
export function stepLook(look: HeroLook, part: LookPart, direction: 1 | -1): HeroLook {
  const count = lookChoices(part);
  return { ...look, [part]: (look[part] + direction + count) % count };
}

/** Arvottu ulkonäkö (ARVO-nappi). */
export function randomLook(rng: Rng = Math.random): HeroLook {
  const pick = (part: LookPart): number => Math.floor(rng() * lookChoices(part));
  return {
    skin: pick('skin'),
    hairStyle: pick('hairStyle'),
    hairColor: pick('hairColor'),
    shirt: pick('shirt'),
    pants: pick('pants'),
  };
}

/** Tallennuksen ulkonäkö. Puuttuva tai virheellinen osa = oletusvaihtoehto. */
export function readLook(value: unknown): HeroLook {
  const raw = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
  const read = (part: LookPart): number => {
    const choice = raw[part];
    const valid = Number.isInteger(choice) && (choice as number) >= 0;
    return valid && (choice as number) < lookChoices(part)
      ? (choice as number)
      : DEFAULT_LOOK[part];
  };
  return {
    skin: read('skin'),
    hairStyle: read('hairStyle'),
    hairColor: read('hairColor'),
    shirt: read('shirt'),
    pants: read('pants'),
  };
}

/** Valitun värin #rrggbb. */
export function lookColor(look: HeroLook, part: LookColorPart): string {
  const colors = HERO_LOOKS.colors[part];
  return colors[look[part]] ?? colors[0] ?? HERO_LOOKS.bootColor;
}

/** Lyhyt tunniste ulkonäölle, esim. "0-2-1-3-0". Sama ulkonäkö = sama tunniste. */
export function lookKey(look: HeroLook): string {
  return HERO_LOOKS.parts.map((part) => look[part]).join('-');
}

/** Sankarin rivit: perusmuoto, jonka ylimmät rivit hiustyyli korvaa. */
function heroRows(look: HeroLook): string[] {
  const style = HERO_LOOKS.hairStyles[look.hairStyle] ?? HERO_LOOKS.hairStyles[0];
  const hair = style?.rows ?? [];
  return HERO_LOOKS.baseRows.map((row, index) => hair[index] ?? row);
}

/** Sankarin sprite valitulla ulkonäöllä ja silmien värillä. */
export function heroSprite(look: HeroLook, eyeColor: EyeColor): SpriteDef {
  const shirt = lookColor(look, 'shirt');
  return {
    id: `hero-${lookKey(look)}-${eyeColor}`,
    palette: {
      h: lookColor(look, 'hairColor'),
      s: lookColor(look, 'skin'),
      e: PLAYER.eyeColors[eyeColor],
      b: shirt,
      c: shirt,
      l: lookColor(look, 'pants'),
      k: HERO_LOOKS.bootColor,
    },
    rows: heroRows(look),
  };
}

/** Kulkuneuvon sprite (esim. Bugatti), jonka kuskilla on sankarin hiukset ja iho. */
export function driverSprite(vehicle: SpriteDef, look: HeroLook): SpriteDef {
  return {
    id: `${vehicle.id}-${lookKey(look)}`,
    palette: {
      ...vehicle.palette,
      h: lookColor(look, 'hairColor'),
      s: lookColor(look, 'skin'),
    },
    rows: vehicle.rows,
  };
}
