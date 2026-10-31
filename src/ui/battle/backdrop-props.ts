import type { BattleBackdropDef } from '../../data/types';
import { randomInt } from '../../logic/seeded-random';
import { fillDisc, type BackdropSize } from './pixel-draw';

// Taustan esineet horisontissa: kuuset, koivut ja punaiset mökit valkoisine nurkkineen.

const BIRCH_TRUNK = '#eeeeea';
const BIRCH_MARK = '#2a2a2a';
const HOUSE = {
  width: 16,
  wall: 8,
  roofRise: 6,
  wallColor: '#b03a2e',
  cornerColor: '#f2f2ee',
  roofColor: '#3a3a44',
  windowColor: '#ffe08a',
};

export function paintTrees(
  ctx: CanvasRenderingContext2D,
  def: BattleBackdropDef,
  size: BackdropSize,
  rng: () => number,
): void {
  const trees = def.trees;
  if (!trees) {
    return;
  }
  const step = size.width / trees.count;
  for (let i = 0; i < trees.count; i++) {
    const x = Math.round(step * i + step / 2 + (rng() - 0.5) * step * 0.6);
    const baseY = size.horizon + randomInt(rng, 0, 3);
    const height = randomInt(rng, 14, 24);
    if (trees.kind === 'pine') {
      paintPine(ctx, { x, baseY, height }, trees.color, trees.shade);
    } else {
      paintBirch(ctx, { x, baseY, height }, trees.color, trees.shade);
    }
  }
}

interface TreeSpot {
  readonly x: number;
  readonly baseY: number;
  readonly height: number;
}

/** Kuusi: kerroksittain levenevä kolmio. Joka toinen oksarivi on varjon (tai lumen) värinen. */
function paintPine(
  ctx: CanvasRenderingContext2D,
  tree: TreeSpot,
  color: string,
  shade: string,
): void {
  const top = tree.baseY - tree.height;
  ctx.fillStyle = '#3b2a1a';
  ctx.fillRect(tree.x, tree.baseY - 3, 1, 3);
  for (let row = 0; row < tree.height - 2; row++) {
    const layer = row % 5;
    const half = Math.floor(row / 3) + layer - 1;
    const width = Math.max(1, half * 2 + 1);
    ctx.fillStyle = layer === 0 && row > 2 ? shade : color;
    ctx.fillRect(tree.x - Math.max(0, half), top + row, width, 1);
  }
}

/** Koivu: valkoinen runko mustine laikkuineen ja pyöreä latvus. */
function paintBirch(
  ctx: CanvasRenderingContext2D,
  tree: TreeSpot,
  color: string,
  shade: string,
): void {
  const top = tree.baseY - tree.height;
  ctx.fillStyle = BIRCH_TRUNK;
  ctx.fillRect(tree.x, top + 4, 2, tree.height - 4);
  ctx.fillStyle = BIRCH_MARK;
  for (let y = top + 8; y < tree.baseY; y += 4) {
    ctx.fillRect(tree.x + ((y >> 2) % 2), y, 1, 1);
  }
  const radius = Math.max(4, Math.round(tree.height / 3));
  ctx.fillStyle = shade;
  fillDisc(ctx, tree.x + 1, top + radius, radius);
  ctx.fillStyle = color;
  fillDisc(ctx, tree.x, top + radius - 1, radius - 1);
}

/** Punainen tupa: seinä, valkoiset nurkkalaudat, tumma harjakatto ja lämmin ikkuna. */
export function paintHouses(
  ctx: CanvasRenderingContext2D,
  def: BattleBackdropDef,
  size: BackdropSize,
  rng: () => number,
): void {
  const step = size.width / Math.max(1, def.houses);
  for (let i = 0; i < def.houses; i++) {
    const x = Math.round(
      step * i + randomInt(rng, 6, Math.max(6, Math.round(step) - HOUSE.width - 6)),
    );
    paintHouse(ctx, x, size.horizon + 1);
  }
}

function paintHouse(ctx: CanvasRenderingContext2D, x: number, baseY: number): void {
  const { width, wall, roofRise } = HOUSE;
  const wallTop = baseY - wall;
  ctx.fillStyle = HOUSE.wallColor;
  ctx.fillRect(x, wallTop, width, wall);
  ctx.fillStyle = HOUSE.cornerColor;
  ctx.fillRect(x, wallTop, 1, wall);
  ctx.fillRect(x + width - 1, wallTop, 1, wall);
  ctx.fillStyle = HOUSE.windowColor;
  ctx.fillRect(x + 4, wallTop + 3, 3, 2);
  ctx.fillRect(x + width - 7, wallTop + 3, 3, 2);
  ctx.fillStyle = HOUSE.roofColor;
  for (let row = 0; row < roofRise; row++) {
    const inset = roofRise - 1 - row;
    ctx.fillRect(x - 1 + inset, wallTop - roofRise + row, width + 2 - inset * 2, 1);
  }
  ctx.fillRect(x + width - 5, wallTop - roofRise - 1, 2, 4);
}
