import { GAME_INFO } from '../data/game-info';
import { PLAYER } from '../data/player';
import type {
  EnemyDef,
  GearSlot,
  GearStat,
  IsleDef,
  ItemDef,
  LookPart,
  NpcDef,
  PlayerStats,
  QuestDef,
  SkillStat,
  StatBonus,
  TownDef,
} from '../data/types';
import { localDateParts, twoDigits, type DateParts } from './date-parts';
import { FI_BOAT, FI_VEHICLE } from './fi-boat';
import { FI_BOSS, FI_VICTORY } from './fi-boss';
import { FI_CAVE, FI_MAGIC, FI_SPELL_BUTTONS, FI_SPELLS } from './fi-cave';
import { FI_QUESTS } from './fi-quests';
import { FI_SHOP } from './fi-shop';
import { FI_STAIRS } from './fi-stairs';
import { FI_FISHING } from './fi-fishing';
import { FI_HOUSE } from './fi-house';
import { FI_IDEAS } from './fi-ideas';
import { FI_MAP } from './fi-map';
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
    /** Alakulman versioteksti, esim. "Versio: 0.50 (beta)". Vaihe: data/game-info.ts. */
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
  /** Hahmonluonti uuden pelin alussa (scenes/hero-scene.ts). */
  hero: {
    title: 'LUO SANKARI',
    start: 'ALOITA',
    back: 'TAKAISIN',
    random: 'ARVO',
    name: 'Nimi',
    /** Valintarivin nuolinapit: edellinen ja seuraava vaihtoehto. */
    previous: '<',
    next: '>',
    parts: {
      skin: 'Iho',
      hairStyle: 'Hiukset',
      hairColor: 'Hiusväri',
      shirt: 'Paita',
      pants: 'Housut',
    } satisfies Record<LookPart, string>,
    /** Hiustyylin numero, esim. "2/5". */
    choice: (choice: number, total: number): string => `${choice}/${total}`,
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
    /** Tallennettu peli: paikan numero, sankarin nimi ja taso. */
    savedTitle: (slot: number, hero: string, level: number): string =>
      `${slot}. ${hero}  Taso ${level}`,
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
    coins: (count: number): string => `Kolikot ${count}`,
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
    intro: 'Seikkailu alkaa Kotirannasta!',
    /** Alkuruudun suden salaisuus (logic/menu-secret.ts): näkyy vasta kartalla. */
    wolfBlessing: (level: number): string => `Susi siunasi sinut! Taso ${level}!`,
    /** Alkuruudun salainen burgeri (logic/burger-secret.ts): näkyy vasta kartalla. */
    burgerGift:
      'Nam, salainen burgeri!\nSait parhaat varusteet, Bugattin avaimet\nja miljoona kultakolikkoa!',
    burgerAgain: 'Nam, burgeri!\nSinulla on jo parhaat varusteet.',
    rest: (town: TownDef): string => `Lepäsit ${town.nameAt}. Elämä palautui!`,
    revived: (town: TownDef): string => `Kaaduit... heräsit ${town.nameAt}. Elämä palautui!`,
    skillPointsWaiting: (points: number): string =>
      `Sinulla on ${points} kykypistettä. Paina KYKYPISTEET.`,
  },
  /** Bugattin avaimet kartalla (logic/vehicle.ts): nappi ja ilmoitukset (i18n/fi-boat.ts). */
  vehicle: FI_VEHICLE,
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
    /** Repun sivunumero, esim. Sivu 2/3. */
    page: (page: number, count: number): string => `Sivu ${page}/${count}`,
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
    eat: 'SYÖ',
    /** Syötti valitaan kalastukseen (logic/fishing-gear.ts). */
    bait: 'SYÖTIKSI',
    done: 'VALMIS',
    equippedNow: (item: string): string => `${item} on nyt käytössä!`,
    unequippedNow: (item: string): string => `${item} on taas repussa.`,
    drank: (amount: number): string => `Joit juoman. Elämä +${amount}!`,
    ate: (item: string, amount: number): string => `Söit: ${item}. Elämä +${amount}!`,
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
    /** Voimaisku valmistellaan edellisellä vuorolla (loppuboss ja lohikäärme). */
    charge: (enemy: string): string => `${enemy} valmistelee voimaiskua! PUOLUSTA nyt!`,
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
    won: (enemy: string, xp: number, coins: number): string =>
      `Voitit: ${enemy}! Sait ${xp} KP ja ${coins} kolikkoa.`,
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
    /** Pienen saaren nimi (data/isles.ts). */
    isle: (isle: IsleDef): string => isle.name,
    npc: (npc: NpcDef): string => npc.name,
    /** Tehtävän nimi, tarjous ja kiitos (data/quests.ts). */
    quest: (quest: QuestDef): { title: string; story: string; thanks: string } => quest,
  },
  /** Tehtävänantajien (Jussi ja Ossi Ketola) tehtävät (i18n/fi-quests.ts). */
  quests: FI_QUESTS,
  /** Kulkevan kauppiaan kauppa (i18n/fi-shop.ts). */
  shop: FI_SHOP,
  /** Tulivuoren rappuset Ossi Ketolan luo (i18n/fi-stairs.ts). */
  stairs: FI_STAIRS,
  /** Kalastus (i18n/fi-fishing.ts). */
  fishing: FI_FISHING,
  /** Vene ja pienet saaret (i18n/fi-boat.ts). */
  boat: FI_BOAT,
  /** Loitsujen nimet ja napit taistelussa (data/spells.ts, i18n/fi-cave.ts). */
  spells: FI_SPELLS,
  spellButtons: FI_SPELL_BUTTONS,
  /** Loitsut taistelussa (logic/spells.ts). */
  magic: FI_MAGIC,
  /** Peikkokuninkaan luola (data/cave.ts). */
  cave: FI_CAVE,
  /** Sankarin talo ja 10 parhaan lista (data/house.ts, i18n/fi-house.ts). */
  house: FI_HOUSE,
  /** Ideaviestit alkuruudun IDEAT-napista (i18n/fi-ideas.ts). */
  ideas: FI_IDEAS,
  /** Minikartta ja iso kartta (i18n/fi-map.ts). */
  map: FI_MAP,
  /** Loppuboss (data/boss.ts): peikkolaskuri, herääminen ja voitto (i18n/fi-boss.ts). */
  boss: FI_BOSS,
  /** Voittoruutu: loppuboss voitettu tai jokainen vihollinen voitettu. Peli jatkuu. */
  victory: FI_VICTORY,
};

/** Kaikkien kielten tekstien muoto: samat avaimet kuin suomeksi. */
export type Texts = typeof FI;
