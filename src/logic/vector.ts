// Pienet vektoriapurit liikkumiseen ja etäisyyksiin.

export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

export const ZERO: Vec2 = { x: 0, y: 0 };

export function length(v: Vec2): number {
  return Math.hypot(v.x, v.y);
}

export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Palauttaa yksikkövektorin. Nollavektori pysyy nollana. */
export function normalize(v: Vec2): Vec2 {
  const len = length(v);
  return len === 0 ? ZERO : { x: v.x / len, y: v.y / len };
}

/** Rajoittaa vektorin pituuden enintään arvoon max. */
export function clampLength(v: Vec2, max: number): Vec2 {
  const len = length(v);
  return len <= max ? v : { x: (v.x / len) * max, y: (v.y / len) * max };
}

export function directionTo(from: Vec2, to: Vec2): Vec2 {
  return normalize({ x: to.x - from.x, y: to.y - from.y });
}
