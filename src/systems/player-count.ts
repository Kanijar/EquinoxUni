import { createPresence } from '../net/create-presence';
import type { PlayerCount, PresenceService } from '../net/presence';

// Pitää yllä yhtä yhteistä pelaajalaskuria koko pelin ajan (ei erikseen joka scenessä).
// Kun puhelimen näyttö sammuu tai selain siirtyy taustalle, pelaaja lähtee laskurista,
// ja palaa, kun peli on taas näkyvissä. Näin luku kertoo, montako pelaa juuri nyt.

type Listener = (count: PlayerCount) => void;

export class PlayerCounter {
  private count: PlayerCount = null;
  private readonly listeners = new Set<Listener>();

  constructor(private readonly presence: PresenceService) {}

  get current(): PlayerCount {
    return this.count;
  }

  start(): void {
    this.presence.connect((count) => this.set(count));
  }

  stop(): void {
    this.presence.disconnect();
    this.set(null);
  }

  /** Kutsuu kuuntelijaa heti nykyisellä luvulla ja aina sen muuttuessa. Palauttaa lopetusfunktion. */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.count);
    return () => this.listeners.delete(listener);
  }

  private set(count: PlayerCount): void {
    if (count === this.count) {
      return;
    }
    this.count = count;
    for (const listener of this.listeners) {
      listener(count);
    }
  }
}

let counter: PlayerCounter | null = null;

/** Pelin yhteinen laskuri. Luodaan ensimmäisellä kutsulla (BootScene). */
export function playerCounter(): PlayerCounter {
  counter ??= new PlayerCounter(createPresence(import.meta.env.VITE_PRESENCE_URL));
  return counter;
}

/** Käynnistää laskurin ja seuraa, onko peli näkyvissä. Kutsutaan kerran BootScenessä. */
export function initPlayerCount(): void {
  const players = playerCounter();
  const follow = (): void => (document.hidden ? players.stop() : players.start());
  document.addEventListener('visibilitychange', follow);
  follow();
}
