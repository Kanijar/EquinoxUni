import { GAME_INFO } from '../data/game-info';
import { PLAYER } from '../data/player';
import type {
  EnemyDef,
  GearSlot,
  GearStat,
  ItemDef,
  PlayerStats,
  SkillStat,
  StatBonus,
  TownDef,
} from '../data/types';
import { localDateParts, twoDigits, type DateParts } from './date-parts';
import type { Language } from './language';

// Kaikki pelaajalle näkyvät tekstit suomeksi. Älä kirjoita tekstejä suoraan koodiin,
// vaan lisää ne tänne ja käytä muodossa TEXT.menu.play (TEXT tulee i18n/text.ts:stä).
// Sama teksti englanniksi kuuluu tiedostoon i18n/en.ts: sama avain, englanninkielinen
// sisältö. TypeScript ja testi tests/i18n.test.ts huomaavat, jos jokin puuttuu.

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
  const { day, month, hour, minute } = localDateParts(time);
  return `${day}.${month}. klo ${hour}.${twoDigits(minute)}`;
}

/** Kielten nimet asetuksissa. Kukin kieli omalla kielellään, jotta sen löytää aina. */
export const LANGUAGE_NAMES: Readonly<Record<Language, string>> = {
  fi: 'SUOMI',
  en: 'ENGLISH',
};

