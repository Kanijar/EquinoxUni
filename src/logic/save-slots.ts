import { SAVE_SLOT_COUNT, STORAGE_KEYS } from '../config/persistence';
import { playerLevel, type GameState } from './game-state';
import { safeRead, safeWrite, type KeyValueStore } from './key-value-store';
import { decodeSave, encodeSave, type SaveMeta } from './save-format';

// Tallennuspaikat (1..SAVE_SLOT_COUNT). Jokainen paikka on oma avaimensa varastossa.

export type SlotInfo =
  | { readonly slot: number; readonly kind: 'empty' }
  | { readonly slot: number; readonly kind: 'broken' }
  | {
      readonly slot: number;
      readonly kind: 'saved';
      readonly level: number;
      readonly xp: number;
      readonly place: string;
      readonly savedAt: number;
    };

export function slotKey(slot: number): string {
  return `${STORAGE_KEYS.saveSlotPrefix}${slot}`;
}

/** Tallennuspaikkojen numerot 1, 2, 3 ... */
export function slotNumbers(count: number = SAVE_SLOT_COUNT): number[] {
  return Array.from({ length: count }, (_, index) => index + 1);
}

export function readSlot(store: KeyValueStore, slot: number): SlotInfo {
  const text = safeRead(store, slotKey(slot));
  if (text === null) {
    return { slot, kind: 'empty' };
  }
  const save = decodeSave(text);
  if (!save) {
    return { slot, kind: 'broken' };
  }
  const { state, place, savedAt } = save;
  return { slot, kind: 'saved', level: playerLevel(state), xp: state.xp, place, savedAt };
}

export function listSlots(store: KeyValueStore): SlotInfo[] {
  return slotNumbers().map((slot) => readSlot(store, slot));
}

/** Tallentaa pelin paikkaan. Palauttaa false, jos selain ei suostunut tallentamaan. */
export function saveToSlot(
  store: KeyValueStore,
  slot: number,
  state: GameState,
  meta: SaveMeta,
): boolean {
  return safeWrite(store, slotKey(slot), encodeSave(state, meta));
}

/** Lataa pelin paikasta. Palauttaa uuden, tallennuksesta erillisen tilan tai null. */
export function loadFromSlot(store: KeyValueStore, slot: number): GameState | null {
  const text = safeRead(store, slotKey(slot));
  return text === null ? null : (decodeSave(text)?.state ?? null);
}

export function deleteSlot(store: KeyValueStore, slot: number): void {
  try {
    store.removeItem(slotKey(slot));
  } catch {
    // Jos selain estää poiston, paikka vain jää ennalleen.
  }
}
