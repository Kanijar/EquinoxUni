// Alkuruudun salainen burgeri (ui/secret-burger.ts) pelin pikseleinä (480 × 270).
// Burgeri on tarkoituksella todella pieni (8 × 7 px) ja vasemmassa reunassa taivaalla.
// Napautusalue on kuvaa vähän isompi, jotta sen osuu peukalolla, kun sen on löytänyt.

export const BURGER_VIEW = {
  /** Burgerin keskikohta: vasen reuna, otsikon ja sankarin välissä. */
  x: 8,
  y: 124,
  scale: 1,
  /** Napautusalueen leveys ja korkeus. */
  hitSize: 22,
  sprite: 'burger',
  bittenSprite: 'burger-bitten',
  /** Napautus: burgeri pomppaa isommaksi ja palaa. */
  popScale: 1.8,
  popMs: 120,
  /** Murut lentävät burgerista (ui/wolf-magic.ts burstStars). */
  crumbCount: 10,
  crumbCountSmall: 4,
  crumbColors: [0xd98c2b, 0x5fd35f, 0xffd23f, 0xfff4d0],
} as const;
