// Minikartan ja ison kartan tekstit suomeksi (ui/minimap.ts, scenes/map-scene.ts).
// Sama englanniksi: i18n/en-map.ts.

/** Iso kartta ja sen selite (TEXT.map). */
export const FI_MAP = {
  title: 'KARTTA',
  back: 'TAKAISIN',
  hero: 'Sinä',
  town: 'Kylä',
  cave: 'Luola',
  merchant: (name: string): string => `Kauppias ${name}`,
  /** Näkyy, kun kaikkia pieniä saaria ei ole vielä löydetty. */
  islesHint: 'Saaret ilmestyvät karttaan, kun löydät ne veneellä.',
};
