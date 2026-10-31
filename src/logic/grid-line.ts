import type { Vec2 } from './vector';

// Ruutuviiva kahden ruudun välillä. Viiva kulkee vain sivuttain ja pystysuunnassa
// (ei vinottain kulmien yli), jotta hahmo mahtuu kulkemaan sitä pitkin.

export function gridLine(from: Vec2, to: Vec2): Vec2[] {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  const stepX = Math.sign(to.x - from.x);
  const stepY = Math.sign(to.y - from.y);
  const points: Vec2[] = [{ x: from.x, y: from.y }];
  let x = from.x;
  let y = from.y;
  let movedX = 0;
  let movedY = 0;
  for (let i = 0; i < dx + dy; i++) {
    if ((0.5 + movedX) / dx < (0.5 + movedY) / dy) {
      x += stepX;
      movedX++;
    } else {
      y += stepY;
      movedY++;
    }
    points.push({ x, y });
  }
  return points;
}
