/**
 * Génère sitemap.xml (+ images) pour SEO moteurs + IA.
 * Usage: npx tsx scripts/generate-seo-assets.ts
 * Branché sur `npm run build` via package.json.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ANALYSIS_CATALOG } from '../src/lib/analyses';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const SITE = process.env.ASTRO_SITE?.replace(/\/$/, '') || 'https://lmdpt.iarbre.org';
const today = new Date().toISOString().slice(0, 10);

/** Routes statiques prioritaires (hors fiches programmes générées). */
const CORE_ROUTES: { path: string; changefreq: string; priority: string }[] = [
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
  { path: '/debats/assemblee-premier-tour', changefreq: 'monthly', priority: '0.7' },
  { path: '/debats/desistements-second-tour', changefreq: 'monthly', priority: '0.7' },
  { path: '/debats/vote-utile-pluralite', changefreq: 'monthly', priority: '0.7' },
  { path: '/mentions-legales', changefreq: 'yearly', priority: '0.3' },
  { path: '/confidentialite', changefreq: 'yearly', priority: '0.3' },
];

const PROGRAMME_PATHS = [
  '/analyses/programmes',
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
  '/analyses/programmes/presidentielle-2027/le-pen',
  '/analyses/programmes/presidentielle-2027/lisnard',
  '/analyses/programmes/presidentielle-2027/melenchon',
  '/analyses/programmes/presidentielle-2027/parti-socialiste',
  '/analyses/programmes/presidentielle-2027/philippe',
  '/analyses/programmes/presidentielle-2027/philippe-brun',
  '/analyses/programmes/presidentielle-2027/retailleau',
  '/analyses/programmes/presidentielle-2027/ruffin',
];

function abs(p: string): string {
  if (p === '/') return `${SITE}/`;
  return `${SITE}${p.startsWith('/') ? p : `/${p}`}/`.replace(/([^:]\/)\/+/g, '$1');
}

function urlEntry(loc: string, changefreq: string, priority: string, lastmod = today): string {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function buildSitemap(): string {
  const seen = new Set<string>();
  const entries: string[] = [];

  const add = (routePath: string, changefreq: string, priority: string) => {
    const loc = abs(routePath === '/' ? '/' : routePath.replace(/\/$/, ''));
    // normalize trailing slash: site uses /path/ for directories
    const normalized =
      routePath === '/' ? `${SITE}/` : `${SITE}${routePath.replace(/\/$/, '')}/`;
    if (seen.has(normalized)) return;
    seen.add(normalized);
    entries.push(urlEntry(normalized, changefreq, priority));
  };

  for (const r of CORE_ROUTES) add(r.path, r.changefreq, r.priority);

  for (const a of ANALYSIS_CATALOG) {
    add(a.href, 'weekly', a.slug.includes('2027') || a.slug === 'alerte-citoyenne' ? '0.95' : '0.85');
  }

  for (const p of PROGRAMME_PATHS) add(p, 'weekly', '0.7');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;
}

function buildImageSitemap(): string {
  const images = [
    { page: '/', img: '/brand/og-default.png', title: 'Le Média du Premier Tour' },
    {
      page: '/',
      img: '/illustrations/2027/hero-premier-tour-2027.jpg',
      title: 'Présidentielle 2027 — premier tour',
    },
    {
      page: '/',
      img: '/illustrations/2027/democracy-over-elimination.jpg',
      title: 'Democracy Over Elimination',
    },
    {
      page: '/analyses/presidentielle-2027-preparation',
      img: '/illustrations/2027/dessin-urne-2027.jpg',
      title: 'Urne Premier Tour 2027',
    },
  ];

  const body = images
    .map((i) => {
      const page = i.page === '/' ? `${SITE}/` : `${SITE}${i.page}/`;
      const img = `${SITE}${i.img}`;
      return `  <url>
    <loc>${page}</loc>
    <image:image>
      <image:loc>${img}</image:loc>
      <image:title>${escapeXml(i.title)}</image:title>
    </image:image>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>
`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

mkdirSync(publicDir, { recursive: true });
const sitemap = buildSitemap();
const imageSitemap = buildImageSitemap();
writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap, 'utf8');
writeFileSync(path.join(publicDir, 'sitemap-images.xml'), imageSitemap, 'utf8');

const urlCount = (sitemap.match(/<url>/g) || []).length;
console.log(`generate-seo-assets: ${urlCount} URLs → public/sitemap.xml (+ images)`);
console.log(`  site=${SITE} lastmod=${today}`);
