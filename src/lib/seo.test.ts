import { describe, expect, it } from 'vitest';
import {
  pageMeta,
  organizationJsonLd,
  websiteJsonLd,
  webPageJsonLd,
  socialTitleFrom,
  SOCIAL_TITLE_MAX,
  DEFAULT_DESCRIPTION,
} from './seo';
import { ANALYSIS_CATALOG } from './analyses';

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
    expect(meta.fullTitle).toContain('Le Média du Premier Tour');
    expect(meta.socialTitle).toBe('Atlas');
    expect(meta.socialTitle).not.toContain('—');
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
    expect(meta.socialTitle).toBe('Le Média du Premier Tour');
    expect(meta.socialTitle.length).toBeLessThanOrEqual(SOCIAL_TITLE_MAX);
  });

  it('raccourcit les titres sociaux sans le suffixe du site', () => {
    const long = 'Trump, garde-fous de l’IA et Anthropic : quand le président se dit la seule règle';
    const meta = pageMeta({
      title: long,
      siteUrl: 'https://lmdpt.iarbre.org',
      pathname: '/analyses/trump-ia-guardrails-anthropic',
      type: 'article',
    });
    expect(meta.fullTitle).toContain('— Le Média du Premier Tour');
    expect(meta.socialTitle).not.toContain('Le Média du Premier Tour');
    expect(meta.socialTitle.length).toBeLessThanOrEqual(SOCIAL_TITLE_MAX);
    expect(socialTitleFrom(long).endsWith('…')).toBe(true);
    for (const analysis of ANALYSIS_CATALOG) {
      const social = socialTitleFrom(analysis.title);
      expect(social.length).toBeLessThanOrEqual(SOCIAL_TITLE_MAX);
      expect(social).not.toMatch(/— Le Média du Premier Tour/);
    }
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
    expect(page.author).toEqual({
      '@type': 'Organization',
      name: 'Le Média du Premier Tour',
      url: 'https://lmdpt.iarbre.org/',
    });
  });

  it('ajoute les dates d’article sans inventer une personne', () => {
    const page = webPageJsonLd({
      siteUrl: 'https://lmdpt.iarbre.org',
      title: 'Trump, garde-fous de l’IA',
      description: DEFAULT_DESCRIPTION,
      canonical: 'https://lmdpt.iarbre.org/analyses/trump-ia-guardrails-anthropic/',
      ogImage: 'https://lmdpt.iarbre.org/illustrations/unes/analyses/trump-ia-guardrails-anthropic.jpg',
      type: 'article',
      datePublished: '2026-09-18',
      dateModified: '2026-09-20',
    });
    expect(page.datePublished).toBe('2026-09-18');
    expect(page.dateModified).toBe('2026-09-20');
    expect(page.author?.['@type']).toBe('Organization');
    expect(JSON.stringify(page.author)).not.toMatch(/Person/);
  });
});
