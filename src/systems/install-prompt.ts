import { InstallOffer, type InstallPrompt } from '../logic/install-offer';

// Kuuntelee Chromen asennustapahtumia heti pelin käynnistyessä (main.ts), koska Chrome voi
// lähettää tarjouksen ennen kuin alkuruutu on valmis. Alkuruudun ASENNA-nappi: ui/install-button.ts.
// Tarjous tulee vain, kun peli on julkaistu (HTTPS, manifesti ja kuvakkeet) eikä sitä ole jo asennettu.

const offer = new InstallOffer();

export function installOffer(): InstallOffer {
  return offer;
}

export function watchInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Oma ASENNA-nappi korvaa Chromen oman ilmoituspalkin.
    event.preventDefault();
    offer.offer(event as Event & InstallPrompt);
  });
  window.addEventListener('appinstalled', () => offer.installed());
}

/**
 * Pyytää selainta säilyttämään pelin tiedot (tallennukset), vaikka puhelimen tila loppuisi.
 * Asennetulle pelille Chrome yleensä myöntää tämän. Jos ei, peli toimii kuten ennenkin.
 */
export function requestPersistentStorage(): void {
  navigator.storage?.persist?.().catch(() => {
    // Ei haittaa: tallennukset ovat silti localStoragessa.
  });
}
