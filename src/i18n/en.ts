import { GAME_INFO } from '../data/game-info';
import type { GearStat, PlayerStats, SkillStat, StatBonus } from '../data/types';
import { localDateParts, twoDigits, type DateParts } from './date-parts';
import { EN_CONTENT } from './en-content';
import { LANGUAGE_NAMES, type Texts } from './fi';

// Kaikki pelaajalle näkyvät tekstit englanniksi. Avaimet ovat samat kuin i18n/fi.ts:ssä:
// kun lisäät tekstin suomeksi, lisää se myös tänne. Englanti on tavallista, 12–15-vuotiaille
// sopivaa kieltä. Vihollisten ja esineiden englanninkieliset nimet: i18n/en-content.ts.

/** Kykyjen arvojen nimet kykypistenäkymässä ("+1 attack / point"). */
const STAT_NAMES: Readonly<Record<SkillStat, string>> = {
  attack: 'attack',
  defense: 'defense',
  maxHp: 'max HP',
  critPercent: 'critical hit',
  magic: 'fire power',
};

/** Varusteiden lisäysten nimet repussa ("+6 attack"). */
const GEAR_STAT_NAMES: Readonly<Record<GearStat, string>> = {
  attack: 'attack',
  defense: 'defense',
  maxHp: 'HP',
  critPercent: 'accuracy',
  magic: 'fire power',
};

/** Varusteen lisäykset tekstinä, esim. "+8% accuracy, +1 attack". */
function bonusText(bonus: StatBonus): string {
  return Object.entries(bonus)
    .map(([stat, amount]) => {
      const percent = stat === 'critPercent' ? '%' : '';
      return `+${amount}${percent} ${GEAR_STAT_NAMES[stat as GearStat]}`;
    })
    .join(', ');
}

const isPercent = (stat: SkillStat): boolean => stat === 'critPercent';

/** Kehitysvaiheen nimi englanniksi (data/game-info.ts: 'alfa' → 'alpha'). */
const STAGES: Readonly<Record<string, string>> = { alfa: 'alpha', beta: 'beta' };
const stage: string = STAGES[GAME_INFO.version] ?? GAME_INFO.version;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Kuukauden lyhenne: 11 → "Nov". */
const monthName = (month: number): string => MONTHS[month - 1] ?? String(month);

/** Tallennushetki muodossa "31 Oct, 14:05". */
function formatTime(time: number): string {
  const { day, month, hour, minute } = localDateParts(time);
  return `${day} ${monthName(month)}, ${hour}:${twoDigits(minute)}`;
}

/** "1 point" mutta "3 points". */
const points = (count: number): string => (count === 1 ? '1 skill point' : `${count} skill points`);

