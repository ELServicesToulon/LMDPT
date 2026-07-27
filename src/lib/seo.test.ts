import { describe, expect, it } from 'vitest';
import {
  pageMeta,
  organizationJsonLd,
  websiteJsonLd,
  webPageJsonLd,
  DEFAULT_DESCRIPTION,
} from './seo';

describe('pageMeta', () => {
  it('builds canonical and og image URLs', () => {
    const meta = pageMeta({
      title: 'Atlas',
      description: 'Résultats 1er tour',
      siteUrl: 'https://lmdpt.iarbre.org',
      pathname: '/atlas',
    });
    expect(meta.canonical).toBe('https://lmdpt.iarbre.org/atlas/');
    expect(meta.ogImage).toBe('https://lmdpt.iarbre.org/brand/og-default.png');
    expect(meta.fullTitle).toContain('Atlas');
    expect(meta.description).toBe('Résultats 1er tour');
    expect(meta.robots).toContain('index');
    expect(meta.keywords).toContain('premier tour');
  });

  it('uses default description when omitted', () => {
    const meta = pageMeta({
      title: 'Accueil',
      siteUrl: 'https://lmdpt.iarbre.org',
      pathname: '/',
    });
    expect(meta.description).toContain('démocratie avant l’élimination');
    expect(meta.fullTitle).toContain('Le Média du Premier Tour');
  });

  it('noindex when requested', () => {
    const meta = pageMeta({
      title: 'Modération',
      siteUrl: 'https://lmdpt.iarbre.org',
      pathname: '/moderation',
      noindex: true,
    });
    expect(meta.robots).toContain('noindex');
  });
});

describe('JSON-LD', () => {
  it('emits NewsMediaOrganization with sameAs', () => {
    const org = organizationJsonLd('https://lmdpt.iarbre.org');
    expect(org['@type']).toBe('NewsMediaOrganization');
    expect(org.sameAs).toContain('https://x.com/LMDuPremierTour');
    expect(org.publishingPrinciples).toContain('/charte');
  });

  it('emits WebSite linked to organization', () => {
    const site = websiteJsonLd('https://lmdpt.iarbre.org/');
    expect(site['@type']).toBe('WebSite');
    expect(site.publisher).toEqual({ '@id': 'https://lmdpt.iarbre.org/#organization' });
  });

  it('emits WebPage/Article for page', () => {
    const page = webPageJsonLd({
      siteUrl: 'https://lmdpt.iarbre.org',
      title: 'Alerte citoyenne',
      description: DEFAULT_DESCRIPTION,
      canonical: 'https://lmdpt.iarbre.org/analyses/alerte-citoyenne/',
      ogImage: 'https://lmdpt.iarbre.org/brand/og-default.png',
      type: 'article',
    });
    expect(page['@type']).toBe('Article');
    expect(page.url).toContain('alerte-citoyenne');
  });
});
