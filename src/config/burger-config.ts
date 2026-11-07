// Alkuruudun salainen burgeri (ui/secret-burger.ts) pelin pikseleinä (480 × 270).
// Burgeri on tarkoituksella todella pieni (6 × 5 px) ja vasemmassa reunassa ylhäällä.
// Se on näkymätön ja välähtää näkyviin hetkeksi kerran minuutissa. Napautus toimii aina.
// Napautusalue on kuvaa vähän isompi, jotta sen osuu peukalolla, kun sen on löytänyt.

export const BURGER_VIEW = {
  /** Burgerin keskikohta: vasen reuna, vähän otsikkoa ylempänä. */
  x: 7,
  y: 18,
  scale: 1,
  /** Napautusalueen leveys ja korkeus. */
  hitSize: 22,
  sprite: 'burger',
  bittenSprite: 'burger-bitten',
  /** Välähdys: näin usein burgeri tulee näkyviin, häivytyksen kesto ja kuinka kauan se näkyy. */
  flashEveryMs: 60_000,
  flashFadeMs: 150,
  flashHoldMs: 1000,
  /** Napautus: burgeri pomppaa isommaksi ja palaa. */
  popScale: 1.8,
  popMs: 120,
  /** Murut lentävät burgerista (ui/wolf-magic.ts burstStars). */
  crumbCount: 10,
  crumbCountSmall: 4,
  crumbColors: [0xd98c2b, 0x5fd35f, 0x6b3a1e, 0xfff4d0],
} as const;
