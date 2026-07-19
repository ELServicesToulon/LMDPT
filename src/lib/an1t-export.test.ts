import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  AN1T_A11Y_CONTRACT,
  buildAn1tExportCsv,
  buildAn1tExportPayload,
  buildAn1tShareUrl,
  decodeAn1tShareQuery,
  encodeAn1tShareQuery,
} from './an1t-export';
import { pageMeta } from './seo';

const ROOT = join(import.meta.dirname, '..');

const sampleShares = [
  { id: 'rn', label: 'RN & alliés', color: '#0d378a', pct: 33 },
  { id: 'nfp', label: 'NFP', color: '#cc2443', pct: 28 },
  { id: 'ensemble', label: 'Ensemble', color: '#ffeb00', pct: 20 },
  { id: 'lr', label: 'LR', color: '#0066cc', pct: 6.5 },
  { id: 'autres', label: 'Autres', color: '#dddddd', pct: 12.5 },
];

describe('an1t export contracts', () => {
  it('builds pedagogical JSON payload with exact 577 seats', () => {
    const payload = buildAn1tExportPayload({
      shares: sampleShares,
      thresholdPct: 3,
      totalSeats: 577,
      exportedAt: '2026-07-18T20:00:00.000Z',
      url: 'https://lmdpt.iarbre.org/analyses/assemblee-premier-tour/',
    });
    expect(payload.meta.pedagogical).toBe(true);
    expect(payload.meta.method).toBe('Sainte-Laguë');
    expect(payload.meta.threshold_pct).toBe(3);
    expect(payload.meta.total_seats).toBe(577);
    expect(payload.results.reduce((s, r) => s + r.seats, 0)).toBe(577);
    expect(payload.inputs).toHaveLength(5);
    expect(payload.meta.url).toContain('assemblee-premier-tour');
  });

  it('builds CSV with header and footer source line', () => {
    const payload = buildAn1tExportPayload({
      shares: sampleShares,
      thresholdPct: 5,
      exportedAt: '2026-07-18T20:00:00.000Z',
    });
    const csv = buildAn1tExportCsv(payload.results, 5, 577, '2026-07-18T20:00:00.000Z');
    expect(csv.startsWith('bloc_id,label,pct_voix,sieges')).toBe(true);
    expect(csv).toContain('seuil_pct,total_sieges');
    expect(csv).toContain('# source=LMDPT AN1T pédagogique');
    expect(csv).toContain(',5,577');
  });

  it('threshold 0 still allocates all seats', () => {
    const payload = buildAn1tExportPayload({
      shares: sampleShares,
      thresholdPct: 0,
    });
    expect(payload.results.reduce((s, r) => s + r.seats, 0)).toBe(577);
  });
});

describe('an1t a11y markup contracts', () => {
  it('An1tSimulator exposes live region + export buttons + presets group', () => {
    const src = readFileSync(join(ROOT, 'components/An1tSimulator.astro'), 'utf8');
    for (const token of AN1T_A11Y_CONTRACT.simulator) {
      expect(src, `missing: ${token}`).toContain(token);
    }
  });

  it('AssembleeHemicycle exposes role=img, live status, keyboard toggles', () => {
    const src = readFileSync(join(ROOT, 'components/AssembleeHemicycle.astro'), 'utf8');
    for (const token of AN1T_A11Y_CONTRACT.hemicycle) {
      expect(src, `missing: ${token}`).toContain(token);
    }
  });
});

describe('assemblee page SEO', () => {
  it('pageMeta for AN1T analysis is indexable with pedagogy keywords', () => {
    const meta = pageMeta({
      title: "L'Assemblée du Premier Tour 2027 — projections & hémicycle",
      description:
        "Représentation graphique interactive des sièges de l'Assemblée nationale basée sur le premier tour. Priorité 2027 : projections à partir de sondages et pluralité du 1er tour.",
      siteUrl: 'https://lmdpt.iarbre.org',
      pathname: '/analyses/assemblee-premier-tour',
      type: 'article',
    });
    expect(meta.canonical).toBe('https://lmdpt.iarbre.org/analyses/assemblee-premier-tour/');
    expect(meta.robots).toContain('index');
    expect(meta.fullTitle).toContain('Assemblée du Premier Tour');
    expect(meta.description.toLowerCase()).toMatch(/premier tour|assemblée|pluralité|projection/);
    expect(meta.keywords).toContain('Assemblée du Premier Tour');
  });
});

describe('an1t share URL (P16-1)', () => {
  it('round-trips encode/decode shares + threshold', () => {
    const shares = sampleShares.map((s) => ({ id: s.id, pct: s.pct }));
    const q = encodeAn1tShareQuery(shares, 3);
    expect(q.startsWith('v1_3_')).toBe(true);
    const decoded = decodeAn1tShareQuery(q);
    expect(decoded?.thresholdPct).toBe(3);
    expect(decoded?.shares.find((s) => s.id === 'rn')?.pct).toBe(33);
    expect(decoded?.shares).toHaveLength(5);
  });

  it('builds absolute share URL with an1t query', () => {
    const url = buildAn1tShareUrl(
      'https://lmdpt.iarbre.org/analyses/assemblee-premier-tour/',
      sampleShares.map((s) => ({ id: s.id, pct: s.pct })),
      5,
    );
    expect(url).toContain('an1t=v1_5_');
    expect(url).toContain('rn%3A33.0');
  });

  it('rejects malformed share payloads', () => {
    expect(decodeAn1tShareQuery('')).toBeNull();
    expect(decodeAn1tShareQuery('garbage')).toBeNull();
  });
});
