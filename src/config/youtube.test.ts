import { describe, expect, it } from 'vitest';
import {
  getYoutubeChannelUrl,
  getYoutubeLiveUrl,
  getYoutubeLiveUrlWithUtm,
  isYoutubeEnabled,
} from './youtube';

describe('youtube config (default: disabled)', () => {
  it('is disabled without PUBLIC_YOUTUBE_ENABLED', () => {
    expect(isYoutubeEnabled()).toBe(false);
    expect(getYoutubeChannelUrl()).toBe('');
    expect(getYoutubeLiveUrl()).toBe('');
  });

  it('does not append UTM when live URL is empty', () => {
    expect(getYoutubeLiveUrlWithUtm('debats_index')).toBe('');
  });
});
