import { describe, expect, it } from 'vitest';
import { getEnemy, getNpc, getQuest, getTown, WORLD } from '../src/data';
import { xpForLevel } from '../src/data/level-curve';
import { LEVEL_CURVE } from '../src/data/rules';
import { VOLCANO_STAIRS } from '../src/data/volcano-stairs';
import { createNewGame, grantVictory, type GameState } from '../src/logic/game-state';
import { recordQuestVisit } from '../src/logic/quest-log';
import { acceptQuest, npcNearby, statusOf, turnInQuest } from '../src/logic/quests';
import { decodeSave, encodeSave } from '../src/logic/save-format';
import {
  areStairsComplete,
  readStairSteps,
  recordStairsVictory,
  risenSteps,
  withStairs,
} from '../src/logic/volcano-stairs';
import { buildWorldGrid, isWalkable, terrainAt, townTile } from '../src/logic/world-grid';
import { reachableFrom, tileKey } from './walk-reach';

// Ossi Ketola tulivuoren kraatterissa: lohikäärmeiden voitot nostavat rappuset laavasta.

const never = (): number => 0.999;
const grid = buildWorldGrid(WORLD);
const STEPS = VOLCANO_STAIRS.steps.length;
const ossi = getNpc('ossi');
const home = townTile(getTown(WORLD.startTown));

/** Voittaa lohikäärmeen n kertaa (väijytyksenä, ei karttavihollisena). */
function defeatDragons(state: GameState, times: number): void {
  for (let i = 0; i < times; i += 1) {
    grantVictory(state, null, getEnemy('dragon'), never);
  }
}

/** Pääseekö kotirannasta kävellen Ossin luo, kun laavasta on noussut näin monta askelmaa. */
function canReachOssi(steps: number): boolean {
  return reachableFrom(withStairs(grid, steps), home).has(tileKey(VOLCANO_STAIRS.goal));
}

