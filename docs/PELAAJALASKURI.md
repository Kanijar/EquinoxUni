# Pelaajalaskuri ja 10 parhaan lista

Alkuruudun ja kartan vasemmassa alakulmassa näkyy, montako ihmistä pelaa juuri nyt:
**Pelaajia nyt: 3**. Luvussa on mukana myös pelaaja itse.

Laskuri tarvitsee pienen palvelimen, koska GitHub Pages näyttää vain valmiita tiedostoja eikä
tiedä, ketkä muut ovat pelissä. **Ennen kuin palvelin on pystytetty, laskuri on piilossa ja peli
toimii täsmälleen kuten ennenkin.**

## Miten se toimii

1. Kun peli käynnistyy, se avaa yhden WebSocket-yhteyden laskuripalvelimeen.
2. Palvelin laskee avoimet yhteydet. Yksi avoin yhteys = yksi pelaaja.
3. Aina kun joku tulee tai lähtee, palvelin lähettää kaikille uuden määrän: `{"count":3}`.
4. Kun puhelimen näyttö sammuu tai selain siirtyy taustalle, peli sulkee yhteyden, ja
   pelaaja lähtee laskurista. Kun peli tulee taas näkyviin, yhteys avataan uudelleen.
5. Jos yhteys katkeaa, laskuri piiloutuu ja peli yrittää myöhemmin uudelleen (2 s, 4 s, 8 s ...
   enintään minuutin välein).

### Yksityisyys (pelaajat ovat 12–15-vuotiaita)

- Peli ei lähetä palvelimelle **mitään tietoa pelaajasta**: ei nimeä, tunnistetta, sijaintia,
  tallennusta eikä evästeitä. Pelkkä avoin yhteys riittää laskemiseen.
- Palvelin ei tallenna mitään. Se tietää vain, montako yhteyttä on auki juuri nyt.
- Palvelin hyväksyy yhteydet vain pelin omalta sivulta (`ALLOWED_ORIGINS` tiedostossa
  `worker/presence/wrangler.toml`), joten muut sivustot eivät voi sotkea laskuria.
- Cloudflare näkee yhteyden IP-osoitteen samalla tavalla kuin GitHub Pages näkee sivun lataajan.

## Miksi Cloudflare (Worker + Durable Object)

| Vaihtoehto                   | Miksi ei / miksi                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cloudflare Worker + DO** ✓ | Ilmainen. Peliin ei tule vierasta kirjastoa (selaimen oma WebSocket riittää). Luku on tarkka: suljettu yhteys poistuu laskurista heti itse. |
| Firebase Realtime Database   | Vaatii Googlen kirjaston peliin (isompi lataus, vierasta koodia). Ilmaisversiossa enintään 100 yhtäaikaista yhteyttä.                       |
| Supabase Realtime            | Vaatii Supabasen kirjaston. Ilmainen projekti menee tauolle, jos sitä ei käytetä viikkoon.                                                  |

Palvelimen koodi on tässä repossa (`worker/presence/`), joten sen voi lukea ja tarkistaa.
CI tarkistaa sen tyypit ja lintterin samalla tavalla kuin pelin.

## Mitä Jarin pitää tehdä (kerran, noin 15 minuuttia)

Tilin tekee aikuinen. Kaikki alla oleva on ilmaista, eikä luottokorttia tarvita.

**A. Cloudflare-tili ja avaimet**

1. Luo tili osoitteessa <https://dash.cloudflare.com/sign-up> ja vahvista sähköposti.
2. Avaa vasemmasta valikosta **Workers & Pages**. Ensimmäisellä kerralla Cloudflare pyytää
   valitsemaan `workers.dev`-aliverkkotunnuksen: valitse esim. `kanijar`. Laskurin osoitteeksi
   tulee silloin `equinox-presence.kanijar.workers.dev`.
3. Kopioi samalta sivulta **Account ID** (näkyy oikeassa reunassa, tai tilin nimen vieressä
   olevan valikon kohdasta _Copy account ID_).
4. Avaa oikean yläkulman profiilikuvake → **My Profile** → **API Tokens** → **Create Token** →
   valitse pohja **Edit Cloudflare Workers** → **Use template**. Valitse _Account Resources_
   -kohtaan oma tilisi ja _Zone Resources_ -kohtaan **All zones** → **Continue to summary** →
   **Create Token**. Kopioi avain heti (se näytetään vain kerran).

