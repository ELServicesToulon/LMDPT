import { describe, expect, it } from 'vitest';
import {
  getGoogleSeoConfig,
  hasGoogleTracking,
  isGa4Id,
  isGtmId,
  isAdsId,
  consentModeBootstrapScript,
  ga4ConfigScript,
  GOOGLE_SITEMAPS,
  GOOGLE_CRAWLERS,
} from './google-seo';

describe('google-seo validators', () => {
  it('accepts GA4 / GTM / Ads ids', () => {
    expect(isGa4Id('G-ABC123XYZ')).toBe(true);
    expect(isGa4Id('UA-123')).toBe(false);
    expect(isGtmId('GTM-XXXXXX')).toBe(true);
    expect(isGtmId('G-XXXX')).toBe(false);
    expect(isAdsId('AW-123456789')).toBe(true);
    expect(isAdsId('G-123')).toBe(false);
  });
});

describe('getGoogleSeoConfig', () => {
  it('defaults to no tracking (privacy-first)', () => {
    const cfg = getGoogleSeoConfig({
      siteVerification: null,
      ga4MeasurementId: null,
      gtmContainerId: null,
      googleAdsId: null,
      newsPublisherId: null,
    });
    expect(hasGoogleTracking(cfg)).toBe(false);
    expect(cfg.siteVerification).toBeNull();
    expect(cfg.consentModeDefaultDenied).toBe(true);
  });

  it('enables GA4 when valid id provided', () => {
    const cfg = getGoogleSeoConfig({
      ga4MeasurementId: 'G-TEST1234',
      gtmContainerId: null,
      googleAdsId: null,
      siteVerification: 'abc_token',
    });
    expect(cfg.ga4MeasurementId).toBe('G-TEST1234');
    expect(cfg.siteVerification).toBe('abc_token');
    expect(hasGoogleTracking(cfg)).toBe(true);
  });

  it('rejects placeholder verification tokens', () => {
    const cfg = getGoogleSeoConfig({
      siteVerification: 'token…placeholder',
    });
    expect(cfg.siteVerification).toBeNull();
  });
});

describe('snippets', () => {
  it('emits consent mode denied by default', () => {
    const s = consentModeBootstrapScript();
    expect(s).toContain("analytics_storage:'denied'");
    expect(s).toContain("ad_storage:'denied'");
  });

  it('emits GA4 config with anonymize_ip', () => {
    const s = ga4ConfigScript('G-TEST');
    expect(s).toContain('G-TEST');
    expect(s).toContain('anonymize_ip:true');
  });
});

describe('catalog', () => {
  it('lists Google sitemaps and crawlers', () => {
    expect(GOOGLE_SITEMAPS).toContain('/sitemap-index.xml');
    expect(GOOGLE_SITEMAPS).toContain('/sitemap-news.xml');
    expect(GOOGLE_CRAWLERS).toContain('Googlebot');
    expect(GOOGLE_CRAWLERS).toContain('Google-InspectionTool');
  });
});