export const EN: Texts = {
  gameTitle: GAME_INFO.name,
  menu: {
    play: 'PLAY',
    load: 'LOAD',
    settings: 'SETTINGS',
    quit: 'EXIT',
    version: (number: string): string => `Version: ${number} (${stage})`,
    versionStageOnly: `Version: ${stage}`,
    released: ({ day, month, year, hour, minute }: DateParts): string =>
      `Released ${day} ${monthName(month)} ${year} at ${hour}:${twoDigits(minute)}`,
    devBuild: 'Development build',
    install: 'INSTALL',
  },
  settings: {
    title: 'Settings',
    brightness: 'Brightness',
    volume: 'Volume',
    sound: 'Sounds',
    percent: (value: number): string => `${value}%`,
    soundOn: 'ON',
    soundOff: 'OFF',
    less: '-',
    more: '+',
    language: 'Language',
    languageNames: LANGUAGE_NAMES,
    back: 'BACK',
  },
  saves: {
    title: 'Saved games',
    slot: (slot: number): string => `Slot ${slot}`,
    empty: 'Empty',
    broken: 'This save is damaged.',
    level: (level: number): string => `Level ${level}`,
    details: (place: string, savedAt: number): string => `${place}, ${formatTime(savedAt)}`,
    save: 'SAVE',
    load: 'LOAD',
    remove: 'DELETE',
    confirm: 'SURE?',
    back: 'BACK',
    saved: (slot: number): string => `Game saved to slot ${slot}!`,
    saveFailed: 'Saving failed. The browser did not allow it.',
    removed: (slot: number): string => `Slot ${slot} cleared.`,
    loadFailed: 'The save could not be loaded.',
    loaded: 'Game loaded!',
    hintMenu: 'Save during the game in a town with the SAVE button.',
    hintGame: 'Your save stays in this browser.',
  },
  exit: {
    title: 'Thanks for playing!',
    hint: 'You can now close the browser tab.',
    back: 'MAIN MENU',
  },
  hud: {
    hp: (hp: number, max: number): string => `HP ${hp}/${max}`,
    xp: (xp: number, nextLevelXp: number | null): string =>
      nextLevelXp === null ? `XP ${xp} (max level)` : `XP ${xp}/${nextLevelXp}`,
    levelAndXp: (level: number, xp: number, nextLevelXp: number | null): string =>
      nextLevelXp === null
        ? `Max level ${level}  XP ${xp}`
        : `Level ${level}  XP ${xp}/${nextLevelXp}`,
    potions: (count: number): string => `Potions ${count}`,
    enemiesLeft: (count: number): string => `Undefeated ${count}`,
    trolls: (count: number, needed: number): string => `Trolls ${count}/${needed}`,
    bossAwake: (boss: string): string => `${boss} is waiting!`,
    players: (count: number): string => `Players now: ${count}`,
  },
  world: {
    intro: 'Your adventure begins in Valkeakoski!',
    wolfBlessing: (level: number): string => `The wolf blessed you! Level ${level}!`,
    rest: (town): string => `You rested in ${town.name}. HP restored!`,
    revived: (town): string => `You fell... and woke up in ${town.name}. HP restored!`,
    skillPointsWaiting: (count: number): string => `You have ${points(count)}. Tap SKILLS.`,
  },
  skills: {
    button: (count: number): string => `SKILLS ${count}`,
    title: 'Skill points',
    left: (count: number): string => `Unused: ${count}`,
    hint: (count: number): string => `You get ${points(count)} for every new level.`,
    names: {
      attack: 'Attack',
      defense: 'Defense',
      vitality: 'Vitality',
      precision: 'Accuracy',
      magic: 'Magic',
    },
    value: (stat: SkillStat, value: number): string =>
      isPercent(stat) ? `${value}%` : String(value),
    perPoint: (amount: number, stat: SkillStat): string =>
      `+${amount}${isPercent(stat) ? '%' : ''} ${STAT_NAMES[stat]} / point`,
    burnPower: (perSecond: number, perPoint: number): string =>
      `burn power ${perSecond}/s (+${perPoint})`,
    add: '+',
    maxed: 'MAX',
    done: 'DONE',
  },
  backpack: {
    button: 'BAG',
    title: 'Backpack',
    equipped: 'Equipped',
    bag: 'In the bag',
    bagEmpty: 'The backpack is empty.',
    slots: { hand: 'Hand', body: 'Body', neck: 'Neck' },
    emptySlot: 'empty',
    count: (count: number): string => `×${count}`,
    hint: 'Tap an item to see what it does.',
    bonus: bonusText,
    stats: (stats: PlayerStats, hp: number): readonly [string, string] => [
      `Attack ${stats.attack}   Defense ${stats.defense}`,
      `Accuracy ${stats.critPercent}%   HP ${hp}/${stats.maxHp}`,
    ],
    equip: 'EQUIP',
    unequip: 'REMOVE',
    drink: 'DRINK',
    done: 'DONE',
    equippedNow: (item: string): string => `${item} is now equipped!`,
    unequippedNow: (item: string): string => `${item} is back in the bag.`,
    drank: (amount: number): string => `You drank a potion. HP +${amount}!`,
    fullHp: 'Your HP is already full.',
  },
  battle: {
    appears: (enemy: string): string => `${enemy} attacks you!`,
    ambush: (enemy: string): string => `Ambush! ${enemy} jumps out from behind the trees!`,
    bossAppears: (enemy: string): string => `${enemy} rises before you! The ground shakes!`,
    choose: 'What will you do?',
    attack: 'ATTACK',
    defend: 'DEFEND',
    punch: 'PUNCH',
    back: 'BACK',
    chooseAttack: 'Punch or throw a fireball?',
    item: (count: number): string => `POTION ${count}`,
    flee: 'RUN',
    playerHit: (enemy: string, damage: number): string => `You hit ${enemy}: -${damage}.`,
    spellHit: (spell: string, enemy: string, damage: number): string =>
      `${spell}! ${enemy} lost ${damage} and caught fire!`,
    burnPopup: (damage: number): string => `-${damage}`,
    enemyHit: (enemy: string, damage: number): string => `${enemy} hit you: -${damage}.`,
    enemyHitDefended: (enemy: string, damage: number): string =>
      `You blocked! ${enemy} only did ${damage}.`,
    charge: (enemy: string): string => `${enemy} raises its club! DEFEND now!`,
    heavyHit: (enemy: string, damage: number): string =>
      `POWER STRIKE! ${enemy} smashed you: -${damage}.`,
    heavyHitDefended: (enemy: string, damage: number): string =>
      `You blocked the power strike! ${enemy} only did ${damage}.`,
    storm: (enemy: string, damage: number): string =>
      `${enemy} blew a snowstorm! You lost ${damage}.`,
    stormDefended: (enemy: string, damage: number): string =>
      `${enemy} blew a snowstorm! Your shield helped: -${damage}.`,
    stormExtinguished: ' The flames went out!',
    chargePopup: 'WARNING!',
    crit: 'CRITICAL HIT! ',
    critPopup: 'CRITICAL HIT!',
    defending: 'You raise your shield and get ready to block.',
    heal: (item: string, amount: number): string => `You drank: ${item}. HP +${amount}.`,
    fleeOk: 'You got away!',
    fleeFail: 'You could not get away!',
    won: (enemy: string, xp: number): string => `You beat ${enemy}! You got ${xp} XP.`,
    drop: (item: string): string => `You found: ${item}!`,
    gearHint: 'Open the BAG and equip your new gear!',
    stole: (enemy: string, item: string): string => `${enemy} stole from you: ${item}!`,
    recovered: (item: string, count: number): string => `You got back: ${item} ×${count}.`,
    levelUp: (level: number): string => `You reached level ${level}! HP restored.`,
    xpToNext: (missing: number): string => `You need ${missing} more XP for the next level.`,
    maxLevel: 'You are at the max level!',
    skillPoints: (count: number): string => `You got ${points(count)}! Use them in a town.`,
    lost: 'You fell in battle...',
    damagePopup: (damage: number): string => `-${damage}`,
    healPopup: (amount: number): string => `+${amount}`,
    victoryBanner: 'VICTORY!',
    levelUpPopup: 'LEVEL UP!',
  },
  names: EN_CONTENT,
  spells: {
    fireball: 'Fireball',
  },
  spellButtons: {
    fireball: 'FIREBALL',
  },
  boss: {
    progress: (count: number, needed: number): string =>
      `Mountain trolls defeated ${count}/${needed}.`,
    awakenedBattle: (boss: string): string => `The ground rumbles... ${boss} has awoken!`,
    awakenedMap: (boss: string): string =>
      `${boss} has awoken!\nIt waits on the fells near Kilpisjärvi.`,
    defeatedBattle: (boss: string): string => `${boss} has fallen!`,
  },
  victory: {
    bossTitle: 'YOU BEAT THE FINAL BOSS!',
    bossText: (boss: string): string => `${boss} is defeated. Lapland is free!`,
    completeTitle: 'Finland is saved!',
    completeText: 'You have beaten every enemy at least once.',
    bossWaiting: (boss: string): string => `But ${boss} is still waiting in Lapland...`,
    bossHint: (count: number, needed: number): string =>
      `Beat mountain trolls (${count}/${needed}) and something will awaken in Lapland...`,
    stats: (level: number, xp: number): string => `Level ${level}   XP ${xp}`,
    next: 'Tap to continue your adventure',
    continues: 'The adventure continues!',
  },
};
