import { describe, expect, it } from 'vitest';
import {
  ENEMIES,
  getEnemy,
  getItem,
  getNpc,
  getQuest,
  getSprite,
  getTown,
  NPCS,
  QUESTS,
} from '../src/data';
import { QUEST_TEXTS_EN } from '../src/i18n/en-content';
import { setLanguage, TEXT } from '../src/i18n/text';
import { createNewGame, grantVictory, playerLevel, type GameState } from '../src/logic/game-state';
import { xpForLevel } from '../src/data/level-curve';
import { LEVEL_CURVE } from '../src/data/rules';
import { recordQuestVisit } from '../src/logic/quest-log';
import {
  acceptQuest,
  nextQuestLevel,
  npcInTown,
  npcMarker,
  questRows,
  statusOf,
  trackedQuests,
  turnInQuest,
} from '../src/logic/quests';
import { decodeSave, encodeSave } from '../src/logic/save-format';

// Jussi Ketolan tehtävät: tarjous, ottaminen, edistyminen, palautus ja palkinnot.

const always = (): number => 0;
const never = (): number => 0.999;

/** Voittaa vihollisen n kertaa (väijytyksenä, ei karttavihollisena). */
function defeat(state: GameState, enemyId: string, times: number, rng = never): void {
  for (let i = 0; i < times; i += 1) {
    grantVictory(state, null, getEnemy(enemyId), rng);
  }
}

/** Pelaaja tasolla level ilman tehtäviä. */
function gameAtLevel(level: number): GameState {
  const state = createNewGame();
  state.xp = xpForLevel(level, LEVEL_CURVE);
  return state;
}

/** Merkitsee tehtävät tehdyiksi (esim. ketjun alku), jotta myöhempiä voi testata. */
function markDone(state: GameState, ...ids: string[]): void {
  for (const id of ids) {
    state.quests[id] = { active: false, progress: 0, completions: 1 };
  }
}

