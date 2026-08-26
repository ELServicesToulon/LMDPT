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
  { path: '/atlas/2024-legislatives-t2', changefreq: 'monthly', priority: '0.8' },
  { path: '/atlas/2027-presidentielle', changefreq: 'weekly', priority: '0.85' },
  { path: '/debats', changefreq: 'weekly', priority: '0.8' },
  { path: '/liberte-d-expression', changefreq: 'weekly', priority: '0.95' },
  { path: '/observatoire-censure', changefreq: 'weekly', priority: '0.92' },
  { path: '/assemblee-influenceurs', changefreq: 'weekly', priority: '0.9' },
  { path: '/assemblee-sondages', changefreq: 'weekly', priority: '0.9' },
  { path: '/debats/assemblee-premier-tour', changefreq: 'monthly', priority: '0.7' },
  { path: '/debats/desistements-second-tour', changefreq: 'monthly', priority: '0.7' },
  { path: '/debats/vote-utile-pluralite', changefreq: 'monthly', priority: '0.7' },
  { path: '/mentions-legales', changefreq: 'yearly', priority: '0.3' },
  { path: '/confidentialite', changefreq: 'yearly', priority: '0.3' },
  { path: '/soutenir', changefreq: 'monthly', priority: '0.7' },
  { path: '/pack-data-an1t', changefreq: 'monthly', priority: '0.75' },
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
      title: 'La démocratie avant l’élimination',
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

/**
 * Sitemap Google News (gratuit) — pages « news-like » civiques.
 * Publication_date = lastmod ; éligibilité News Publisher = démarche manuelle GSC/Publisher Center.
 */
function buildNewsSitemap(): string {
  const newsRoutes: { path: string; title: string; keywords: string }[] = [
    {
      path: '/analyses/alerte-citoyenne',
      title: 'Alerte citoyenne — conditions du débat public',
      keywords: 'liberté d expression, débat public, premier tour',
    },
    {
      path: '/observatoire-censure',
      title: 'Observatoire de la censure en France depuis 2017',
      keywords: 'censure, médias, liberté d expression',
    },
    {
      path: '/assemblee-influenceurs',
      title: 'Assemblée des influenceurs — hémicycle pédagogique',
      keywords: 'influenceurs, hémicycle, teinte politique, dépendances économiques',
    },
    {
      path: '/assemblee-sondages',
      title: 'Assemblée des sondages — hémicycle pédagogique',
      keywords: 'sondages, hémicycle, intentions de vote, Sainte-Laguë, pluralité',
    },
    {
      path: '/analyses/temps-parole-equite',
      title: 'Temps de parole et équité d exposition',
      keywords: 'Arcom, temps de parole, pluralisme',
    },
    {
      path: '/analyses/presidentielle-2027-preparation',
      title: 'Présidentielle 2027 — dossier de préparation',
      keywords: 'présidentielle 2027, premier tour, candidatures',
    },
    {
      path: '/liberte-d-expression',
      title: 'Liberté d expression — hub LMDPT',
      keywords: 'liberté d expression, démocratie, premier tour',
    },
    {
      path: '/analyses/assemblee-premier-tour',
      title: 'Assemblée du premier tour — simulation 2024',
      keywords: 'AN1T, pluralité, législatives',
    },
  ];

  // Google News attend une date ISO récente ; on utilise aujourd’hui (refresh build quotidien).
  const pubDate = `${today}T08:00:00+02:00`;
  const body = newsRoutes
    .map((r) => {
      const loc = abs(r.path);
      return `  <url>
    <loc>${loc}</loc>
    <news:news>
      <news:publication>
        <news:name>Le Média du Premier Tour</news:name>
        <news:language>fr</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(r.title)}</news:title>
      <news:keywords>${escapeXml(r.keywords)}</news:keywords>
    </news:news>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${body}
</urlset>
`;
}

function buildSitemapIndex(): string {
  const maps = ['sitemap.xml', 'sitemap-images.xml', 'sitemap-news.xml'];
  const body = maps
    .map(
      (name) => `  <sitemap>
    <loc>${SITE}/${name}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`;
}

/** robots.txt — sitemaps + crawlers Google gratuits explicites. */
function buildRobotsTxt(): string {
  const googleBots = [
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
  ];
  const googleBlock = googleBots
    .map(
      (bot) => `User-agent: ${bot}
Allow: /
`,
    )
    .join('\n');

  return `# Le Média du Premier Tour — ${SITE}
# Crawlers moteurs + Google (Search / News / Discover / Inspection) bienvenus.
# Généré par npm run seo:assets — ne pas éditer à la main (sauf besoin urgent).

User-agent: *
Allow: /
Disallow: /moderation
Disallow: /api/
Disallow: /connexion
Disallow: /compte

# Sitemaps (Search Console — soumettre l’index en priorité)
Sitemap: ${SITE}/sitemap-index.xml
Sitemap: ${SITE}/sitemap.xml
Sitemap: ${SITE}/sitemap-images.xml
Sitemap: ${SITE}/sitemap-news.xml

# --- Google (outils gratuits de référencement) ---
${googleBlock}
# AI / LLM crawlers
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bytespider
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: meta-externalagent
Allow: /

User-agent: Applebot-Extended
Allow: /

# Aide IA
# ${SITE}/llms.txt
# ${SITE}/ai.txt
# Doc Google SEO : docs/GOOGLE-SEO.md
`;
}

/**
 * Fichier HTML de vérification Search Console (optionnel).
 * Si PUBLIC_GOOGLE_SITE_VERIFICATION_FILE=googleXXXXXXXX.html et
 * PUBLIC_GOOGLE_SITE_VERIFICATION=token → écrit public/google….html
 */
function writeSearchConsoleVerificationFile(): void {
  const fileName = process.env.PUBLIC_GOOGLE_SITE_VERIFICATION_FILE?.trim();
  const token = process.env.PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  if (!fileName || !token) return;
  if (!/^google[a-z0-9]+\.html$/i.test(fileName)) {
    console.warn('seo:assets: PUBLIC_GOOGLE_SITE_VERIFICATION_FILE ignoré (format googleXXXX.html attendu)');
    return;
  }
  const html = `google-site-verification: ${token}\n`;
  writeFileSync(path.join(publicDir, fileName), html, 'utf8');
  console.log(`  Search Console file: public/${fileName}`);
}

mkdirSync(publicDir, { recursive: true });
const sitemap = buildSitemap();
const imageSitemap = buildImageSitemap();
const newsSitemap = buildNewsSitemap();
const sitemapIndex = buildSitemapIndex();
const robots = buildRobotsTxt();
writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap, 'utf8');
writeFileSync(path.join(publicDir, 'sitemap-images.xml'), imageSitemap, 'utf8');
writeFileSync(path.join(publicDir, 'sitemap-news.xml'), newsSitemap, 'utf8');
writeFileSync(path.join(publicDir, 'sitemap-index.xml'), sitemapIndex, 'utf8');
writeFileSync(path.join(publicDir, 'robots.txt'), robots, 'utf8');
writeSearchConsoleVerificationFile();

const urlCount = (sitemap.match(/<url>/g) || []).length;
const newsCount = (newsSitemap.match(/<url>/g) || []).length;
console.log(`generate-seo-assets: ${urlCount} URLs → public/sitemap.xml (+ images + news ${newsCount} + index)`);
console.log(`  site=${SITE} lastmod=${today}`);
console.log('  robots.txt + sitemaps Google (Search Console ready)');