**B. Avaimet GitHubiin (salaisuuksina, eivät näy kenellekään)**

5. Avaa <https://github.com/Kanijar/EquinoxUni/settings/secrets/actions> →
   **New repository secret** ja lisää kaksi salaisuutta:
   - `CLOUDFLARE_API_TOKEN` = kohdan 4 avain
   - `CLOUDFLARE_ACCOUNT_ID` = kohdan 3 Account ID

**C. Palvelin päälle**

6. Avaa <https://github.com/Kanijar/EquinoxUni/actions> → vasemmalta
   **Julkaise pelaajalaskuri Cloudflareen** → **Run workflow** → **Run workflow**.
   (Työ näkyy listassa vasta, kun tämä muutos on yhdistetty `main`-haaraan.)
7. Kun työ on vihreä, avaa selaimessa `https://equinox-presence.<aliverkkotunnus>.workers.dev`.
   Sivulla pitää lukea _Equinox Universe -pelaajalaskuri toimii._ Tarkka osoite näkyy myös
   työn lokin lopussa.

**D. Peli käyttämään palvelinta**

8. Avaa <https://github.com/Kanijar/EquinoxUni/settings/variables/actions> →
   **New repository variable**:
   - Nimi: `PRESENCE_URL`
   - Arvo: `wss://equinox-presence.<aliverkkotunnus>.workers.dev` (huomaa **wss://**, ei https://)

   Tämä on muuttuja eikä salaisuus, koska osoite näkyy pelissä joka tapauksessa julkisesti.

9. Julkaise peli uudelleen: Actions → **Julkaise GitHub Pagesiin** → **Run workflow**.
   Avaa peli puhelimella ja tietokoneella yhtä aikaa: alakulmassa lukee _Pelaajia nyt: 2_.

Jatkossa palvelin päivittyy itsestään, kun sen koodi muuttuu `main`-haarassa.

### Vaihtoehto: julkaisu omalta koneelta

Jos et halua lisätä avaimia GitHubiin (kohdat 3–6), Node.js:n asentaneella koneella:

```bash
cd worker/presence
npx wrangler login     # avaa selaimen ja kirjautuu Cloudflareen
npx wrangler deploy    # tulostaa laskurin osoitteen
```

Tee sen jälkeen kohdat 8 ja 9. Palvelimen muutokset pitää silloin julkaista aina käsin.

## Kokeilu omalla koneella

Kaksi pääteikkunaa:

```bash
# 1) laskuripalvelin paikallisesti (http://127.0.0.1:8787)
cd worker/presence && npx wrangler dev --port 8787

# 2) peli, joka käyttää paikallista laskuria
VITE_PRESENCE_URL=ws://127.0.0.1:8787 npm run dev
```

Windowsissa osoitteen voi laittaa tiedostoon `.env.local` (ei mene GitHubiin):
`VITE_PRESENCE_URL=ws://127.0.0.1:8787`. Avaa `http://localhost:5173` kahteen välilehteen.
Puhelimella paikallinen laskuri ei näy, koska puhelimen sivun osoite ei ole sallittujen listalla.

## 10 parhaan lista (sankarin talo)

Kotirannan laidalla on sankarin talo, jonka seinällä on **koko pelin 10 parhaan pelaajan lista**
(nimimerkki, taso ja KP). Lista käyttää **samaa palvelinta** kuin laskuri: osoite
`https://equinox-presence.<aliverkkotunnus>.workers.dev/leaderboard` johdetaan laskurin
`wss://`-osoitteesta. Kun laskuri on pystytetty yllä olevalla ohjeella, myös lista toimii.
Ennen sitä talossa lukee _Lista ei ole vielä käytössä_.

Jos laskuri on jo pystytetty: kun tämä muutos yhdistetään `main`-haaraan, palvelin päivittyy
itsestään (työ **Julkaise pelaajalaskuri Cloudflareen**). Jos julkaisit palvelimen omalta
koneelta, aja `npx wrangler deploy` uudelleen kansiossa `worker/presence`.

### Miten se toimii

1. Kun pelaaja menee taloonsa, peli hakee listan. Vasta kun hän painaa **LISÄÄ TULOKSENI**,
   peli lähettää palvelimelle kolme asiaa: sankarin satunnaisen
   tunnisteen (20 merkkiä, arvotaan uutta peliä aloitettaessa), nimimerkin ja KP:t.
2. Palvelin muistaa jokaisen sankarin parhaat KP:t (`LeaderboardRoom`, SQLite-taulu) ja
   vastaa 10 parhaalla ja pelaajan omalla sijalla.
3. Paremmuus: eniten KP:tä. Tasatilanteessa ensin perille ehtinyt on edellä.

### Yksityisyys ja turvallisuus

- Talossa kerrotaan aina, että nimimerkki näkyy kaikille, ja kehotetaan olemaan käyttämättä
  oikeaa nimeä. Tulos lähtee vain, kun pelaaja itse painaa talossa LISÄÄ TULOKSENI.
- Palvelin ei tallenna IP-osoitteita, evästeitä eikä muuta tietoa. Tunnistetta ei näytetä muille.
- Nimimerkki siistitään (enintään 12 merkkiä, vain kirjaimia, numeroita, välilyöntejä ja
  viivoja), ja kirosanat (`src/data/blocked-names.ts`) korvataan nimellä _Sankari_.
- Palvelin muistaa enintään 5000 sankaria (`src/config/leaderboard.ts`); huonoimmat poistetaan.

### Rajoitukset

- **Huijaaminen on mahdollista.** Peli toimii selaimessa, joten taitava käyttäjä voi lähettää
  palvelimelle keksityt KP:t (tai muokata tallennustaan). Palvelin hylkää vain järjettömät luvut.
  Alkuruudun suden salaisuus (taso 100 heti) näkyy listalla tavallisena tuloksena.
- **Kirosanasuodatin ei ole täydellinen.** Jos listalle ilmestyy sopimaton nimimerkki, sen voi
  poistaa (alla).
- Sama pelaaja voi olla listalla monella sankarilla (jokaisella uudella pelillä on oma tunniste).
  Vanhan tallennuksen sankari saa tunnisteen latauksessa: tallenna peli, niin tunniste pysyy.

### Sopimattoman nimimerkin poisto (aikuinen, kerran)

1. Keksi pitkä salainen avain ja tallenna se palvelimelle kansiossa `worker/presence`:
   `npx wrangler secret put ADMIN_KEY` (kysyy avaimen).
2. Poista nimimerkki (kaikki sen nimiset sankarit):

```bash
curl -X DELETE -H "Authorization: Bearer <avain>" \
  "https://equinox-presence.<aliverkkotunnus>.workers.dev/leaderboard?name=Nimimerkki"
```

Vastaus kertoo, montako riviä poistettiin: `{"removed":1}`. Uuden estetyn sanan voi lisätä
tiedostoon `src/data/blocked-names.ts`.

## Koodin rakenne

| Tiedosto                                                     | Mitä tekee                                                        |
| ------------------------------------------------------------ | ----------------------------------------------------------------- |
| `src/net/presence.ts`                                        | Rajapinta `PresenceService` ja `NoPresence` (laskuri pois päältä) |
| `src/net/websocket-presence.ts`                              | WebSocket-toteutus: yhteys, ping, uudet yritykset                 |
| `src/net/create-presence.ts`                                 | Valitsee toteutuksen osoitteen (`VITE_PRESENCE_URL`) perusteella  |
| `src/logic/presence-message.ts`                              | Viestien muoto ja odotusajat (puhdas logiikka, testattu)          |
| `src/config/presence.ts`                                     | Vakiot: ping-väli, odotusajat, yläraja                            |
| `src/systems/player-count.ts`                                | Yksi yhteinen laskuri koko pelille, seuraa onko peli näkyvissä    |
| `src/ui/player-count-label.ts`                               | Teksti vasempaan alakulmaan (alkuruutu ja kartta)                 |
| `worker/presence/`                                           | Palvelin: Cloudflare Worker + `PresenceRoom`-Durable Object       |
| `worker/presence/src/leaderboard-room.ts`                    | 10 parhaan lista (`LeaderboardRoom`-Durable Object, SQLite)       |
| `src/net/leaderboard.ts`, `src/logic/leaderboard*.ts`        | Listan yhteys, viestit, nimimerkit ja sankaritunniste             |
| `tests/presence.test.ts`, `tests/websocket-presence.test.ts` | Testit valeyhteydellä, ilman oikeaa palvelinta                    |

**Palvelun vaihtaminen:** tee uusi luokka, joka toteuttaa `PresenceService`-rajapinnan
(esim. `src/net/firebase-presence.ts`), ja vaihda se `create-presence.ts`:ään. Muuta peliä ei
tarvitse muuttaa.