export const FI = {
  /** Pelin nimi. Vaihda se tiedostossa data/game-info.ts, ei tässä. */
  gameTitle: GAME_INFO.name,
  menu: {
    play: 'PELAA',
    load: 'LATAA',
    settings: 'ASETUKSET',
    quit: 'LÄHDE',
    /** Alakulman versioteksti, esim. "Versio: 0.25 (alfa)". Vaihe: data/game-info.ts. */
    version: (number: string): string => `Versio: ${number} (${GAME_INFO.version})`,
    /** Versioteksti, kun numeroa ei saatu buildissa (esim. peli ladattu zip-tiedostona). */
    versionStageOnly: `Versio: ${GAME_INFO.version}`,
    /** Julkaisuaika versionumeron alla, esim. "Julkaistu 1.11.2026 klo 10.05". */
    released: ({ day, month, year, hour, minute }: DateParts): string =>
      `Julkaistu ${day}.${month}.${year} klo ${hour}.${twoDigits(minute)}`,
    /** Omalla koneella (npm run dev) ajettava peli ei ole julkaistu versio. */
    devBuild: 'Kehitysversio',
    /** Oikean yläkulman nappi: asentaa pelin puhelimen aloitusnäytölle (PWA). */
    install: 'ASENNA',
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
    /** Kielivalinta: napit SUOMI ja ENGLISH (LANGUAGE_NAMES). */
    language: 'Kieli',
    languageNames: LANGUAGE_NAMES,
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
    xp: (xp: number, nextLevelXp: number | null): string =>
      nextLevelXp === null ? `KP ${xp} (huipputaso)` : `KP ${xp}/${nextLevelXp}`,
    /** Kartan HUD: huipputasolla lyhyt teksti, jottei se osu paikkakunnan nimeen. */
    levelAndXp: (level: number, xp: number, nextLevelXp: number | null): string =>
      nextLevelXp === null
        ? `Huipputaso ${level}  KP ${xp}`
        : `Taso ${level}  KP ${xp}/${nextLevelXp}`,
    potions: (count: number): string => `Juomat ${count}`,
    /** Viholliset, joita ei ole vielä voitettu kertaakaan (voitetut palaavat kartalle). */
    enemiesLeft: (count: number): string => `Voittamatta ${count}`,
    /** Loppubossin peikkolaskuri (data/boss.ts). */
    trolls: (count: number, needed: number): string => `Peikot ${count}/${needed}`,
    /** Herännyt loppuboss odottaa kartalla. */
    bossAwake: (boss: string): string => `${boss} odottaa!`,
    /** Montako ihmistä pelaa juuri nyt (pelaaja itse mukaan lukien). */
    players: (count: number): string => `Pelaajia nyt: ${count}`,
  },
  world: {
    intro: 'Seikkailu alkaa Valkeakoskelta!',
    /** Alkuruudun suden salaisuus (logic/menu-secret.ts): näkyy vasta kartalla. */
    wolfBlessing: (level: number): string => `Susi siunasi sinut! Taso ${level}!`,
    rest: (town: TownDef): string => `Lepäsit ${town.nameAt}. Elämä palautui!`,
    revived: (town: TownDef): string => `Kaaduit... heräsit ${town.nameAt}. Elämä palautui!`,
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
    /** Loppuboss taistelun alussa. */
    bossAppears: (enemy: string): string => `${enemy} nousee eteesi! Maa tärisee!`,
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
    /** Loppubossin voimaisku valmistellaan edellisellä vuorolla. */
    charge: (enemy: string): string => `${enemy} nostaa nuijansa! PUOLUSTA nyt!`,
    heavyHit: (enemy: string, damage: number): string =>
      `VOIMAISKU! ${enemy} murskasi: -${damage}.`,
    heavyHitDefended: (enemy: string, damage: number): string =>
      `Torjuit voimaiskun! ${enemy} teki vain ${damage}.`,
    /** Loppubossin erikoisliike: lumimyrsky. */
    storm: (enemy: string, damage: number): string =>
      `${enemy} puhalsi lumimyrskyn! Menetit ${damage}.`,
    stormDefended: (enemy: string, damage: number): string =>
      `${enemy} puhalsi lumimyrskyn! Kilpi suojasi: -${damage}.`,
    stormExtinguished: ' Liekit sammuivat!',
    chargePopup: 'VAROITUS!',
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
    /** Lentävät numerot taistelijoiden päällä. */
    damagePopup: (damage: number): string => `-${damage}`,
    healPopup: (amount: number): string => `+${amount}`,
    /** Iso teksti ruudun keskellä, kun vihollinen kaatuu. */
    victoryBanner: 'VOITTO!',
    levelUpPopup: 'TASO NOUSI!',
  },
  /**
   * Sisällön nimet. Suomenkieliset nimet ovat data-tiedostoissa (data/enemies.ts,
   * data/items.ts, data/towns.ts, data/player.ts), englanninkieliset i18n/en-content.ts:ssä.
   */
  names: {
    player: PLAYER.name,
    enemy: (enemy: EnemyDef): string => enemy.name,
    item: (item: ItemDef): string => item.name,
    itemDescription: (item: ItemDef): string => item.description,
    town: (town: TownDef): string => town.name,
  },
  /** Loitsujen nimet (data/spells.ts). */
  spells: {
    fireball: 'Tulipallo',
  },
  /** Loitsujen napit taistelussa. */
  spellButtons: {
    fireball: 'TULIPALLO',
  },
  /** Loppuboss (data/boss.ts): peikkolaskuri, herääminen ja voitto. */
  boss: {
    progress: (count: number, needed: number): string =>
      `Tunturipeikkoja voitettu ${count}/${needed}.`,
    awakenedBattle: (boss: string): string => `Maa jyrisee... ${boss} heräsi!`,
    /** Kartalla, kun boss on juuri herännyt. */
    awakenedMap: (boss: string): string =>
      `${boss} heräsi!\nSe odottaa tuntureilla Kilpisjärven lähellä.`,
    defeatedBattle: (boss: string): string => `${boss} kaatui!`,
  },
  /** Voittoruutu: loppuboss voitettu tai jokainen vihollinen voitettu. Peli jatkuu. */
  victory: {
    bossTitle: 'VOITIT LOPPUBOSSIN!',
    bossText: (boss: string): string => `${boss} on kukistettu. Lappi on vapaa!`,
    completeTitle: 'Suomi on pelastettu!',
    completeText: 'Voitit jokaisen vihollisen ainakin kerran.',
    bossWaiting: (boss: string): string => `Mutta ${boss} odottaa vielä Lapissa...`,
    bossHint: (count: number, needed: number): string =>
      `Voita tunturipeikkoja (${count}/${needed}), niin jokin herää Lapissa...`,
    stats: (level: number, xp: number): string => `Taso ${level}   KP ${xp}`,
    next: 'Kosketa jatkaaksesi seikkailua',
    /** Kartalle palatessa. */
    continues: 'Seikkailu jatkuu!',
  },
};

/** Kaikkien kielten tekstien muoto: samat avaimet kuin suomeksi. */
export type Texts = typeof FI;
