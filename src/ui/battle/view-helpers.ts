import { DAMAGE_NUMBERS } from '../../config/battle-config';
import { COLORS } from '../../config/game-config';
import { getSprite } from '../../data';
import type { Side } from '../../logic/battle';

// Taistelunäkymän pienet apufunktiot: värit ja lentävien numeroiden paikka.

export function hitColor(attacker: Side): number {
  return attacker === 'player' ? COLORS.hitFlash : COLORS.hurt;
}

/** Numerot lentävät hahmon keskeltä, jolloin kriittisen osuman teksti mahtuu niiden yläpuolelle. */
export function numberSpot(center: { x: number; y: number }): { x: number; y: number } {
  return { x: center.x, y: center.y + DAMAGE_NUMBERS.offsetY };
}

/** Tätä tummemmat värit (esim. mustat silmät) jätetään pölystä pois, ettei se näytä liasta. */
const MIN_DUST_BRIGHTNESS = 60;

/** Spriten paletin värit numeroina (vihollisen kuolinpöly on vihollisen väristä). */
export function paletteColors(spriteKey: string): number[] {
  const colors = Object.values(getSprite(spriteKey).palette).map((hex) =>
    parseInt(hex.slice(1), 16),
  );
  const bright = colors.filter(
    (c) => Math.max(c >> 16, (c >> 8) & 0xff, c & 0xff) >= MIN_DUST_BRIGHTNESS,
  );
  return bright.length > 0 ? bright : colors;
}
