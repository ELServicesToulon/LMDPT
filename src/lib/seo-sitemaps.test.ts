import { describe, expect, it } from 'vitest';
import {
  coverFileExists,
  isForbiddenUneCover,
  listEditorialPosts,
  resolveCover,
} from './editorial';
import {
  listPublicSitemapRoutes,
  listUneImageSitemapEntries,
  SITEMAP_EXCLUDED_PATHS,
} from './seo-sitemaps';

describe('listPublicSitemapRoutes', () => {
  const paths = listPublicSitemapRoutes().map((r) => r.path);

  it('includes public indexable pages previously missing from the sitemap', () => {
    expect(paths).toContain('/contribuer');
    expect(paths).toContain('/analyses/programmes/axes');
    expect(paths).toContain('/independance-medias');
  });

  it('keeps core public routes', () => {
    expect(paths).toContain('/');
    expect(paths).toContain('/analyses');
    expect(paths).toContain('/sources');
    expect(paths).toContain('/pack-data-an1t');
  });

  it('excludes private and noindex routes', () => {
    for (const excluded of SITEMAP_EXCLUDED_PATHS) {
      expect(paths, `sitemap must not list ${excluded}`).not.toContain(excluded);
    }
  });

  it('has no duplicate paths', () => {
    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe('listUneImageSitemapEntries', () => {
  it('lists every editorial post whose une cover file exists', () => {
    const entries = listUneImageSitemapEntries();
    const withCover = listEditorialPosts().filter((post) => {
      const resolved = resolveCover(post.cover);
      return (
        !resolved.missing &&
        !isForbiddenUneCover(resolved.src) &&
        coverFileExists(resolved.src)
      );
    });

    expect(entries.length).toBeGreaterThanOrEqual(withCover.length);
    expect(withCover.length).toBeGreaterThanOrEqual(45);

    for (const post of withCover) {
      const resolved = resolveCover(post.cover);
      const img = (resolved.src.startsWith('/') ? resolved.src : `/${resolved.src}`).split('?')[0];
      const page = post.href.replace(/\/+$/, '') || '/';
      const found = entries.find((e) => e.page === page && e.img === img);
      expect(found, `missing image sitemap entry for ${page}`).toBeTruthy();
      expect(found?.title).toBe(post.title);
    }
  });

  it('includes the homepage une when a cover exists', () => {
    const home = listUneImageSitemapEntries().find((e) => e.page === '/');
    expect(home).toBeTruthy();
    expect(home?.img.startsWith('/')).toBe(true);
    expect(home?.title.length).toBeGreaterThan(0);
  });
});
