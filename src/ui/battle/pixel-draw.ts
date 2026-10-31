// Pienet apufunktiot taustan piirtämiseen canvasille pikseli kerrallaan.

/** Taustakuvan koko ja horisontin korkeus taustan pikseleinä. */
export interface BackdropSize {
  readonly width: number;
  readonly height: number;
  readonly horizon: number;
}

/** Täytetty ympyrä pikseleinä (ei pehmennettyjä reunoja). */
export function fillDisc(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  for (let dy = -r; dy <= r; dy++) {
    const half = Math.floor(Math.sqrt(r * r - dy * dy));
    ctx.fillRect(cx - half, cy + dy, half * 2 + 1, 1);
  }
}
