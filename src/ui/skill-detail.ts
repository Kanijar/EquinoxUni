import { FIREBALL } from '../data/spells';
import type { PlayerStats, SkillDef } from '../data/types';
import { TEXT } from '../i18n/text';
import { burnDamage } from '../logic/magic';

// Kykypistenäkymän rivin lisätieto, joka muuttuu pisteitä laitettaessa.
// Maagia näyttää tulipallon polttovoiman: paljonko palava vihollinen menettää elämää sekunnissa.

/** Lisätieto kyvyn riville, tai null jos kyvyllä ei ole lisätietoa. */
export function skillDetail(skill: SkillDef, stats: PlayerStats): string | null {
  if (skill.stat !== 'magic') {
    return null;
  }
  const fireball = FIREBALL;
  const perPoint = fireball.burnDamagePerMagic * skill.perPoint;
  return TEXT.skills.burnPower(burnDamage(fireball, stats.magic), perPoint);
}
