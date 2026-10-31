// Sallitaanko yhteys tältä sivulta? Selaimet kertovat aina sivun osoitteen (Origin),
// joten muut sivustot eivät voi liittää omia kävijöitään pelin laskuriin.

export function isAllowedOrigin(origin: string | null, allowedList: string): boolean {
  if (!origin) {
    return false;
  }
  return allowedList
    .split(',')
    .map((entry) => entry.trim())
    .some((allowed) => allowed !== '' && allowed === origin);
}
