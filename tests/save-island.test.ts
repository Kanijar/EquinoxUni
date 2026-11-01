import { describe, expect, it } from 'vitest';
import { FINLAND_MAP_TROLLS } from '../src/config/persistence';
import { getTown, WORLD } from '../src/data';
import { createNewGame } from '../src/logic/game-state';
import { decodeSave, encodeSave } from '../src/logic/save-format';

// Vanha Suomen kartan tallennus (versio 5) siirtyy saarelle (versio 6).

/** Versio 5 -tallennus, jossa sankari on Tampereella ja on voittanut vihollisia. */
function finlandSave(): Record<string, unknown> {
  const state = createNewGame();
  state.xp = 900;
  state.skills.attack = 10;
  state.inventory['potion'] = 4;
  state.inventory['club'] = 1;
  state.equipped.neck = 'tooth-necklace';
  state.eyeColor = 'black';
  state.bossProgress = 3;
  const raw = JSON.parse(encodeSave(state, { savedAt: 1, place: 'Tampere' })) as Record<
    string,
    unknown
  >;
  const oldState = raw['state'] as Record<string, unknown>;
  oldState['position'] = { x: 900, y: 2000 };
  oldState['lastTown'] = 'tampere';
  oldState['defeated'] = [0, 5, ...FINLAND_MAP_TROLLS];
  oldState['respawning'] = [{ index: 5, msLeft: 1000 }];
  oldState['completed'] = true;
  return { ...raw, version: 5, state: oldState };
}

describe('vanha tallennus saarelle', () => {
  const save = decodeSave(JSON.stringify(finlandSave()));
  const state = save?.state;

  it('sankari herää saaren aloituskylässä', () => {
    expect(state?.position).toBeNull();
    expect(state?.lastTown).toBe(WORLD.startTown);
    expect(save?.place).toBe(getTown(WORLD.startTown).name);
  });

  it('saaren viholliset ovat voittamatta, eikä läpäisyä ole juhlittu', () => {
    expect(state?.defeated).toEqual([]);
    expect(state?.respawning).toEqual([]);
    expect(state?.completed).toBe(false);
  });

  it('taso, kykypisteet, reppu, varusteet, silmät ja peikkolaskuri säilyvät', () => {
    expect(state?.xp).toBe(900);
    expect(state?.skills.attack).toBe(10);
    expect(state?.inventory).toEqual({ potion: 4, club: 1 });
    expect(state?.equipped).toEqual({ neck: 'tooth-necklace' });
    expect(state?.eyeColor).toBe('black');
    expect(state?.bossProgress).toBe(3);
  });

  it('versio 4: peikkolaskuri lasketaan Suomen kartan peikoista', () => {
    const raw = finlandSave();
    const oldState = raw['state'] as Record<string, unknown>;
    delete oldState['bossProgress'];
    delete oldState['bossDefeated'];
    oldState['defeated'] = [0, FINLAND_MAP_TROLLS[0], FINLAND_MAP_TROLLS[1]];
    expect(decodeSave(JSON.stringify({ ...raw, version: 4 }))?.state.bossProgress).toBe(2);
  });
});
