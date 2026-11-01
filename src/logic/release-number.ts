// Versionumeron loppuosa on uusimman PR:n numero. Buildi (vite.config.ts) lukee gitistä
// commitien otsikot uusimmasta alkaen, ja tämä tiedosto poimii niistä PR:n numeron.
// Tiedosto ei tuo mitään, jotta vite.config.ts voi käyttää sitä suoraan.

/** GitHubin merge-napin otsikko: "Merge pull request #25 from Kanijar/haara". */
const MERGE_SUBJECT = /^Merge pull request #(\d+)\b/;
/** GitHubin squash-mergen otsikko: "Uusi vihollinen (#25)". */
const SQUASH_SUBJECT = /\(#(\d+)\)\s*$/;

/** PR:n numero commitin otsikosta. null, jos otsikko ei ole PR:n merge. */
export function prNumberFromSubject(subject: string): number | null {
  const match = MERGE_SUBJECT.exec(subject) ?? SQUASH_SUBJECT.exec(subject);
  const digits = match?.[1];
  return digits === undefined ? null : Number(digits);
}

/** Uusimman PR:n numero otsikoista (uusin ensin). null, jos yhtään PR:ää ei löydy. */
export function latestPrNumber(subjects: readonly string[]): number | null {
  for (const subject of subjects) {
    const number = prNumberFromSubject(subject);
    if (number !== null) return number;
  }
  return null;
}
