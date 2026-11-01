import type { MapPoint } from '../data/types';

// Monikulmion ja ympyrän tarkistukset kartan ruuduille (saaren rantaviiva, alueet, järvet).

/** Onko piste monikulmion sisällä (säteenheittoalgoritmi). */
export function isInsidePolygon(point: MapPoint, polygon: readonly MapPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (!a || !b) {
      continue;
    }
    const crosses = a.y > point.y !== b.y > point.y;
    if (crosses && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

/** Onko piste ympyrän sisällä tai reunalla. */
export function isInsideCircle(
  point: MapPoint,
  circle: MapPoint & { readonly radius: number },
): boolean {
  return Math.hypot(point.x - circle.x, point.y - circle.y) <= circle.radius;
}
