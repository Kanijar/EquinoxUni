import { createLeaderboard, type LeaderboardService } from '../net/leaderboard';

// Pelin yhteinen 10 parhaan listan yhteys. Osoite johdetaan pelaajalaskurin osoitteesta
// (VITE_PRESENCE_URL), joten lista toimii heti, kun laskurin palvelin on pystytetty.

let service: LeaderboardService | null = null;

export function leaderboardService(): LeaderboardService {
  service ??= createLeaderboard(import.meta.env.VITE_PRESENCE_URL);
  return service;
}
