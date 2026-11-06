import { describe, expect, it } from 'vitest';
import { DEFAULT_DONATE_URL, donateReady, getDonateUrl } from './soutenir';

describe('soutenir / don Stripe', () => {
  it('fournit l’URL Stripe par défaut et donateReady() est vrai', () => {
    expect(getDonateUrl()).toBe(DEFAULT_DONATE_URL);
    expect(donateReady()).toBe(true);
  });
});
