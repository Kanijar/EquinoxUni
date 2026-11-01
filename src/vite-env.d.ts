// Ympäristömuuttujat, jotka Vite lisää peliin buildissa. Arvot ovat julkisia, eivät salaisuuksia.
interface ImportMetaEnv {
  /** Pelaajalaskurin osoite, esim. wss://equinox-presence.nimi.workers.dev */
  readonly VITE_PRESENCE_URL?: string;
  /** Uusimman PR:n numero, josta versionumero tulee (vite.config.ts lukee sen gitistä). */
  readonly VITE_RELEASE_PR?: string;
  /** Buildin aika ISO-muodossa, näytetään alkuruudussa julkaisuaikana. */
  readonly VITE_RELEASE_TIME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
