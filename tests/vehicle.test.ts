import { describe, expect, it } from 'vitest';
import { getEnemy, getItem, getQuest, getSprite, MAP_ENEMIES, QUESTS } from '../src/data';
import { xpForLevel } from '../src/data/level-curve';
import { LEVEL_CURVE } from '../src/data/rules';
import { createNewGame, grantVictory, type GameState } from '../src/logic/game-state';
import { acceptQuest, questRows, statusOf, turnInQuest } from '../src/logic/quests';
import { decodeSave, encodeSave } from '../src/logic/save-format';
import { terrainSpeedFactor } from '../src/logic/terrain-speed';
import {
  isDriving,
  isVehicle,
  ownedVehicle,
  toggleDriving,
  vehicleSpeedFactor,
} from '../src/logic/vehicle';

// Bugattin avaimet: Jussi Ketolan viimeinen tehtävä (kaksi lohikäärmettä) ja auto kartalla.

const never = (): number => 0.999;
const meta = { savedAt: 1_700_000_000_000, place: 'Kotiranta' };

function gameWithKeys(): GameState {
  const state = createNewGame();
  state.inventory['bugatti-keys'] = 1;
  return state;
}

describe('Bugattin avaimet', () => {
  it('avaimet ovat kulkuneuvo, joka tekee kulusta 80 % nopeamman', () => {
    const keys = getItem('bugatti-keys');
    expect(isVehicle(keys)).toBe(true);
    expect(isVehicle(keys) && keys.speedMultiplier).toBe(1.8);
    expect(isVehicle(keys) && getSprite(keys.mapSprite).id).toBe('bugatti');
  });

  it('ilman avaimia autoa ei voi kytkeä päälle', () => {
    const state = createNewGame();
    expect(ownedVehicle(state)).toBeNull();
    expect(toggleDriving(state)).toBeNull();
    expect(state.driving).toBe(false);
    expect(vehicleSpeedFactor(state)).toBe(1);
  });

  it('E kytkee auton päälle ja pois: nopeus x1,8 vain päällä', () => {
    const state = gameWithKeys();
    expect(vehicleSpeedFactor(state)).toBe(1);
    expect(toggleDriving(state)).toBe(true);
    expect(isDriving(state)).toBe(true);
    expect(vehicleSpeedFactor(state)).toBe(1.8);
    expect(toggleDriving(state)).toBe(false);
    expect(isDriving(state)).toBe(false);
    expect(vehicleSpeedFactor(state)).toBe(1);
  });

  it('metsä hidastaa autoakin: kertoimet kerrotaan keskenään', () => {
    const state = gameWithKeys();
    toggleDriving(state);
    const forestFactor = terrainSpeedFactor('forest');
    expect(forestFactor).toBeLessThan(1);
    expect(forestFactor * vehicleSpeedFactor(state)).toBeCloseTo(forestFactor * 1.8);
    expect(forestFactor * vehicleSpeedFactor(state)).toBeGreaterThan(forestFactor);
  });

  it('auto pysyy päällä tallennuksessa, ja vanha tallennus latautuu ilman autoa', () => {
    const state = gameWithKeys();
    toggleDriving(state);
    expect(decodeSave(encodeSave(state, meta))?.state.driving).toBe(true);
    const raw = JSON.parse(encodeSave(createNewGame(), meta)) as { state: Record<string, unknown> };
    delete raw.state['driving'];
    expect(decodeSave(JSON.stringify(raw))?.state.driving).toBe(false);
  });
});

describe('Jussin viimeinen tehtävä: Lohikäärmeiden tuho', () => {
  /** Pelaaja tasolla 40, Liskovahti tehty kerran. */
  function readyForDragons(): GameState {
    const state = createNewGame();
    state.xp = xpForLevel(40, LEVEL_CURVE);
    for (const id of ['fire-lizards', 'lizard-watch']) {
      state.quests[id] = { active: false, progress: 0, completions: 1 };
    }
    return state;
  }

  it('on Jussin taistelutehtävistä viimeinen ja vaatii kaksi lohikäärmettä', () => {
    const quest = getQuest('dragon-hunt');
    expect(quest.goal).toEqual({ kind: 'defeat', enemy: 'dragon', count: 2 });
    expect(quest.requires).toBe('lizard-watch');
    const jussi = QUESTS.filter((entry) => entry.giver === 'jussi');
    const maxLevel = Math.max(...jussi.map((entry) => entry.minLevel));
    expect(quest.minLevel).toBe(maxLevel);
  });

  it('kartalla on kaksi lohikäärmettä', () => {
    expect(MAP_ENEMIES.filter((spawn) => spawn.enemy === 'dragon')).toHaveLength(2);
  });

  it('kahden lohikäärmeen jälkeen Jussi antaa Bugattin avaimet', () => {
    const state = readyForDragons();
    expect(statusOf(state, getQuest('dragon-hunt'))).toBe('available');
    expect(acceptQuest(state, 'dragon-hunt')).toBe(true);
    grantVictory(state, null, getEnemy('dragon'), never);
    expect(statusOf(state, getQuest('dragon-hunt'))).toBe('active');
    grantVictory(state, null, getEnemy('dragon'), never);
    expect(statusOf(state, getQuest('dragon-hunt'))).toBe('ready');
    expect(turnInQuest(state, 'dragon-hunt')).not.toBeNull();
    expect(state.inventory['bugatti-keys']).toBe(1);
    expect(ownedVehicle(state)?.id).toBe('bugatti-keys');
  });

  it('avaimet saa vain kerran: tehtävää ei voi toistaa', () => {
    const state = readyForDragons();
    state.quests['dragon-hunt'] = { active: false, progress: 0, completions: 1 };
    expect(statusOf(state, getQuest('dragon-hunt'))).toBe('done');
    expect(questRows(state, 'jussi').map((row) => row.quest.id)).not.toContain('dragon-hunt');
  });
});
