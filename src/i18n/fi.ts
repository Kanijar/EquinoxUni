import { GAME_INFO } from '../data/game-info';
import type { GearSlot, GearStat, PlayerStats, SkillStat, StatBonus } from '../data/types';

// Kaikki pelaajalle näkyvät tekstit. Älä kirjoita tekstejä suoraan koodiin,
// vaan lisää ne tänne ja käytä muodossa TEXT.menu.play.

/** Kykyjen arvojen nimet kykypistenäkymässä ("+1 hyökkäys / piste"). */
const STAT_NAMES: Readonly<Record<SkillStat, string>> = {
  attack: 'hyökkäys',
  defense: 'puolustus',
  maxHp: 'maksimielämä',
  critPercent: 'kriittinen osuma',
  magic: 'tulivoima',
};

/** Varusteiden lisäysten nimet repussa ("+6 hyökkäys"). */
const GEAR_STAT_NAMES: Readonly<Record<GearStat, string>> = {
  attack: 'hyökkäys',
  defense: 'puolustus',
  maxHp: 'elämä',
  critPercent: 'tarkkuus',
  magic: 'tulivoima',
};

/** Varusteen lisäykset tekstinä, esim. "+8 % tarkkuus, +1 hyökkäys". */
function bonusText(bonus: StatBonus): string {
  return Object.entries(bonus)
    .map(([stat, amount]) => {
      const percent = stat === 'critPercent' ? ' %' : '';
      return `+${amount}${percent} ${GEAR_STAT_NAMES[stat as GearStat]}`;
    })
    .join(', ');
}

/** Prosentteina näytettävä arvo (kriittisen osuman mahdollisuus). */
const isPercent = (stat: SkillStat): boolean => stat === 'critPercent';

/** Desimaaliluku suomalaisittain pilkulla: 1.5 → "1,5". */
const decimal = (value: number): string => String(value).replace('.', ',');

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
    /** Alakulman versioteksti. Vaihda versio tiedostossa data/game-info.ts, ei tässä. */
    version: `Versio: ${GAME_INFO.version}`,
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
    /** Viholliset, joita ei ole vielä voitettu kertaakaan (voitetut palaavat kartalle). */
    enemiesLeft: (count: number): string => `Voittamatta ${count}`,
    /** Montako ihmistä pelaa juuri nyt (pelaaja itse mukaan lukien). */
    players: (count: number): string => `Pelaajia nyt: ${count}`,
  },
  world: {
    intro: 'Seikkailu alkaa Valkeakoskelta!',
    /** Alkuruudun suden salaisuus (logic/menu-secret.ts): näkyy vasta kartalla. */
    wolfBlessing: (level: number): string => `Susi siunasi sinut! Taso ${level}!`,
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
    names: {
      attack: 'Hyökkäys',
      defense: 'Puolustus',
      vitality: 'Elinvoima',
      precision: 'Tarkkuus',
      magic: 'Maagia',
    },
    value: (stat: SkillStat, value: number): string =>
      isPercent(stat) ? `${value} %` : String(value),
    perPoint: (amount: number, stat: SkillStat): string =>
      `+${amount}${isPercent(stat) ? ' %' : ''} ${STAT_NAMES[stat]} / piste`,
    /** Maagia-rivin lisätieto: tulipallon polttovoima nyt ja kasvu pisteestä. */
    burnPower: (perSecond: number, perPoint: number): string =>
      `polttovoima ${decimal(perSecond)}/s (+${decimal(perPoint)})`,
    add: '+',
    /** Kyky on ylärajallaan (esim. tarkkuus 40 %). */
    maxed: 'MAKS',
    done: 'VALMIS',
  },
  backpack: {
    /** Kartan nappi, josta reppu avautuu. */
    button: 'REPPU',
    title: 'Reppu',
    equipped: 'Käytössä',
    bag: 'Repussa',
    bagEmpty: 'Reppu on tyhjä.',
    slots: { hand: 'Käsi', body: 'Vartalo', neck: 'Koru' } satisfies Record<GearSlot, string>,
    emptySlot: 'tyhjä',
    count: (count: number): string => `×${count}`,
    hint: 'Napauta esinettä nähdäksesi, mitä se tekee.',
    bonus: bonusText,
    /** Pelaajan arvot varusteineen kahdella rivillä. */
    stats: (stats: PlayerStats, hp: number): readonly [string, string] => [
      `Hyökkäys ${stats.attack}   Puolustus ${stats.defense}`,
      `Tarkkuus ${stats.critPercent} %   Elämä ${hp}/${stats.maxHp}`,
    ],
    equip: 'LAITA KÄYTTÖÖN',
    unequip: 'OTA POIS',
    drink: 'JUO',
    done: 'VALMIS',
    equippedNow: (item: string): string => `${item} on nyt käytössä!`,
    unequippedNow: (item: string): string => `${item} on taas repussa.`,
    drank: (amount: number): string => `Joit juoman. Elämä +${amount}!`,
    fullHp: 'Elämäsi on jo täynnä.',
  },
  battle: {
    appears: (enemy: string): string => `${enemy} hyökkää kimppuusi!`,
    ambush: (enemy: string): string => `Väijytys! ${enemy} hyppää esiin puiden takaa!`,
    choose: 'Mitä teet?',
    attack: 'HYÖKKÄÄ',
    defend: 'PUOLUSTA',
    /** HYÖKKÄÄ avaa valinnan: lyönti tai tulipallo. */
    punch: 'LYÖNTI',
    back: 'TAKAISIN',
    chooseAttack: 'Lyötkö vai heitätkö tulipallon?',
    item: (count: number): string => `JUOMA ${count}`,
    flee: 'PAKENE',
    playerHit: (enemy: string, damage: number): string => `Löit: ${enemy} menetti ${damage}.`,
    spellHit: (spell: string, enemy: string, damage: number): string =>
      `${spell}! ${enemy} menetti ${damage} ja syttyi liekkeihin!`,
    /** Palamisen vahinko, joka nousee palavan vihollisen yläpuolelle. */
    burnPopup: (damage: number): string => `-${damage}`,
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
    drop: (item: string): string => `Löysit: ${item}!`,
    /** Vihollinen pudotti varusteen: kerrotaan, miten se laitetaan käyttöön. */
    gearHint: 'Avaa REPPU ja laita varuste käyttöön!',
    stole: (enemy: string, item: string): string => `${enemy} nappasi sinulta: ${item}!`,
    recovered: (item: string, count: number): string => `Sait takaisin: ${item} ×${count}.`,
    levelUp: (level: number): string => `Nousit tasolle ${level}! Elämä palautui.`,
    xpToNext: (missing: number): string => `Seuraavaan tasoon tarvitset vielä ${missing} KP.`,
    maxLevel: 'Olet huipputasolla!',
    skillPoints: (points: number): string =>
      `Sait ${points} kykypistettä! Käytä ne paikkakunnassa.`,
    lost: 'Kaaduit taistelussa...',
  },
  /** Loitsujen nimet (data/spells.ts). */
  spells: {
    fireball: 'Tulipallo',
  },
  /** Loitsujen napit taistelussa. */
  spellButtons: {
    fireball: 'TULIPALLO',
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
