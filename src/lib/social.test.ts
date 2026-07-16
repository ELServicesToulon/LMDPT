import { describe, expect, it } from 'vitest';
import { getPublicSocialLinks, getYoutubeLiveUrl, SOCIAL_LINKS } from '../config/social';
import {
  getYoutubeChannelUrl,
  getYoutubeLiveUrlWithUtm,
  isYoutubeEnabled,
} from '../config/youtube';

describe('social links', () => {
  it('exposes live X account', () => {
    const x = SOCIAL_LINKS.find((l) => l.id === 'x');
    expect(x?.handle).toBe('@LMDuPremierTour');
    expect(x?.url).toBe('https://x.com/LMDuPremierTour');
  });

  it('keeps YouTube off by default until PUBLIC_YOUTUBE_ENABLED', () => {
    expect(isYoutubeEnabled()).toBe(false);
    expect(getYoutubeChannelUrl()).toBe('');
    expect(getYoutubeLiveUrl()).toBe('');
    expect(getYoutubeLiveUrlWithUtm('debats_index')).toBe('');
    const yt = SOCIAL_LINKS.find((l) => l.id === 'youtube');
    expect(yt?.url).toBe('');
  });

  it('returns only links with url (X at minimum)', () => {
    const links = getPublicSocialLinks();
    expect(links.some((l) => l.id === 'x')).toBe(true);
    expect(links.every((l) => l.url.length > 0)).toBe(true);
    expect(links.some((l) => l.id === 'youtube')).toBe(false);
  });
});
