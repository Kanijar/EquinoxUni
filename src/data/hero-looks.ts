import type { HeroLook, HeroLookOptions } from './types';

// Sankarin ulkonäkö, jonka pelaaja valitsee uuden pelin alussa (scenes/hero-scene.ts).
// Uusi väri: lisää se listan loppuun (vanhat tallennukset pysyvät samannäköisinä).
// Uusi hiustyyli: lisää rivit hairStyles-listan loppuun. Rivit korvaavat baseRowsin ylimmät
// rivit, joten pää ja silmät pysyvät paikallaan. Sprite kootaan logic/hero-look.ts:ssä.

export const HERO_LOOKS: HeroLookOptions = {
  baseRows: [
    '................',
    '.....hhhhhh.....',
    '....hhhhhhhh....',
    '....hssssssh....',
    '....sesssses....',
    '....ssssssss....',
    '.....ssssss.....',
    '....bbbbbbbb....',
    '...bbbbbbbbbb...',
    '...sbbbbbbbbs...',
    '...sbbbbbbbbs...',
    '....llllllll....',
    '....lll..lll....',
    '....lll..lll....',
    '....kkk..kkk....',
    '................',
  ],
  hairStyles: [
    // Lyhyt tukka (sama kuin baseRows).
    { id: 'short', rows: [] },
    {
      id: 'spiky',
      rows: [
        '....h.h..h.h....',
        '....hhhhhhhh....',
        '...hhhhhhhhhh...',
        '....hshsshsh....',
        '....sesssses....',
      ],
    },
    {
      id: 'long',
      rows: [
        '................',
        '.....hhhhhh.....',
        '....hhhhhhhh....',
        '...hhsssssshh...',
        '...hsessssesh...',
        '...hssssssssh...',
        '....hssssssh....',
      ],
    },
    {
      id: 'mohawk',
      rows: [
        '.......hh.......',
        '.....shhhhs.....',
        '....sshhhhss....',
        '....ssssssss....',
        '....sesssses....',
      ],
    },
    {
      // Lippis paidan värisenä, lippa oikealle.
      id: 'cap',
      rows: [
        '................',
        '.....cccccc.....',
        '....cccccccc....',
        '....ccccccccccc.',
        '....sesssses....',
      ],
    },
  ],
  colors: {
    skin: ['#f2c38f', '#ffdcb8', '#d9a066', '#a8683c', '#6b4226'],
    hairColor: [
      '#5a3a1a',
      '#1a1a1a',
      '#f0d060',
      '#c8501e',
      '#e8e8e8',
      '#3a7ae0',
      '#3fbf4a',
      '#9b4ae0',
    ],
    shirt: ['#2e6fd8', '#d83a3a', '#3fa34d', '#f0c030', '#7a3ad8', '#f08a24', '#2a2a2a', '#e8e8e8'],
    pants: ['#22355e', '#3b2a1a', '#2a2a2a', '#4a6a2a', '#7a7a7a'],
  },
  bootColor: '#3b2a1a',
  parts: ['skin', 'hairStyle', 'hairColor', 'shirt', 'pants'],
};

/** Ulkonäkö, jos pelaaja ei valitse mitään (myös vanhat tallennukset ja alkuruutu). */
export const DEFAULT_LOOK: HeroLook = { skin: 0, hairStyle: 0, hairColor: 0, shirt: 0, pants: 0 };
