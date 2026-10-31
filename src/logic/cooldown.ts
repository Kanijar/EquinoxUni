// Ajastin toistuville toiminnoille (hyökkäys, kyvyt). Aika millisekunteina.

export class Cooldown {
  private readyAt = 0;

  constructor(private readonly durationMs: number) {}

  isReady(now: number): boolean {
    return now >= this.readyAt;
  }

  /** Yrittää käyttää toiminnon. Palauttaa true, jos se onnistui. */
  tryUse(now: number): boolean {
    if (!this.isReady(now)) {
      return false;
    }
    this.readyAt = now + this.durationMs;
    return true;
  }
}
