import { describe, expect, it } from 'vitest';
import { getEnemy, MAP_ENEMIES } from '../src/data';
import { RESPAWN_RULES } from '../src/data/rules';
import { createNewGame, enemiesToBeat, grantVictory } from '../src/logic/game-state';
import {
  isFarEnough,
  isRespawning,
  mapEnemyRespawnMs,
  respawnDelayMs,
  startRespawn,
  tickRespawns,
  type RespawnTimer,
} from '../src/logic/respawn';

const always = (): boolean => true;
const never = (): boolean => false;

describe('vihollisten palaaminen', () => {
  it('palautusaika tulee säännöistä, ellei vihollisella ole omaa', () => {
    expect(respawnDelayMs(getEnemy('slime'))).toBe(RESPAWN_RULES.delayMs);
    expect(respawnDelayMs(getEnemy('troll'))).toBe(getEnemy('troll').respawnMs);
    expect(mapEnemyRespawnMs(MAP_ENEMIES.length + 5)).toBe(RESPAWN_RULES.delayMs);
  });

  it('vihollinen palaa vasta, kun aika on kulunut', () => {
    const timers: RespawnTimer[] = [];
    startRespawn(timers, 2, 1000);
    expect(tickRespawns(timers, 600, always)).toEqual([]);
    expect(timers).toEqual([{ index: 2, msLeft: 400 }]);
    expect(tickRespawns(timers, 400, always)).toEqual([2]);
    expect(timers).toEqual([]);
  });

  it('valmis vihollinen odottaa, kunnes pelaaja on tarpeeksi kaukana', () => {
    const timers: RespawnTimer[] = [];
    startRespawn(timers, 1, 500);
    expect(tickRespawns(timers, 5000, never)).toEqual([]);
    expect(timers).toEqual([{ index: 1, msLeft: 0 }]);
    expect(tickRespawns(timers, 0, always)).toEqual([1]);
  });

  it('palaa vain ne, joiden aika on kulunut ja joiden paikka on vapaa', () => {
    const timers: RespawnTimer[] = [];
    startRespawn(timers, 0, 100);
    startRespawn(timers, 3, 100);
    startRespawn(timers, 5, 9000);
    expect(tickRespawns(timers, 200, (index) => index !== 3)).toEqual([0]);
    expect(timers.map((timer) => timer.index)).toEqual([3, 5]);
  });

  it('uusi voitto aloittaa ajan alusta eikä tuplaa vihollista', () => {
    const timers: RespawnTimer[] = [];
    startRespawn(timers, 4, 100);
    startRespawn(timers, 4, 1000);
    expect(timers).toEqual([{ index: 4, msLeft: 1000 }]);
    expect(isRespawning(timers, 4)).toBe(true);
    expect(isRespawning(timers, 2)).toBe(false);
  });

  it('negatiivinen aika ei pidennä odotusta', () => {
    const timers: RespawnTimer[] = [{ index: 0, msLeft: 100 }];
    tickRespawns(timers, -500, never);
    expect(timers).toEqual([{ index: 0, msLeft: 100 }]);
  });

  it('etäisyys pelaajaan ratkaisee, saako vihollinen palata', () => {
    const spawn = { x: 0, y: 0 };
    const near = RESPAWN_RULES.minPlayerDistancePx - 1;
    expect(isFarEnough(spawn, { x: near, y: 0 })).toBe(false);
    expect(isFarEnough(spawn, { x: RESPAWN_RULES.minPlayerDistancePx, y: 0 })).toBe(true);
  });
});

describe('voitto ja palaaminen pelin tilassa', () => {
  it('voitettu karttavihollinen lähtee kartalta palautusajaksi', () => {
    const state = createNewGame();
    grantVictory(state, 4, getEnemy('hiisi'));
    expect(state.respawning).toEqual([{ index: 4, msLeft: RESPAWN_RULES.delayMs }]);
    expect(enemiesToBeat(state)).toBe(MAP_ENEMIES.length - 1);
  });

  it('palannut vihollinen voidaan voittaa uudelleen, ja se lasketaan vain kerran', () => {
    const state = createNewGame();
    grantVictory(state, 4, getEnemy('hiisi'));
    tickRespawns(state.respawning, RESPAWN_RULES.delayMs, always);
    expect(state.respawning).toEqual([]);
    const reward = grantVictory(state, 4, getEnemy('hiisi'));
    expect(reward.xp).toBe(getEnemy('hiisi').xp);
    expect(state.defeated).toEqual([4]);
    expect(state.respawning).toHaveLength(1);
    expect(enemiesToBeat(state)).toBe(MAP_ENEMIES.length - 1);
  });

  it('väijytyksen voitto ei aloita palautusaikaa', () => {
    const state = createNewGame();
    grantVictory(state, null, getEnemy('robber'));
    expect(state.respawning).toEqual([]);
  });
});
