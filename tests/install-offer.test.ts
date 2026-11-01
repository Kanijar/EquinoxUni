import { describe, expect, it, vi } from 'vitest';
import { InstallOffer } from '../src/logic/install-offer';

// ASENNA-nappi näkyy vain, kun Chrome tarjoaa asennusta, ja tarjous käytetään vain kerran.

interface FakePrompt {
  calls: number;
  prompt(): Promise<void>;
}

function fakePrompt(): FakePrompt {
  const fake: FakePrompt = {
    calls: 0,
    prompt: () => {
      fake.calls += 1;
      return Promise.resolve();
    },
  };
  return fake;
}

describe('asennustarjous', () => {
  it('nappi on piilossa, kunnes Chrome tarjoaa asennusta', () => {
    const offer = new InstallOffer();
    const seen: boolean[] = [];
    offer.subscribe((available) => seen.push(available));
    offer.offer(fakePrompt());
    expect(seen).toEqual([false, true]);
    expect(offer.available).toBe(true);
  });

  it('napautus avaa asennusikkunan kerran ja piilottaa napin', async () => {
    const offer = new InstallOffer();
    const prompt = fakePrompt();
    offer.offer(prompt);
    expect(await offer.install()).toBe(true);
    expect(prompt.calls).toBe(1);
    expect(offer.available).toBe(false);
    expect(await offer.install()).toBe(false);
    expect(prompt.calls).toBe(1);
  });

  it('asennuksen jälkeen nappia ei näytetä', () => {
    const offer = new InstallOffer();
    offer.offer(fakePrompt());
    offer.installed();
    expect(offer.available).toBe(false);
  });

  it('lopetettu kuuntelija ei saa enää tietoja', () => {
    const offer = new InstallOffer();
    const listener = vi.fn();
    const unsubscribe = offer.subscribe(listener);
    unsubscribe();
    offer.offer(fakePrompt());
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