describe('Jussi Ketolan tehtävät', () => {
  it('uudessa pelissä Jussilla on kaksi tehtävää tarjolla ja pään päällä on !', () => {
    const state = createNewGame();
    const rows = questRows(state, 'jussi');
    expect(rows.map((row) => row.quest.id)).toEqual(['slime-hunt', 'letter-peltola']);
    expect(rows.every((row) => row.status === 'available')).toBe(true);
    expect(npcMarker(state, 'jussi')).toBe('available');
  });

  it('Jussi asuu aloituspaikkakunnassa', () => {
    const state = createNewGame();
    expect(npcInTown(state.lastTown)?.id).toBe('jussi');
    expect(npcInTown('peltola')).toBeNull();
  });

  it('voitot lasketaan vasta, kun tehtävä on otettu', () => {
    const state = createNewGame();
    defeat(state, 'slime', 3);
    expect(statusOf(state, getQuest('slime-hunt'))).toBe('available');
    expect(acceptQuest(state, 'slime-hunt')).toBe(true);
    defeat(state, 'slime', 2);
    expect(statusOf(state, getQuest('slime-hunt'))).toBe('active');
    expect(trackedQuests(state)[0]?.progress).toEqual({ have: 2, need: 3 });
  });

  it('valmiin tehtävän voi palauttaa: KP ja esineet, merkki vaihtuu ?:ksi', () => {
    const state = createNewGame();
    acceptQuest(state, 'slime-hunt');
    defeat(state, 'slime', 3);
    expect(statusOf(state, getQuest('slime-hunt'))).toBe('ready');
    expect(npcMarker(state, 'jussi')).toBe('ready');
    const xpBefore = state.xp;
    const potions = state.inventory['potion'] ?? 0;
    const result = turnInQuest(state, 'slime-hunt');
    expect(result?.xp).toBe(getQuest('slime-hunt').reward.xp);
    expect(state.xp).toBe(xpBefore + getQuest('slime-hunt').reward.xp);
    expect(state.inventory['potion']).toBe(potions + 2);
    expect(statusOf(state, getQuest('slime-hunt'))).toBe('done');
    expect(turnInQuest(state, 'slime-hunt')).toBeNull();
  });

  it('keskeneräistä tehtävää ei voi palauttaa eikä samaa tehtävää ottaa kahdesti', () => {
    const state = createNewGame();
    expect(turnInQuest(state, 'slime-hunt')).toBeNull();
    acceptQuest(state, 'slime-hunt');
    expect(acceptQuest(state, 'slime-hunt')).toBe(false);
    expect(turnInQuest(state, 'slime-hunt')).toBeNull();
  });

  it('voitosta tulee viesti tehtävän edistymisestä', () => {
    const state = createNewGame();
    acceptQuest(state, 'slime-hunt');
    const reward = grantVictory(state, null, getEnemy('slime'), never);
    expect(reward.quests).toEqual([{ quest: 'slime-hunt', have: 1, need: 3 }]);
    expect(grantVictory(state, null, getEnemy('hiisi'), never).quests).toBeUndefined();
  });

  it('seuraava taistelutehtävä aukeaa tasolla 3, ja Jussi kertoo sen', () => {
    const state = createNewGame();
    markDone(state, 'slime-hunt');
    expect(statusOf(state, getQuest('goblin-trouble'))).toBe('locked');
    expect(nextQuestLevel(state, 'jussi')).toBe(3);
    state.xp = xpForLevel(3, LEVEL_CURVE);
    expect(statusOf(state, getQuest('goblin-trouble'))).toBe('available');
  });

  it('kirje Peltolaan: tehtävä valmistuu, kun saavut Peltolaan', () => {
    const state = createNewGame();
    expect(recordQuestVisit(state.quests, 'peltola')).toEqual([]);
    acceptQuest(state, 'letter-peltola');
    expect(recordQuestVisit(state.quests, 'myllykyla')).toEqual([]);
    expect(recordQuestVisit(state.quests, 'peltola').map((quest) => quest.id)).toEqual([
      'letter-peltola',
    ]);
    expect(recordQuestVisit(state.quests, 'peltola')).toEqual([]);
    turnInQuest(state, 'letter-peltola');
    expect(state.inventory['jussi-sword']).toBe(1);
  });

  it('sudenkarvatupsu putoaa vain tehtävän aikana ja vain tarvittava määrä', () => {
    const state = gameAtLevel(5);
    markDone(state, 'letter-peltola');
    defeat(state, 'wolf', 2, always);
    expect(state.inventory['wolf-tuft']).toBeUndefined();
    acceptQuest(state, 'wolf-fur');
    const reward = grantVictory(state, null, getEnemy('wolf'), always);
    expect(reward.drops).toContain('wolf-tuft');
    expect(reward.quests).toEqual([{ quest: 'wolf-fur', have: 1, need: 3 }]);
    defeat(state, 'wolf', 4, always);
    expect(state.inventory['wolf-tuft']).toBe(3);
    expect(statusOf(state, getQuest('wolf-fur'))).toBe('ready');
    turnInQuest(state, 'wolf-fur');
    expect(state.inventory['wolf-tuft'] ?? 0).toBe(0);
    expect(state.inventory['lucky-charm']).toBe(1);
    defeat(state, 'wolf', 1, always);
    expect(state.inventory['wolf-tuft'] ?? 0).toBe(0);
  });

  it('palkinto voi nostaa tason ja antaa kykypisteitä', () => {
    const state = createNewGame();
    acceptQuest(state, 'slime-hunt');
    defeat(state, 'slime', 3);
    state.xp = xpForLevel(3, LEVEL_CURVE) - 1;
    const result = turnInQuest(state, 'slime-hunt');
    expect(result?.leveledUp).toBe(true);
    expect(result?.level).toBe(playerLevel(state));
    expect(result?.skillPoints).toBeGreaterThan(0);
  });

  it('viimeisen tehtävän (Liskovahti) voi tehdä yhä uudelleen', () => {
    const state = gameAtLevel(34);
    markDone(state, 'fire-lizards');
    acceptQuest(state, 'lizard-watch');
    defeat(state, 'lizard', 5);
    expect(turnInQuest(state, 'lizard-watch')).not.toBeNull();
    expect(statusOf(state, getQuest('lizard-watch'))).toBe('available');
    expect(acceptQuest(state, 'lizard-watch')).toBe(true);
    expect(trackedQuests(state)[0]?.progress).toEqual({ have: 0, need: 5 });
    expect(state.quests['lizard-watch']?.completions).toBe(1);
  });

  it('kaikki tehtävät tehtyinä Jussilla ei ole tarjolla muuta kuin toistettava tehtävä', () => {
    const state = gameAtLevel(50);
    markDone(state, ...QUESTS.map((quest) => quest.id));
    expect(questRows(state, 'jussi').map((row) => row.quest.id)).toEqual(['lizard-watch']);
    expect(nextQuestLevel(state, 'jussi')).toBeNull();
  });
});

