import { IDEAS_STORAGE } from '../config/ideas';
import { isDeviceId, newDeviceId } from '../logic/ideas';
import { safeRead, safeWrite } from '../logic/key-value-store';
import { createIdeas, type IdeasService } from '../net/ideas';
import { browserStore } from './browser-storage';

// Pelin yhteinen ideaviestien yhteys ja laitteen salainen tunniste. Osoite johdetaan
// pelaajalaskurin osoitteesta (VITE_PRESENCE_URL). Tunniste arvotaan kerran ja tallennetaan
// selaimeen (ei tallennuksiin): yksi tykkäys per laite ja oman idean tunnistus.

let service: IdeasService | null = null;

export function ideasService(): IdeasService {
  service ??= createIdeas(import.meta.env.VITE_PRESENCE_URL);
  return service;
}

/** Laitteen tunniste. Arvotaan ensimmäisellä kerralla. Ei näy kenellekään. */
export function ideasDevice(): string {
  const store = browserStore();
  const saved = safeRead(store, IDEAS_STORAGE.deviceKey);
  if (isDeviceId(saved)) {
    return saved;
  }
  const id = newDeviceId();
  safeWrite(store, IDEAS_STORAGE.deviceKey, id);
  return id;
}