describe('tulivuoren rappuset', () => {
  it('uudessa pelissä laavasta ei ole noussut askelmia', () => {
    expect(createNewGame().stairSteps).toBe(0);
  });

  it('jokainen lohikäärme nostaa yhden askelman, viimeinen kertoo rappusten valmistuneen', () => {
    const state = createNewGame();
    for (let count = 1; count < STEPS; count += 1) {
      expect(recordStairsVictory(state, 'dragon')).toEqual({
        kind: 'step',
        count,
        needed: STEPS,
      });
    }
    expect(recordStairsVictory(state, 'dragon')).toEqual({ kind: 'complete' });
    expect(areStairsComplete(state)).toBe(true);
    expect(recordStairsVictory(state, 'dragon')).toBeNull();
    expect(state.stairSteps).toBe(STEPS);
  });

  it('muut viholliset eivät nosta askelmia', () => {
    const state = createNewGame();
    expect(recordStairsVictory(state, 'lizard')).toBeNull();
    grantVictory(state, null, getEnemy('troll'), never);
    expect(state.stairSteps).toBe(0);
  });

  it('lohikäärmeen voiton palkinto kertoo uudesta askelmasta', () => {
    const state = createNewGame();
    const reward = grantVictory(state, null, getEnemy('dragon'), never);
    expect(reward.stairs).toEqual({ kind: 'step', count: 1, needed: STEPS });
  });

  it('askelmat ovat kraatterin laavaa ja vievät reunalta saarelle vierekkäin', () => {
    expect(STEPS).toBeGreaterThanOrEqual(3);
    for (const step of VOLCANO_STAIRS.steps) {
      expect(terrainAt(grid, step), tileKey(step)).toBe('lava');
    }
    const tiles = [...VOLCANO_STAIRS.steps, VOLCANO_STAIRS.goal];
    const last = VOLCANO_STAIRS.steps[STEPS - 1];
    for (let i = 1; i < STEPS; i += 1) {
      const [a, b] = [tiles[i - 1], tiles[i]];
      if (!a || !b) continue;
      expect(Math.abs(a.x - b.x) + Math.abs(a.y - b.y)).toBe(1);
    }
    // Viimeisen askelman vieressä on saaren maata.
    expect(last && isWalkable(grid, { x: last.x + 1, y: last.y })).toBe(true);
    expect(isWalkable(grid, VOLCANO_STAIRS.goal)).toBe(true);
  });

  it('Ossin luo pääsee vasta, kun kaikki askelmat ovat nousseet', () => {
    expect(canReachOssi(0)).toBe(false);
    expect(canReachOssi(STEPS - 1)).toBe(false);
    expect(canReachOssi(STEPS)).toBe(true);
    // Ensimmäinen askelma on heti kraatterin reunalla, jonne pääsee kävellen.
    const first = VOLCANO_STAIRS.steps[0];
    expect(first && reachableFrom(withStairs(grid, 1), home).has(tileKey(first))).toBe(true);
  });

  it('rappuset eivät muuta alkuperäistä karttaa', () => {
    const before = grid.cells.map((row) => row.join(','));
    const stairs = withStairs(grid, STEPS);
    expect(grid.cells.map((row) => row.join(','))).toEqual(before);
    for (const step of risenSteps(STEPS)) {
      expect(terrainAt(stairs, step)).toBe('stairs');
      expect(isWalkable(stairs, step)).toBe(true);
    }
    expect(risenSteps(-1)).toEqual([]);
  });

  it('askelmat tallentuvat, ja vanha tallennus alkaa nollasta', () => {
    const state = createNewGame();
    defeatDragons(state, 3);
    const meta = { savedAt: 0, place: 'Tuhkala' };
    expect(decodeSave(encodeSave(state, meta))?.state.stairSteps).toBe(3);
    const old = JSON.parse(encodeSave(createNewGame(), meta)) as { state: Record<string, unknown> };
    delete old.state['stairSteps'];
    expect(decodeSave(JSON.stringify(old))?.state.stairSteps).toBe(0);
    expect(readStairSteps(99)).toBe(STEPS);
    expect(readStairSteps(-2)).toBe(0);
    expect(readStairSteps('3')).toBe(0);
    expect(readStairSteps(2.5)).toBe(0);
  });
});

describe('Ossi Ketola', () => {
  it('seisoo kraatterin saarella, ja hänen kanssaan voi puhua vain saarelta', () => {
    expect(ossi.tile).toEqual(VOLCANO_STAIRS.goal);
    expect(ossi.town).toBeUndefined();
    const goal = VOLCANO_STAIRS.goal;
    expect(npcNearby(undefined, goal)?.id).toBe('ossi');
    expect(npcNearby(undefined, { x: goal.x - 1, y: goal.y + 1 })?.id).toBe('ossi');
    const last = VOLCANO_STAIRS.steps[STEPS - 1] ?? goal;
    expect(npcNearby(undefined, last)).toBeNull();
  });

  it('kiittää pelastuksesta ja lähettää terveiset Jussille, sitten pyytää suomuja', () => {
    const state = createNewGame();
    state.xp = xpForLevel(42, LEVEL_CURVE);
    expect(acceptQuest(state, 'ossi-greetings')).toBe(true);
    recordQuestVisit(state.quests, WORLD.startTown);
    expect(turnInQuest(state, 'ossi-greetings')?.items).toEqual([{ id: 'potion', count: 5 }]);
    const scales = getQuest('dragon-scales');
    expect(statusOf(state, scales)).toBe('available');
    acceptQuest(state, 'dragon-scales');
    // Suomu putoaa vain tehtävän aikana (rng 0 = kaikki pudotukset osuvat).
    for (let i = 0; i < 4; i += 1) grantVictory(state, null, getEnemy('dragon'), () => 0);
    expect(state.inventory['dragon-scale']).toBe(3);
    const reward = turnInQuest(state, 'dragon-scales');
    expect(reward?.items).toEqual([{ id: 'lava-armor', count: 1 }]);
    expect(state.inventory['dragon-scale'] ?? 0).toBe(0);
  });
});
