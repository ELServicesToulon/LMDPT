import { describe, expect, it } from 'vitest';
import {
  CF_WEB_ANALYTICS_BEACON_SRC,
  LMDPT_CF_WEB_ANALYTICS_TOKEN,
  cfBeaconPayload,
  getCfWebAnalyticsToken,
  hasCfWebAnalytics,
  isCfWebAnalyticsToken,
  resolveCfWebAnalyticsToken,
} from './cf-web-analytics';

describe('isCfWebAnalyticsToken', () => {
  it('accepts a 32-char hex token', () => {
    expect(isCfWebAnalyticsToken(LMDPT_CF_WEB_ANALYTICS_TOKEN)).toBe(true);
    expect(isCfWebAnalyticsToken('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).toBe(true);
  });

  it('rejects empty, short, or non-hex values', () => {
    expect(isCfWebAnalyticsToken(null)).toBe(false);
    expect(isCfWebAnalyticsToken('')).toBe(false);
    expect(isCfWebAnalyticsToken('not-a-token')).toBe(false);
    expect(isCfWebAnalyticsToken('72ab49a17241420da6d8a97cee1f62e')).toBe(false);
    expect(isCfWebAnalyticsToken('G-ABCDEF12')).toBe(false);
  });
});

describe('resolveCfWebAnalyticsToken', () => {
  it('falls back to the public LMDPT token when unset', () => {
    expect(resolveCfWebAnalyticsToken(null)).toBe(LMDPT_CF_WEB_ANALYTICS_TOKEN);
    expect(resolveCfWebAnalyticsToken(undefined)).toBe(LMDPT_CF_WEB_ANALYTICS_TOKEN);
    expect(resolveCfWebAnalyticsToken('')).toBe(LMDPT_CF_WEB_ANALYTICS_TOKEN);
    expect(resolveCfWebAnalyticsToken('   ')).toBe(LMDPT_CF_WEB_ANALYTICS_TOKEN);
  });

  it('honours an explicit override', () => {
    const other = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
    expect(resolveCfWebAnalyticsToken(other)).toBe(other);
    expect(resolveCfWebAnalyticsToken(`  ${other}  `)).toBe(other);
  });

  it('disables the beacon on explicit off flags', () => {
    expect(resolveCfWebAnalyticsToken('off')).toBeNull();
    expect(resolveCfWebAnalyticsToken('OFF')).toBeNull();
    expect(resolveCfWebAnalyticsToken('false')).toBeNull();
    expect(resolveCfWebAnalyticsToken('0')).toBeNull();
    expect(resolveCfWebAnalyticsToken('none')).toBeNull();
    expect(resolveCfWebAnalyticsToken('disabled')).toBeNull();
  });

  it('rejects invalid tokens (no silent fallback)', () => {
    expect(resolveCfWebAnalyticsToken('not-a-token')).toBeNull();
    expect(resolveCfWebAnalyticsToken('72ab49a1…placeholder')).toBeNull();
  });
});

describe('getCfWebAnalyticsToken / hasCfWebAnalytics', () => {
  it('returns the public token when env is unset (Giscus-style)', () => {
    expect(getCfWebAnalyticsToken(null)).toBe(LMDPT_CF_WEB_ANALYTICS_TOKEN);
    expect(hasCfWebAnalytics(LMDPT_CF_WEB_ANALYTICS_TOKEN)).toBe(true);
    expect(hasCfWebAnalytics(null)).toBe(false);
  });

  it('can be turned off without touching Google consent', () => {
    expect(getCfWebAnalyticsToken('off')).toBeNull();
    expect(hasCfWebAnalytics(getCfWebAnalyticsToken('off'))).toBe(false);
  });
});

describe('beacon snippet helpers', () => {
  it('emits the official module beacon payload', () => {
    const payload = cfBeaconPayload(LMDPT_CF_WEB_ANALYTICS_TOKEN);
    expect(JSON.parse(payload)).toEqual({ token: LMDPT_CF_WEB_ANALYTICS_TOKEN });
    expect(CF_WEB_ANALYTICS_BEACON_SRC).toBe(
      'https://static.cloudflareinsights.com/beacon.min.js',
    );
  });
});
