// Pelisisällön tyypit. Kaikki sisältö (viholliset, esineet, kentät, spritet)
// kuvataan näillä tyypeillä data/-kansiossa. Lisää uusi kenttä ensin tänne.

/** Yksinkertainen pikseligrafiikka: jokainen merkki on yksi pikseli, '.' = läpinäkyvä. */
export interface SpriteDef {
  readonly id: string;
  readonly palette: Readonly<Record<string, string>>;
  readonly rows: readonly string[];
}

export interface CombatStats {
  readonly maxHp: number;
  readonly attack: number;
  readonly defense: number;
  /** Liikkumisnopeus pikseleinä sekunnissa. */
  readonly speed: number;
}

export interface PlayerDef {
  readonly sprite: string;
  readonly stats: CombatStats;
  /** Hyökkäyksen kantama pikseleinä. */
  readonly attackRange: number;
  /** Hyökkäysten väli millisekunteina. */
  readonly attackCooldownMs: number;
}

export interface EnemyDef {
  readonly id: string;
  /** Suomenkielinen nimi, näytetään pelaajalle. */
  readonly name: string;
  readonly sprite: string;
  readonly stats: CombatStats;
  /** Etäisyys, jolta vihollinen huomaa pelaajan. */
  readonly aggroRange: number;
  readonly attackRange: number;
  readonly attackCooldownMs: number;
  /** Kokemuspisteet voitosta. */
  readonly xp: number;
}

export type ItemKind = 'heal' | 'weapon' | 'key';

export interface ItemDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly kind: ItemKind;
  readonly sprite: string;
  /** Tyypistä riippuva arvo: parannuksen määrä, aseen hyökkäysbonus jne. */
  readonly value: number;
}

export interface Spawn {
  readonly id: string;
  /** Sijainti ruutuina (tile), ei pikseleinä. */
  readonly x: number;
  readonly y: number;
}

export interface LevelDef {
  readonly id: string;
  readonly name: string;
  /** Kartta merkkeinä: '#' = seinä, '.' = lattia. Katso data/levels/README. */
  readonly map: readonly string[];
  readonly playerStart: { readonly x: number; readonly y: number };
  readonly enemies: readonly Spawn[];
  readonly items: readonly Spawn[];
}
