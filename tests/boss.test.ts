import { describe, expect, it } from 'vitest';
import { ENEMIES, getEnemy, MAP_ENEMIES } from '../src/data';
import { FINAL_BOSS } from '../src/data/boss';
import type { BossDef } from '../src/data/types';
import { TEXT } from '../src/i18n/text';
import {
  bossHudText,
  bossName,
  isBoss,
  isBossAwake,
  isBossOnMap,
  recordBossVictory,
  type BossProgress,
} from '../src/logic/boss';
import {
  celebrateCompletion,
  createNewGame,
  enemiesToBeat,
  grantVictory,
} from '../src/logic/game-state';

// Loppuboss: viisi tunturipeikkoa herättää Peikkokuninkaan, voitettu boss ei palaa
// ja peli jatkuu voiton jälkeen.

const boss: BossDef = { enemy: 'king', unlockEnemy: 'troll', unlockCount: 3, lon: 0, lat: 0 };
const fresh = (): BossProgress => ({ bossProgress: 0, bossDefeated: false });

describe('loppubossin herääminen', () => {
  it('laskuri kasvaa vain herättävän vihollisen voitoista', () => {
    const state = fresh();
    expect(recordBossVictory(state, 'slime', boss)).toBeNull();
    expect(recordBossVictory(state, 'troll', boss)).toEqual({
      kind: 'progress',
      count: 1,
      needed: 3,
    });
    expect(state.bossProgress).toBe(1);
    expect(isBossAwake(state, boss)).toBe(false);
  });

  it('boss herää, kun laskuri täyttyy, eikä laskuri kasva sen jälkeen', () => {
    const state = fresh();
    recordBossVictory(state, 'troll', boss);
    recordBossVictory(state, 'troll', boss);
    expect(recordBossVictory(state, 'troll', boss)).toEqual({ kind: 'awakened' });
    expect(isBossOnMap(state, boss)).toBe(true);
    expect(recordBossVictory(state, 'troll', boss)).toBeNull();
    expect(state.bossProgress).toBe(3);
  });

  it('voitettu boss ei ole enää kartalla', () => {
    const state: BossProgress = { bossProgress: 3, bossDefeated: false };
    expect(recordBossVictory(state, 'king', boss)).toEqual({ kind: 'defeated' });
    expect(state.bossDefeated).toBe(true);
    expect(isBossOnMap(state, boss)).toBe(false);
    expect(recordBossVictory(state, 'troll', boss)).toBeNull();
  });

  it('HUD näyttää peikkolaskurin, herännyt bossin ja voiton jälkeen ei mitään', () => {
    const state = fresh();
    expect(bossHudText(state, FINAL_BOSS)).toBe(TEXT.hud.trolls(0, FINAL_BOSS.unlockCount));
    state.bossProgress = FINAL_BOSS.unlockCount;
    expect(bossHudText(state, FINAL_BOSS)).toBe(TEXT.hud.bossAwake(bossName()));
    state.bossDefeated = true;
    expect(bossHudText(state, FINAL_BOSS)).toBe('');
  });
});

describe('loppuboss pelissä', () => {
  it('Peikkokuningas herää viidestä tunturipeikosta', () => {
    expect(FINAL_BOSS.unlockEnemy).toBe('troll');
    expect(FINAL_BOSS.unlockCount).toBe(5);
    const state = createNewGame();
    const troll = getEnemy('troll');
    const news = [1, 2, 3, 4, 5].map(() => grantVictory(state, 13, troll).boss);
    expect(news.slice(0, 4).map((n) => n?.kind)).toEqual(Array(4).fill('progress'));
    expect(news[4]).toEqual({ kind: 'awakened' });
    expect(isBossOnMap(state)).toBe(true);
  });

  it('bossin voitto: iso palkinto, Kuninkaan viitta ja juoma, eikä boss palaa', () => {
    const state = createNewGame();
    state.bossProgress = FINAL_BOSS.unlockCount;
    const king = getEnemy(FINAL_BOSS.enemy);
    const potions = state.inventory['potion'] ?? 0;
    const reward = grantVictory(state, null, king);
    expect(reward.boss).toEqual({ kind: 'defeated' });
    expect(reward.drops).toEqual(['king-cloak', 'potion']);
    expect(state.inventory['king-cloak']).toBe(1);
    expect(state.inventory['potion']).toBe(potions + 1);
    expect(state.xp).toBe(king.xp);
    expect(state.bossDefeated).toBe(true);
    expect(state.respawning).toEqual([]);
    expect(state.defeated).toEqual([]);
    expect(isBossOnMap(state)).toBe(false);
  });

  it('boss on selvästi vahvempi kuin tunturipeikko ja sillä on erikoisliikkeet', () => {
    const king = getEnemy(FINAL_BOSS.enemy);
    const troll = getEnemy(FINAL_BOSS.unlockEnemy);
    expect(isBoss(king.id)).toBe(true);
    expect(king.stats.maxHp).toBeGreaterThan(troll.stats.maxHp * 3);
    expect(king.stats.attack).toBeGreaterThan(troll.stats.attack);
    expect(king.xp).toBeGreaterThan(troll.xp * 10);
    expect(king.moves).toBeDefined();
    expect(king.backdrop).toBe('summit');
  });

  it('boss ei ole tavallisten karttavihollisten listassa (ei vaikuta läpäisyyn)', () => {
    expect(MAP_ENEMIES.some((spawn) => spawn.enemy === FINAL_BOSS.enemy)).toBe(false);
    expect(ENEMIES.map((enemy) => enemy.id)).toContain(FINAL_BOSS.enemy);
  });
});

describe('läpäisy', () => {
  it('voittoruutu näytetään kerran, kun jokainen karttavihollinen on voitettu, ja peli jatkuu', () => {
    const state = createNewGame();
    expect(celebrateCompletion(state)).toBe(false);
    state.defeated.push(...MAP_ENEMIES.map((_, index) => index));
    expect(enemiesToBeat(state)).toBe(0);
    expect(celebrateCompletion(state)).toBe(true);
    expect(state.completed).toBe(true);
    expect(celebrateCompletion(state)).toBe(false);
  });
});
