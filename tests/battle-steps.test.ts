import { describe, expect, it, vi } from 'vitest';
import { PROGRESSION } from '../src/data/rules';
import { TEXT } from '../src/i18n/fi';
import type { VictoryReward } from '../src/logic/game-state';
import { victorySteps } from '../src/systems/battle-steps';
import type { BattleView } from '../src/ui/battle-view';

// Voiton jälkeiset viestit: pelaaja näkee, paljonko KP:tä puuttuu seuraavasta tasosta
// ja montako kykypistettä tason nousu antoi.

function fakeView(): { view: BattleView; updateXp: ReturnType<typeof vi.fn> } {
  const updateXp = vi.fn();
  const view = { updateXp, playVictory: vi.fn(), playLevelUp: vi.fn() };
  return { view: view as unknown as BattleView, updateXp };
}

describe('voiton viestit', () => {
  it('kertoo, paljonko KP:tä puuttuu seuraavaan tasoon', () => {
    const { view } = fakeView();
    const reward: VictoryReward = {
      xp: 5,
      totalXp: 5,
      leveledUp: false,
      level: 1,
      skillPoints: 0,
    };
    const texts = victorySteps(reward, 'Lima', view).map((step) => step.text);
    const missing = (PROGRESSION.xpForLevel[1] ?? 0) - 5;
    expect(texts.at(-1)).toBe(TEXT.battle.xpToNext(missing));
  });

  it('huipputasolla kertoo, ettei uutta tasoa enää tule', () => {
    const { view } = fakeView();
    const maxXp = PROGRESSION.xpForLevel.at(-1) ?? 0;
    const reward: VictoryReward = {
      xp: 10,
      totalXp: maxXp,
      leveledUp: false,
      level: PROGRESSION.xpForLevel.length,
      skillPoints: 0,
    };
    const texts = victorySteps(reward, 'Lima', view).map((step) => step.text);
    expect(texts.at(-1)).toBe(TEXT.battle.maxLevel);
  });

  it('KP-palkki täyttyy voittoviestin aikana', () => {
    const { view, updateXp } = fakeView();
    const reward: VictoryReward = {
      xp: 12,
      totalXp: 20,
      leveledUp: true,
      level: 2,
      skillPoints: 3,
    };
    const [won] = victorySteps(reward, 'Hiisi', view);
    won?.effect?.();
    expect(updateXp).toHaveBeenCalledWith(20);
  });

  it('tason noustessa kertoo saaduista kykypisteistä', () => {
    const { view } = fakeView();
    const reward: VictoryReward = {
      xp: 12,
      totalXp: 20,
      leveledUp: true,
      level: 2,
      skillPoints: 3,
    };
    const texts = victorySteps(reward, 'Hiisi', view).map((step) => step.text);
    expect(texts).toContain(TEXT.battle.skillPoints(3));
  });
});
