import { describe, expect, it } from 'vitest';
import { DEFAULT_LOOK, HERO_LOOKS } from '../src/data/hero-looks';
import { PLAYER } from '../src/data/player';
import type { HeroLook, LookPart } from '../src/data/types';
import { createNewGame } from '../src/logic/game-state';
import {
  driverSprite,
  heroSprite,
  lookChoices,
  lookColor,
  lookKey,
  randomLook,
  readLook,
  stepLook,
} from '../src/logic/hero-look';
import { cleanHeroName, heroName } from '../src/logic/hero-name';
import { decodeSave, encodeSave } from '../src/logic/save-format';
import { getSprite } from '../src/data';

const meta = { savedAt: 1_700_000_000_000, place: 'Kotiranta' };
const SIZE = 16;

/** Kaikki ulkonäöt, joissa yksi osa käy läpi kaikki vaihtoehtonsa. */
function everyChoice(): HeroLook[] {
  return HERO_LOOKS.parts.flatMap((part) =>
    Array.from({ length: lookChoices(part) }, (_, choice) => ({ ...DEFAULT_LOOK, [part]: choice })),
  );
}

describe('sankarin ulkonäkö', () => {
  it('uusi peli alkaa oletusulkonäöllä ja ilman omaa nimeä', () => {
    const state = createNewGame();
    expect(state.look).toEqual(DEFAULT_LOOK);
    expect(state.name).toBe('');
    expect(state.eyeColor).toBe(PLAYER.eyeColor);
  });

  it('jokaisessa osassa on ainakin kaksi vaihtoehtoa', () => {
    for (const part of HERO_LOOKS.parts) {
      expect(lookChoices(part)).toBeGreaterThanOrEqual(2);
    }
  });

  it('nuolet kiertävät vaihtoehdot: viimeisestä eteenpäin pääsee ensimmäiseen', () => {
    const part: LookPart = 'shirt';
    const last = lookChoices(part) - 1;
    expect(stepLook(DEFAULT_LOOK, part, 1).shirt).toBe(1);
    expect(stepLook(DEFAULT_LOOK, part, -1).shirt).toBe(last);
    expect(stepLook({ ...DEFAULT_LOOK, shirt: last }, part, 1).shirt).toBe(0);
    expect(stepLook(DEFAULT_LOOK, part, 1).skin).toBe(DEFAULT_LOOK.skin);
  });

  it('arvottu ulkonäkö pysyy vaihtoehtojen rajoissa', () => {
    expect(randomLook(() => 0)).toEqual(DEFAULT_LOOK);
    const highest = randomLook(() => 0.999);
    for (const part of HERO_LOOKS.parts) {
      expect(highest[part]).toBe(lookChoices(part) - 1);
    }
  });

  it.each(everyChoice())('sprite on 16 × 16 ja käyttää vain palettinsa värejä (%o)', (look) => {
    const sprite = heroSprite(look, 'yellow');
    expect(sprite.rows).toHaveLength(SIZE);
    for (const row of sprite.rows) {
      expect(row).toHaveLength(SIZE);
      for (const char of row) {
        expect(char === '.' || sprite.palette[char] !== undefined).toBe(true);
      }
    }
  });

  it('valitut värit näkyvät spritessä', () => {
    const look: HeroLook = { skin: 3, hairStyle: 1, hairColor: 6, shirt: 2, pants: 4 };
    const sprite = heroSprite(look, 'black');
    expect(sprite.palette['s']).toBe(HERO_LOOKS.colors.skin[3]);
    expect(sprite.palette['h']).toBe(HERO_LOOKS.colors.hairColor[6]);
    expect(sprite.palette['b']).toBe(HERO_LOOKS.colors.shirt[2]);
    expect(sprite.palette['l']).toBe(HERO_LOOKS.colors.pants[4]);
    expect(sprite.palette['e']).toBe(PLAYER.eyeColors.black);
    expect(lookColor(look, 'shirt')).toBe(HERO_LOOKS.colors.shirt[2]);
  });

  it('eri ulkonäöillä on eri tunniste, samalla sama', () => {
    const ids = everyChoice().map((look) => heroSprite(look, 'yellow').id);
    expect(new Set(ids).size).toBe(ids.length - (HERO_LOOKS.parts.length - 1));
    expect(heroSprite(DEFAULT_LOOK, 'yellow').id).not.toBe(heroSprite(DEFAULT_LOOK, 'black').id);
    expect(lookKey(DEFAULT_LOOK)).toBe(lookKey({ ...DEFAULT_LOOK }));
  });

  it('hiustyyli muuttaa spriteä', () => {
    const rows = HERO_LOOKS.hairStyles.map((_, hairStyle) =>
      heroSprite({ ...DEFAULT_LOOK, hairStyle }, 'yellow').rows.join(''),
    );
    expect(new Set(rows).size).toBe(HERO_LOOKS.hairStyles.length);
  });

  it('Bugattin kuskilla on sankarin hiukset ja iho, auto pysyy samana', () => {
    const look: HeroLook = { ...DEFAULT_LOOK, skin: 4, hairColor: 2 };
    const bugatti = getSprite('bugatti');
    const driver = driverSprite(bugatti, look);
    expect(driver.palette['h']).toBe(HERO_LOOKS.colors.hairColor[2]);
    expect(driver.palette['s']).toBe(HERO_LOOKS.colors.skin[4]);
    expect(driver.palette['b']).toBe(bugatti.palette['b']);
    expect(driver.rows).toEqual(bugatti.rows);
    expect(driver.id).not.toBe(bugatti.id);
  });

  it('tallennuksen virheellinen ulkonäkö korjataan oletukseksi', () => {
    expect(readLook(undefined)).toEqual(DEFAULT_LOOK);
    expect(readLook('punainen')).toEqual(DEFAULT_LOOK);
    const fixed = readLook({ skin: 99, hairStyle: -1, hairColor: 1.5, shirt: '2', pants: 1 });
    expect(fixed).toEqual({ ...DEFAULT_LOOK, pants: 1 });
  });
});

