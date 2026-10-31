// Toistettava satunnaisluku: sama siemen antaa aina saman lukujonon. Käytetään
// esimerkiksi taistelun taustan puiden ja kukkien sijoitteluun, jotta sama tausta
// näyttää joka kerta samalta.

/** Palauttaa funktion, joka antaa lukuja väliltä 0..1 (Mulberry32-algoritmi). */
export function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Kokonaisluku väliltä min..max (molemmat mukaan lukien). */
export function randomInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}
