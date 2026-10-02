/** Métadonnées Open Graph / Twitter / JSON-LD — SEO moteurs + IA. */

const DEFAULT_DESCRIPTION =
  'Média civique du premier tour : pluralité des voix, données ouvertes officielles, la démocratie avant l’élimination. Présidentielle 2027, atlas électoral, programmes sourcés — sans sondages ni classement éliminatoire.';

/** Carte par défaut. Nouveau chemin : l’URL historique reste en cache Cloudflare / X. */
const DEFAULT_OG_IMAGE = '/brand/og-default-fr-2026-10.png';

const SITE_NAME = 'Le Média du Premier Tour';

/** Titre social (X / Facebook) : au-delà, la carte tronque. */
export const SOCIAL_TITLE_MAX = 70;

export const DEFAULT_OG_ALT =
  'Le Média du Premier Tour — pluralité, faits sourcés, vote pour, pas contre.';

/**
 * Titre pour og:title / twitter:title.
 * Le suffixe du site reste dans `<title>` ; ici on le retire, puis on coupe si besoin.
 */
export function socialTitleFrom(pageTitle: string): string {
  const trimmed = pageTitle.replace(/\s+/g, ' ').trim();
  const bare = trimmed === 'Accueil' || trimmed === SITE_NAME ? SITE_NAME : trimmed;
  if (bare.length <= SOCIAL_TITLE_MAX) return bare;
  const slice = bare.slice(0, SOCIAL_TITLE_MAX - 1);
  const space = slice.lastIndexOf(' ');
  const cut = (space >= 40 ? slice.slice(0, space) : slice).trimEnd();
  return `${cut}…`;
}

const DEFAULT_KEYWORDS = [
  'premier tour',
  'élection présidentielle 2027',
  'pluralité électorale',
  'données ouvertes électorales',
  'data.gouv.fr',
  'démocratie avant élimination',
  'LMDPT',
  'Le Média du Premier Tour',
  'atlas électoral',
  'distorsion second tour',
  'programmes candidats',
  'Assemblée du Premier Tour',
  'média civique France',
].join(', ');

export function pageMeta(input: {
  title: string;
  description?: string;
  ogImage?: string;
  siteUrl: string;
  pathname: string;
  keywords?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}) {
  const description = input.description?.trim() || DEFAULT_DESCRIPTION;
  const ogImagePath = input.ogImage || DEFAULT_OG_IMAGE;
  const site = new URL(input.siteUrl.endsWith('/') ? input.siteUrl : `${input.siteUrl}/`);
  const path = input.pathname.startsWith('/') ? input.pathname : `/${input.pathname}`;
  const canonical = new URL(path.replace(/\/+$/, '') || '/', site);
  // Prefer trailing slash for directory-style routes (Astro static)
  if (path !== '/' && !canonical.pathname.endsWith('/')) {
    canonical.pathname = `${canonical.pathname}/`;
  }
  const ogImage = new URL(ogImagePath, site);
  const fullTitle =
    input.title === 'Accueil' || input.title === SITE_NAME
      ? `${SITE_NAME} — pluralité du premier tour, faits sourcés`
      : `${input.title} — ${SITE_NAME}`;

  return {
    description,
    canonical: canonical.href,
    ogImage: ogImage.href,
    fullTitle,
    socialTitle: socialTitleFrom(input.title),
    keywords: input.keywords?.trim() || DEFAULT_KEYWORDS,
    type: input.type || 'website',
    robots: input.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    siteName: SITE_NAME,
  };
}

export function organizationJsonLd(siteUrl: string) {
  const base = siteUrl.replace(/\/$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    '@id': `${base}/#organization`,
    name: SITE_NAME,
    alternateName: ['LMDPT', 'Le Média du Premier Tour'],
    url: `${base}/`,
    logo: {
      '@type': 'ImageObject',
      url: `${base}${DEFAULT_OG_IMAGE}`,
    },
    description: DEFAULT_DESCRIPTION,
    foundingDate: '2026',
    sameAs: ['https://x.com/LMDuPremierTour', 'https://github.com/ELServicesToulon/LMDPT'],
    publishingPrinciples: `${base}/charte/`,
    ethicsPolicy: `${base}/charte/`,
    masthead: `${base}/a-propos/`,
    ownershipFundingInfo: `${base}/mentions-legales/`,
    knowsAbout: [
      'Élections françaises',
      'Premier tour',
      'Données ouvertes électorales',
      'Présidentielle 2027',
      'Pluralité politique',
    ],
    areaServed: {
      '@type': 'Country',
      name: 'France',
    },
    inLanguage: 'fr-FR',
  };
}

export function websiteJsonLd(siteUrl: string) {
  const base = siteUrl.replace(/\/$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${base}/#website`,
    name: SITE_NAME,
    url: `${base}/`,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'fr-FR',
    publisher: { '@id': `${base}/#organization` },
    potentialAction: {
      '@type': 'ReadAction',
      target: `${base}/`,
    },
  };
}

export function webPageJsonLd(input: {
  siteUrl: string;
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  type?: 'website' | 'article';
  datePublished?: string;
  dateModified?: string;
}) {
  const base = input.siteUrl.replace(/\/$/, '');
  const isArticle = input.type === 'article';
  return {
    '@context': 'https://schema.org',
    '@type': isArticle ? 'Article' : 'WebPage',
    '@id': `${input.canonical}#webpage`,
    url: input.canonical,
    name: input.title,
    headline: input.title,
    description: input.description,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${base}/#website` },
    publisher: { '@id': `${base}/#organization` },
    ...(isArticle
      ? {
          author: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: `${base}/`,
          },
          ...(input.datePublished ? { datePublished: input.datePublished } : {}),
          ...(input.dateModified ? { dateModified: input.dateModified } : {}),
        }
      : {}),
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: input.ogImage,
    },
    image: input.ogImage,
  };
}

export function breadcrumbJsonLd(
  siteUrl: string,
  crumbs: { name: string; path: string }[],
) {
  const base = siteUrl.replace(/\/$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.path === '/' ? `${base}/` : `${base}${c.path.startsWith('/') ? c.path : `/${c.path}`}`,
    })),
  };
}

export { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, SITE_NAME, DEFAULT_KEYWORDS };
