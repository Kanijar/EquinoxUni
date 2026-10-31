# Väinön seikkailu

Pixelart 2D -seikkailu- ja taistelupeli, jota pelataan Android-puhelimen selaimella.

## Pelaaminen

- Valmis versio: https://kanijar.github.io/EquinoxUni/ (kun GitHub Pages on otettu käyttöön)
- Käännä puhelin vaakatasoon. Vasen peukalo liikuttaa, oikea peukalo painaa **LYÖ**.
- Tietokoneella: nuolet tai WASD liikkuu, välilyönti lyö.

## Kehittäminen

Tarvitset [Node.js](https://nodejs.org/) 22 -version.

```bash
npm install
npm run dev     # avaa näkyvän osoitteen selaimessa tai puhelimessa samassa wifissä
npm run check   # tarkistukset ennen kuin muutos on valmis
```

- Ohjeet tekoälylle (ja ihmisille): [CLAUDE.md](CLAUDE.md)
- Arkkitehtuuri ja suunnitelma: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
