import { describe, expect, it } from 'vitest';
import type { MapProjection } from '../src/data/types';
import { geoToTile, gridSize, isInsidePolygon, tileToGeo } from '../src/logic/geo';
import { gridLine } from '../src/logic/grid-line';
import { tileNoise } from '../src/logic/world-grid';

const projection: MapProjection = {
  west: 20,
  east: 30,
  north: 70,
  south: 60,
  kmPerTile: 10,
  referenceLat: 60,
};

describe('geo', () => {
  it('pohjoisin ja läntisin kulma on ruutu 0,0', () => {
    expect(geoToTile({ lon: 20.01, lat: 69.99 }, projection)).toEqual({ x: 0, y: 0 });
  });

  it('ruudun keskipiste osuu takaisin samaan ruutuun', () => {
    const tile = { x: 12, y: 40 };
    expect(geoToTile(tileToGeo(tile, projection), projection)).toEqual(tile);
  });

  it('kartan koko lasketaan kilometreistä', () => {
    // 10 leveysastetta ≈ 1113 km → 112 ruutua
    expect(gridSize(projection).height).toBe(112);
  });

  it('tunnistaa pisteen monikulmion sisältä', () => {
    const square = [
      { lon: 0, lat: 0 },
      { lon: 10, lat: 0 },
      { lon: 10, lat: 10 },
      { lon: 0, lat: 10 },
    ];
    expect(isInsidePolygon({ lon: 5, lat: 5 }, square)).toBe(true);
    expect(isInsidePolygon({ lon: 15, lat: 5 }, square)).toBe(false);
  });
});

describe('gridLine', () => {
  it('kulkee alusta loppuun ilman vinoja hyppyjä', () => {
    const line = gridLine({ x: 0, y: 0 }, { x: 3, y: -2 });
    expect(line[0]).toEqual({ x: 0, y: 0 });
    expect(line[line.length - 1]).toEqual({ x: 3, y: -2 });
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1];
      const b = line[i];
      expect(Math.abs((b?.x ?? 0) - (a?.x ?? 0)) + Math.abs((b?.y ?? 0) - (a?.y ?? 0))).toBe(1);
    }
  });

  it('yhden ruudun viiva on pelkkä alkupiste', () => {
    expect(gridLine({ x: 2, y: 2 }, { x: 2, y: 2 })).toEqual([{ x: 2, y: 2 }]);
  });
});

describe('tileNoise', () => {
  it('antaa saman luvun samalle ruudulle ja pysyy välillä 0..1', () => {
    expect(tileNoise(5, 7)).toBe(tileNoise(5, 7));
    for (let i = 0; i < 50; i++) {
      const n = tileNoise(i, i * 3);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });
});
