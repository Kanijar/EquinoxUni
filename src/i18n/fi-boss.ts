// Loppubossin ja voittoruudun tekstit suomeksi. Erotettu tiedostosta i18n/fi.ts, jotta se pysyy
// pienenä. Sama englanniksi: i18n/en.ts (boss ja victory).

/** Loppuboss (data/boss.ts): peikkolaskuri, herääminen ja voitto (TEXT.boss). */
export const FI_BOSS = {
  progress: (count: number, needed: number): string =>
    `Tunturipeikkoja voitettu ${count}/${needed}.`,
  awakenedBattle: (boss: string): string => `Maa jyrisee... ${boss} heräsi!`,
  /** Kartalla, kun boss on juuri herännyt. */
  awakenedMap: (boss: string): string => `${boss} heräsi!\nSe odottaa luoteisilla tuntureilla.`,
  defeatedBattle: (boss: string): string => `${boss} kaatui!`,
};

/** Voittoruutu: loppuboss voitettu tai jokainen vihollinen voitettu. Peli jatkuu (TEXT.victory). */
export const FI_VICTORY = {
  bossTitle: 'VOITIT LOPPUBOSSIN!',
  bossText: (boss: string): string => `${boss} on kukistettu. Tunturit ovat vapaat!`,
  completeTitle: 'Saari on pelastettu!',
  completeText: 'Voitit jokaisen vihollisen ainakin kerran.',
  bossWaiting: (boss: string): string => `Mutta ${boss} odottaa vielä tuntureilla...`,
  bossHint: (count: number, needed: number): string =>
    `Voita tunturipeikkoja (${count}/${needed}), niin jokin herää tuntureilla...`,
  stats: (level: number, xp: number): string => `Taso ${level}   KP ${xp}`,
  next: 'Kosketa jatkaaksesi seikkailua',
  /** Kartalle palatessa. */
  continues: 'Seikkailu jatkuu!',
};
