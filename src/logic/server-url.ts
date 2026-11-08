// Pelaajalaskurin palvelimen muut osoitteet (10 parhaan lista, ideaviestit).
// Osoite johdetaan laskurin WebSocket-osoitteesta, joten uusia asetuksia ei tarvita.

/**
 * wss://x.workers.dev + /ideas → https://x.workers.dev/ideas (ws:// → http://).
 * null = laskuria ei ole määritetty, joten palvelinta ei ole.
 */
export function serverUrl(presenceUrl: string | undefined, path: string): string | null {
  const match = /^(wss?):\/\/([^\s/]+)/.exec(presenceUrl?.trim() ?? '');
  if (!match) {
    return null;
  }
  const scheme = match[1] === 'wss' ? 'https' : 'http';
  return `${scheme}://${match[2] ?? ''}${path}`;
}
