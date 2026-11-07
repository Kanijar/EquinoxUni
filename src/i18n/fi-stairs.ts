// Tulivuoren rappusten tekstit suomeksi (TEXT.stairs). Lohikäärmeen voitto nostaa laavasta
// askelman Ossi Ketolan luo (data/volcano-stairs.ts). Sama englanniksi: i18n/en-stairs.ts.

export const FI_STAIRS = {
  /** Taistelun voittoviesti: uusi askelma. */
  step: (count: number, needed: number): string =>
    `Kraatterin laavasta nousi kiviaskelma (${count}/${needed})!`,
  /** Ensimmäisen askelman jälkeen kraatterista kuuluu huuto. */
  cry: '"Apua! Olen Ossi Ketola!" kuuluu kraatterista.',
  /** Taistelun voittoviesti: viimeinen askelma. */
  complete: 'Rappuset ovat valmiit! Kävele kraatteriin Ossi Ketolan luo.',
};
