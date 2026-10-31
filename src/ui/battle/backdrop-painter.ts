import type { BattleBackdropDef } from '../../data/types';
import { createSeededRng, randomInt } from '../../logic/seeded-random';
import { paintHouses, paintTrees } from './backdrop-props';
import { fillDisc, type BackdropSize } from './pixel-draw';

// Piirtää taistelun taustan pikseli kerrallaan canvasille: raidoitettu taivas,
// aurinko, kukkulat tai tunturit, puurivi, mökit ja maa ruohotupsuineen.
// Tausta piirretään vain kerran ja tallennetaan kuvaksi, joten se ei maksa mitään
// ruudunpäivityksessä. Satunnaisuus on toistettavaa: sama tausta näyttää aina samalta.

const SEED = 1917;
const SUN_HALO_PX = 3;
const SUN_HALO_ALPHA = 0.25;
/** Tupsuja maassa: määrä taustan leveyttä kohti. */
const SPECKLES_PER_PX = 0.4;

export function paintBackdrop(
  ctx: CanvasRenderingContext2D,
  def: BattleBackdropDef,
  size: BackdropSize,
): void {
  const rng = createSeededRng(SEED + def.id.length * 31 + def.sky.length);
  paintBands(ctx, def.sky, { y: 0, height: size.horizon, width: size.width, grow: false });
  if (def.aurora) {
    paintAurora(ctx, def.aurora, size, rng);
  }
  paintSun(ctx, def.sun);
  paintHills(ctx, def, size, rng);
  const groundHeight = size.height - size.horizon;
  paintBands(ctx, def.ground, {
    y: size.horizon,
    height: groundHeight,
    width: size.width,
    grow: true,
  });
  if (def.path) {
    paintPath(ctx, def.path, size, rng);
  }
  paintHouses(ctx, def, size, rng);
  paintTrees(ctx, def, size, rng);
  paintSpeckles(ctx, def.speckles, size, rng);
}

interface BandArea {
  readonly y: number;
  readonly height: number;
  readonly width: number;
  /** true = raidat levenevät alaspäin (maan perspektiivi). */
  readonly grow: boolean;
}

/** Värit raitoina. Raitojen rajalla värit sekoittuvat ruutukuviona (pikselitaiteen liukuväri). */
function paintBands(
  ctx: CanvasRenderingContext2D,
  colors: readonly string[],
  area: BandArea,
): void {
  const weights = colors.map((_, i) => (area.grow ? i + 1 : 1));
  const total = weights.reduce((sum, w) => sum + w, 0);
  let y = area.y;
  colors.forEach((color, i) => {
    const bandHeight = Math.round((area.height * (weights[i] ?? 1)) / total);
    const end = i === colors.length - 1 ? area.y + area.height : y + bandHeight;
    ctx.fillStyle = color;
    ctx.fillRect(0, y, area.width, end - y);
    const previous = colors[i - 1];
    if (previous) {
      ctx.fillStyle = previous;
      for (let x = 0; x < area.width; x += 2) {
        ctx.fillRect(x, y, 1, 1);
        ctx.fillRect(x + 1, y + 1, 1, 1);
      }
    }
    y = end;
  });
}

/** Revontulten verhoja: kevyesti läpikuultavia aaltoilevia pystyraitoja taivaalla. */
const AURORA = { alpha: 0.35, top: 6, length: 34, wave: 9, period: 0.05, flicker: 0.11 } as const;

function paintAurora(
  ctx: CanvasRenderingContext2D,
  colors: readonly string[],
  size: BackdropSize,
  rng: () => number,
): void {
  ctx.globalAlpha = AURORA.alpha;
  colors.forEach((color, band) => {
    const phase = rng() * Math.PI * 2;
    const offset = band * AURORA.wave;
    ctx.fillStyle = color;
    for (let x = 0; x < size.width; x++) {
      const y = AURORA.top + offset + Math.round(Math.sin(x * AURORA.period + phase) * AURORA.wave);
      const length = Math.round(
        AURORA.length * (0.5 + 0.5 * Math.abs(Math.sin(x * AURORA.flicker + phase))),
      );
      ctx.fillRect(x, Math.max(0, y), 1, length);
    }
  });
  ctx.globalAlpha = 1;
}

function paintSun(ctx: CanvasRenderingContext2D, sun: BattleBackdropDef['sun']): void {
  ctx.fillStyle = sun.color;
  ctx.globalAlpha = SUN_HALO_ALPHA;
  fillDisc(ctx, sun.x, sun.y, sun.radius + SUN_HALO_PX);
  ctx.globalAlpha = 1;
  fillDisc(ctx, sun.x, sun.y, sun.radius);
}

/** Kukkulat aaltoilevat pehmeästi, tunturit ovat teräviä ja niillä on lumihuiput. */
function paintHills(
  ctx: CanvasRenderingContext2D,
  def: BattleBackdropDef,
  size: BackdropSize,
  rng: () => number,
): void {
  const { color, height, peaks, cap } = def.hills;
  const phase = rng() * Math.PI * 2;
  const period = randomInt(rng, 60, 80);
  for (let x = 0; x < size.width; x++) {
    const wave = 0.6 + 0.25 * Math.sin(x * 0.045 + phase) + 0.15 * Math.sin(x * 0.13 + phase * 2);
    const tri = 1 - Math.abs(((x + period / 2) % period) / (period / 2) - 1);
    const h = Math.round(height * (peaks ? 0.35 + tri * 0.65 * wave : wave));
    const top = size.horizon - h;
    ctx.fillStyle = color;
    ctx.fillRect(x, top, 1, h);
    if (peaks && cap && h > height * 0.55) {
      ctx.fillStyle = cap;
      ctx.fillRect(x, top, 1, Math.round((h - height * 0.55) * 0.8) + 1);
    }
  }
}

/** Kylätie: kapea horisontissa, levenee ruudun alareunaa kohti. */
function paintPath(
  ctx: CanvasRenderingContext2D,
  color: string,
  size: BackdropSize,
  rng: () => number,
): void {
  const center = size.width / 2;
  const groundHeight = size.height - size.horizon;
  ctx.fillStyle = color;
  for (let y = size.horizon; y < size.height; y++) {
    const t = (y - size.horizon) / groundHeight;
    const half = Math.round(4 + t * 46 + (rng() < 0.3 ? 1 : 0));
    ctx.fillRect(center - half, y, half * 2, 1);
  }
}

/** Ruohotupsut, kukat, puolukat tai lumen kimallus. Alempana tiheämmin ja isompina. */
function paintSpeckles(
  ctx: CanvasRenderingContext2D,
  colors: readonly string[],
  size: BackdropSize,
  rng: () => number,
): void {
  const count = Math.round(size.width * SPECKLES_PER_PX);
  const groundHeight = size.height - size.horizon;
  for (let i = 0; i < count; i++) {
    const t = Math.sqrt(rng());
    const y = Math.round(size.horizon + 3 + t * (groundHeight - 4));
    const x = randomInt(rng, 0, size.width - 1);
    ctx.fillStyle = colors[i % colors.length] ?? '#ffffff';
    ctx.fillRect(x, y, 1, 1);
    if (t > 0.5) {
      ctx.fillRect(x - 1, y - 1, 1, 1);
      ctx.fillRect(x + 1, y - 1, 1, 1);
    }
  }
}
