/**
 * Outils Google gratuits pour le référencement LMDPT.
 * Toutes les balises/scripts sont optionnels (env PUBLIC_*) — zéro traceur par défaut (DOE + RGPD).
 *
 * Doc : docs/GOOGLE-SEO.md
 */

export type GoogleSeoConfig = {
  /** Google Search Console — contenu de la balise meta google-site-verification */
  siteVerification: string | null;
  /** GA4 Measurement ID (G-XXXXXXXX) — désactivé si null */
  ga4MeasurementId: string | null;
  /** Google Tag Manager container (GTM-XXXX) — désactivé si null */
  gtmContainerId: string | null;
  /** ID Google Ads (AW-XXXX) optionnel — conversion / remarketing soft */
  googleAdsId: string | null;
  /** Publisher ID Google News / Publisher Center (si connu) */
  newsPublisherId: string | null;
  /** Activer Consent Mode v2 (défaut denied) avant chargement scripts */
  consentModeDefaultDenied: boolean;
};

function env(name: string): string | null {
  const v = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.[name]
    ?? (typeof process !== 'undefined' ? process.env[name] : undefined);
  const t = typeof v === 'string' ? v.trim() : '';
  return t || null;
}

/** Lit la config publique Google (build-time Astro). */
export function getGoogleSeoConfig(
  overrides?: Partial<Record<keyof GoogleSeoConfig, string | boolean | null>>,
): GoogleSeoConfig {
  const siteVerification =
    (overrides?.siteVerification as string | null | undefined) ??
    env('PUBLIC_GOOGLE_SITE_VERIFICATION');
  const ga4MeasurementId =
    (overrides?.ga4MeasurementId as string | null | undefined) ?? env('PUBLIC_GA4_MEASUREMENT_ID');
  const gtmContainerId =
    (overrides?.gtmContainerId as string | null | undefined) ?? env('PUBLIC_GTM_CONTAINER_ID');
  const googleAdsId =
    (overrides?.googleAdsId as string | null | undefined) ?? env('PUBLIC_GOOGLE_ADS_ID');
  const newsPublisherId =
    (overrides?.newsPublisherId as string | null | undefined) ?? env('PUBLIC_GOOGLE_NEWS_PUBLISHER_ID');

  const consentRaw =
    overrides?.consentModeDefaultDenied ??
    env('PUBLIC_GOOGLE_CONSENT_MODE_DEFAULT') ??
    'denied';
  const consentModeDefaultDenied =
    typeof consentRaw === 'boolean'
      ? consentRaw
      : String(consentRaw).toLowerCase() !== 'granted';

  return {
    siteVerification: siteVerification && !siteVerification.includes('…') ? siteVerification : null,
    ga4MeasurementId: isGa4Id(ga4MeasurementId) ? ga4MeasurementId : null,
    gtmContainerId: isGtmId(gtmContainerId) ? gtmContainerId : null,
    googleAdsId: isAdsId(googleAdsId) ? googleAdsId : null,
    newsPublisherId: newsPublisherId && !newsPublisherId.includes('…') ? newsPublisherId : null,
    consentModeDefaultDenied,
  };
}

export function isGa4Id(id: string | null | undefined): id is string {
  return Boolean(id && /^G-[A-Z0-9]+$/i.test(id.trim()));
}

export function isGtmId(id: string | null | undefined): id is string {
  return Boolean(id && /^GTM-[A-Z0-9]+$/i.test(id.trim()));
}

export function isAdsId(id: string | null | undefined): id is string {
  return Boolean(id && /^AW-[0-9]+$/i.test(id.trim()));
}

/** True si au moins un script tiers Google (analytics/tag) est activé. */
export function hasGoogleTracking(cfg: GoogleSeoConfig = getGoogleSeoConfig()): boolean {
  return Boolean(cfg.ga4MeasurementId || cfg.gtmContainerId || cfg.googleAdsId);
}

/** Liste des sitemaps à déclarer dans robots.txt / Search Console. */
export const GOOGLE_SITEMAPS = [
  '/sitemap.xml',
  '/sitemap-images.xml',
  '/sitemap-news.xml',
  '/sitemap-index.xml',
] as const;

/** Crawlers Google (robots.txt). */
export const GOOGLE_CRAWLERS = [
  'Googlebot',
  'Googlebot-Image',
  'Googlebot-News',
  'Googlebot-Video',
  'Storebot-Google',
  'Google-InspectionTool',
  'GoogleOther',
  'Google-Extended',
  'AdsBot-Google',
  'AdsBot-Google-Mobile',
  'Mediapartners-Google',
] as const;

/**
 * Snippet Consent Mode v2 (default denied) — requis avant gtag/GTM en FR.
 * Ne collecte pas tant que l’utilisateur n’a pas consenti (bannière future L1+).
 */
export function consentModeBootstrapScript(): string {
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{
  ad_storage:'denied',
  ad_user_data:'denied',
  ad_personalization:'denied',
  analytics_storage:'denied',
  functionality_storage:'granted',
  security_storage:'granted',
  wait_for_update:500
});
gtag('set','ads_data_redaction',true);
gtag('set','url_passthrough',true);`;
}

/** Config gtag pour GA4 (anonymize / privacy). */
export function ga4ConfigScript(measurementId: string): string {
  return `gtag('js', new Date());
gtag('config','${measurementId}',{
  anonymize_ip:true,
  allow_google_signals:false,
  allow_ad_personalization_signals:false,
  send_page_view:true
});`;
}

/** Config Google Ads optionnelle (conversion tag only). */
export function googleAdsConfigScript(adsId: string): string {
  return `gtag('config','${adsId}');`;
}
