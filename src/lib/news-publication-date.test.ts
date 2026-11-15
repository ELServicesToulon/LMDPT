import { describe, expect, it } from 'vitest';
import { ANALYSIS_CATALOG } from './analyses';
import {
  formatNewsPublicationDate,
  newsPublicationDate,
  type NewsPublicationCatalogEntry,
} from './news-publication-date';

const KEPT_ARTICLES = [
  '/analyses/lisnard-abonnes-electeurs',
  '/analyses/dsa-qui-decide',
  '/analyses/visite-pape-appel-popularite',
  '/analyses/lfi-bfmtv-exigence-pluralisme',
  '/analyses/ukraine-energie-triangle-europe-algerie-russie',
] as const;

function catalogDate(path: string): string {
  const slug = path.slice(path.lastIndexOf('/') + 1);
  const entry = ANALYSIS_CATALOG.find((item) => item.slug === slug || item.href === path);
  expect(entry).toBeDefined();
  return entry!.published ?? entry!.date;
}

describe('newsPublicationDate', () => {
  it('renvoie published ?? date du catalogue pour chaque article conservé', () => {
    const today = new Date().toISOString().slice(0, 10);
    for (const path of KEPT_ARTICLES) {
      const expected = formatNewsPublicationDate(catalogDate(path));
      expect(expected).not.toBeNull();
      expect(newsPublicationDate(path, ANALYSIS_CATALOG)).toBe(expected);
      if (expected !== today) {
        expect(newsPublicationDate(path, ANALYSIS_CATALOG)).not.toBe(today);
        expect(newsPublicationDate(path, ANALYSIS_CATALOG)).not.toBe(`${today}T08:00:00+02:00`);
      }
    }
  });

  it('renvoie null pour une route absente du catalogue', () => {
    expect(newsPublicationDate('/observatoire-censure', ANALYSIS_CATALOG)).toBeNull();
    expect(newsPublicationDate('/liberte-d-expression', ANALYSIS_CATALOG)).toBeNull();
  });

  it('une date sans heure sort YYYY-MM-DD ; un ISO avec heure est conservé', () => {
    const catalog: NewsPublicationCatalogEntry[] = [
      { slug: 'date-seule', href: '/analyses/date-seule', date: '2026-10-04' },
      {
        slug: 'avec-heure',
        href: '/analyses/avec-heure',
        date: '2026-09-17',
        published: '2026-09-17T07:30:00+02:00',
      },
    ];
    expect(newsPublicationDate('/analyses/date-seule', catalog)).toBe('2026-10-04');
    expect(newsPublicationDate('/analyses/avec-heure', catalog)).toBe('2026-09-17T07:30:00+02:00');
    expect(newsPublicationDate('/analyses/date-seule/', catalog)).toBe('2026-10-04');
  });

  it('ne retombe jamais sur la date du jour et refuse une date absente ou invalide', () => {
    const today = new Date().toISOString().slice(0, 10);
    const catalog: NewsPublicationCatalogEntry[] = [
      { slug: 'vide', href: '/analyses/vide', date: '' },
      { slug: 'invalide', href: '/analyses/invalide', date: 'pas-une-date' },
    ];
    expect(newsPublicationDate('/analyses/vide', catalog)).toBeNull();
    expect(newsPublicationDate('/analyses/invalide', catalog)).toBeNull();
    expect(newsPublicationDate('/analyses/inconnue', catalog)).toBeNull();
    expect(newsPublicationDate('/analyses/lisnard-abonnes-electeurs', ANALYSIS_CATALOG)).not.toBe(
      today,
    );
  });
});

describe('formatNewsPublicationDate', () => {
  it('valide une date seule et un ISO avec heure, refuse le reste', () => {
    expect(formatNewsPublicationDate('2026-10-04')).toBe('2026-10-04');
    expect(formatNewsPublicationDate('2026-10-04T08:00:00+02:00')).toBe(
      '2026-10-04T08:00:00+02:00',
    );
    expect(formatNewsPublicationDate('2026-10-04T08:00:00Z')).toBe('2026-10-04T08:00:00Z');
    expect(formatNewsPublicationDate('2026-13-40')).toBeNull();
    expect(formatNewsPublicationDate('2026-02-29')).toBeNull();
    expect(formatNewsPublicationDate('')).toBeNull();
  });
});
