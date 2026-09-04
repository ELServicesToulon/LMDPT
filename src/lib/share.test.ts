import { describe, expect, it } from 'vitest';
import { ANALYSIS_CATALOG } from './analyses';
import { DEBATE_CATALOG } from './debates';
import {
  FACEBOOK_SHARE_BASE,
  LINKEDIN_SHARE_BASE,
  X_INTENT_BASE,
  X_TEXT_MAX,
  X_VIA_HANDLE,
  buildFacebookShareUrl,
  buildLinkedInShareUrl,
  buildShareLinks,
  buildShareText,
  buildXIntentUrl,
  isEditorialHubPath,
  shareNetworkAriaLabel,
  shareNetworkLabel,
  shareTextRespectsCharte,
  shouldShowArticleShareBar,
  truncateShareTitle,
} from './share';

const articleUrl = 'https://lmdpt.iarbre.org/analyses/alerte-citoyenne/';
const articleTitle = 'Alerte citoyenne — débat public';

describe('share text', () => {
  it('uses the title only — no hashtags, no favori, no slogans', () => {
    const text = buildShareText(`  ${articleTitle}  `);
    expect(text).toBe(articleTitle);
    expect(text).not.toMatch(/#/);
    expect(text.toLowerCase()).not.toContain('favori');
    expect(shareTextRespectsCharte(text)).toBe(true);
  });

  it('rejects prefill that would violate the charte', () => {
    expect(shareTextRespectsCharte('Lecture #AN1T #2027')).toBe(false);
    expect(shareTextRespectsCharte('Notre favori du premier tour')).toBe(false);
    expect(shareTextRespectsCharte('Votez pour ce camp')).toBe(false);
    expect(shareTextRespectsCharte(articleTitle)).toBe(true);
  });

  it('truncates long titles for X without adding tags', () => {
    const long = 'A'.repeat(X_TEXT_MAX + 40);
    const cut = truncateShareTitle(long);
    expect(cut.length).toBeLessThanOrEqual(X_TEXT_MAX);
    expect(cut.endsWith('…')).toBe(true);
    expect(cut).not.toMatch(/#/);
  });
});

describe('share URLs', () => {
  it('builds an X intent URL with title, canonical URL and via @LMDuPremierTour', () => {
    const href = buildXIntentUrl({ title: articleTitle, url: articleUrl });
    const parsed = new URL(href);
    expect(`${parsed.origin}${parsed.pathname}`).toBe(X_INTENT_BASE);
    expect(parsed.searchParams.get('text')).toBe(articleTitle);
    expect(parsed.searchParams.get('url')).toBe(articleUrl);
    expect(parsed.searchParams.get('via')).toBe(X_VIA_HANDLE);
    expect(href).not.toMatch(/hashtags=/);
  });

  it('omits via when explicitly empty', () => {
    const href = buildXIntentUrl({ title: articleTitle, url: articleUrl, via: '' });
    expect(new URL(href).searchParams.get('via')).toBeNull();
  });

  it('builds Facebook and LinkedIn share URLs from the canonical URL only', () => {
    const fb = buildFacebookShareUrl(articleUrl);
    const li = buildLinkedInShareUrl(articleUrl);
    expect(fb.startsWith(FACEBOOK_SHARE_BASE)).toBe(true);
    expect(new URL(fb).searchParams.get('u')).toBe(articleUrl);
    expect(li.startsWith(LINKEDIN_SHARE_BASE)).toBe(true);
    expect(new URL(li).searchParams.get('url')).toBe(articleUrl);
  });

  it('returns the full link set for a page', () => {
    const links = buildShareLinks({ title: articleTitle, url: articleUrl });
    expect(links.text).toBe(articleTitle);
    expect(links.url).toBe(articleUrl);
    expect(links.x).toContain('intent/tweet');
    expect(links.facebook).toContain('facebook.com/sharer');
    expect(links.linkedin).toContain('linkedin.com/sharing');
    expect(shareTextRespectsCharte(links.text)).toBe(true);
  });
});

describe('share labels', () => {
  it('exposes accessible French labels for each network', () => {
    expect(shareNetworkLabel('x')).toBe('X');
    expect(shareNetworkAriaLabel('x')).toBe('Partager sur X');
    expect(shareNetworkAriaLabel('facebook')).toBe('Partager sur Facebook');
    expect(shareNetworkAriaLabel('linkedin')).toBe('Partager sur LinkedIn');
  });
});

describe('share bar placement', () => {
  it('hides the auto bar on analysis and debate hub listings', () => {
    expect(isEditorialHubPath('/analyses')).toBe(true);
    expect(isEditorialHubPath('/analyses/')).toBe(true);
    expect(isEditorialHubPath('/debats')).toBe(true);
    expect(shouldShowArticleShareBar('/analyses', false)).toBe(false);
    expect(shouldShowArticleShareBar('/debats/', false)).toBe(false);
  });

  it('shows the bar on catalog analyses, debates, and nested analysis routes', () => {
    expect(shouldShowArticleShareBar('/analyses/alerte-citoyenne', true)).toBe(true);
    expect(shouldShowArticleShareBar('/debats/vote-utile-pluralite/', true)).toBe(true);
    expect(
      shouldShowArticleShareBar('/analyses/programmes/presidentielle-2027/attal', false),
    ).toBe(true);
    expect(shouldShowArticleShareBar('/', false)).toBe(false);
    expect(shouldShowArticleShareBar('/charte', false)).toBe(false);
  });

  it('covers every catalog analysis and debate path', () => {
    for (const analysis of ANALYSIS_CATALOG) {
      expect(shouldShowArticleShareBar(analysis.href, true)).toBe(true);
    }
    for (const debate of DEBATE_CATALOG) {
      expect(shouldShowArticleShareBar(debate.href, true)).toBe(true);
    }
  });

  it('prefills catalog titles without hashtags or partisan slogans', () => {
    const titles = [
      ...ANALYSIS_CATALOG.map((a) => a.title),
      ...DEBATE_CATALOG.map((d) => d.question),
    ];
    for (const title of titles) {
      const links = buildShareLinks({
        title,
        url: 'https://lmdpt.iarbre.org/analyses/exemple/',
      });
      expect(shareTextRespectsCharte(links.text)).toBe(true);
      expect(links.x).toContain('via=LMDuPremierTour');
    }
  });
});
