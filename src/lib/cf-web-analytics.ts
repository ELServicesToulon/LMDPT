/**
 * Cloudflare Web Analytics — beacon cookieless, privacy-first.
 * Hors Consent Mode GA4/GTM : pas de cookie, pas d’attente de consentement pubs.
 *
 * PUBLIC_CF_WEB_ANALYTICS_TOKEN :
 *   - unset / vide → jeton public LMDPT (même classe que les IDs Giscus)
 *   - 32 hex → émettre le beacon
 *   - off | false | 0 | none | disabled → aucun script
 *
 * Doc deploy OVH : docs/SYNC-OPS.md · jeton aussi dans .env.example
 */

/** Jeton public LMDPT (Cloudflare Web Analytics — public by design). */
export const LMDPT_CF_WEB_ANALYTICS_TOKEN = '72ab49a17241420da6d8a97cee1f62e2';

export const CF_WEB_ANALYTICS_BEACON_SRC =
  'https://static.cloudflareinsights.com/beacon.min.js';

const DISABLE_FLAGS = new Set(['off', 'false', '0', 'none', 'disabled', 'no']);

function env(name: string): string | null {
  const v = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.[name]
    ?? (typeof process !== 'undefined' ? process.env[name] : undefined);
  const t = typeof v === 'string' ? v.trim() : '';
  return t || null;
}

export function isCfWebAnalyticsToken(token: string | null | undefined): token is string {
  return Boolean(token && /^[a-f0-9]{32}$/i.test(token.trim()));
}

function isDisabledFlag(value: string): boolean {
  return DISABLE_FLAGS.has(value.trim().toLowerCase());
}

/**
 * Résout le jeton à émettre.
 * `raw === null | undefined | ''` = unset → fallback public (Giscus-style).
 */
export function resolveCfWebAnalyticsToken(raw: string | null | undefined): string | null {
  if (raw == null || raw.trim() === '') {
    return LMDPT_CF_WEB_ANALYTICS_TOKEN;
  }
  const trimmed = raw.trim();
  if (isDisabledFlag(trimmed)) return null;
  return isCfWebAnalyticsToken(trimmed) ? trimmed : null;
}

/** Lit le jeton build-time (env Astro / process). */
export function getCfWebAnalyticsToken(override?: string | null): string | null {
  const raw = override !== undefined ? override : env('PUBLIC_CF_WEB_ANALYTICS_TOKEN');
  return resolveCfWebAnalyticsToken(raw);
}

export function hasCfWebAnalytics(token: string | null = getCfWebAnalyticsToken()): boolean {
  return isCfWebAnalyticsToken(token);
}

/** Valeur de `data-cf-beacon` (JSON). */
export function cfBeaconPayload(token: string): string {
  return JSON.stringify({ token });
}
