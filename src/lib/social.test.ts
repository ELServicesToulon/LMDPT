import { describe, expect, it } from 'vitest';
import { getPublicSocialLinks, getYoutubeLiveUrl, SOCIAL_LINKS } from '../config/social';

describe('social links', () => {
  it('exposes live X account', () => {
    const x = SOCIAL_LINKS.find((l) => l.id === 'x');
    expect(x?.handle).toBe('@LMDuPremierTour');
    expect(x?.url).toBe('https://x.com/LMDuPremierTour');
  });

  it('exposes YouTube channel for débats live', () => {
    const yt = SOCIAL_LINKS.find((l) => l.id === 'youtube');
    expect(yt?.handle).toBe('@LMDuPremierTour');
    expect(yt?.url).toContain('youtube.com');
  });

  it('builds live URL on channel', () => {
    expect(getYoutubeLiveUrl()).toMatch(/youtube\.com\/@LMDuPremierTour\/live$/);
  });

  it('returns only links with url', () => {
    expect(getPublicSocialLinks().length).toBeGreaterThanOrEqual(2);
  });
});
