import { isPresenceUrl } from '../logic/presence-message';
import { NoPresence, type PresenceService } from './presence';
import { WebSocketPresence } from './websocket-presence';

// Valitsee pelaajalaskurin toteutuksen. Osoite tulee ympäristömuuttujasta
// VITE_PRESENCE_URL (GitHubissa repon muuttuja PRESENCE_URL, ks. docs/PELAAJALASKURI.md).
// Jos osoitetta ei ole, laskuri on pois päältä eikä peli ota yhteyttä mihinkään.

export function createPresence(url: string | undefined): PresenceService {
  return isPresenceUrl(url) ? new WebSocketPresence(url.trim()) : new NoPresence();
}
