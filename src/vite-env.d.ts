// Ympäristömuuttujat, jotka Vite lisää peliin buildissa. Arvot ovat julkisia, eivät salaisuuksia.
interface ImportMetaEnv {
  /** Pelaajalaskurin osoite, esim. wss://equinox-presence.nimi.workers.dev */
  readonly VITE_PRESENCE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
