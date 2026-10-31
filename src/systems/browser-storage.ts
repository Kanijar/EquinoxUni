import { MemoryStore, type KeyValueStore } from '../logic/key-value-store';

// Selaimen localStorage. Jos selain estää sen (esim. yksityinen tila),
// käytetään muistia: peli toimii, mutta tallennukset katoavat sivun sulkeutuessa.

let store: KeyValueStore | null = null;

export function browserStore(): KeyValueStore {
  store ??= openLocalStorage();
  return store;
}

function openLocalStorage(): KeyValueStore {
  try {
    const probe = '__vainon-seikkailu-testi__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return new MemoryStore();
  }
}
