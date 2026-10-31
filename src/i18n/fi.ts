import { GAME_INFO } from '../data/game-info';

// Kaikki pelaajalle näkyvät tekstit. Älä kirjoita tekstejä suoraan koodiin,
// vaan lisää ne tänne ja käytä muodossa TEXT.menu.start.

export const TEXT = {
  /** Pelin nimi. Vaihda se tiedostossa data/game-info.ts, ei tässä. */
  gameTitle: GAME_INFO.name,
  menu: {
    start: 'Aloita peli',
    hint: 'Kosketa aloittaaksesi',
    rotate: 'Käännä puhelin vaakatasoon',
  },
  hud: {
    hp: (hp: number, max: number): string => `Elämä ${hp}/${max}`,
    level: (level: number): string => `Taso ${level}`,
    xp: (xp: number, nextLevelXp: number | null): string =>
      nextLevelXp === null ? `KP ${xp} (huipputaso)` : `KP ${xp}/${nextLevelXp}`,
    potions: (count: number): string => `Juomat ${count}`,
    enemiesLeft: (count: number): string => `Vihollisia ${count}`,
  },
  world: {
    intro: 'Seikkailu alkaa Valkeakoskelta!',
    rest: (townAt: string): string => `Lepäsit ${townAt}. Elämä palautui!`,
    revived: (townAt: string): string => `Kaaduit... heräsit ${townAt}. Elämä palautui!`,
    skillPointsWaiting: (points: number): string =>
      `Sinulla on ${points} kykypistettä. Paina KYKYPISTEET.`,
  },
  skills: {
    button: (points: number): string => `KYKYPISTEET ${points}`,
    title: 'Kykypisteet',
    left: (points: number): string => `Käyttämättä: ${points}`,
    hint: (points: number): string => `Jokaisesta uudesta tasosta saat ${points} kykypistettä.`,
    names: { attack: 'Hyökkäys', defense: 'Puolustus', vitality: 'Elinvoima' },
    perPoint: (amount: number, stat: string): string => `+${amount} ${stat} / piste`,
    statNames: { attack: 'hyökkäys', defense: 'puolustus', maxHp: 'maksimielämä' },
    add: '+',
    done: 'VALMIS',
  },
  battle: {
    appears: (enemy: string): string => `${enemy} hyökkää kimppuusi!`,
    ambush: (enemy: string): string => `Väijytys! ${enemy} hyppää esiin puiden takaa!`,
    choose: 'Mitä teet?',
    attack: 'HYÖKKÄÄ',
    defend: 'PUOLUSTA',
    item: (count: number): string => `JUOMA ${count}`,
    flee: 'PAKENE',
    playerHit: (enemy: string, damage: number): string => `Löit: ${enemy} menetti ${damage}.`,
    enemyHit: (enemy: string, damage: number): string => `${enemy} löi sinua: -${damage}.`,
    enemyHitDefended: (enemy: string, damage: number): string =>
      `Torjuit iskun! ${enemy} teki vain ${damage}.`,
    crit: 'KRIITTINEN OSUMA! ',
    critPopup: 'KRIITTINEN OSUMA!',
    defending: 'Nostit kilven ja valmistaudut torjumaan.',
    heal: (item: string, amount: number): string => `Joit: ${item}. Elämä +${amount}.`,
    fleeOk: 'Pääsit pakoon!',
    fleeFail: 'Pako epäonnistui!',
    won: (enemy: string, xp: number): string => `Voitit: ${enemy}! Sait ${xp} KP.`,
    drop: (item: string): string => `Löysit: ${item}.`,
    stole: (enemy: string, item: string): string => `${enemy} nappasi sinulta: ${item}!`,
    recovered: (item: string, count: number): string => `Sait takaisin: ${item} ×${count}.`,
    levelUp: (level: number): string => `Nousit tasolle ${level}! Elämä palautui.`,
    xpToNext: (missing: number): string => `Seuraavaan tasoon tarvitset vielä ${missing} KP.`,
    maxLevel: 'Olet huipputasolla!',
    skillPoints: (points: number): string =>
      `Sait ${points} kykypistettä! Käytä ne paikkakunnassa.`,
    lost: 'Kaaduit taistelussa...',
  },
  gameOver: {
    title: 'Hävisit!',
    retry: 'Yritä uudelleen',
  },
  victory: {
    title: 'Suomi on pelastettu!',
    next: 'Pelaa uudelleen',
  },
} as const;
