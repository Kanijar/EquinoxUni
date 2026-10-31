import { describe, expect, it } from 'vitest';
import type { AmbushRule } from '../src/data/types';
import { checkAmbush, createAmbushTracker, type SteppedTile } from '../src/logic/ambush';
import type { Rng } from '../src/logic/battle';

// Väijytysten testit: ryöstäjä voi hyökätä metsässä, mutta ei pelloilla,
// paikkakunnissa eikä heti taistelun jälkeen.

const rules: readonly AmbushRule[] = [
  { terrain: 'forest', enemies: ['robber'], chancePerTile: 0.5 },
];
const lucky: Rng = () => 0.1; // osuu aina
const unlucky: Rng = () => 0.9; // ei koskaan

const forest = (x: number, y = 0): SteppedTile => ({
  tile: { x, y },
  terrain: 'forest',
  inTown: false,
});

describe('väijytys', () => {
  it('ryöstäjä hyökkää metsässä, kun arpa osuu', () => {
    const tracker = createAmbushTracker(0);
    expect(checkAmbush(tracker, forest(1), lucky, rules)).toBe('robber');
  });

  it('ei hyökkää, kun arpa ei osu', () => {
    const tracker = createAmbushTracker(0);
    expect(checkAmbush(tracker, forest(1), unlucky, rules)).toBeNull();
  });

  it('ei hyökkää pellolla eikä paikkakunnassa', () => {
    const tracker = createAmbushTracker(0);
    const field: SteppedTile = { tile: { x: 1, y: 0 }, terrain: 'field', inTown: false };
    expect(checkAmbush(tracker, field, lucky, rules)).toBeNull();
    expect(checkAmbush(tracker, { ...forest(2), inTown: true }, lucky, rules)).toBeNull();
  });

  it('samalla ruudulla seisominen ei arvo uudelleen', () => {
    const tracker = createAmbushTracker(0);
    expect(checkAmbush(tracker, forest(1), unlucky, rules)).toBeNull();
    expect(checkAmbush(tracker, forest(1), lucky, rules)).toBeNull();
    expect(checkAmbush(tracker, forest(2), lucky, rules)).toBe('robber');
  });

  it('alussa ja taistelun jälkeen saa kulkea rauhassa muutaman ruudun', () => {
    const tracker = createAmbushTracker(3);
    expect(checkAmbush(tracker, forest(1), lucky, rules)).toBeNull();
    expect(checkAmbush(tracker, forest(2), lucky, rules)).toBeNull();
    expect(checkAmbush(tracker, forest(3), lucky, rules)).toBeNull();
    expect(checkAmbush(tracker, forest(4), lucky, rules)).toBe('robber');
  });

  it('arpoo hyökkääjän listasta', () => {
    const many: AmbushRule[] = [{ terrain: 'forest', enemies: ['a', 'b'], chancePerTile: 1 }];
    const tracker = createAmbushTracker(0);
    expect(checkAmbush(tracker, forest(1), () => 0.99, many)).toBe('b');
    expect(checkAmbush(tracker, forest(2), () => 0, many)).toBe('a');
  });
});
