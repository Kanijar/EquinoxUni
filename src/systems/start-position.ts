import type { GameState } from '../logic/game-state';
import { isSailing } from '../logic/sailing';
import { lastVisitedTown } from '../logic/town-visits';
import type { Vec2 } from '../logic/vector';
import { townTile } from '../logic/world-grid';
import { getWorldGrid, sailablePosition, tileToWorld, walkablePosition } from './world-map';

// Mistä sankari aloittaa, kun kartta avataan (scenes/world-scene.ts).

/**
 * Tallennettu paikka (veneessä merellä, muuten maalla), tai viimeisin paikkakunta (pelin
 * alussa ja kaatumisen jälkeen, jolloin vene jää rantaan).
 */
export function heroStartPosition(state: GameState): Vec2 {
  const saved = state.position;
  const grid = getWorldGrid();
  const sea = saved && isSailing(state) ? sailablePosition(grid, saved) : null;
  if (sea) {
    return sea;
  }
  state.sailing = false;
  return saved ? walkablePosition(grid, saved) : tileToWorld(townTile(lastVisitedTown(state)));
}
