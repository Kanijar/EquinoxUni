import type { GeoPoint, MapProjection } from '../data/types';
import type { Vec2 } from './vector';

// Muunnokset oikeiden koordinaattien (pituus- ja leveysaste) ja karttaruutujen välillä.
// Kartta on tasakulmainen projektio: yksi ruutu on aina yhtä monta kilometriä.

const KM_PER_DEGREE_LAT = 111.32;

function kmPerDegreeLon(p: MapProjection): number {
  return KM_PER_DEGREE_LAT * Math.cos((p.referenceLat * Math.PI) / 180);
}

/** Kartan koko ruutuina. */
export function gridSize(p: MapProjection): { readonly width: number; readonly height: number } {
  return {
    width: Math.ceil(((p.east - p.west) * kmPerDegreeLon(p)) / p.kmPerTile),
    height: Math.ceil(((p.north - p.south) * KM_PER_DEGREE_LAT) / p.kmPerTile),
  };
}

/** Ruutu, jossa annettu paikka on. */
export function geoToTile(point: GeoPoint, p: MapProjection): Vec2 {
  return {
    x: Math.floor(((point.lon - p.west) * kmPerDegreeLon(p)) / p.kmPerTile),
    y: Math.floor(((p.north - point.lat) * KM_PER_DEGREE_LAT) / p.kmPerTile),
  };
}

/** Ruudun keskipisteen koordinaatit. */
export function tileToGeo(tile: Vec2, p: MapProjection): GeoPoint {
  return {
    lon: p.west + ((tile.x + 0.5) * p.kmPerTile) / kmPerDegreeLon(p),
    lat: p.north - ((tile.y + 0.5) * p.kmPerTile) / KM_PER_DEGREE_LAT,
  };
}

/** Etäisyys kilometreinä samalla mittakaavalla kuin kartta. */
export function distanceKm(a: GeoPoint, b: GeoPoint, p: MapProjection): number {
  const dx = (b.lon - a.lon) * kmPerDegreeLon(p);
  const dy = (b.lat - a.lat) * KM_PER_DEGREE_LAT;
  return Math.hypot(dx, dy);
}

/** Onko piste monikulmion sisällä (säteenheittoalgoritmi). */
export function isInsidePolygon(point: GeoPoint, polygon: readonly GeoPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (!a || !b) {
      continue;
    }
    const crosses = a.lat > point.lat !== b.lat > point.lat;
    if (crosses && point.lon < ((b.lon - a.lon) * (point.lat - a.lat)) / (b.lat - a.lat) + a.lon) {
      inside = !inside;
    }
  }
  return inside;
}
