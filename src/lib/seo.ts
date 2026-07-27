/** Métadonnées Open Graph / Twitter / JSON-LD — SEO moteurs + IA. */

const DEFAULT_DESCRIPTION =
  'Média civique du premier tour : pluralité des voix, données ouvertes officielles, la démocratie avant l’élimination. Présidentielle 2027, atlas électoral, programmes sourcés — sans sondages ni classement éliminatoire.';

const DEFAULT_OG_IMAGE = '/brand/og-default.png';

const SITE_NAME = 'Le Média du Premier Tour';
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
      url: `${base}/brand/og-default.png`,
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
}) {
  const base = input.siteUrl.replace(/\/$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': input.type === 'article' ? 'Article' : 'WebPage',
    '@id': `${input.canonical}#webpage`,
    url: input.canonical,
    name: input.title,
    headline: input.title,
    description: input.description,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${base}/#website` },
    publisher: { '@id': `${base}/#organization` },
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