describe('sankarin nimi', () => {
  it('nimi siistitään: vain kirjaimet, numerot, välilyönnit ja yhdysmerkit', () => {
    expect(cleanHeroName('  Väinö  ')).toBe('Väinö');
    expect(cleanHeroName('Åke-Pekka 2')).toBe('Åke-Pekka 2');
    expect(cleanHeroName('Matti   Meikä')).toBe('Matti Meikä');
    expect(cleanHeroName('<Ville!>')).toBe('Ville');
    expect(cleanHeroName('😀')).toBe('');
  });

  it('nimi on enintään nameMaxLength merkkiä', () => {
    expect(cleanHeroName('Abcdefghijklmnopqrstu')).toHaveLength(PLAYER.nameMaxLength);
    expect(cleanHeroName('ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ', 5)).toBe('ÄÄÄÄÄ');
  });

  it('tyhjä nimi näytetään oletusnimenä', () => {
    expect(heroName('', 'Sankari')).toBe('Sankari');
    expect(heroName('Väinö', 'Sankari')).toBe('Väinö');
  });
});

describe('nimi ja ulkonäkö tallennuksessa', () => {
  it('nimi ja ulkonäkö säilyvät tallennuksessa', () => {
    const state = createNewGame();
    state.name = 'Väinö';
    state.look = { skin: 1, hairStyle: 2, hairColor: 3, shirt: 4, pants: 1 };
    const loaded = decodeSave(encodeSave(state, meta))?.state;
    expect(loaded?.name).toBe('Väinö');
    expect(loaded?.look).toEqual(state.look);
  });

  it('vanha tallennus ilman nimeä ja ulkonäköä latautuu oletuksilla', () => {
    const raw = JSON.parse(encodeSave(createNewGame(), meta)) as { state: Record<string, unknown> };
    delete raw.state['name'];
    delete raw.state['look'];
    const loaded = decodeSave(JSON.stringify(raw))?.state;
    expect(loaded?.name).toBe('');
    expect(loaded?.look).toEqual(DEFAULT_LOOK);
  });

  it('muokattu nimi siistitään latauksessa', () => {
    const raw = JSON.parse(encodeSave(createNewGame(), meta)) as { state: Record<string, unknown> };
    raw.state['name'] = '  <Hakkeri>  joka on liian pitkä';
    const loaded = decodeSave(JSON.stringify(raw))?.state;
    expect(loaded?.name.length).toBeLessThanOrEqual(PLAYER.nameMaxLength);
    expect(loaded?.name).toBe('Hakkeri joka');
  });
});
