// Minimap and big map texts in English. Finnish: i18n/fi-map.ts.
// Kommentit suomeksi: minikartta ui/minimap.ts, iso kartta scenes/map-scene.ts.

/** Iso kartta ja sen selite englanniksi (TEXT.map). */
export const EN_MAP = {
  title: 'MAP',
  back: 'BACK',
  hero: 'You',
  town: 'Village',
  cave: 'Cave',
  merchant: (name: string): string => `Merchant ${name}`,
  islesHint: 'Islands appear on the map when you find them by boat.',
};
