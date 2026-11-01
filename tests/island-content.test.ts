import { describe, expect, it } from 'vitest';
import { ENEMIES, ITEMS, QUESTS } from '../src/data';
import { FINAL_BOSS } from '../src/data/boss';

// Saaren hirviöiden ja varusteiden sisältötestit.

/** Saaren uudet hirviöt: jokainen pudottaa jonkin varusteen. */
const ISLAND_MONSTERS = ['crab', 'mud', 'wisp', 'giant', 'lizard', 'dragon'];

/** Kuvaus mahtuu repun alareunaan LAITA KÄYTTÖÖN -napin viereen. */
const MAX_DESCRIPTION_LENGTH = 45;

const gearIds = new Set(ITEMS.filter((item) => item.kind === 'gear').map((item) => item.id));
const dropped = new Set(ENEMIES.flatMap((enemy) => enemy.drops ?? []).map((drop) => drop.item));
/** Jussi Ketolan tehtävien palkinnot (data/quests.ts). */
const rewarded = new Set(QUESTS.flatMap((quest) => quest.reward.items).map((stack) => stack.id));

describe('saaren hirviöt ja varusteet', () => {
  it.each(ISLAND_MONSTERS)('%s pudottaa varusteen', (id) => {
    const enemy = ENEMIES.find((e) => e.id === id);
    expect(enemy?.drops?.some((drop) => gearIds.has(drop.item))).toBe(true);
  });

  it('jokaisen varusteen voi saada joltain viholliselta tai tehtävän palkintona', () => {
    for (const id of gearIds) {
      expect(dropped.has(id) || rewarded.has(id), id).toBe(true);
    }
  });

  it('esineiden kuvaukset mahtuvat repun riville', () => {
    for (const item of ITEMS) {
      expect(item.description.length, item.id).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
    }
  });

  it('vahvempi vihollinen antaa enemmän kokemusta', () => {
    const power = (e: (typeof ENEMIES)[number]) => e.stats.maxHp * e.stats.attack;
    const sorted = ENEMIES.filter((e) => e.id !== FINAL_BOSS.enemy).sort(
      (a, b) => power(a) - power(b),
    );
    sorted.forEach((enemy, i) => {
      const weaker = sorted[i - 1];
      if (weaker) {
        expect(enemy.xp, `${weaker.id} → ${enemy.id}`).toBeGreaterThanOrEqual(weaker.xp);
      }
    });
  });
});
