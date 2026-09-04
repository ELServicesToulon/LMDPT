import { describe, expect, it } from 'vitest';
import { getUneDuJour } from './editorial';
import { scoopIsLive, type ScoopCurated } from './scoop';

describe('scoop', () => {
  it('la une du jour est un texte interne publié, pas une URL externe', () => {
    const une = getUneDuJour();
    expect(une).not.toBeNull();
    expect(une?.href.startsWith('/')).toBe(true);
    expect(une?.href).not.toMatch(/^https?:\/\//i);
    expect(String(une?.title ?? '').trim().length).toBeGreaterThan(0);
    expect(scoopIsLive({ active: true, title: une!.title, url: une!.href })).toBe(true);
  });

  it('masque une URL externe ou inactive', () => {
    expect(scoopIsLive({ active: false, title: 'x', url: '/analyses/' })).toBe(false);
    expect(
      scoopIsLive({
        active: true,
        title: 'x',
        url: 'https://example.com/leak',
      } as ScoopCurated),
    ).toBe(false);
  });
});