describe('tehtävät tallennuksessa', () => {
  const meta = { savedAt: 1_700_000_000_000, place: 'Valkeakoski' };

  it('tehtäväkirja tallentuu ja latautuu', () => {
    const state = createNewGame();
    acceptQuest(state, 'slime-hunt');
    defeat(state, 'slime', 2);
    markDone(state, 'letter-peltola');
    expect(decodeSave(encodeSave(state, meta))?.state.quests).toEqual(state.quests);
  });

  it('vanha tallennus ilman tehtäviä latautuu tyhjällä tehtäväkirjalla', () => {
    const text = encodeSave(createNewGame(), meta);
    const raw = JSON.parse(text) as { state: Record<string, unknown> };
    delete raw.state['quests'];
    expect(decodeSave(JSON.stringify(raw))?.state.quests).toEqual({});
  });

  it('tuntemattomat ja rikkinäiset tehtävät jätetään pois', () => {
    const state = createNewGame();
    const raw = JSON.parse(encodeSave(state, meta)) as { state: Record<string, unknown> };
    raw.state['quests'] = {
      'slime-hunt': { active: true, progress: 1, completions: 0 },
      'letter-peltola': { active: 'joo', progress: 1, completions: 0 },
      'ei-ole': { active: true, progress: 1, completions: 0 },
    };
    expect(decodeSave(JSON.stringify(raw))?.state.quests).toEqual({
      'slime-hunt': { active: true, progress: 1, completions: 0 },
    });
  });
});

describe('tehtävien sisältö', () => {
  const ids = QUESTS.map((quest) => quest.id);

  it('tunnisteet ovat uniikkeja ja viittaukset olemassa', () => {
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(NPCS.map((npc) => npc.id)).size).toBe(NPCS.length);
    for (const quest of QUESTS) {
      expect(() => getNpc(quest.giver)).not.toThrow();
      if (quest.requires) expect(ids).toContain(quest.requires);
      for (const stack of quest.reward.items) expect(() => getItem(stack.id)).not.toThrow();
      const goal = quest.goal;
      if (goal.kind === 'defeat') expect(() => getEnemy(goal.enemy)).not.toThrow();
      if (goal.kind === 'bring') expect(() => getItem(goal.item)).not.toThrow();
      if (goal.kind === 'visit') expect(() => getTown(goal.town)).not.toThrow();
    }
    for (const npc of NPCS) {
      expect(() => getTown(npc.town)).not.toThrow();
      expect(() => getSprite(npc.sprite)).not.toThrow();
    }
  });

  it('käyntitehtävä ei vie tehtävänantajan omaan paikkakuntaan', () => {
    for (const quest of QUESTS) {
      if (quest.goal.kind === 'visit') expect(quest.goal.town).not.toBe(getNpc(quest.giver).town);
    }
  });

  it('palkinnoissa on KP:tä ja tehtävä aukeaa aikaisintaan edellisen tasolla', () => {
    for (const quest of QUESTS) {
      expect(quest.reward.xp, quest.id).toBeGreaterThan(0);
      const before = quest.requires ? getQuest(quest.requires).minLevel : 1;
      expect(quest.minLevel, quest.id).toBeGreaterThanOrEqual(before);
      expect(quest.minLevel).toBeLessThanOrEqual(LEVEL_CURVE.maxLevel);
    }
  });

  it('tehtävän pudotukset kuuluvat tuontitehtävälle, joka pyytää samaa esinettä', () => {
    for (const enemy of ENEMIES) {
      for (const drop of enemy.drops ?? []) {
        if (drop.quest === undefined) continue;
        const goal = getQuest(drop.quest).goal;
        expect(goal.kind === 'bring' && goal.item === drop.item, drop.item).toBe(true);
      }
    }
  });

  it('jokainen tuotava esine putoaa jostain vihollisesta', () => {
    for (const quest of QUESTS) {
      const goal = quest.goal;
      if (goal.kind !== 'bring') continue;
      const drops = ENEMIES.flatMap((enemy) => enemy.drops ?? []);
      expect(drops.some((drop) => drop.item === goal.item && drop.quest === quest.id)).toBe(true);
    }
  });

  it('jokaisella tehtävällä on englanninkieliset tekstit', () => {
    for (const quest of QUESTS) {
      const texts = QUEST_TEXTS_EN[quest.id];
      expect(texts?.title && texts.story && texts.thanks, quest.id).toBeTruthy();
    }
    for (const id of Object.keys(QUEST_TEXTS_EN)) expect(ids).toContain(id);
  });

  it('tavoite ja palkinto näkyvät molemmilla kielillä', () => {
    const quest = getQuest('slime-hunt');
    expect(TEXT.quests.goal(quest.goal)).toBe('Voita 3 × Lima');
    expect(TEXT.quests.goal(getQuest('letter-peltola').goal)).toBe('Käy Peltolassa');
    expect(TEXT.quests.reward(15, quest.reward.items)).toBe('Palkinto: 15 KP ja Parannusjuoma ×2');
    setLanguage('en');
    expect(TEXT.names.quest(quest).title).toBe('Slime Trouble');
    expect(TEXT.quests.goal(quest.goal)).toBe('Defeat 3 × Slime');
    setLanguage('fi');
    expect(TEXT.names.quest(quest).title).toBe('Limat kuriin');
  });
});
