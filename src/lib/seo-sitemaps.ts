/**
 * Données des sitemaps HTML et images — sans écriture de fichiers.
 * Le script `scripts/generate-seo-assets.ts` s’en sert au build ;
 * les tests importent ces helpers, pas le script (qui écrit dans public/).
 *
 * Le sitemap-news n’est pas généré ici : sa fenêtre de dates
 * est un chantier séparé (PR #95), volontairement intact.
 */
import { ANALYSIS_CATALOG } from './analyses';
import {
  coverFileExists,
  isForbiddenUneCover,
  listEditorialPosts,
  getUneDuJour,
  resolveCover,
  type EditorialPost,
} from './editorial';

export type SitemapRoute = {
  path: string;
  changefreq: string;
  priority: string;
};

export type UneImageSitemapEntry = {
  /** Chemin de la page, sans trailing slash (sauf accueil « / »). */
  page: string;
  /** Chemin public de l’image de une, commençant par /. */
  img: string;
  title: string;
};

/** Routes statiques prioritaires (hors fiches programmes générées). */
export const CORE_ROUTES: SitemapRoute[] = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/a-propos', changefreq: 'monthly', priority: '0.8' },
  { path: '/charte', changefreq: 'monthly', priority: '0.85' },
  { path: '/sources', changefreq: 'monthly', priority: '0.85' },
  { path: '/analyses', changefreq: 'daily', priority: '0.95' },
  { path: '/atlas', changefreq: 'weekly', priority: '0.9' },
  { path: '/atlas/2017-presidentielle', changefreq: 'monthly', priority: '0.75' },
  { path: '/atlas/2022-presidentielle', changefreq: 'monthly', priority: '0.8' },
  { path: '/atlas/2024-legislatives', changefreq: 'monthly', priority: '0.8' },
  { path: '/atlas/2027-presidentielle', changefreq: 'weekly', priority: '0.85' },
  { path: '/debats', changefreq: 'weekly', priority: '0.8' },
  { path: '/liberte-d-expression', changefreq: 'weekly', priority: '0.95' },
  { path: '/observatoire-censure', changefreq: 'weekly', priority: '0.92' },
  { path: '/debats/assemblee-premier-tour', changefreq: 'monthly', priority: '0.7' },
  { path: '/debats/desistements-second-tour', changefreq: 'monthly', priority: '0.7' },
  { path: '/debats/vote-utile-pluralite', changefreq: 'monthly', priority: '0.7' },
  { path: '/mentions-legales', changefreq: 'yearly', priority: '0.3' },
  { path: '/confidentialite', changefreq: 'yearly', priority: '0.3' },
  { path: '/soutenir', changefreq: 'monthly', priority: '0.7' },
  { path: '/contribuer', changefreq: 'monthly', priority: '0.7' },
  { path: '/independance-medias', changefreq: 'monthly', priority: '0.75' },
  { path: '/pack-data-an1t', changefreq: 'monthly', priority: '0.75' },
];

export const PROGRAMME_PATHS: string[] = [
  '/analyses/programmes',
  '/analyses/programmes/axes',
  '/analyses/programmes-comparateur',
  '/analyses/programmes/presidentielle-2017',
  '/analyses/programmes/presidentielle-2017/macron',
  '/analyses/programmes/presidentielle-2017/le-pen',
  '/analyses/programmes/presidentielle-2017/fillon',
  '/analyses/programmes/presidentielle-2017/melenchon',
  '/analyses/programmes/presidentielle-2017/hamon',
  '/analyses/programmes/presidentielle-2022',
  '/analyses/programmes/presidentielle-2022/macron',
  '/analyses/programmes/presidentielle-2022/le-pen',
  '/analyses/programmes/presidentielle-2022/melenchon',
  '/analyses/programmes/presidentielle-2022/zemmour',
  '/analyses/programmes/presidentielle-2022/pecresse',
  '/analyses/programmes/presidentielle-2027',
  '/analyses/programmes/presidentielle-2027/attal',
  '/analyses/programmes/presidentielle-2027/bardella',
  '/analyses/programmes/presidentielle-2027/barrot',
  '/analyses/programmes/presidentielle-2027/glucksmann',
  '/analyses/programmes/presidentielle-2027/hollande',
  '/analyses/programmes/presidentielle-2027/le-pen',
  '/analyses/programmes/presidentielle-2027/lisnard',
  '/analyses/programmes/presidentielle-2027/melenchon',
  '/analyses/programmes/presidentielle-2027/parti-socialiste',
  '/analyses/programmes/presidentielle-2027/philippe',
  '/analyses/programmes/presidentielle-2027/philippe-brun',
  '/analyses/programmes/presidentielle-2027/retailleau',
  '/analyses/programmes/presidentielle-2027/roussel',
  '/analyses/programmes/presidentielle-2027/ruffin',
];

/** Routes privées ou noindex : ne jamais les ajouter au sitemap public. */
export const SITEMAP_EXCLUDED_PATHS: string[] = [
  '/404',
  '/connexion',
  '/compte',
  '/redaction',
  '/assemblee-influenceurs',
  '/moderation',
];

export function normalizeSitemapPath(routePath: string): string {
  if (routePath === '/') return '/';
  return `/${routePath.replace(/^\/+|\/+$/g, '')}`;
}

function uneCoverWebPath(post: EditorialPost): string | null {
  const resolved = resolveCover(post.cover);
  if (resolved.missing) return null;
  if (isForbiddenUneCover(resolved.src)) return null;
  if (!coverFileExists(resolved.src)) return null;
  const src = resolved.src.trim();
  const web = src.startsWith('/') ? src : `/${src}`;
  return web.split('?')[0] ?? null;
}

/** Pages publiques indexables du sitemap.xml (sans doublon). */
export function listPublicSitemapRoutes(): SitemapRoute[] {
  const seen = new Set<string>();
  const routes: SitemapRoute[] = [];

  const add = (routePath: string, changefreq: string, priority: string) => {
    const normalized = normalizeSitemapPath(routePath);
    if (SITEMAP_EXCLUDED_PATHS.includes(normalized)) return;
    if (seen.has(normalized)) return;
    seen.add(normalized);
    routes.push({ path: normalized, changefreq, priority });
  };

  for (const r of CORE_ROUTES) add(r.path, r.changefreq, r.priority);

  for (const a of ANALYSIS_CATALOG) {
    add(
      a.href,
      'weekly',
      a.slug.includes('2027') || a.slug === 'alerte-citoyenne' ? '0.95' : '0.85',
    );
  }

  for (const p of PROGRAMME_PATHS) add(p, 'weekly', '0.7');

  return routes;
}

/**
 * Entrées du sitemap-images : uniquement les images de une
 * (même source que EditorialCoverImage : listEditorialPosts + resolveCover).
 * L’accueil expose aussi la une du jour.
 */
export function listUneImageSitemapEntries(): UneImageSitemapEntry[] {
  const entries: UneImageSitemapEntry[] = [];
  const seen = new Set<string>();

  const push = (page: string, img: string, title: string) => {
    const key = `${normalizeSitemapPath(page)}|${img}`;
    if (seen.has(key)) return;
    seen.add(key);
    entries.push({ page: normalizeSitemapPath(page), img, title });
  };

  const une = getUneDuJour();
  if (une) {
    const img = uneCoverWebPath(une);
    if (img) push('/', img, une.title);
  }

  for (const post of listEditorialPosts()) {
    const img = uneCoverWebPath(post);
    if (!img) continue;
    push(post.href, img, post.title);
  }

  return entries;
}
