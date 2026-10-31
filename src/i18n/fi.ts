// Kaikki pelaajalle näkyvät tekstit. Älä kirjoita tekstejä suoraan koodiin,
// vaan lisää ne tänne ja käytä muodossa TEXT.menu.start.

export const TEXT = {
  gameTitle: 'Väinön seikkailu',
  menu: {
    start: 'Aloita peli',
    hint: 'Kosketa aloittaaksesi',
    rotate: 'Käännä puhelin vaakatasoon',
  },
  hud: {
    hp: (hp: number, max: number): string => `Elämä ${hp}/${max}`,
    xp: (xp: number): string => `KP ${xp}`,
  },
  controls: {
    attack: 'LYÖ',
  },
  gameOver: {
    title: 'Hävisit!',
    retry: 'Yritä uudelleen',
  },
  victory: {
    title: 'Kenttä läpäisty!',
    next: 'Jatka',
  },
  pickup: (name: string): string => `Löysit: ${name}`,
} as const;
