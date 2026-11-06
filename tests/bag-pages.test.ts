import { describe, expect, it } from 'vitest';
import { clampPage, pageCount, pageItems, pageOfIndex, turnPage } from '../src/logic/bag-pages';

// Repun sivut: esineet jaetaan sivuille, ja sivua voi kääntää kumpaankin suuntaan.

const SIZE = 10;
const items = (count: number) => Array.from({ length: count }, (_, index) => index);

describe('repun sivut', () => {
  it('tyhjässä ja vajaassa repussa on yksi sivu', () => {
    expect(pageCount(0, SIZE)).toBe(1);
    expect(pageCount(1, SIZE)).toBe(1);
    expect(pageCount(10, SIZE)).toBe(1);
  });

  it('yksi esine yli sivun koon tekee uuden sivun', () => {
    expect(pageCount(11, SIZE)).toBe(2);
    expect(pageCount(20, SIZE)).toBe(2);
    expect(pageCount(21, SIZE)).toBe(3);
  });

  it('sivulla näkyvät oikeat esineet', () => {
    const all = items(23);
    expect(pageItems(all, 0, SIZE)).toEqual(items(10));
    expect(pageItems(all, 1, SIZE)).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    expect(pageItems(all, 2, SIZE)).toEqual([20, 21, 22]);
  });

  it('liian suuri sivu näyttää viimeisen sivun', () => {
    expect(clampPage(5, 12, SIZE)).toBe(1);
    expect(clampPage(-1, 12, SIZE)).toBe(0);
    expect(pageItems(items(12), 5, SIZE)).toEqual([10, 11]);
  });

  it('sivu kääntyy eteen ja taakse ja hyppää reunoilla toiseen päähän', () => {
    expect(turnPage(0, 1, 25, SIZE)).toBe(1);
    expect(turnPage(1, 1, 25, SIZE)).toBe(2);
    expect(turnPage(2, 1, 25, SIZE)).toBe(0);
    expect(turnPage(0, -1, 25, SIZE)).toBe(2);
    expect(turnPage(2, -1, 25, SIZE)).toBe(1);
  });

  it('yhden sivun repussa sivu ei vaihdu', () => {
    expect(turnPage(0, 1, 4, SIZE)).toBe(0);
    expect(turnPage(0, -1, 4, SIZE)).toBe(0);
  });

  it('esineen sivu löytyy sen järjestysnumerosta', () => {
    expect(pageOfIndex(0, SIZE)).toBe(0);
    expect(pageOfIndex(9, SIZE)).toBe(0);
    expect(pageOfIndex(10, SIZE)).toBe(1);
    expect(pageOfIndex(-1, SIZE)).toBe(0);
  });
});
