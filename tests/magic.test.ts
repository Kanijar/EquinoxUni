import { describe, expect, it } from 'vitest';
import { getSpell } from '../src/data';
import { PLAYER } from '../src/data/player';
import { MAGIC_RULES } from '../src/data/rules';
import type { BattleRules, SpellDef } from '../src/data/types';
import { createBattle, takeTurn, type Rng } from '../src/logic/battle';
import type { Fighter } from '../src/logic/combat';
import { getSkill } from '../src/logic/skill-points';
import { skillDetail } from '../src/ui/skill-detail';
import { burnDamage, burnSeconds, burnTick, castSpell, spellPower } from '../src/logic/magic';

// Maagian testit: tulipallon osuma, palaminen ja tulivoiman vaikutus.

const rules: BattleRules = {
  damageVariance: 0.2,
  critChance: 0.1,
  critMultiplier: 2,
  defendMultiplier: 0.5,
  fleeChance: 0.6,
};
const spell: SpellDef = {
  id: 'fireball',
  power: 1,
  powerPerMagic: 1,
  burnDamage: 1,
  burnDamagePerMagic: 0.5,
  burnSeconds: 3,
  burnSecondsPerMagic: 1,
};
/** 0.5 = ei vaihtelua eikä kriittistä osumaa. */
const middle: Rng = () => 0.5;
const fighter = (hp: number, attack: number, defense: number, magic = 0): Fighter => ({
  hp,
  maxHp: hp,
  attack,
  defense,
  magic,
});

describe('tulipallo', () => {
  it('ilman kykypisteitä lyönti tekee 4 ja tulipallo 1 + palaminen 3 × 1', () => {
    expect(PLAYER.stats.attack).toBe(4);
    expect(PLAYER.stats.magic).toBe(0);
    const fireball = getSpell('fireball');
    expect(spellPower(fireball, 0)).toBe(1);
    expect(burnSeconds(fireball, 0)).toBe(3);
    expect(burnDamage(fireball, 0)).toBe(1);
    expect(MAGIC_RULES.burnTickMs).toBe(1000);
  });

  it('tulivoima kasvattaa osumaa, palamisaikaa ja polttovoimaa', () => {
    expect(spellPower(spell, 2)).toBe(3);
    expect(burnSeconds(spell, 2)).toBe(5);
    expect(burnDamage(spell, 2)).toBe(2);
    const { damage, burn } = castSpell(fighter(30, 4, 0, 2), spell, middle, rules);
    expect(damage).toBe(3);
    expect(burn).toEqual({ damage: 2, secondsLeft: 5, carry: 0 });
  });

  it('jokainen Maagia-piste nostaa tulipallon polttovoimaa 0,5:llä', () => {
    const fireball = getSpell('fireball');
    expect(fireball.burnDamagePerMagic).toBe(0.5);
    expect([0, 1, 2, 3].map((magic) => burnDamage(fireball, magic))).toEqual([1, 1.5, 2, 2.5]);
  });

  it('tulipallo voi olla kriittinen osuma tarkkuuden mukaan', () => {
    const sharp = { ...fighter(30, 4, 0, 2), critChance: 0.4 };
    const result = castSpell(sharp, spell, () => 0.3, rules);
    expect(result.crit).toBe(true);
    expect(result.damage).toBeGreaterThanOrEqual(5);
  });

  it('taistelussa tulipallo ei välitä puolustuksesta ja sytyttää vihollisen', () => {
    const battle = createBattle(fighter(30, 4, 2), fighter(20, 5, 10), {});
    const events = takeTurn(battle, { kind: 'spell', spellId: 'fireball' }, middle, rules);
    expect(events[0]).toEqual({
      kind: 'spell',
      spellId: 'fireball',
      damage: 1,
      crit: false,
      burnSeconds: 3,
    });
    expect(battle.enemy.hp).toBe(19);
    expect(battle.enemyBurn).toEqual({ damage: 1, secondsLeft: 3, carry: 0 });
  });
});

