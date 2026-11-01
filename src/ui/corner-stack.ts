import { GAME_HEIGHT, GAME_WIDTH, WORLD_VIEW } from '../config/game-config';
import type { TextButtonOptions } from './text-button';

// Kartan oikean alakulman napit päällekkäin, oikeaan reunaan tasattuina (peukalon alla).
// Paikka 0 on alimpana: 0 = REPPU, 1 = KYKYPISTEET, 2 = TALLENNA, 3 = puhu tehtävänantajalle.

export function cornerButton(
  index: number,
  width: number,
  label: string,
  onTap: () => void,
): TextButtonOptions {
  const { height, margin, gap } = WORLD_VIEW.cornerButtons;
  return {
    x: GAME_WIDTH - margin - width / 2,
    y: GAME_HEIGHT - margin - height / 2 - index * (height + gap),
    width,
    height,
    label,
    onTap,
  };
}
