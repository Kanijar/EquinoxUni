// 10 parhaan listan ja ideaviestien HTTP-vastausten CORS-otsakkeet: selain antaa pelin lukea vastauksen
// vain, jos palvelin kertoo pelin sivun osoitteen (Origin) sallituksi.

export function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

/** Lisää CORS-otsakkeet palvelimen vastaukseen. */
export function withCors(response: Response, origin: string): Response {
  const result = new Response(response.body, response);
  for (const [key, value] of Object.entries(corsHeaders(origin))) {
    result.headers.set(key, value);
  }
  return result;
}

/** Ylläpidon avain otsakkeesta "Authorization: Bearer <avain>". Tyhjä avain ei kelpaa koskaan. */
export function isAdmin(header: string | null, adminKey: string | undefined): boolean {
  return Boolean(adminKey) && header === `Bearer ${adminKey ?? ''}`;
}
