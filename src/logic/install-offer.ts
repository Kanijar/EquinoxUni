// Pelin asennustarjous (PWA). Chrome kertoo tapahtumalla, että pelin voi asentaa, ja
// tapahtuman prompt() avaa asennusikkunan. Tämä luokka muistaa tarjouksen, kertoo
// kuuntelijoille, näytetäänkö ASENNA-nappi, ja käyttää tarjouksen vain kerran
// (Chrome ei salli saman tapahtuman uudelleenkäyttöä). Selaimen tapahtumat: systems/install-prompt.ts.

/** Chromen asennustapahtuman osa, jota peli tarvitsee. */
export interface InstallPrompt {
  prompt(): Promise<unknown>;
}

type Listener = (available: boolean) => void;

export class InstallOffer {
  private pending: InstallPrompt | null = null;
  private readonly listeners = new Set<Listener>();

  get available(): boolean {
    return this.pending !== null;
  }

  /** Chrome tarjoaa asennusta (beforeinstallprompt). */
  offer(prompt: InstallPrompt): void {
    this.pending = prompt;
    this.notify();
  }

  /** Peli asennettiin (appinstalled): nappia ei enää tarvita. */
  installed(): void {
    this.pending = null;
    this.notify();
  }

  /** Avaa asennusikkunan. Palauttaa false, jos tarjousta ei ole. */
  async install(): Promise<boolean> {
    const prompt = this.pending;
    if (!prompt) {
      return false;
    }
    this.pending = null;
    this.notify();
    await prompt.prompt();
    return true;
  }

  /** Kutsuu kuuntelijaa heti ja aina tilan muuttuessa. Palauttaa lopetusfunktion. */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.available);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.available);
    }
  }
}
