import { describe, expect, it } from 'vitest';
import curated from '../data/scoop/curated.json';
import { scoopIsLive, type ScoopCurated } from './scoop';

describe('scoop', () => {
  it('montre la une du jour si curated est actif et interne', () => {
    expect(scoopIsLive(curated as ScoopCurated)).toBe(true);
    expect(curated.url.startsWith('/')).toBe(true);
    expect(curated.url).not.toMatch(/^https?:\/\//i);
    expect(String(curated.title ?? '').trim().length).toBeGreaterThan(0);
  });

  it('masque une URL externe ou inactive', () => {
    expect(scoopIsLive({ active: false, title: 'x', url: '/analyses/' })).toBe(false);
    expect(
      scoopIsLive({
        active: true,
        title: 'x',
        url: 'https://example.com/leak',
      }),
    ).toBe(false);
  });
});
