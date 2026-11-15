import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ANALYSIS_CATALOG } from './analyses';
import {
  formatNewsPublicationDate,
  isNewsDateInWindow,
  newsPublicationDate,
  NEWS_SITEMAP_WINDOW_DAYS,
  selectNewsSitemapRoutes,
  type NewsPublicationCatalogEntry,
  type NewsSitemapRoute,
} from './news-publication-date';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const REFERENCE_DATE = '2026-11-15';
const FAKE_TODAY = '2026-11-20';

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

describe('isNewsDateInWindow', () => {
  it('inclut les bornes d’une fenêtre de 30 jours calendaires UTC', () => {
    expect(NEWS_SITEMAP_WINDOW_DAYS).toBe(30);
    expect(isNewsDateInWindow('2026-11-15', REFERENCE_DATE)).toBe(true);
    expect(isNewsDateInWindow('2026-10-16', REFERENCE_DATE)).toBe(true);
    expect(isNewsDateInWindow('2026-10-16T07:30:00+02:00', REFERENCE_DATE)).toBe(true);
    expect(isNewsDateInWindow('2026-10-15', REFERENCE_DATE)).toBe(false);
    expect(isNewsDateInWindow('2026-11-16', REFERENCE_DATE)).toBe(false);
    expect(isNewsDateInWindow('pas-une-date', REFERENCE_DATE)).toBe(false);
    expect(isNewsDateInWindow('2026-11-15', 'invalide')).toBe(false);
  });
});

const MANUAL_NEWS_ROUTES: NewsSitemapRoute[] = KEPT_ARTICLES.map((path) => ({
  path,
  title: 'manuel',
  keywords: 'keywords-manuels',
}));

describe('selectNewsSitemapRoutes', () => {
  it('inclut le serment du perdant à la date catalogue injectée, sans doublon ni date fictive', () => {
    const selected = selectNewsSitemapRoutes(
      ANALYSIS_CATALOG,
      MANUAL_NEWS_ROUTES,
      REFERENCE_DATE,
    );
    const serment = selected.find((route) => route.path === '/analyses/le-serment-du-perdant');
    expect(serment).toBeDefined();
    expect(serment!.title).toBe('Le serment du perdant');
    expect(serment!.keywords).toBe('Le serment du perdant');
    expect(newsPublicationDate(serment!.path, ANALYSIS_CATALOG)).toBe('2026-11-15');

    expect(selected.slice(0, MANUAL_NEWS_ROUTES.length).map((route) => route.path)).toEqual(
      [...KEPT_ARTICLES],
    );

    const paths = selected.map((route) => route.path.replace(/\/+$/, '') || '/');
    expect(new Set(paths).size).toBe(paths.length);

    const catalogByPath = new Map(
      ANALYSIS_CATALOG.map((entry) => [entry.href.replace(/\/+$/, '') || '/', entry]),
    );
    for (const route of selected) {
      const key = route.path.replace(/\/+$/, '') || '/';
      const entry = catalogByPath.get(key);
      expect(entry).toBeDefined();
      const pub = newsPublicationDate(route.path, ANALYSIS_CATALOG);
      expect(pub).not.toBeNull();
      expect(pub).not.toBe(FAKE_TODAY);
      expect(pub?.slice(0, 10)).not.toBe(FAKE_TODAY);
      expect(pub).toBe(formatNewsPublicationDate(entry!.published ?? entry!.date));
      if (pub?.slice(0, 10) === REFERENCE_DATE) {
        expect(formatNewsPublicationDate(entry!.published ?? entry!.date)?.slice(0, 10)).toBe(
          REFERENCE_DATE,
        );
      }
    }
  });

  it('applique la fenêtre, exclut preparation et dates invalides, et laisse gagner la liste manuelle', () => {
    const catalog: NewsPublicationCatalogEntry[] = [
      { slug: 'in-window', href: '/analyses/in-window', date: '2026-11-15', title: 'In window' },
      { slug: 'lower-bound', href: '/analyses/lower-bound', date: '2026-10-16', title: 'Lower bound' },
      { slug: 'too-old', href: '/analyses/too-old', date: '2026-10-15', title: 'Too old' },
      { slug: 'future', href: '/analyses/future', date: '2026-11-16', title: 'Future' },
      {
        slug: 'prep',
        href: '/analyses/prep',
        date: '2026-11-14',
        title: 'Prep',
        preparation: true,
      },
      { slug: 'invalid', href: '/analyses/invalid', date: 'pas-une-date', title: 'Invalid' },
      { slug: 'empty', href: '/analyses/empty', date: '', title: 'Empty' },
      {
        slug: 'iso',
        href: '/analyses/iso',
        date: '2026-10-20',
        published: '2026-10-20T07:30:00+02:00',
        title: 'ISO hour',
      },
    ];
    const manual: NewsSitemapRoute[] = [
      {
        path: '/analyses/in-window/',
        title: 'Titre manuel',
        keywords: 'keywords, manuels',
      },
      {
        path: '/analyses/kept-old',
        title: 'Ancien manuel',
        keywords: 'hors-fenetre',
      },
    ];

    const selected = selectNewsSitemapRoutes(catalog, manual, REFERENCE_DATE);
    expect(selected.map((route) => route.path)).toEqual([
      '/analyses/in-window/',
      '/analyses/kept-old',
      '/analyses/lower-bound',
      '/analyses/iso',
    ]);
    expect(selected[0]).toEqual({
      path: '/analyses/in-window/',
      title: 'Titre manuel',
      keywords: 'keywords, manuels',
    });
    expect(selected[2]).toEqual({
      path: '/analyses/lower-bound',
      title: 'Lower bound',
      keywords: 'Lower bound',
    });
    expect(selected[3]).toEqual({
      path: '/analyses/iso',
      title: 'ISO hour',
      keywords: 'ISO hour',
    });
  });
});

function xmlLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]!);
}

describe('public sitemaps', () => {
  it('chaque loc de sitemap-news.xml est dans sitemap.xml, sans doublon', () => {
    const news = readFileSync(join(ROOT, 'public/sitemap-news.xml'), 'utf8');
    const sitemap = readFileSync(join(ROOT, 'public/sitemap.xml'), 'utf8');
    const newsLocs = xmlLocs(news);
    const sitemapLocs = new Set(xmlLocs(sitemap));
    expect(newsLocs.length).toBeGreaterThan(0);
    expect(new Set(newsLocs).size).toBe(newsLocs.length);
    for (const loc of newsLocs) {
      expect(sitemapLocs.has(loc)).toBe(true);
    }
  });
});
