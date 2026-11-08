import { getSpell, ITEMS, SPELLS } from '../data';
import { PLAYER } from '../data/player';
import type { BattleRules, ItemDef, SpellDef, SpellId, SpellItemDef } from '../data/types';
import type { Battle, BattleEvent } from './battle';
import { applyDamage, heal, isDefeated } from './combat';
import type { Rng } from './damage-roll';
import { castSpell, rollSpellHit, spellPower } from './magic';

// Loitsut taistelussa. Tulipallo osataan alusta asti (PLAYER.spell). Muut loitsut opitaan
// loitsukirjoista, joita Noita myy luolassa (data/cave.ts): kun kirja on repussa, loitsu
// näkyy taistelussa HYÖKKÄÄ → LOITSUT -valikossa.
//
// Osalla loitsuista on odotusaika (SpellDef.cooldownTurns): käytön jälkeen loitsua ei voi
// käyttää uudelleen ennen kuin niin monta vuoroa on kulunut. Joka vuoron alussa odotus
// lyhenee yhdellä (tickCooldowns), ja loitsu on taas käytössä, kun odotus on 0.
//
// Loitsujen vaikutukset: tulipallo sytyttää palamaan (logic/magic.ts), salama osuu kovaa,
// jäänuoli osuu ja jäädyttää vihollisen (se ei lyö tällä vuorolla) ja parannus antaa elämää.

/** Montako vuoroa kutakin loitsua pitää vielä odottaa (puuttuu = 0, käytössä heti). */
export type SpellCooldowns = Partial<Record<SpellId, number>>;

function isSpellBook(item: ItemDef): item is SpellItemDef {
  return item.kind === 'spell';
}

/** Loitsukirja, joka opettaa loitsun, tai null (tulipalloa ei tarvitse opetella). */
export function spellBook(spellId: SpellId): SpellItemDef | null {
  return ITEMS.filter(isSpellBook).find((item) => item.spell === spellId) ?? null;
}

/** Loitsukirjoista opitut loitsut (ilman tulipalloa) SPELLS-listan järjestyksessä. */
export function learnedSpells(inventory: Readonly<Record<string, number>>): SpellId[] {
  return SPELLS.filter((spell) => {
    const book = spellBook(spell.id);
    return book !== null && (inventory[book.id] ?? 0) > 0;
  }).map((spell) => spell.id);
}

/** Osaako sankari loitsun: tulipallo aina, muut, kun loitsukirja on repussa. */
export function knowsSpell(inventory: Readonly<Record<string, number>>, spellId: SpellId): boolean {
  return spellId === PLAYER.spell || learnedSpells(inventory).includes(spellId);
}

/** Montako vuoroa loitsua pitää vielä odottaa (0 = sen voi käyttää nyt). */
export function spellWait(battle: Battle, spellId: SpellId): number {
  return Math.max(0, battle.spellCooldowns[spellId] ?? 0);
}

/** Voiko loitsun käyttää nyt: sankari osaa sen, eikä sitä tarvitse odottaa. */
export function canCast(battle: Battle, spellId: SpellId): boolean {
  return knowsSpell(battle.inventory, spellId) && spellWait(battle, spellId) === 0;
}

/** Uusi vuoro alkaa: jokaisen loitsun odotus lyhenee yhdellä. */
export function tickCooldowns(cooldowns: SpellCooldowns): void {
  for (const spell of SPELLS) {
    const wait = cooldowns[spell.id] ?? 0;
    if (wait > 0) {
      cooldowns[spell.id] = wait - 1;
    }
  }
}

/** Sankari käyttää loitsun. Loitsun odotusaika alkaa. */
export function castPlayerSpell(
  battle: Battle,
  spellId: SpellId,
  rng: Rng,
  rules: BattleRules,
): BattleEvent {
  const spell = getSpell(spellId);
  battle.spellCooldowns[spellId] = spell.cooldownTurns ?? 0;
  switch (spell.effect) {
    case 'burn': {
      const { damage, crit, burn } = castSpell(battle.player, spell, rng, rules);
      const won = hitEnemy(battle, damage);
      if (!won) {
        battle.enemyBurn = burn;
      }
      return { kind: 'spell', spellId, damage, crit, burnSeconds: burn.secondsLeft };
    }
    case 'heal': {
      const amount = heal(battle.player, spellPower(spell, battle.player.magic ?? 0));
      return { kind: 'spellHeal', spellId, amount };
    }
    default:
      return strike(battle, spell, rng, rules);
  }
}

/** Salama tai jäänuoli: osuma, ja jäänuoli jäädyttää vihollisen, jos se jää henkiin. */
function strike(battle: Battle, spell: SpellDef, rng: Rng, rules: BattleRules): BattleEvent {
  const { damage, crit } = rollSpellHit(battle.player, spell, rng, rules);
  const won = hitEnemy(battle, damage);
  const frozen = spell.effect === 'freeze' && !won;
  if (frozen) {
    battle.enemyFrozen = true;
  }
  return { kind: 'spell', spellId: spell.id, damage, crit, burnSeconds: 0, frozen };
}

/** Vihollinen menettää elämää. Palauttaa true, jos se kaatui (pelaaja voitti). */
function hitEnemy(battle: Battle, damage: number): boolean {
  applyDamage(battle.enemy, damage);
  if (isDefeated(battle.enemy)) {
    battle.outcome = 'won';
    return true;
  }
  return false;
}

/** Jäätynyt vihollinen ei lyö tällä vuorolla. Jää sulaa heti, joten seuraavalla vuorolla se lyö. */
export function thawEnemy(battle: Battle): BattleEvent {
  battle.enemyFrozen = false;
  return { kind: 'frozen' };
}
