// Avain–arvo-varasto, johon tallennukset ja asetukset kirjoitetaan.
// Selaimessa tämä on localStorage (systems/browser-storage.ts), testeissä MemoryStore.

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Muistissa toimiva varasto: testit ja varavaihtoehto, jos localStorage ei toimi. */
export class MemoryStore implements KeyValueStore {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

/** Lukee arvon. Palauttaa null, jos lukeminen epäonnistuu (esim. selain estää tallennuksen). */
export function safeRead(store: KeyValueStore, key: string): string | null {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

/** Kirjoittaa arvon. Palauttaa false, jos kirjoitus epäonnistuu (esim. tila on täynnä). */
export function safeWrite(store: KeyValueStore, key: string, value: string): boolean {
  try {
    store.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/** Lukee JSON-tekstin. Palauttaa null, jos teksti ei ole kelvollista JSONia. */
export function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