describe('kykypistenäkymän polttovoima', () => {
  it('Maagia-rivi näyttää polttovoiman pilkulla ja kasvun pisteestä', () => {
    const stats = { ...PLAYER.stats, magic: 1 };
    expect(skillDetail(getSkill('magic'), stats)).toBe('polttovoima 1,5/s (+0,5)');
    expect(skillDetail(getSkill('magic'), PLAYER.stats)).toBe('polttovoima 1/s (+0,5)');
    expect(skillDetail(getSkill('attack'), stats)).toBeNull();
  });
});

describe('palaminen', () => {
  it('vihollinen menettää 1 elämän sekunnissa kolmen sekunnin ajan', () => {
    const battle = createBattle(fighter(30, 4, 2), fighter(20, 5, 0), {});
    takeTurn(battle, { kind: 'spell', spellId: 'fireball' }, middle, rules);
    expect(burnTick(battle)).toEqual({ damage: 1, secondsLeft: 2 });
    expect(burnTick(battle)).toEqual({ damage: 1, secondsLeft: 1 });
    expect(burnTick(battle)).toEqual({ damage: 1, secondsLeft: 0 });
    expect(burnTick(battle)).toBeNull();
    expect(battle.enemy.hp).toBe(20 - 1 - 3);
    expect(battle.enemyBurn).toBeNull();
  });

  it('polttovoimalla 1,5 puolikkaat kertyvät: vihollinen menettää vuorotellen 1 ja 2', () => {
    const battle = createBattle(fighter(30, 4, 2, 1), fighter(30, 5, 0), {});
    takeTurn(battle, { kind: 'spell', spellId: 'fireball' }, middle, rules);
    expect(battle.enemyBurn).toEqual({ damage: 1.5, secondsLeft: 4, carry: 0 });
    const hpAfterHit = battle.enemy.hp;
    const ticks = [1, 2, 3, 4].map(() => burnTick(battle)?.damage);
    expect(ticks).toEqual([1, 2, 1, 2]);
    expect(hpAfterHit - battle.enemy.hp).toBe(6);
  });

  it('desimaalinen polttovoima ei häviä pyöristysvirheisiin', () => {
    const battle = createBattle(fighter(30, 4, 2), fighter(99, 5, 0), {});
    battle.enemyBurn = { damage: 0.1, secondsLeft: 10, carry: 0 };
    const total = Array.from({ length: 10 }, () => burnTick(battle)?.damage ?? 0);
    expect(total.reduce((sum, damage) => sum + damage, 0)).toBe(1);
  });

  it('uusi tulipallo sytyttää palamisen alusta', () => {
    const battle = createBattle(fighter(30, 4, 2), fighter(30, 5, 0), {});
    takeTurn(battle, { kind: 'spell', spellId: 'fireball' }, middle, rules);
    burnTick(battle);
    burnTick(battle);
    takeTurn(battle, { kind: 'spell', spellId: 'fireball' }, middle, rules);
    expect(battle.enemyBurn?.secondsLeft).toBe(3);
  });

  it('palamiseen kaatunut vihollinen tarkoittaa voittoa', () => {
    const battle = createBattle(fighter(30, 4, 2), fighter(3, 5, 0), {});
    takeTurn(battle, { kind: 'spell', spellId: 'fireball' }, middle, rules);
    expect(battle.enemy.hp).toBe(2);
    burnTick(battle);
    burnTick(battle);
    expect(battle.outcome).toBe('won');
    expect(burnTick(battle)).toBeNull();
  });

  it('ilman tulipalloa mikään ei pala, ja palaminen loppuu kun taistelu on ohi', () => {
    const battle = createBattle(fighter(30, 4, 2), fighter(20, 5, 0), {});
    expect(burnTick(battle)).toBeNull();
    battle.enemyBurn = { damage: 1, secondsLeft: 3, carry: 0 };
    battle.outcome = 'fled';
    expect(burnTick(battle)).toBeNull();
    expect(battle.enemy.hp).toBe(20);
  });

  it('tulipallo, joka kaataa vihollisen, ei jätä palamista', () => {
    const battle = createBattle(fighter(30, 4, 2), fighter(1, 5, 0), {});
    takeTurn(battle, { kind: 'spell', spellId: 'fireball' }, middle, rules);
    expect(battle.outcome).toBe('won');
    expect(battle.enemyBurn).toBeNull();
  });
});
