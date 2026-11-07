import { describe, expect, it } from 'vitest';
import { getSpell, ITEMS, SPELLS } from '../src/data';
import { PLAYER } from '../src/data/player';
import type { BattleRules } from '../src/data/types';
import { canChoose, createBattle, takeTurn, type Rng } from '../src/logic/battle';
import type { Fighter } from '../src/logic/combat';
import { spellPower } from '../src/logic/magic';
import { knowsSpell, learnedSpells, spellBook, spellWait } from '../src/logic/spells';
import { FI_SPELL_BUTTONS } from '../src/i18n/fi-cave';
import { EN_SPELL_BUTTONS } from '../src/i18n/en-cave';

// Noidan loitsut taistelussa: salama, jäänuoli ja parannus, odotusvuorot ja loitsukirjat.

const rules: BattleRules = {
  damageVariance: 0.2,
  critChance: 0.1,
  critMultiplier: 2,
  defendMultiplier: 0.5,
  fleeChance: 0.6,
};
/** 0.5 = ei vaihtelua eikä kriittistä osumaa. */
const middle: Rng = () => 0.5;
const hero = (magic = 0): Fighter => ({ hp: 100, maxHp: 100, attack: 10, defense: 0, magic });
const monster = (): Fighter => ({ hp: 500, maxHp: 500, attack: 20, defense: 50 });
const allBooks = { 'spell-lightning': 1, 'spell-ice': 1, 'spell-healing': 1 };

function battleWith(inventory: Record<string, number>, magic = 0) {
  return createBattle(hero(magic), monster(), { ...inventory });
}

describe('loitsukirjat', () => {
  it('jokaiselle loitsulle paitsi tulipallolle on loitsukirja', () => {
    for (const spell of SPELLS) {
      const book = spellBook(spell.id);
      expect(book === null, spell.id).toBe(spell.id === PLAYER.spell);
    }
    expect(ITEMS.filter((item) => item.kind === 'spell')).toHaveLength(SPELLS.length - 1);
  });

  it('tulipallo osataan aina, muut vasta kun kirja on repussa', () => {
    expect(learnedSpells({})).toEqual([]);
    expect(knowsSpell({}, 'fireball')).toBe(true);
    expect(knowsSpell({}, 'lightning')).toBe(false);
    expect(learnedSpells({ 'spell-healing': 1, 'spell-lightning': 1 })).toEqual([
      'lightning',
      'healing',
    ]);
  });

  it('loitsuvalikkoon mahtuvat kaikki opittavat loitsut, ja napin teksti mahtuu nappiin', () => {
    expect(learnedSpells(allBooks).length).toBeLessThanOrEqual(3);
    for (const label of [...Object.values(FI_SPELL_BUTTONS), ...Object.values(EN_SPELL_BUTTONS)]) {
      expect(label.length, label).toBeLessThanOrEqual(9);
    }
  });

  it('loitsua, jota ei osaa, ei voi valita taistelussa', () => {
    const battle = battleWith({});
    expect(canChoose(battle, { kind: 'spell', spellId: 'lightning' })).toBe(false);
    expect(takeTurn(battle, { kind: 'spell', spellId: 'lightning' }, middle, rules)).toEqual([]);
    expect(canChoose(battle, { kind: 'spell', spellId: 'fireball' })).toBe(true);
  });
});

describe('salama', () => {
  it('osuu tulivoiman mukaan puolustuksesta välittämättä eikä sytytä', () => {
    const battle = battleWith(allBooks, 2);
    const [event] = takeTurn(battle, { kind: 'spell', spellId: 'lightning' }, middle, rules);
    const damage = spellPower(getSpell('lightning'), 2);
    expect(damage).toBe(18);
    expect(event).toEqual({
      kind: 'spell',
      spellId: 'lightning',
      damage,
      crit: false,
      burnSeconds: 0,
      frozen: false,
    });
    expect(battle.enemy.hp).toBe(500 - damage);
    expect(battle.enemyBurn).toBeNull();
  });

  it('salamaa pitää odottaa kaksi vuoroa, sitten se on taas käytössä', () => {
    const battle = battleWith(allBooks);
    const lightning = { kind: 'spell', spellId: 'lightning' } as const;
    takeTurn(battle, lightning, middle, rules);
    expect(spellWait(battle, 'lightning')).toBe(2);
    expect(canChoose(battle, lightning)).toBe(false);
    takeTurn(battle, { kind: 'defend' }, middle, rules);
    expect(spellWait(battle, 'lightning')).toBe(1);
    takeTurn(battle, { kind: 'defend' }, middle, rules);
    expect(spellWait(battle, 'lightning')).toBe(0);
    expect(canChoose(battle, lightning)).toBe(true);
  });

  it('tulipallolla ei ole odotusta', () => {
    const battle = battleWith({});
    takeTurn(battle, { kind: 'spell', spellId: 'fireball' }, middle, rules);
    expect(canChoose(battle, { kind: 'spell', spellId: 'fireball' })).toBe(true);
  });
});

describe('jäänuoli', () => {
  it('jäädyttää vihollisen: se ei lyö tällä vuorolla, mutta lyö seuraavalla', () => {
    const battle = battleWith(allBooks);
    const events = takeTurn(battle, { kind: 'spell', spellId: 'ice-arrow' }, middle, rules);
    expect(events[0]).toMatchObject({ kind: 'spell', spellId: 'ice-arrow', frozen: true });
    expect(events[1]).toEqual({ kind: 'frozen' });
    expect(battle.player.hp).toBe(100);
    expect(battle.enemyFrozen).toBe(false);
    const next = takeTurn(battle, { kind: 'defend' }, middle, rules);
    expect(next[1]?.kind).toBe('hit');
    expect(battle.player.hp).toBeLessThan(100);
  });

  it('kaatunut vihollinen ei jäädy, ja taistelu on voitettu', () => {
    const battle = createBattle(hero(), { ...monster(), hp: 3 }, { ...allBooks });
    const events = takeTurn(battle, { kind: 'spell', spellId: 'ice-arrow' }, middle, rules);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ frozen: false });
    expect(battle.outcome).toBe('won');
  });
});

describe('parannus', () => {
  it('antaa elämää tulivoiman mukaan, mutta ei yli maksimin', () => {
    const battle = battleWith(allBooks, 1);
    battle.player.hp = 40;
    const [event] = takeTurn(battle, { kind: 'spell', spellId: 'healing' }, () => 0.99, rules);
    expect(event).toEqual({ kind: 'spellHeal', spellId: 'healing', amount: 29 });
    const full = battleWith(allBooks);
    full.player.hp = 95;
    const [capped] = takeTurn(full, { kind: 'spell', spellId: 'healing' }, () => 0.99, rules);
    expect(capped).toEqual({ kind: 'spellHeal', spellId: 'healing', amount: 5 });
  });

  it('parannusta ei voi käyttää joka vuoro', () => {
    const battle = battleWith(allBooks);
    takeTurn(battle, { kind: 'spell', spellId: 'healing' }, middle, rules);
    expect(canChoose(battle, { kind: 'spell', spellId: 'healing' })).toBe(false);
    expect(spellWait(battle, 'healing')).toBe(getSpell('healing').cooldownTurns);
  });
});
