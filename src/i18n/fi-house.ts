// Sankarin talon ja 10 parhaan listan tekstit suomeksi (data/house.ts, scenes/house-scene.ts).
// Sama englanniksi: i18n/en-house.ts.

/** Sankarin talo (TEXT.house). */
export const FI_HOUSE = {
  /** Talon nimi kartalla talon alla. */
  mapLabel: 'Talosi',
  /** Kartan nappi talon ovella. */
  button: 'TALO',
  title: 'Talosi',
  leave: 'POISTU',
  listTitle: 'KOKO PELIN 10 PARASTA',
  /** Yksi listan rivi: sija ja nimimerkki vasemmalla, taso ja KP omissa sarakkeissaan oikealla. */
  rowName: (rank: number, name: string): string => `${rank}. ${name}`,
  rowLevel: (level: number): string => `Taso ${level}`,
  rowXp: (xp: number): string => `${xp} KP`,
  loading: 'Haetaan listaa...',
  empty: 'Lista on vielä tyhjä.',
  offline: 'Listaa ei saatu.\nKokeile myöhemmin uudelleen.',
  disabled: 'Lista ei ole vielä käytössä.',
  /** Oma sija listan vieressä. */
  yourRank: (rank: number): string => `Olet sijalla ${rank}!`,
  best: 'Olet koko pelin paras!',
  /** Nappi, joka lähettää oman tuloksen listalle. */
  submit: 'LISÄÄ TULOKSENI',
  /** Kerrotaan aina napin yllä, ennen kuin nimimerkki näkyy muille. */
  privacy: 'Nimimerkkisi ja KP:si näkyvät listalla kaikille pelaajille. Älä käytä oikeaa nimeäsi.',
};
