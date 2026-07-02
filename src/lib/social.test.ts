import { describe, expect, it } from 'vitest';
import { getPublicSocialLinks, SOCIAL_LINKS } from '../config/social';

describe('social links', () => {
  it('exposes live X account', () => {
    const x = SOCIAL_LINKS.find((l) => l.id === 'x');
    expect(x?.handle).toBe('@LMDuPremierTour');
    expect(x?.url).toBe('https://x.com/LMDuPremierTour');
  });

  it('returns only links with url', () => {
    expect(getPublicSocialLinks().length).toBeGreaterThanOrEqual(1);
  });
});
