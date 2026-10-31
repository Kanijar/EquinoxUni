import { describe, expect, it } from 'vitest';
import { SAVE_SLOT_COUNT, SAVE_VERSION } from '../src/config/persistence';
import { MAP_ENEMIES, WORLD } from '../src/data';
import { createNewGame, playerStats, type GameState } from '../src/logic/game-state';
import { MemoryStore, type KeyValueStore } from '../src/logic/key-value-store';
import { decodeSave, encodeSave, migrateSave } from '../src/logic/save-format';
import { deleteSlot, listSlots, loadFromSlot, saveToSlot, slotKey } from '../src/logic/save-slots';

const meta = { savedAt: 1_700_000_000_000, place: 'Tampere' };

function playedGame(): GameState {
  const state = createNewGame();
  state.xp = 40;
  state.skills.attack = 2;
  state.skills.vitality = 1;
  state.inventory['potion'] = 5;
  state.position = { x: 123.5, y: 456 };
  state.defeated.push(0, 3);
  state.hp = 20;
  state.lastTown = 'tampere';
  return state;
}

describe('tallennusmuoto', () => {
  it('tallennettu peli latautuu samanlaisena', () => {
    const state = playedGame();
    const save = decodeSave(encodeSave(state, meta));
    expect(save).not.toBeNull();
    expect(save?.state).toEqual(state);
    expect(save?.place).toBe('Tampere');
    expect(save?.savedAt).toBe(meta.savedAt);
    expect(save?.version).toBe(SAVE_VERSION);
  });

  it('ladattu tila on erillinen kopio', () => {
    const state = playedGame();
    const loaded = decodeSave(encodeSave(state, meta))?.state;
    loaded?.defeated.push(5);
    expect(state.defeated).toEqual([0, 3]);
  });

  it('rikkinäinen teksti ei kaada peliä', () => {
    expect(decodeSave('ei json')).toBeNull();
    expect(decodeSave('null')).toBeNull();
    expect(decodeSave('[]')).toBeNull();
    expect(decodeSave('{"version":1}')).toBeNull();
  });

  it('uudemman pelin version tallennusta ei ladata', () => {
    const text = encodeSave(playedGame(), meta).replace(
      `"version":${SAVE_VERSION}`,
      `"version":${SAVE_VERSION + 1}`,
    );
    expect(decodeSave(text)).toBeNull();
  });

  it('tuntematon vanha versio hylätään, nykyinen kelpaa sellaisenaan', () => {
    expect(migrateSave({ version: 0 })).toBeNull();
    expect(migrateSave({ version: SAVE_VERSION, x: 1 })).toEqual({ version: SAVE_VERSION, x: 1 });
  });

  it('väärät arvot hylätään', () => {
    const bad = (patch: Record<string, unknown>) => {
      const raw = JSON.parse(encodeSave(playedGame(), meta)) as { state: object };
      raw.state = { ...raw.state, ...patch };
      return decodeSave(JSON.stringify(raw));
    };
    expect(bad({ xp: -5 })).toBeNull();
    expect(bad({ hp: 'paljon' })).toBeNull();
    expect(bad({ skills: { attack: 1.5 } })).toBeNull();
    expect(bad({ position: { x: 'a', y: 1 } })).toBeNull();
    expect(bad({ defeated: 'kaikki' })).toBeNull();
  });

  it('tuntemattomat esineet ja viholliset jätetään pois, puuttuva kyky on 0', () => {
    const raw = JSON.parse(encodeSave(playedGame(), meta)) as { state: Record<string, unknown> };
    raw.state['inventory'] = { potion: 2, lohikaarme: 9 };
    raw.state['defeated'] = [1, 1, MAP_ENEMIES.length, 2];
    raw.state['skills'] = { attack: 1 };
    const state = decodeSave(JSON.stringify(raw))?.state;
    expect(state?.inventory).toEqual({ potion: 2 });
    expect(state?.defeated).toEqual([1, 2]);
    expect(state?.skills).toEqual({
      attack: 1,
      defense: 0,
      vitality: 0,
      precision: 0,
      magic: 0,
    });
  });

  it('vanha tallennus ilman tarkkuutta ja maagiaa latautuu, uudet kyvyt ovat 0', () => {
    const raw = JSON.parse(encodeSave(playedGame(), meta)) as { state: Record<string, unknown> };
    raw.state['skills'] = { attack: 2, defense: 0, vitality: 1 };
    const state = decodeSave(JSON.stringify(raw))?.state;
    expect(state?.skills).toEqual({ attack: 2, defense: 0, vitality: 1, precision: 0, magic: 0 });
  });

  it('tarkkuus ja maagia tallentuvat', () => {
    const state = playedGame();
    state.skills.precision = 1;
    state.skills.magic = 1;
    expect(decodeSave(encodeSave(state, meta))?.state.skills).toEqual(state.skills);
  });

  it('tuntematon viimeisin paikkakunta vaihtuu aloituspaikkakunnaksi', () => {
    const raw = JSON.parse(encodeSave(playedGame(), meta)) as { state: Record<string, unknown> };
    raw.state['lastTown'] = 'atlantis';
    expect(decodeSave(JSON.stringify(raw))?.state.lastTown).toBe(WORLD.startTown);
    delete raw.state['lastTown'];
    expect(decodeSave(JSON.stringify(raw))?.state.lastTown).toBe(WORLD.startTown);
  });

  it('elämä pysyy rajoissa', () => {
    const raw = JSON.parse(encodeSave(playedGame(), meta)) as { state: Record<string, unknown> };
    raw.state['hp'] = 9999;
    const state = decodeSave(JSON.stringify(raw))?.state;
    expect(state && state.hp).toBe(state && playerStats(state).maxHp);
    raw.state['hp'] = 0;
    expect(decodeSave(JSON.stringify(raw))?.state.hp).toBe(1);
  });
});

describe('tallennuspaikat', () => {
  it('aluksi kaikki paikat ovat tyhjiä', () => {
    const slots = listSlots(new MemoryStore());
    expect(slots).toHaveLength(SAVE_SLOT_COUNT);
    expect(slots.every((slot) => slot.kind === 'empty')).toBe(true);
  });

  it('tallennus, lataus ja poisto', () => {
    const store = new MemoryStore();
    const state = playedGame();
    expect(saveToSlot(store, 2, state, meta)).toBe(true);
    expect(listSlots(store)[1]).toEqual({
      slot: 2,
      kind: 'saved',
      level: 3,
      xp: 40,
      place: 'Tampere',
      savedAt: meta.savedAt,
    });
    expect(loadFromSlot(store, 2)).toEqual(state);
    expect(loadFromSlot(store, 1)).toBeNull();
    deleteSlot(store, 2);
    expect(listSlots(store)[1]?.kind).toBe('empty');
  });

  it('rikkinäinen tallennus näkyy omana tilanaan', () => {
    const store = new MemoryStore();
    store.setItem(slotKey(1), '{rikki');
    expect(listSlots(store)[0]?.kind).toBe('broken');
    expect(loadFromSlot(store, 1)).toBeNull();
  });

  it('jos selain estää tallennuksen, saveToSlot palauttaa false', () => {
    const full: KeyValueStore = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => undefined,
    };
    expect(saveToSlot(full, 1, playedGame(), meta)).toBe(false);
    expect(listSlots(full)[0]?.kind).toBe('empty');
  });
});
