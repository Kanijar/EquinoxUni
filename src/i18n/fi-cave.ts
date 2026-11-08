// Loitsujen ja Peikkokuninkaan luolan tekstit suomeksi. Loitsut: data/spells.ts ja
// logic/spells.ts, luola: data/cave.ts ja scenes/cave-scene.ts. Sama englanniksi: i18n/en-cave.ts.

/** Loitsujen nimet (TEXT.spells). */
export const FI_SPELLS = {
  fireball: 'Tulipallo',
  lightning: 'Salama',
  'ice-arrow': 'Jäänuoli',
  healing: 'Parannus',
};

/** Loitsujen napit taistelussa (TEXT.spellButtons). Nappiin mahtuu noin 9 merkkiä. */
export const FI_SPELL_BUTTONS = {
  fireball: 'TULIPALLO',
  lightning: 'SALAMA',
  'ice-arrow': 'JÄÄNUOLI',
  healing: 'PARANNUS',
};

/** Loitsut taistelussa (TEXT.magic). */
export const FI_MAGIC = {
  /** HYÖKKÄÄ-valikon nappi, kun sankari osaa loitsuja loitsukirjoista. */
  spellsButton: 'LOITSUT',
  chooseSpell: 'Minkä loitsun käytät?',
  /** Loitsunappi, kun loitsua pitää vielä odottaa (vuoroja). */
  wait: (turns: number): string => `ODOTA ${turns}`,
  /** Salama tai jäänuoli, joka ei jäädyttänyt (vihollinen kaatui). */
  spellStrike: (spell: string, enemy: string, damage: number): string =>
    `${spell}! ${enemy} menetti ${damage}.`,
  freezeHit: (enemy: string, damage: number): string =>
    `Jäänuoli! ${enemy} menetti ${damage} ja jäätyi!`,
  healed: (amount: number): string => `Parannus! Sait ${amount} elämää.`,
  frozen: (enemy: string): string => `${enemy} on jäässä eikä voi liikkua!`,
  /** Loitsukirjan tiedot kaupassa ja repussa. */
  strikeInfo: (amount: number, wait: number): string => `Osuma ${amount}, odotus ${wait} vuoroa`,
  healInfo: (amount: number, wait: number): string => `Parantaa ${amount}, odotus ${wait} vuoroa`,
  learned: (spell: string): string => `Opit loitsun: ${spell}! Taistelussa HYÖKKÄÄ → LOITSUT.`,
};

/** Peikkokuninkaan luola (TEXT.cave). */
export const FI_CAVE = {
  /** Kartan nappi luolan suulla. */
  button: 'LUOLA',
  /** Kartalla suljetun luolan suulla. */
  closed: 'Luolan suun tukkii valtava kivi.\nPeikkokuningas vartioi sitä...',
  /** Voittoruudulla, kun Peikkokuningas kaatui. */
  opened: 'Tunturilla jyrähti: luolan suulta vierähti kivi pois!',
  title: 'Peikkokuninkaan luola',
  leave: 'POISTU',
  pull: 'VEDÄ MIEKKA',
  shop: 'NOIDAN KAUPPA',
  swordReady: 'Excalibur on juuttunut kiveen. Jaksatko vetää sen irti?',
  swordLevel: (level: number): string =>
    `Excalibur on juuttunut kiveen. Vain tason ${level} sankari jaksaa vetää sen irti.`,
  swordPulled: 'Vedit Excaliburin kivestä! Se on nyt kädessäsi.',
  swordTaken: 'Kivi on tyhjä. Excalibur on sinun.',
  witchGreet: (name: string): string =>
    `${name}: Hihhii! Kukistit Peikkokuninkaan. Haluatko oppia loitsuja?`,
  shopTitle: (name: string): string => `Noita ${name}`,
  shopGreet: (name: string): string => `${name}: Loitsuja ja voimia, kultaseni! Mitä otat?`,
  /** Noidan kaupan salainen nappi ja teksti sen yläpuolella (ui/coming-soon-button.ts). */
  mystery: '???',
  comingSoon: 'Tulee pian peliin!',
};
