import { GAME_INFO } from '../data/game-info';

// Kaikki pelaajalle näkyvät tekstit. Älä kirjoita tekstejä suoraan koodiin,
// vaan lisää ne tänne ja käytä muodossa TEXT.menu.play.

/** Tallennushetki muodossa "31.10. klo 14.05". */
function formatTime(time: number): string {
  const date = new Date(time);
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${date.getDate()}.${date.getMonth() + 1}. klo ${date.getHours()}.${minutes}`;
}

export const TEXT = {
  /** Pelin nimi. Vaihda se tiedostossa data/game-info.ts, ei tässä. */
  gameTitle: GAME_INFO.name,
  menu: {
    play: 'PELAA',
    load: 'LATAA',
    settings: 'ASETUKSET',
    quit: 'LÄHDE',
  },
  settings: {
    title: 'Asetukset',
    brightness: 'Valo',
    volume: 'Äänenvoimakkuus',
    sound: 'Äänet',
    percent: (value: number): string => `${value} %`,
    soundOn: 'PÄÄLLÄ',
    soundOff: 'POIS',
    less: '-',
    more: '+',
    back: 'TAKAISIN',
  },
  saves: {
    title: 'Tallennukset',
    slot: (slot: number): string => `Paikka ${slot}`,
    empty: 'Tyhjä',
    broken: 'Tallennus on vioittunut.',
    level: (level: number): string => `Taso ${level}`,
    details: (place: string, savedAt: number): string => `${place}, ${formatTime(savedAt)}`,
    save: 'TALLENNA',
    load: 'LATAA',
    remove: 'POISTA',
    confirm: 'VARMA?',
    back: 'TAKAISIN',
    saved: (slot: number): string => `Peli tallennettu paikkaan ${slot}!`,
    saveFailed: 'Tallennus epäonnistui. Selain ei sallinut tallentamista.',
    removed: (slot: number): string => `Paikka ${slot} tyhjennetty.`,
    loadFailed: 'Tallennusta ei voitu ladata.',
    loaded: 'Peli ladattu!',
    hintMenu: 'Tallenna pelin aikana paikkakunnassa TALLENNA-napista.',
    hintGame: 'Tallennus säilyy tässä selaimessa.',
  },
  exit: {
    title: 'Kiitos pelaamisesta!',
    hint: 'Voit nyt sulkea selaimen välilehden.',
    back: 'ALKURUUTUUN',
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
    next: 'Kosketa palataksesi alkuruutuun',
  },
  victory: {
    title: 'Suomi on pelastettu!',
    next: 'Kosketa palataksesi alkuruutuun',
  },
} as const;
