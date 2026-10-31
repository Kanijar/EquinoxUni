// Taistelukaavat. Puhdasta logiikkaa: ei Phaseria, helppo testata.

export interface Fighter {
  hp: number;
  readonly maxHp: number;
  readonly attack: number;
  readonly defense: number;
  /** Oma kriittisen osuman todennäköisyys. Puuttuessa käytetään taistelun sääntöjä. */
  readonly critChance?: number;
  /** Tulivoima (vain pelaajalla). Kasvattaa loitsujen voimaa (logic/magic.ts). */
  readonly magic?: number;
}

/** Vahinko on aina vähintään 1, jotta jokainen osuma tuntuu. */
export function calculateDamage(attack: number, defense: number): number {
  return Math.max(1, Math.round(attack - defense));
}

/** Vähentää elämäpisteitä ja palauttaa tehdyn vahingon. */
export function applyDamage(target: Fighter, amount: number): number {
  const dealt = Math.min(target.hp, Math.max(0, amount));
  target.hp -= dealt;
  return dealt;
}

/** Hyökkääjä lyö kohdetta. Palauttaa tehdyn vahingon. */
export function strike(attacker: Fighter, target: Fighter): number {
  return applyDamage(target, calculateDamage(attacker.attack, target.defense));
}

/** Parantaa enintään maksimiin asti. Palauttaa parannetun määrän. */
export function heal(target: Fighter, amount: number): number {
  const healed = Math.min(target.maxHp - target.hp, Math.max(0, amount));
  target.hp += healed;
  return healed;
}

export function isDefeated(target: Fighter): boolean {
  return target.hp <= 0;
}
