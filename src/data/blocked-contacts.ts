// Yhteystietoja ideaviesteissä (logic/idea-text.ts). Pelaajat ovat 12–15-vuotiaita, ja ideat
// näkyvät kaikille, joten viestiä, jossa näyttää olevan yhteystieto, ei lähetetä. Sana estetään
// vain kokonaisena sanana (myös "snäppiin", koska sanan alku riittää). Pienillä kirjaimilla.

/** Sovellukset, joiden käyttäjänimillä voisi pyytää ottamaan yhteyttä. Sanan alku riittää. */
export const BLOCKED_CONTACT_WORDS: readonly string[] = [
  'discord',
  'snapchat',
  'snäp',
  'snap',
  'whatsapp',
  'wa',
  'telegram',
  'instagram',
  'insta',
  'tiktok',
  'kik',
  'youtube',
  'twitch',
];

/** Lyhyet sanat, jotka täsmäävät vain kokonaisina (wa ≠ "wanha"). */
export const EXACT_CONTACT_WORDS: readonly string[] = ['wa', 'kik', 'snap'];
