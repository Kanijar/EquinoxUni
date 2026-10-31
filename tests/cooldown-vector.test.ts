import { describe, expect, it } from 'vitest';
import { Cooldown } from '../src/logic/cooldown';
import { clampLength, normalize } from '../src/logic/vector';

describe('Cooldown', () => {
  it('estää uudelleenkäytön ennen kuin aika on kulunut', () => {
    const cd = new Cooldown(100);
    expect(cd.tryUse(0)).toBe(true);
    expect(cd.tryUse(50)).toBe(false);
    expect(cd.tryUse(100)).toBe(true);
  });
});

describe('vector', () => {
  it('normalize pitää nollavektorin nollana', () => {
    expect(normalize({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
  });

  it('clampLength lyhentää liian pitkän vektorin', () => {
    expect(clampLength({ x: 3, y: 4 }, 1)).toEqual({ x: 0.6, y: 0.8 });
  });
});
