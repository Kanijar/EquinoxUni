import { describe, expect, it } from 'vitest';
import { isInsideCircle, isInsidePolygon } from '../src/logic/polygon';

// Monikulmion ja ympyrän testit (saaren rantaviiva, alueet ja järvet).

const square = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
];

describe('monikulmio', () => {
  it('piste neliön sisällä', () => {
    expect(isInsidePolygon({ x: 5, y: 5 }, square)).toBe(true);
  });

  it('piste neliön ulkopuolella', () => {
    expect(isInsidePolygon({ x: 15, y: 5 }, square)).toBe(false);
    expect(isInsidePolygon({ x: 5, y: -1 }, square)).toBe(false);
  });

  it('lovettu muoto: lovi on ulkopuolella', () => {
    const notched = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 6, y: 10 },
      { x: 5, y: 3 },
      { x: 4, y: 10 },
      { x: 0, y: 10 },
    ];
    expect(isInsidePolygon({ x: 5, y: 8 }, notched)).toBe(false);
    expect(isInsidePolygon({ x: 2, y: 8 }, notched)).toBe(true);
  });
});

describe('ympyrä', () => {
  it('keskipiste ja reuna ovat sisällä, kauempana ei', () => {
    const circle = { x: 3, y: 3, radius: 2 };
    expect(isInsideCircle({ x: 3, y: 3 }, circle)).toBe(true);
    expect(isInsideCircle({ x: 5, y: 3 }, circle)).toBe(true);
    expect(isInsideCircle({ x: 5, y: 5 }, circle)).toBe(false);
  });
});
