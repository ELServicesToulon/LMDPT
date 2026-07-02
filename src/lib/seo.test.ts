import { describe, expect, it } from 'vitest';
import { pageMeta } from './seo';

describe('pageMeta', () => {
  it('builds canonical and og image URLs', () => {
    const meta = pageMeta({
      title: 'Atlas',
      description: 'Résultats 1er tour',
      siteUrl: 'https://lmdpt.iarbre.org',
      pathname: '/atlas',
    });
    expect(meta.canonical).toBe('https://lmdpt.iarbre.org/atlas');
    expect(meta.ogImage).toBe('https://lmdpt.iarbre.org/brand/og-default.png');
    expect(meta.fullTitle).toContain('Atlas');
    expect(meta.description).toBe('Résultats 1er tour');
  });

  it('uses default description when omitted', () => {
    const meta = pageMeta({
      title: 'Accueil',
      siteUrl: 'https://lmdpt.iarbre.org',
      pathname: '/',
    });
    expect(meta.description).toContain('Democracy Over Elimination');
  });
});
